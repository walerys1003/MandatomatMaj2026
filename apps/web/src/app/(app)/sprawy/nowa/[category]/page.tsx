import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import {
  CATEGORIES,
  caseTypeUrlSlug,
  getCategory,
  getCaseTypesByCategory,
} from '@/lib/cases/catalog'

interface PageProps {
  params: { category: string }
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const cat = getCategory(params.category)
  if (!cat) return { title: 'Nieznana kategoria' }
  return {
    title: `${cat.title} — wybierz typ pisma`,
    description: cat.description,
  }
}

/**
 * Krok 1b wizarda — wybór konkretnego typu pisma w ramach kategorii.
 *
 * Server Component. Karty MVP są klikalne, pozostałe wyszarzone (Soon).
 */
export default function CategoryPage({ params }: PageProps) {
  const cat = getCategory(params.category)
  if (!cat) notFound()

  const types = getCaseTypesByCategory(cat.id)
  // MVP najpierw, potem reszta (alfabetycznie po shortId)
  const sorted = [...types].sort((a, b) => {
    if (a.mvp !== b.mvp) return a.mvp ? -1 : 1
    return a.shortId.localeCompare(b.shortId)
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
      <nav className="mb-6 flex items-center gap-2 text-sm text-iron-500">
        <Link href="/sprawy/nowa" className="hover:text-precision-blue-600 hover:underline">
          ← Wszystkie kategorie
        </Link>
      </nav>

      <header className="mb-10 text-center">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-iron-500">
          Krok 1 z 4 — Rodzaj sprawy
        </p>
        <div className="mb-3 flex items-center justify-center gap-2 text-3xl">{cat.icon}</div>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-iron-950 dark:text-white sm:text-5xl">
          {cat.title}
        </h1>
        <p className="mt-3 text-base text-iron-600 dark:text-iron-300">{cat.description}</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sorted.map((t) => {
          const slug = caseTypeUrlSlug(t)
          const href = `/sprawy/nowa/${cat.slug}/${slug}/formularz`
          const Tag = t.mvp ? Link : 'div'

          return (
            <Tag
              key={t.type}
              href={t.mvp ? href : (undefined as never)}
              aria-disabled={!t.mvp}
              className={`group relative flex min-h-[110px] cursor-pointer items-start gap-4 rounded-xl border-[1.5px] bg-white p-4 transition-all duration-150 ease-snap dark:bg-iron-900 ${
                t.mvp
                  ? 'border-iron-200 hover:-translate-y-px hover:border-precision-blue-300 hover:shadow-md dark:border-iron-800 dark:hover:border-precision-blue-700'
                  : 'pointer-events-none border-iron-100 opacity-60 dark:border-iron-800'
              }`}
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-2xl">
                {t.icon}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-iron-400">
                    {t.shortId}
                  </span>
                  {t.mvp ? (
                    <span className="rounded-full bg-volt-100 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-volt-700">
                      Dostępne
                    </span>
                  ) : (
                    <span className="rounded-full bg-iron-100 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-iron-500 dark:bg-iron-800">
                      Wkrótce
                    </span>
                  )}
                </div>
                <h2 className="mt-1 font-display text-base font-bold tracking-[-0.01em] text-iron-950 dark:text-white">
                  {t.title}
                </h2>
                <p className="mt-1 text-xs text-iron-600 dark:text-iron-400">{t.description}</p>
                <p className="mt-2 font-mono text-[11px] text-iron-500">
                  {t.price} zł / pismo
                </p>
              </div>
              {t.mvp ? (
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-precision-blue-600 transition-transform group-hover:translate-x-0.5 dark:text-precision-blue-400"
                  aria-hidden="true"
                >
                  →
                </span>
              ) : null}
            </Tag>
          )
        })}
      </div>

      <p className="mt-8 text-center text-sm text-iron-500">
        Twoja sprawa nie pasuje do żadnej? Zacznij od{' '}
        <Link
          href="/sprawdz-szanse"
          className="font-medium text-precision-blue-600 hover:underline"
        >
          darmowej oceny szans
        </Link>
        .
      </p>
    </div>
  )
}
