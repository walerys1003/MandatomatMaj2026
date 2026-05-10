import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { attributeReferral } from '@/lib/payments/referral'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/referral/redeem
 *
 * Atrybucja referrala — zapisuje `referred_by` do profilu zalogowanego usera.
 * Wywoływane po potwierdzeniu emaila (z `/witaj` jeśli `?ref=` w URL).
 *
 * Body: { code: string }  // np. "MND-A1B2C3D4"
 *
 * Idempotentne: jeśli user już ma `referred_by`, zwraca {updated: false, alreadySet: true}.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  code: z.string().trim().min(5).max(32),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const rl = await rateLimit(`referral:${user.id}`, 'default')
  const headers = rateLimitHeaders(rl)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Zbyt wiele żądań.', retryAfter: rl.reset },
      { status: 429, headers },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400, headers })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400, headers },
    )
  }

  const result = await attributeReferral(user.id, parsed.data.code)
  if (!result.updated) {
    return NextResponse.json(
      { updated: false, reason: result.reason ?? 'Nie udało się przypisać referrala.' },
      { status: 200, headers },
    )
  }

  // Best-effort event log
  await supabase
    .from('events')
    .insert({
      user_id: user.id,
      event_type: 'user_registered',
      properties: {
        referral_code: parsed.data.code.toUpperCase(),
        attributed_at: new Date().toISOString(),
      },
    })
    .then(
      () => undefined,
      () => undefined,
    )

  return NextResponse.json(
    { updated: true, referrerId: result.referrerId },
    { status: 200, headers },
  )
}
