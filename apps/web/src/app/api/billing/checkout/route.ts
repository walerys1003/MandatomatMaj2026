import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { createCheckoutSession, getProduct, StripeError } from '@/lib/payments/stripe'
import { validatePromoCode } from '@/lib/payments/promo'
import { getReferralDiscount } from '@/lib/payments/referral'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/get-ip'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/billing/checkout
 *
 * Tworzy Stripe Checkout Session dla danej sprawy.
 *
 * Body:
 *   {
 *     caseId: uuid,
 *     productCode: string,         // np. "M1_mandat_predkosc"
 *     promoCode?: string,
 *   }
 *
 * Response:
 *   { url: string, sessionId: string, amount: number, finalAmount: number, currency: 'pln' }
 *
 * Edge cases:
 *  - Sprawa istnieje, należy do usera, ma status 'preview'/'paid_pending'
 *  - User z aktywną subskrypcją (kierowca/PRO+) — bypass Stripe (301 → /pobranie)
 *  - Promo code zwalidowany, discount zastosowany
 *  - Idempotency po stronie Stripe (klucz: case_id:product_code)
 *
 * Rate limit: bucket 'default' (60/min/IP).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  caseId: z.string().uuid(),
  productCode: z.string().min(2).max(64),
  promoCode: z.string().min(3).max(32).optional(),
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
  const rl = await rateLimit(`checkout:${user.id}:${ip}`, 'default')
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Zbyt wiele prób. Odczekaj chwilę.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { caseId, productCode, promoCode } = parsed.data

  const product = getProduct(productCode)
  if (!product) {
    return NextResponse.json({ error: 'Nieznany kod produktu.' }, { status: 400 })
  }

  // Verify case ownership
  const { data: caseRow, error: caseErr } = await supabase
    .from('cases')
    .select('id, user_id, status, case_type')
    .eq('id', caseId)
    .maybeSingle()

  if (caseErr || !caseRow) {
    return NextResponse.json({ error: 'Sprawa nie istnieje.' }, { status: 404 })
  }

  const caseTyped = caseRow as { id: string; user_id: string; status: string; case_type: string }
  if (caseTyped.user_id !== user.id) {
    return NextResponse.json({ error: 'Brak dostępu do sprawy.' }, { status: 403 })
  }

  if (caseTyped.status === 'paid' || caseTyped.status === 'archived') {
    return NextResponse.json(
      { error: 'Ta sprawa jest już opłacona.', alreadyPaid: true },
      { status: 409 },
    )
  }

  // Subscription bypass — sprawdź profile.subscription_tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, monthly_quota_remaining, email, full_name')
    .eq('id', user.id)
    .maybeSingle()

  const profileTyped = profile as {
    subscription_tier?: string | null
    subscription_status?: string | null
    monthly_quota_remaining?: number | null
    email?: string | null
    full_name?: string | null
  } | null

  const hasActiveSub =
    profileTyped?.subscription_status === 'active' &&
    profileTyped.subscription_tier &&
    ['kierowca', 'pro', 'pro_plus'].includes(profileTyped.subscription_tier) &&
    (profileTyped.monthly_quota_remaining ?? 0) > 0

  if (hasActiveSub) {
    // Bypass Stripe: zapisz "fake" payment + decrement limit + update case status
    await supabase.from('payments').insert({
      user_id: user.id,
      case_id: caseId,
      amount: 0,
      currency: 'pln',
      payment_type: 'subscription',
      status: 'succeeded',
      product_name: product.name,
      product_code: productCode,
      original_amount: product.amount,
      metadata: { reason: 'subscription_bypass', tier: profileTyped!.subscription_tier },
    })

    await supabase.from('cases').update({ status: 'paid' }).eq('id', caseId)

    await supabase
      .from('profiles')
      .update({ monthly_quota_remaining: (profileTyped!.monthly_quota_remaining ?? 1) - 1 })
      .eq('id', user.id)

    await supabase.from('events').insert({
      user_id: user.id,
      case_id: caseId,
      event_type: 'payment_succeeded',
      data: { reason: 'subscription_bypass', product_code: productCode },
    })

    return NextResponse.json(
      {
        bypass: true,
        redirectUrl: `/sprawy/${caseId}/pobranie`,
        message: 'Płatność pominięta — masz aktywną subskrypcję.',
      },
      { headers: rateLimitHeaders(rl) },
    )
  }

  // Promo validation
  let discountPercent = 0
  let validatedPromoCode: string | undefined
  if (promoCode) {
    const promo = await validatePromoCode(promoCode, productCode)
    if (!promo.valid) {
      return NextResponse.json(
        { error: promo.reason ?? 'Kod promocyjny nieprawidłowy.' },
        { status: 400 },
      )
    }
    discountPercent = promo.discountPercent ?? 0
    validatedPromoCode = promo.code
  }

  // Referral discount fallback — tylko jeśli user nie podał własnego promo code.
  // Daje 20% zniżki na pierwszy zakup, jeśli user ma `referred_by` w profilu.
  let referralApplied = false
  let referredByCode: string | null = null
  if (discountPercent === 0) {
    const referral = await getReferralDiscount(user.id)
    if (referral.applicable) {
      discountPercent = referral.discountPercent
      referralApplied = true
      referredByCode = referral.referredBy
    }
  }

  // Build success/cancel URLs
  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  const successUrl = `${origin}/sprawy/${caseId}/pobranie?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${origin}/sprawy/${caseId}/platnosc?canceled=1`

  // Create Stripe session
  let session
  try {
    session = await createCheckoutSession({
      caseId,
      userId: user.id,
      productCode,
      productName: product.name,
      amount: product.amount,
      ...(profileTyped?.email ? { customerEmail: profileTyped.email } : {}),
      successUrl,
      cancelUrl,
      ...(validatedPromoCode ? { promoCode: validatedPromoCode } : {}),
      ...(discountPercent ? { discountPercent } : {}),
      metadata: {
        case_type: caseTyped.case_type,
        ...(referralApplied ? { referral_applied: 'true', referred_by: referredByCode ?? '' } : {}),
      },
    })
  } catch (err) {
    if (err instanceof StripeError) {
      return NextResponse.json({ error: err.message }, { status: err.status ?? 500 })
    }
    return NextResponse.json({ error: 'Błąd tworzenia sesji płatności.' }, { status: 500 })
  }

  if (!session.url) {
    return NextResponse.json({ error: 'Stripe nie zwrócił URL.' }, { status: 502 })
  }

  // Insert pending payment row (status='pending')
  const finalAmount =
    discountPercent > 0 ? Math.round(product.amount * (1 - discountPercent / 100)) : product.amount

  await supabase.from('payments').insert({
    user_id: user.id,
    case_id: caseId,
    stripe_checkout_session_id: session.id,
    amount: finalAmount,
    currency: 'pln',
    payment_type: 'one_time',
    status: 'pending',
    product_name: product.name,
    product_code: productCode,
    original_amount: product.amount,
    promo_code: validatedPromoCode ?? null,
    discount_percent: discountPercent || null,
    metadata: {
      stripe_session_id: session.id,
      ...(referralApplied ? { referral_applied: true, referred_by: referredByCode } : {}),
    },
  })

  await supabase.from('cases').update({ status: 'paid_pending' }).eq('id', caseId)

  await supabase.from('events').insert({
    user_id: user.id,
    case_id: caseId,
    event_type: 'payment_initiated',
    data: {
      product_code: productCode,
      amount: finalAmount,
      session_id: session.id,
      ...(referralApplied ? { referral_applied: true, referred_by: referredByCode } : {}),
    },
  })

  return NextResponse.json(
    {
      url: session.url,
      sessionId: session.id,
      amount: product.amount,
      finalAmount,
      discountPercent,
      currency: 'pln',
      referralApplied,
    },
    { headers: rateLimitHeaders(rl) },
  )
}
