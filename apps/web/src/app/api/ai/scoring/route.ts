import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { CASE_TYPES } from '@mandatomat/db-types'

import { scoringAnalysis, AnthropicError } from '@/lib/ai'
import { getIp } from '@/lib/get-ip'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/ai/scoring — darmowa ocena szans (Haiku).
 *
 * Endpoint dostępny BEZ logowania (free tier — top funnel).
 * Rate limit:
 *   - anon (po IP):  5 req/min, 20/dzień
 *   - auth (po user): 30 req/min (bucket 'ai')
 *
 * Używa Claude Haiku (taniej, szybciej). Nie zapisuje wyniku do bazy
 * dla anon — tylko zwraca w odpowiedzi. Dla auth: zapisuje do `cases`
 * jako "scoring_szans" placeholder (po MVP).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Akceptujemy zarówno pełne CaseType (M1_mandat_predkosc) jak i generic ('mandat', 'parking', 'windykacja')
const genericCaseType = z.enum(['mandat', 'parking', 'windykacja', 'ubezpieczenie', 'etoll', 'kontrola', 'techniczne'])
const requestSchema = z.object({
  caseType: z.union([z.enum(CASE_TYPES), genericCaseType]),
  description: z.string().trim().min(20, 'Opis musi mieć min. 20 znaków').max(2500, 'Maks. 2500 znaków'),
  hasEvidence: z.boolean().optional(),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD')
    .optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Identyfikacja: user jeśli zalogowany, inaczej IP
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const ip = getIp(req)
  const identifier = user ? `user:${user.id}` : `ip:${ip}`

  // Rate limit
  const rl = await rateLimit(identifier, user ? 'ai' : 'default')
  const headers = rateLimitHeaders(rl)
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.',
        retryAfter: rl.reset,
      },
      { status: 429, headers },
    )
  }

  // Body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400, headers })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Walidacja nieudana',
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400, headers },
    )
  }

  // Wywołanie Claude
  try {
    const result = await scoringAnalysis({
      caseType: parsed.data.caseType,
      description: parsed.data.description,
      ...(parsed.data.hasEvidence !== undefined && { hasEvidence: parsed.data.hasEvidence }),
      ...(parsed.data.eventDate !== undefined && { eventDate: parsed.data.eventDate }),
    })

    // Logging telemetrii (best-effort, nie blokujemy odpowiedzi przy błędzie)
    if (user) {
      void supabase
        .from('events')
        .insert({
          user_id: user.id,
          event_name: 'ai_scoring_used',
          metadata: {
            case_type: parsed.data.caseType,
            score: result.data.score,
            label: result.data.label,
            cost_usd: result.costUsd,
            tokens: result.raw.usage,
          },
        })
        .then(({ error }) => {
          if (error) console.warn('[scoring] events log failed:', error.message)
        })
    }

    return NextResponse.json(
      {
        score: result.data.score,
        label: result.data.label,
        reasoning: result.data.reasoning,
        recommendations: result.data.recommendations,
        legal_basis_hints: result.data.legal_basis_hints,
        estimated_complexity: result.data.estimated_complexity,
      },
      { status: 200, headers },
    )
  } catch (e) {
    if (e instanceof AnthropicError) {
      console.error('[scoring] Anthropic error:', e.message, e.status)
      return NextResponse.json(
        { error: 'Nie udało się ocenić sprawy. Spróbuj ponownie za chwilę.' },
        { status: e.status && e.status >= 500 ? 502 : 400, headers },
      )
    }
    console.error('[scoring] Unexpected error:', e)
    return NextResponse.json(
      { error: 'Błąd serwera. Spróbuj ponownie.' },
      { status: 500, headers },
    )
  }
}
