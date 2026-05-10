import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { getIp } from '@/lib/get-ip'
import { rateLimit } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/profile/delete
 *
 * RODO art. 17 — prawo do bycia zapomnianym.
 *
 * Flow:
 *  1. User musi być zalogowany
 *  2. Body: { confirm: 'USUWAM' } (tekst potwierdzenia żeby uniknąć przypadkowych kliknięć)
 *  3. Soft delete: profile.deleted_at = now() (zachowujemy dla audytu prawnego — księgowość, faktury)
 *  4. Anonimizacja: full_name = '[USUNIĘTY]', phone = null, marketing/newsletter = false
 *  5. Hard delete auth.users przez admin client (kasuje sesje, magic linki)
 *  6. Sign out current session
 *  7. Zdarzenie audit log
 *
 * UWAGA: Pliki w Storage (skany mandatów, PDFy) i sprawy zostają dla obowiązków
 *        retencyjnych (art. 6 ust. 1 lit. c RODO — obowiązek prawny, np. księgowość 5 lat).
 *        Po okresie retencji cron job usuwa fizycznie.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  confirm: z.literal('USUWAM'),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getIp(req)
  const r = await rateLimit(ip, 'auth')
  if (!r.ok) {
    return NextResponse.json({ error: 'Za dużo prób. Spróbuj za chwilę.' }, { status: 429 })
  }

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

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Wpisz USUWAM (wielkimi literami) aby potwierdzić.' },
      { status: 400 },
    )
  }

  const userId = user.id
  const admin = createAdminClient()

  // 1. Anonimizacja profilu (zachowujemy wiersz dla audytu)
  const { error: updErr } = await admin
    .from('profiles')
    .update({
      full_name: '[USUNIĘTY]',
      phone: null,
      marketing_consent: false,
      newsletter_consent: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (updErr) {
    return NextResponse.json(
      { error: 'Nie udało się zanonimizować profilu.', detail: updErr.message },
      { status: 500 },
    )
  }

  // 2. Audit log (PRZED skasowaniem auth.users — bo potem nie będzie usera)
  await admin.from('events').insert({
    user_id: userId,
    type: 'profile.deleted',
    payload: {
      ip,
      user_agent: req.headers.get('user-agent') ?? null,
      reason: 'rodo_art_17',
    },
  })

  // 3. Hard delete auth.users (kasuje sesje, magic links, identities)
  const { error: delErr } = await admin.auth.admin.deleteUser(userId)
  if (delErr) {
    return NextResponse.json(
      { error: 'Nie udało się usunąć konta auth.', detail: delErr.message },
      { status: 500 },
    )
  }

  // 4. Sign out z bieżącej sesji (cookie cleanup)
  await supabase.auth.signOut()

  return NextResponse.json({
    ok: true,
    message: 'Konto zostało usunięte. Dane księgowe zachowujemy zgodnie z obowiązkiem prawnym.',
  })
}
