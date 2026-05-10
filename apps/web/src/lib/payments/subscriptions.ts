import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * Subscription plans — Faza T20 / P7.
 *
 * Definicje planów: tier, quota miesięczna, cena (grosze).
 * Cena = ta sama co w PRICING w stripe.ts (single source of truth → poniżej re-export
 * dla wygody, ale wartości muszą się zgadzać).
 *
 * Reguły:
 *   - Free: 0 pism/mies (pay-per-doc)
 *   - Kierowca: 3 pisma/mies + priorytet w kolejce AI
 *   - Pro: 999 pism/mies (efektywnie unlimited)
 *   - Pro Plus: 999 pism/mies + opieka prawnika (na żądanie)
 */

export type SubscriptionTier = 'free' | 'kierowca' | 'pro' | 'pro_plus'

export interface PlanDefinition {
  tier: SubscriptionTier
  productCode: 'SUB_KIEROWCA' | 'SUB_PRO' | null
  name: string
  /** Cena miesięczna w groszach (0 dla free). */
  amount: number
  /** Liczba pism wliczonych w miesięczną opłatę. */
  monthlyQuota: number
  features: string[]
  /** Czy widoczny w UI wyboru planu. */
  visible: boolean
}

export const PLANS: Record<SubscriptionTier, PlanDefinition> = {
  free: {
    tier: 'free',
    productCode: null,
    name: 'Free',
    amount: 0,
    monthlyQuota: 0,
    features: [
      'Pay-per-doc — 19 zł za pismo',
      'Wszystkie 30 typów spraw',
      'Przypomnienia o terminach',
      'Historia spraw bez limitu',
    ],
    visible: true,
  },
  kierowca: {
    tier: 'kierowca',
    productCode: 'SUB_KIEROWCA',
    name: 'Kierowca',
    amount: 2900,
    monthlyQuota: 3,
    features: [
      '3 pisma w miesiącu (oszczędzasz 28 zł vs pay-per-doc)',
      'Priorytet w kolejce AI (szybsze generowanie)',
      'Wszystkie 30 typów spraw',
      'Anuluj w każdej chwili — bez kar',
    ],
    visible: true,
  },
  pro: {
    tier: 'pro',
    productCode: 'SUB_PRO',
    name: 'Pro',
    amount: 5900,
    monthlyQuota: 999,
    features: [
      'Bez limitu pism (do 999/mies)',
      'Najwyższy priorytet w kolejce AI',
      'Wszystkie 30 typów spraw',
      'Eksport pism w PDF + DOCX',
      'Anuluj w każdej chwili',
    ],
    visible: true,
  },
  pro_plus: {
    tier: 'pro_plus',
    productCode: null, // tylko ręczna aktywacja przez admina (B2B / corp)
    name: 'Pro Plus',
    amount: 0,
    monthlyQuota: 999,
    features: ['Wszystko z Pro', 'Konsultacja prawnika na żądanie', 'Dedykowany account manager'],
    visible: false,
  },
}

export function getPlan(tier: SubscriptionTier | string | null | undefined): PlanDefinition {
  if (tier && tier in PLANS) {
    return PLANS[tier as SubscriptionTier]
  }
  return PLANS.free
}

export function getPlanByProductCode(productCode: string): PlanDefinition | null {
  for (const plan of Object.values(PLANS)) {
    if (plan.productCode === productCode) return plan
  }
  return null
}

export interface SubscriptionSnapshot {
  tier: SubscriptionTier
  status: string | null
  monthlyQuotaTotal: number
  monthlyQuotaRemaining: number
  periodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  /** Czy user ma aktywną subskrypcję, która pozwala na bypass płatności. */
  isActive: boolean
}

/**
 * Pobiera kompletny snapshot subskrypcji usera z `profiles` + `subscriptions`.
 *
 * Source of truth:
 *   - profiles.subscription_tier / status / monthly_quota_remaining (cache)
 *   - subscriptions.current_period_end (autoritatywne dla period)
 */
export async function getSubscriptionSnapshot(userId: string): Promise<SubscriptionSnapshot> {
  const supabase = createClient()

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select(
      'subscription_tier, subscription_status, monthly_quota_total, monthly_quota_remaining, subscription_period_end, subscription_cancel_at_period_end, stripe_customer_id',
    )
    .eq('id', userId)
    .maybeSingle()

  const profile = profileRaw as {
    subscription_tier: string | null
    subscription_status: string | null
    monthly_quota_total: number | null
    monthly_quota_remaining: number | null
    subscription_period_end: string | null
    subscription_cancel_at_period_end: boolean | null
    stripe_customer_id: string | null
  } | null

  const tier = (profile?.subscription_tier ?? 'free') as SubscriptionTier
  const status = profile?.subscription_status ?? null

  // Stripe sub ID — z aktywnego rekordu w `subscriptions`
  const { data: subRaw } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, current_period_end, cancel_at_period_end, status')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sub = subRaw as {
    stripe_subscription_id: string
    current_period_end: string | null
    cancel_at_period_end: boolean | null
    status: string
  } | null

  const isActive =
    (status === 'active' || status === 'trialing') &&
    tier !== 'free' &&
    (profile?.monthly_quota_remaining ?? 0) > 0

  return {
    tier,
    status,
    monthlyQuotaTotal: profile?.monthly_quota_total ?? 0,
    monthlyQuotaRemaining: profile?.monthly_quota_remaining ?? 0,
    periodEnd: sub?.current_period_end ?? profile?.subscription_period_end ?? null,
    cancelAtPeriodEnd:
      sub?.cancel_at_period_end ?? profile?.subscription_cancel_at_period_end ?? false,
    stripeCustomerId: profile?.stripe_customer_id ?? null,
    stripeSubscriptionId: sub?.stripe_subscription_id ?? null,
    isActive,
  }
}

/**
 * Aplikuje stan subskrypcji ze Stripe webhook do `profiles` + `subscriptions`.
 *
 * Service-role only (admin client) — wywoływane wyłącznie z webhook handlera.
 * Idempotentne: UPSERT po stripe_subscription_id.
 */
export async function applySubscriptionToProfile(input: {
  userId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  stripePriceId?: string
  productCode: string
  tier: SubscriptionTier
  status: SubscriptionSnapshot['status']
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  amount: number
}): Promise<void> {
  const admin = createAdminClient()
  const plan = getPlan(input.tier)

  // 1. Upsert do `subscriptions`
  await admin
    .from('subscriptions')
    .upsert(
      {
        user_id: input.userId,
        stripe_subscription_id: input.stripeSubscriptionId,
        stripe_customer_id: input.stripeCustomerId,
        stripe_price_id: input.stripePriceId ?? null,
        stripe_product_code: input.productCode,
        tier: input.tier === 'free' ? 'kierowca' : input.tier,
        status: input.status ?? 'active',
        current_period_start: input.currentPeriodStart,
        current_period_end: input.currentPeriodEnd,
        cancel_at_period_end: input.cancelAtPeriodEnd,
        canceled_at: input.canceledAt,
        amount: input.amount,
        currency: 'pln',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' },
    )
    .then(
      () => undefined,
      (err) => {
        console.error('[subscriptions] upsert failed:', err)
      },
    )

  // 2. Sync do profiles — tier/status/quota
  // Reset quota tylko przy zmianie okresu lub świeżej aktywacji
  const isActiveStatus = input.status === 'active' || input.status === 'trialing'
  const update: Record<string, unknown> = {
    subscription_tier: isActiveStatus ? input.tier : 'free',
    subscription_plan: isActiveStatus ? input.tier : 'free',
    subscription_status: input.status,
    subscription_period_end: input.currentPeriodEnd,
    subscription_cancel_at_period_end: input.cancelAtPeriodEnd,
    stripe_customer_id: input.stripeCustomerId,
    updated_at: new Date().toISOString(),
  }

  if (isActiveStatus) {
    update['monthly_quota_total'] = plan.monthlyQuota
    update['monthly_quota_remaining'] = plan.monthlyQuota
  } else {
    // canceled / past_due → quota=0
    update['monthly_quota_total'] = 0
    update['monthly_quota_remaining'] = 0
  }

  const { error: updErr } = await admin.from('profiles').update(update).eq('id', input.userId)

  if (updErr) {
    console.error('[subscriptions] profile sync failed:', updErr)
  }
}
