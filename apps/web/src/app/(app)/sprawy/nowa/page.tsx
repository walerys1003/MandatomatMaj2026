import Link from 'next/link'
import type { Metadata } from 'next'

import { CATEGORIES, getCaseTypesByCategory } from '@/lib/cases/catalog'

export const metadata: Metadata = {
  title: 'Nowa sprawa — wybierz kategorię',
  description:
    'Wybierz kategorię sprawy: mandat, parking, windykacja, ubezpieczenia, e-TOLL, kontrola, badanie techniczne.',
}

/**
 * Krok 1 wizarda — wybór kategorii sprawy.
 *
 * Server Component — pełna lista 7 kategorii z liczbą dostępnych w MVP typów.
 * Każda karta linkuje do `/sprawy/nowa/[category]`.
 */
export default function NowaSprawaPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-10 text-center">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-iron-500">
          Krok 1 z 4 — Rodzaj sprawy
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-iron-950 dark:text-white sm:text-5xl">
          Z czym mamy pomóc?
        </h1>
        <p className="mt-3 text-base text-iron-600 dark:text-iron-300">
          Wybierz kategorię, a w kolejnym kroku doprecyzujesz typ pisma.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const types = getCaseTypesByCategory(cat.id)
          const mvpCount = types.filter((t) => t.mvp).length
          const totalCount = types.length
          const available = mvpCount > 0

          return (
            <Link
              key={cat.id}
              href={available ? `/sprawy/nowa/${cat.slug}` : '#'}
              aria-disabled={!available}
              className={`group relative flex min-h-[140px] flex-col rounded-xl border-[1.5px] bg-white p-5 transition-all duration-150 ease-snap dark:bg-iron-900 ${
                available
                  ? 'border-iron-200 hover:-translate-y-px hover:border-precision-blue-300 hover:shadow-md dark:border-iron-800 dark:hover:border-precision-blue-700'
                  : 'pointer-events-none border-iron-100 opacity-50 dark:border-iron-800'
              }`}
            >
              <div className="mb-3 text-3xl">{cat.icon}</div>
              <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
                {cat.title}
              </h2>
              <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">{cat.description}</p>

              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="font-mono text-[11px] uppercase tracking-wider text-iron-500">
                  {available ? `${mvpCount} dostępne / ${totalCount}` : `Wkrótce (${totalCount})`}
                </span>
                {available ? (
                  <span
                    className="text-precision-blue-600 transition-transform group-hover:translate-x-0.5 dark:text-precision-blue-400"
                    aria-hidden="true"
                  >
                    →
                  </span>
                ) : (
                  <span className="rounded-full bg-iron-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-iron-500 dark:bg-iron-800">
                    Soon
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <p className="mt-8 text-center text-sm text-iron-500">
        Nie widzisz swojej sprawy?{' '}
        <Link href="/kontakt" className="font-medium text-precision-blue-600 hover:underline">
          Napisz do nas
        </Link>{' '}
        — dodajemy nowe kategorie na bieżąco.
      </p>
    </div>
  )
}
