import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * GET  /api/profile  → zwraca profil zalogowanego usera (z `profiles`)
 * PATCH /api/profile → aktualizuje wybrane pola profilu
 *
 * RLS na tabeli `profiles` zapewnia, że user widzi/edytuje tylko swój wiersz.
 * Nie używamy service_role — zwykły server client z cookies.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{9,15}$/, 'Nieprawidłowy numer telefonu')
    .optional()
    .or(z.literal('')),
  marketing_consent: z.boolean().optional(),
  newsletter_consent: z.boolean().optional(),
  preferred_locale: z.enum(['pl', 'en']).optional(),
})

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, email, full_name, phone, marketing_consent, newsletter_consent, preferred_locale, role, plan, created_at, updated_at',
    )
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  // Zamień pusty string na null (kasowanie pola)
  const update: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() }
  if (update.phone === '') update.phone = null

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)
    .select(
      'id, email, full_name, phone, marketing_consent, newsletter_consent, preferred_locale, role, plan, updated_at',
    )
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
