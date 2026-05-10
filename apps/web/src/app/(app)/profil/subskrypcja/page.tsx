import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Badge } from '@mandatomat/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mandatomat/ui/card'

import { createClient } from '@/lib/supabase/server'
import { getSubscriptionSnapshot, PLANS } from '@/lib/payments/subscriptions'

import { SubscriptionControls } from './subscription-controls'

export const metadata: Metadata = {
  title: 'Subskrypcja',
}

export const dynamic = 'force-dynamic'

export default async function SubscriptionPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/logowanie?next=/profil/subskrypcja')
  }

  const snapshot = await getSubscriptionSnapshot(user.id)
  const currentPlan = PLANS[snapshot.tier]

  // Plany dostępne do upgrade'u (visible + nie ten sam tier)
  const upgradablePlans = Object.values(PLANS).filter(
    (p) => p.visible && p.tier !== 'free' && p.tier !== snapshot.tier,
  )

  // Progres quoty (procent zużycia)
  const quotaUsed = snapshot.monthlyQuotaTotal - snapshot.monthlyQuotaRemaining
  const quotaPct =
    snapshot.monthlyQuotaTotal > 0
      ? Math.min(100, Math.round((quotaUsed / snapshot.monthlyQuotaTotal) * 100))
      : 0

  const periodEndFormatted = snapshot.periodEnd
    ? new Date(snapshot.periodEnd).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          KONTO / SUBSKRYPCJA
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
          Twój plan
        </h1>
        <p className="mt-1 text-iron-600 dark:text-iron-300">
          Zarządzaj subskrypcją, sprawdzaj zużycie i przeglądaj historię płatności.
        </p>
      </header>

      {/* AKTUALNY PLAN */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardDescription>Aktualny plan</CardDescription>
              <CardTitle className="mt-1 font-display text-3xl">
                {currentPlan.name}
                {snapshot.tier !== 'free' && (
                  <span className="ml-3 font-mono text-base font-normal text-iron-500">
                    {(currentPlan.amount / 100).toFixed(2)} zł/mies
                  </span>
                )}
              </CardTitle>
            </div>
            <div className="flex flex-col items-end gap-2">
              {snapshot.status === 'active' && (
                <Badge variant="success" mono>
                  AKTYWNY
                </Badge>
              )}
              {snapshot.status === 'trialing' && (
                <Badge variant="info" mono>
                  OKRES PRÓBNY
                </Badge>
              )}
              {snapshot.status === 'past_due' && (
                <Badge variant="warning" mono>
                  ZALEGŁA PŁATNOŚĆ
                </Badge>
              )}
              {snapshot.status === 'canceled' && (
                <Badge variant="neutral" mono>
                  ANULOWANY
                </Badge>
              )}
              {!snapshot.status && (
                <Badge variant="neutral" mono>
                  FREE
                </Badge>
              )}
              {snapshot.cancelAtPeriodEnd && (
                <Badge variant="warning" mono>
                  ANULOWANIE NA KONIEC OKRESU
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quota progress */}
          {snapshot.tier !== 'free' && snapshot.monthlyQuotaTotal > 0 && (
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-iron-600 dark:text-iron-400">
                  Pisma w tym miesiącu
                </p>
                <p className="font-mono text-sm tabular-nums text-iron-900 dark:text-iron-100">
                  {quotaUsed} / {snapshot.monthlyQuotaTotal}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-iron-100 dark:bg-iron-800">
                <div
                  className={`h-full transition-all ${
                    quotaPct >= 90
                      ? 'bg-signal-600'
                      : quotaPct >= 70
                        ? 'bg-volt-500'
                        : 'bg-precision-blue-600'
                  }`}
                  style={{ width: `${quotaPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-iron-600 dark:text-iron-400">
                {snapshot.monthlyQuotaRemaining > 0
                  ? `Pozostało ${snapshot.monthlyQuotaRemaining} pism do końca okresu`
                  : 'Limit wyczerpany — następny reset po odnowieniu subskrypcji'}
              </p>
            </div>
          )}

          {/* Period end info */}
          {periodEndFormatted && snapshot.tier !== 'free' && (
            <div className="rounded-lg border border-iron-200 bg-iron-50 p-4 dark:border-iron-700 dark:bg-iron-900/40">
              <p className="font-mono text-[11px] uppercase tracking-wider text-iron-600 dark:text-iron-400">
                {snapshot.cancelAtPeriodEnd ? 'Subskrypcja wygasa' : 'Następne odnowienie'}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-iron-950 dark:text-white">
                {periodEndFormatted}
              </p>
              {snapshot.cancelAtPeriodEnd && (
                <p className="mt-1 text-xs text-signal-700 dark:text-signal-400">
                  Po tym dniu plan zostanie zmieniony na Free.
                </p>
              )}
            </div>
          )}

          {/* Cechy planu */}
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-iron-600 dark:text-iron-400">
              Twoje benefity
            </p>
            <ul className="space-y-2">
              {currentPlan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-iron-700 dark:text-iron-300"
                >
                  <span className="mt-0.5 text-precision-blue-600 dark:text-precision-blue-400">
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Akcje */}
          <SubscriptionControls
            tier={snapshot.tier}
            status={snapshot.status}
            cancelAtPeriodEnd={snapshot.cancelAtPeriodEnd}
            hasStripeCustomer={!!snapshot.stripeCustomerId}
            stripeSubscriptionId={snapshot.stripeSubscriptionId}
          />
        </CardContent>
      </Card>

      {/* PLANY DO UPGRADE'U */}
      {upgradablePlans.length > 0 && snapshot.tier !== 'pro_plus' && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-extrabold text-iron-950 dark:text-white">
            {snapshot.tier === 'free' ? 'Wybierz plan' : 'Zmień plan'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {upgradablePlans.map((plan) => (
              <Card key={plan.tier}>
                <CardHeader>
                  <div className="flex items-baseline justify-between">
                    <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
                    <p className="font-mono text-lg tabular-nums text-precision-blue-600 dark:text-precision-blue-400">
                      {(plan.amount / 100).toFixed(2)} zł
                      <span className="text-xs text-iron-500">/mies</span>
                    </p>
                  </div>
                  <CardDescription>
                    {plan.monthlyQuota === 999
                      ? 'Bez limitu pism'
                      : `${plan.monthlyQuota} pism/mies`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-4 space-y-1.5 text-sm text-iron-700 dark:text-iron-300">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-0.5 text-precision-blue-600 dark:text-precision-blue-400">
                          ✓
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <SubscriptionControls
                    tier={snapshot.tier}
                    status={snapshot.status}
                    cancelAtPeriodEnd={snapshot.cancelAtPeriodEnd}
                    hasStripeCustomer={!!snapshot.stripeCustomerId}
                    stripeSubscriptionId={snapshot.stripeSubscriptionId}
                    upgradeTo={plan.productCode}
                    upgradeName={plan.name}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* LINK POWROTU */}
      <div className="border-t border-iron-200 pt-6 dark:border-iron-800">
        <Link
          href="/profil"
          className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 hover:underline dark:text-precision-blue-400"
        >
          ← POWRÓT DO PROFILU
        </Link>
      </div>
    </div>
  )
}
