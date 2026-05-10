import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/feedback   → user dodaje/aktualizuje feedback dla swojej sprawy
 * GET  /api/feedback?caseId=... → zwraca feedback usera dla danej sprawy (lub null)
 *
 * Tabela: `feedback` (rating 1-5, outcome enum, comment text).
 * RLS: "Users manage own feedback" — user może zarządzać tylko własnym (user_id = auth.uid()).
 *
 * Reguły biznesowe:
 *  - feedback dopuszczalny TYLKO dla spraw w statusie != 'draft' (po wygenerowaniu pisma)
 *  - 1 feedback per (user_id, case_id) — upsert by case_id
 *  - rating: integer 1..5 (CHECK constraint w migracji 009)
 *  - outcome: 'success' | 'partial' | 'failure' | 'pending' | 'unknown'
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const OUTCOME_VALUES = ['success', 'partial', 'failure', 'pending', 'unknown'] as const

const postSchema = z.object({
  caseId: z.string().uuid('Nieprawidłowy identyfikator sprawy'),
  rating: z.number().int().min(1, 'Min. 1').max(5, 'Max. 5').optional(),
  outcome: z.enum(OUTCOME_VALUES).optional(),
  comment: z.string().trim().max(2000, 'Komentarz max. 2000 znaków').optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  // Rate-limit (feedback nie może być spamowany)
  const rl = await rateLimit(`user:${user.id}`, 'default')
  const headers = rateLimitHeaders(rl)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Za dużo żądań. Spróbuj ponownie za chwilę.', retryAfter: rl.reset },
      { status: 429, headers },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400, headers })
  }

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400, headers },
    )
  }

  // At least one of rating/outcome/comment must be provided
  if (
    parsed.data.rating == null &&
    parsed.data.outcome == null &&
    (parsed.data.comment == null || parsed.data.comment.length === 0)
  ) {
    return NextResponse.json(
      { error: 'Podaj przynajmniej ocenę, status sprawy lub komentarz.' },
      { status: 400, headers },
    )
  }

  // Sprawdź, czy sprawa należy do usera i nie jest draftem
  const { data: caseRow, error: caseErr } = await supabase
    .from('cases')
    .select('id, user_id, status')
    .eq('id', parsed.data.caseId)
    .maybeSingle()

  if (caseErr || !caseRow) {
    return NextResponse.json({ error: 'Sprawa nie istnieje' }, { status: 404, headers })
  }
  if ((caseRow as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: 'Brak dostępu' }, { status: 403, headers })
  }
  if ((caseRow as { status: string }).status === 'draft') {
    return NextResponse.json(
      { error: 'Feedback dostępny po wygenerowaniu pisma.' },
      { status: 409, headers },
    )
  }

  // Upsert: 1 feedback per (user_id, case_id)
  // Najpierw sprawdź czy istnieje
  const { data: existing } = await supabase
    .from('feedback')
    .select('id')
    .eq('user_id', user.id)
    .eq('case_id', parsed.data.caseId)
    .maybeSingle()

  const payload: Record<string, unknown> = {
    user_id: user.id,
    case_id: parsed.data.caseId,
  }
  if (parsed.data.rating != null) payload['rating'] = parsed.data.rating
  if (parsed.data.outcome != null) payload['outcome'] = parsed.data.outcome
  if (parsed.data.comment != null && parsed.data.comment.length > 0) {
    payload['comment'] = parsed.data.comment
  }

  if (existing && (existing as { id: string }).id) {
    const { data, error } = await supabase
      .from('feedback')
      .update(payload)
      .eq('id', (existing as { id: string }).id)
      .select('id, rating, outcome, comment, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers })
    }
    return NextResponse.json({ feedback: data, updated: true }, { headers })
  }

  const { data, error } = await supabase
    .from('feedback')
    .insert(payload)
    .select('id, rating, outcome, comment, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers })
  }
  return NextResponse.json({ feedback: data, created: true }, { status: 201, headers })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const caseId = req.nextUrl.searchParams.get('caseId')
  if (!caseId) {
    return NextResponse.json({ error: 'Brak parametru caseId' }, { status: 400 })
  }

  // Walidacja UUID
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRe.test(caseId)) {
    return NextResponse.json({ error: 'Nieprawidłowy caseId' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('feedback')
    .select('id, rating, outcome, comment, created_at')
    .eq('user_id', user.id)
    .eq('case_id', caseId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ feedback: data ?? null })
}
