import type { Metadata } from 'next'

import { KalkulatorForm } from './kalkulator-form'

export const metadata: Metadata = {
  title: 'Kalkulator przedawnienia — sprawdź czy roszczenie wygasło',
  description:
    'Darmowy kalkulator przedawnienia: mandaty (1 rok), windykacja (3 lata), e-TOLL (5 lat), OC (3 lata), parking SPP (1 rok). Podstawy prawne KW, KC, KPA. Liczy przerwy i zawieszenia biegu.',
  alternates: { canonical: '/kalkulator-przedawnienia' },
  openGraph: {
    title: 'Kalkulator przedawnienia — Mandatomat',
    description:
      'Sprawdź w 10 sekund czy Twoje roszczenie się przedawniło. Wszystkie kategorie: mandaty, parking, windykacja, OC, e-TOLL.',
    type: 'website',
  },
}

/**
 * /kalkulator-przedawnienia — narzędzie diagnostyczne (lead magnet).
 *
 * Pure client-side calculation (bez wywołań AI, bez rate-limit) — szybkie,
 * deterministyczne. Po wyniku CTA do /sprawy/nowa lub /sprawdz-szanse.
 */
export default function KalkulatorPrzedawnieniaPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10 text-center">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          DARMOWE NARZĘDZIE · 10 SEKUND
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-iron-950 dark:text-white sm:text-5xl">
          Kalkulator przedawnienia
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-iron-600 dark:text-iron-300">
          Sprawdź czy Twoje roszczenie już się przedawniło. Obsługujemy
          mandaty (KW), windykację (KC), e-TOLL, OC, parking SPP i decyzje
          administracyjne (KPA).
        </p>
      </header>

      <KalkulatorForm />

      <section className="mt-16 rounded-2xl border border-iron-200 bg-iron-50 p-6 dark:border-iron-800 dark:bg-iron-900/40">
        <h2 className="mb-4 font-display text-xl font-bold text-iron-950 dark:text-white">
          Najczęstsze okresy przedawnienia
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-iron-900 dark:text-iron-100">
              Wykroczenie — 1 rok
            </dt>
            <dd className="text-iron-600 dark:text-iron-400">
              art. 45 § 1 KW (od dnia popełnienia czynu)
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-iron-900 dark:text-iron-100">
              Windykacja działalności — 3 lata
            </dt>
            <dd className="text-iron-600 dark:text-iron-400">
              art. 118 KC (przedsiębiorca, abonament, czynsz)
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-iron-900 dark:text-iron-100">
              Roszczenia cywilne — 6 lat
            </dt>
            <dd className="text-iron-600 dark:text-iron-400">
              art. 118 KC (po nowelizacji 9.07.2018)
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-iron-900 dark:text-iron-100">
              OC z deliktu — 3 lata
            </dt>
            <dd className="text-iron-600 dark:text-iron-400">
              art. 442¹ § 1 KC (max. 10 lat od zdarzenia)
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-iron-900 dark:text-iron-100">
              e-TOLL — 5 lat
            </dt>
            <dd className="text-iron-600 dark:text-iron-400">
              art. 13k ustawy o autostradach
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-iron-900 dark:text-iron-100">
              Opłata SPP — 1 rok
            </dt>
            <dd className="text-iron-600 dark:text-iron-400">
              art. 40d ust. 3 ustawy o drogach publicznych
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-xs text-iron-500 dark:text-iron-500">
          Uwaga: kalkulator nie zastępuje porady prawnika. Bieg przedawnienia
          może być przerwany (art. 123 KC) lub zawieszony (art. 121 KC) — np.
          przez uznanie długu, pozew, mediację. Skorzystaj z opcji
          „przerwanie/zawieszenie" w formularzu.
        </p>
      </section>
    </div>
  )
}
