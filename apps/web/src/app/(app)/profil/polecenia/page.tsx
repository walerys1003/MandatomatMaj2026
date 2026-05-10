import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mandatomat/ui/card'
import { EmptyState } from '@mandatomat/ui/empty-state'

import { getReferralStats, REFERRAL_DISCOUNT_PERCENT } from '@/lib/payments/referral'
import { createClient } from '@/lib/supabase/server'

import { ReferralShareCard } from './share-card'

export const metadata: Metadata = {
  title: 'Polecaj znajomym',
  description: 'Zaproś znajomych do Mandatomat — zniżka 20% dla nich, statystyki dla Ciebie.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Polecaj znajomym — strona z kodem referral, share URL i statystykami.
 *
 * Faza 9 z roadmapy T20: "Referral system (polecenie = 20% zniżka)".
 *
 * Każdy user ma własny `profiles.referral_code` (auto-generated przy signup).
 * Po wysłaniu linku znajomemu, ten przy rejestracji i pierwszym checkoucie
 * dostaje 20% zniżki — automatycznie, bez wpisywania kodu.
 */
export default async function PoleceniaPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/profil/polecenia')

  const stats = await getReferralStats(user.id)

  if (!stats) {
    return (
      <div className="space-y-6">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
            KONTO
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
            Polecaj znajomym
          </h1>
        </header>
        <EmptyState
          variant="default"
          icon="⏳"
          title="Kod referral się generuje"
          description="Twój unikalny kod referral nie został jeszcze wygenerowany. Spróbuj odświeżyć stronę za kilka sekund."
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          KONTO
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
          Polecaj znajomym 🎁
        </h1>
        <p className="mt-2 text-iron-600 dark:text-iron-300">
          Podziel się linkiem, a Twoi znajomi otrzymają{' '}
          <strong>{REFERRAL_DISCOUNT_PERCENT}% zniżki</strong> na pierwsze pismo.
        </p>
      </header>

      <ReferralShareCard code={stats.code} discountPercent={REFERRAL_DISCOUNT_PERCENT} />

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Rejestracje z Twojego linku</CardDescription>
            <CardTitle className="font-mono text-4xl tabular-nums">{stats.signups}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-iron-600 dark:text-iron-300">
            Liczba osób, które założyły konto klikając Twój link.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Konwersje (płatności)</CardDescription>
            <CardTitle className="text-success-600 dark:text-success-400 font-mono text-4xl tabular-nums">
              {stats.conversions}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-iron-600 dark:text-iron-300">
            Liczba osób, które wykorzystały Twój kod przy zakupie pisma.
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-iron-200 bg-iron-50 p-5 dark:border-iron-800 dark:bg-iron-900/50">
        <h2 className="font-display text-lg font-bold text-iron-950 dark:text-white">
          Jak to działa?
        </h2>
        <ol className="mt-3 space-y-2 text-sm text-iron-700 dark:text-iron-200">
          <li>
            <strong>1.</strong> Skopiuj swój link i wyślij znajomemu (e-mail, Messenger, WhatsApp).
          </li>
          <li>
            <strong>2.</strong> Znajomy rejestruje się przez Twój link — kod zapisze się
            automatycznie.
          </li>
          <li>
            <strong>3.</strong> Przy pierwszym zakupie pisma otrzymuje{' '}
            <strong>{REFERRAL_DISCOUNT_PERCENT}% zniżki</strong> — bez wpisywania żadnego kodu.
          </li>
          <li>
            <strong>4.</strong> Tutaj zobaczysz statystyki — ile osób się zarejestrowało i ile
            kupiło.
          </li>
        </ol>
      </section>
    </div>
  )
}
