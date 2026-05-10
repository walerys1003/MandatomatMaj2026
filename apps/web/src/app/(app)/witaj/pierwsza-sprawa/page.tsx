import type { Metadata } from 'next'
import Link from 'next/link'

import { Stepper } from '@mandatomat/ui'

import { CompleteOnboardingButton } from './complete-onboarding-button'

export const metadata: Metadata = {
  title: 'Onboarding — pierwsza sprawa',
  description: 'Krok 3 z 3 — utwórz pierwszą sprawę lub zacznij od pulpitu.',
  robots: { index: false, follow: false },
}

const STEPS = [
  { id: '1', label: 'Powitanie' },
  { id: '2', label: 'Profil' },
  { id: '3', label: 'Pierwsza sprawa' },
]

const CATEGORIES = [
  {
    slug: 'mandaty',
    icon: '🚓',
    title: 'Mandat karny',
    desc: 'Prędkość, fotoradar, straż gminna, ITD',
  },
  { slug: 'parking', icon: '🅿️', title: 'Parking', desc: 'Wezwania ZTM/MPK, opłaty dodatkowe SPP' },
  {
    slug: 'windykacja',
    icon: '💼',
    title: 'Windykacja',
    desc: 'Przedawnienie długu, KRUK, EOS, Intrum',
  },
  { slug: 'ubezpieczenia', icon: '🛡️', title: 'Ubezpieczenia', desc: 'OC, AC, odmowa wypłaty' },
  { slug: 'etoll', icon: '🛣️', title: 'e-TOLL', desc: 'Kary za brak opłat, awaria urządzenia' },
  {
    slug: 'kontrole',
    icon: '⚠️',
    title: 'Kontrole drogowe',
    desc: 'Zatrzymanie prawa jazdy, CEPiK',
  },
  {
    slug: 'techniczne',
    icon: '🔧',
    title: 'Pisma techniczne',
    desc: 'Pełnomocnictwo, RODO, lista załączników',
  },
] as const

/**
 * Krok 3/3 — pierwsza sprawa.
 *
 * Dwa flow:
 *  A) "Utwórz pierwszą sprawę" → wybór kategorii → /sprawy/nowa/[slug]
 *     (klik kategorii uruchamia `completeOnboardingAction` z `next=sprawy`)
 *  B) "Zacznij od pulpitu" → /panel
 *     (komponent `CompleteOnboardingButton` z `next=panel`)
 *
 * W obu przypadkach `profiles.onboarding_completed` jest ustawiane na true
 * + emit event `user_onboarding_completed`.
 */
export default function WitajPierwszaSprawaPage() {
  return (
    <div className="space-y-10">
      <Stepper steps={STEPS} currentIndex={2} completedThrough={1} />

      <header className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          Krok 3 z 3
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
          Z czym przyszedłeś?
        </h1>
        <p className="text-base text-iron-600 dark:text-iron-300">
          Wybierz kategorię i przejdź do katalogu — pomożemy znaleźć właściwy typ pisma. Możesz też
          pominąć i zacząć od pulpitu.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Kategorie spraw">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/sprawy/nowa/${cat.slug}`}
            className="group flex items-start gap-3 rounded-xl border border-iron-200 bg-white p-4 transition-colors duration-150 hover:border-precision-blue-300 hover:bg-precision-blue-50/40 dark:border-iron-800 dark:bg-iron-900 dark:hover:border-precision-blue-800 dark:hover:bg-precision-blue-950/30"
          >
            <span className="text-2xl" aria-hidden="true">
              {cat.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-iron-950 group-hover:text-precision-blue-700 dark:text-white dark:group-hover:text-precision-blue-300">
                {cat.title}
              </p>
              <p className="mt-0.5 text-xs text-iron-600 dark:text-iron-400">{cat.desc}</p>
            </div>
            <span
              aria-hidden="true"
              className="self-center text-iron-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-precision-blue-600"
            >
              →
            </span>
          </Link>
        ))}
      </section>

      <section className="border-volt-200 dark:border-volt-900 dark:bg-volt-950/30 rounded-xl border bg-volt-50/60 p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-volt-700 dark:text-volt-300">
          Tip
        </p>
        <p className="mt-2 text-sm text-iron-700 dark:text-iron-200">
          Nie wiesz w którą kategorię trafia Twoja sprawa? Skorzystaj z{' '}
          <Link
            href="/sprawdz-szanse"
            className="font-medium text-precision-blue-700 underline underline-offset-4 hover:text-precision-blue-800"
          >
            darmowej oceny szans
          </Link>{' '}
          — opisz sytuację, AI podpowie kategorię i typ pisma.
        </p>
      </section>

      <footer className="flex flex-col-reverse items-stretch gap-3 border-t border-iron-100 pt-6 dark:border-iron-800 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/witaj/profil"
          className="text-sm text-iron-500 underline-offset-4 hover:text-iron-700 hover:underline"
        >
          ← Wstecz
        </Link>
        <CompleteOnboardingButton />
      </footer>
    </div>
  )
}
