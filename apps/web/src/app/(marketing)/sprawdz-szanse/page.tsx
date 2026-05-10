import type { Metadata } from 'next'

import { ScoringForm } from './scoring-form'

export const metadata: Metadata = {
  title: 'Sprawdź szanse — darmowa ocena AI',
  description:
    'Opisz swoją sprawę (mandat, parking, windykacja) — AI oceni szanse skuteczności odwołania w 30 sekund. Bez logowania, bez płatności.',
  alternates: { canonical: '/sprawdz-szanse' },
}

/**
 * /sprawdz-szanse — darmowa ocena szans (top funnel).
 *
 * Bez logowania, bez płatności. Limit: 5/min/IP (rate-limit).
 * Po wyniku: CTA "Wygeneruj pełne pismo (99 zł)" → /sprawy/nowa.
 */
export default function SprawdzSzansePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10 text-center">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          DARMOWA OCENA · 30 SEKUND
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-iron-950 dark:text-white sm:text-5xl">
          Sprawdź szanse Twojej sprawy
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-iron-600 dark:text-iron-300">
          Opisz swoją sytuację, a AI oceni szanse skuteczności odwołania, podpowie
          podstawy prawne i wskaże kluczowe argumenty.
          <br />
          <span className="font-medium text-iron-700 dark:text-iron-200">
            Bez rejestracji, bez płatności, bez zobowiązań.
          </span>
        </p>
      </header>

      <ScoringForm />

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        <Feature icon="🎯" title="Realistyczna ocena">
          AI nie zawyża szans. Otrzymasz uczciwą ocenę 0–100% z uzasadnieniem.
        </Feature>
        <Feature icon="⚖️" title="Konkretne podstawy prawne">
          Wskazujemy artykuły ustaw, które są kluczowe dla Twojej sprawy.
        </Feature>
        <Feature icon="🚀" title="3 rekomendacje">
          Praktyczne kroki, które możesz wdrożyć od razu — z prawnikiem lub samodzielnie.
        </Feature>
      </section>
    </div>
  )
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-iron-200 bg-white p-5 dark:border-iron-800 dark:bg-iron-900">
      <div className="mb-2 text-2xl">{icon}</div>
      <h2 className="font-display text-base font-bold tracking-[-0.01em] text-iron-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">{children}</p>
    </div>
  )
}
