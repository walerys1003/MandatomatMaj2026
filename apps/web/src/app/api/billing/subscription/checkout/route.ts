import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import {
  createStripeCustomer,
  createSubscriptionCheckoutSession,
  StripeError,
} from '@/lib/payments/stripe'
import { getPlan, getPlanByProductCode } from '@/lib/payments/subscriptions'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/get-ip'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/billing/subscription/checkout
 *
 * Tworzy Stripe Checkout Session w trybie `subscription` (recurring monthly).
 *
 * Body: { productCode: 'SUB_KIEROWCA' | 'SUB_PRO' }
 *
 * Flow:
 *   1. Auth required
 *   2. Rate-limit (default bucket)
 *   3. Sprawdzenie czy user już ma aktywną sub → 409
 *   4. Lazy-create Stripe customer (jeśli profile.stripe_customer_id pusty)
 *   5. createSubscriptionCheckoutSession z metadata
 *   6. Insert event 'subscription_checkout_initiated'
 *
 * Webhook `customer.subscription.created` zaktualizuje profiles.subscription_tier.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  productCode: z.enum(['SUB_KIEROWCA', 'SUB_PRO']),
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
  const rl = await rateLimit(`sub-checkout:${user.id}:${ip}`, 'default')
  const headers = rateLimitHeaders(rl)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Zbyt wiele prób. Odczekaj chwilę.' },
      { status: 429, headers },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400, headers })
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400, headers },
    )
  }

  const plan = getPlanByProductCode(parsed.data.productCode)
  if (!plan || !plan.productCode) {
    return NextResponse.json({ error: 'Nieznany plan subskrypcji.' }, { status: 400, headers })
  }

  // Sprawdź czy user już ma aktywną subskrypcję
  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('email, full_name, subscription_tier, subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileRaw as {
    email: string | null
    full_name: string | null
    subscription_tier: string | null
    subscription_status: string | null
    stripe_customer_id: string | null
  } | null

  if (
    profile?.subscription_status === 'active' &&
    profile.subscription_tier &&
    profile.subscription_tier !== 'free'
  ) {
    return NextResponse.json(
      {
        error: 'Masz już aktywną subskrypcję. Zmień plan w Customer Portal.',
        currentTier: profile.subscription_tier,
      },
      { status: 409, headers },
    )
  }

  // Lazy-create Stripe customer
  let customerId = profile?.stripe_customer_id ?? null
  if (!customerId) {
    try {
      const customer = await createStripeCustomer({
        email: profile?.email ?? user.email ?? '',
        ...(profile?.full_name ? { name: profile.full_name } : {}),
        userId: user.id,
      })
      customerId = customer.id

      // Persist do profiles (admin client, RLS by zablokowało update przez user)
      const admin = createAdminClient()
      await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq('id', user.id)
    } catch (err) {
      console.error('[sub-checkout] failed to create Stripe customer:', err)
      return NextResponse.json(
        { error: 'Nie udało się utworzyć klienta Stripe.' },
        { status: 500, headers },
      )
    }
  }

  // Build URLs
  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  const successUrl = `${origin}/profil/subskrypcja?session_id={CHECKOUT_SESSION_ID}&success=1`
  const cancelUrl = `${origin}/profil/subskrypcja?canceled=1`

  let session
  try {
    session = await createSubscriptionCheckoutSession({
      userId: user.id,
      productCode: plan.productCode,
      productName: plan.name,
      amount: plan.amount,
      tier: plan.tier as 'kierowca' | 'pro' | 'pro_plus',
      ...(customerId ? { customerId } : {}),
      ...(profile?.email ? { customerEmail: profile.email } : {}),
      successUrl,
      cancelUrl,
    })
  } catch (err) {
    if (err instanceof StripeError) {
      return NextResponse.json({ error: err.message }, { status: err.status ?? 500, headers })
    }
    return NextResponse.json(
      { error: 'Błąd tworzenia sesji subskrypcji.' },
      { status: 500, headers },
    )
  }

  if (!session.url) {
    return NextResponse.json({ error: 'Stripe nie zwrócił URL.' }, { status: 502, headers })
  }

  // Telemetry
  await supabase.from('events').insert({
    user_id: user.id,
    event_type: 'subscription_checkout_initiated',
    data: {
      product_code: plan.productCode,
      tier: plan.tier,
      amount: plan.amount,
      session_id: session.id,
    },
  })

  return NextResponse.json(
    {
      url: session.url,
      sessionId: session.id,
      tier: plan.tier,
      amount: plan.amount,
      monthlyQuota: getPlan(plan.tier).monthlyQuota,
    },
    { headers },
  )
}
