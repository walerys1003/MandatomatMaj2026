import Link from 'next/link'
import * as React from 'react'

import { cn } from '../lib/cn'

/**
 * <RelatedArticles> — sekcja "Powiązane artykuły" na końcu blog post / SEO landing.
 *
 * Roadmap T20 / T5-SEO-024 + T5-SEO-025: cross-linking między blogiem a stronami
 * kategorii. Zwiększa internal linking dla SEO + retencję użytkownika.
 *
 * Layout:
 *  - mobile: pojedyncza kolumna, full-width karty
 *  - tablet+: 2-kolumnowy grid
 *  - max 3 itemy (więcej rozprasza)
 */

export interface RelatedArticleItem {
  /** Pełny URL (relatywny lub absolutny). */
  href: string
  /** Tytuł artykułu / strony. */
  title: string
  /** Krótki opis (1-2 zdania, max 160 znaków). */
  description: string
  /** Pill — np. "Mandaty", "Windykacja", "Blog". */
  category?: string
  /** Czas czytania — np. "7 min". */
  readingTime?: string
  /** Czy link zewnętrzny — wtedy target=_blank. */
  external?: boolean
}

export interface RelatedArticlesProps {
  items: RelatedArticleItem[]
  /** Tytuł sekcji. Default: "Powiązane artykuły". */
  title?: string
  /** Opcjonalny opis pod tytułem. */
  description?: string
  className?: string
}

export function RelatedArticles({
  items,
  title = 'Powiązane artykuły',
  description,
  className,
}: RelatedArticlesProps): React.JSX.Element | null {
  if (items.length === 0) return null

  return (
    <aside className={cn('border-t border-iron-200 pt-8 dark:border-iron-800', className)}>
      <div className="mb-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-iron-500">Czytaj dalej</p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">{description}</p>
        ) : null}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {items.slice(0, 3).map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={cn(
                'group block h-full rounded-xl border border-iron-200 bg-white p-5',
                'transition-colors duration-150',
                'hover:border-precision-blue-300 hover:bg-precision-blue-50/30',
                'dark:border-iron-800 dark:bg-iron-900',
                'dark:hover:border-precision-blue-700 dark:hover:bg-precision-blue-950/30',
              )}
            >
              {item.category ? (
                <span className="inline-block rounded bg-iron-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-iron-700 dark:bg-iron-800 dark:text-iron-300">
                  {item.category}
                </span>
              ) : null}
              <h3 className="mt-2 font-display text-base font-bold tracking-[-0.01em] text-iron-950 group-hover:text-precision-blue-700 dark:text-white dark:group-hover:text-precision-blue-300">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-iron-600 dark:text-iron-400">
                {item.description}
              </p>
              {item.readingTime ? (
                <p className="mt-3 text-xs text-iron-500 dark:text-iron-500">
                  {item.readingTime} czytania
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
