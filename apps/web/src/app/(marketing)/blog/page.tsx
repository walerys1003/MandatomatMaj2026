import Link from 'next/link'
import type { Metadata } from 'next'

import { BLOG_POSTS } from '@/lib/blog/posts'

/**
 * /blog — lista wszystkich artykułów (T5-SEO-022).
 *
 * Renderowane jako Static (cache na build), bo posts.ts jest typu const.
 * Sortowanie: najnowsze pierwsze (po publishedAt DESC).
 */

export const metadata: Metadata = {
  title: 'Blog — porady prawne, mandaty, windykacja | Mandatomat',
  description:
    'Praktyczne porady prawne dotyczące mandatów, windykacji, parkingów i kontroli drogowych. 5 artykułów z aktualnymi przepisami i wzorami pism.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog Mandatomat — porady prawne i wzory pism',
    description:
      'Aktualne artykuły o mandatach, windykacji, EPU, przedawnieniach i punktach karnych.',
    type: 'website',
  },
}

const POLISH_MONTHS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
]

function formatPolishDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${POLISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export default function BlogIndexPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-wider text-iron-500">Blog</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
          Porady prawne i wzory pism
        </h1>
        <p className="mt-3 text-base leading-relaxed text-iron-700 dark:text-iron-300">
          Praktyczne artykuły o mandatach, windykacji, EPU, przedawnieniach i punktach karnych — z
          aktualnymi przepisami, terminami i krok-po-kroku instrukcjami.
        </p>
      </header>

      <ul className="space-y-6">
        {sorted.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-iron-200 bg-white p-6 transition hover:border-precision-blue-300 hover:bg-precision-blue-50/30 dark:border-iron-800 dark:bg-iron-900 dark:hover:border-precision-blue-700 dark:hover:bg-precision-blue-950/30"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-iron-500">
                  {formatPolishDate(post.publishedAt)}
                </span>
                <span aria-hidden className="text-iron-300">
                  ·
                </span>
                <span className="text-iron-500">{post.readingMinutes} min czytania</span>
              </div>
              <h2 className="mt-2 font-display text-xl font-bold tracking-[-0.02em] text-iron-950 group-hover:text-precision-blue-700 dark:text-white dark:group-hover:text-precision-blue-300 sm:text-2xl">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-iron-700 dark:text-iron-300">
                {post.excerpt}
              </p>
              <p className="mt-3 text-sm font-medium text-precision-blue-700 group-hover:underline dark:text-precision-blue-400">
                Czytaj więcej →
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <aside className="mt-12 rounded-xl border border-precision-blue-200 bg-precision-blue-50 p-6 dark:border-precision-blue-800 dark:bg-precision-blue-950/30">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
          Potrzebujesz pisma teraz?
        </h2>
        <p className="mt-2 text-sm text-iron-700 dark:text-iron-300">
          Mandatomat generuje pismo w 60 sekund — wybierz typ sprawy i wypełnij krótki formularz.
        </p>
        <Link
          href="/sprawy/nowa"
          className="mt-4 inline-flex items-center rounded-md bg-precision-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-precision-blue-500"
        >
          Sprawdź swoją sprawę →
        </Link>
      </aside>
    </div>
  )
}
