import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { validatePromoCode } from '@/lib/payments/promo'
import { getProduct } from '@/lib/payments/stripe'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/get-ip'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/billing/promo-codes/validate
 *
 * Body: { code: string, productCode: string }
 * Response: { valid: boolean, code?, discountPercent?, finalAmount?, originalAmount?, reason? }
 *
 * Rate limit: bucket 'default' (60/min/IP).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  code: z.string().min(3).max(32),
  productCode: z.string().min(2).max(64),
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
  const rl = await rateLimit(`promo:${user.id}:${ip}`, 'default')
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Zbyt wiele prób. Odczekaj chwilę.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { code, productCode } = parsed.data

  const product = getProduct(productCode)
  if (!product) {
    return NextResponse.json({ valid: false, reason: 'Nieznany produkt.' }, { status: 400 })
  }

  const result = await validatePromoCode(code, productCode)
  if (!result.valid) {
    return NextResponse.json(
      { valid: false, reason: result.reason ?? 'Kod nieprawidłowy.' },
      { status: 200, headers: rateLimitHeaders(rl) },
    )
  }

  const finalAmount = Math.round(product.amount * (1 - (result.discountPercent ?? 0) / 100))

  return NextResponse.json(
    {
      valid: true,
      code: result.code,
      discountPercent: result.discountPercent,
      originalAmount: product.amount,
      finalAmount,
      currency: 'pln',
    },
    { headers: rateLimitHeaders(rl) },
  )
}
