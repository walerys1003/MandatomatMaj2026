import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/get-ip'
import { createClient } from '@/lib/supabase/server'

/**
 * GET  /api/deadlines — lista terminów użytkownika
 * POST /api/deadlines — manual deadline (user dodaje własny)
 *
 * Filtry GET:
 *  - ?status=active|expired|completed (CSV)
 *  - ?upcoming=1 (tylko nadchodzące, default true)
 *  - ?caseId=uuid
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')?.split(',').filter(Boolean) ?? []
  const upcoming = searchParams.get('upcoming') !== '0'
  const caseId = searchParams.get('caseId')

  let query = supabase
    .from('deadlines')
    .select('id, case_id, title, description, deadline_date, status, source, legal_basis, remind_days, created_at')
    .eq('user_id', user.id)

  if (caseId) query = query.eq('case_id', caseId)
  if (statusFilter.length > 0) query = query.in('status', statusFilter)
  if (upcoming) query = query.gte('deadline_date', new Date().toISOString().slice(0, 10))

  const { data, error } = await query.order('deadline_date', { ascending: true }).limit(200)

  if (error) {
    return NextResponse.json({ error: 'Nie udało się pobrać terminów.' }, { status: 500 })
  }

  return NextResponse.json({ items: data ?? [] })
}

const postSchema = z.object({
  caseId: z.string().uuid().optional(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  legalBasis: z.string().max(500).optional(),
  remindDays: z.array(z.number().int().min(0).max(60)).max(10).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const ip = getClientIp(req)
  const rl = await rateLimit(`deadline:${user.id}:${ip}`, 'default')
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Zbyt wiele prób.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }
  const parsed = postSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Walidacja nieudana', issues: parsed.error.issues }, { status: 400 })
  }

  const { caseId, title, description, deadlineDate, legalBasis, remindDays } = parsed.data

  // Jeśli caseId podane — weryfikacja ownership
  if (caseId) {
    const { data: caseRow } = await supabase
      .from('cases')
      .select('id, user_id')
      .eq('id', caseId)
      .maybeSingle()
    const t = caseRow as { id: string; user_id: string } | null
    if (!t || t.user_id !== user.id) {
      return NextResponse.json({ error: 'Brak dostępu do sprawy.' }, { status: 403 })
    }
  }

  const insertPayload = {
    user_id: user.id,
    case_id: caseId ?? null,
    title,
    description: description ?? null,
    deadline_date: deadlineDate,
    legal_basis: legalBasis ?? null,
    remind_days: remindDays ?? [5, 3, 1, 0],
    source: 'manual',
    status: 'active' as const,
  }

  const { data, error } = await supabase
    .from('deadlines')
    .insert(insertPayload)
    .select('id, case_id, title, deadline_date, status, source, legal_basis, remind_days')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Nie udało się utworzyć terminu.' }, { status: 500 })
  }

  await supabase.from('events').insert({
    user_id: user.id,
    case_id: caseId ?? null,
    event_type: 'deadline_created',
    data: { title, deadline_date: deadlineDate, source: 'manual' },
  })

  return NextResponse.json({ deadline: data }, { status: 201, headers: rateLimitHeaders(rl) })
}
