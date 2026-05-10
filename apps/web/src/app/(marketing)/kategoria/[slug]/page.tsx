import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  breadcrumbJsonLd,
  faqJsonLd,
  legalServiceJsonLd,
  serializeJsonLd,
} from '@/lib/seo/json-ld'
import {
  CATEGORIES,
  findCategory,
  getAllCategorySlugs,
} from '@/lib/seo/categories'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cat = findCategory(slug)
  if (!cat) return { title: 'Kategoria nie znaleziona' }

  return {
    title: cat.title,
    description: cat.metaDescription,
    keywords: cat.keywords.join(', '),
    alternates: { canonical: `/kategoria/${slug}` },
    openGraph: {
      title: cat.title,
      description: cat.metaDescription,
      type: 'website',
      url: `/kategoria/${slug}`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const cat = findCategory(slug)
  if (!cat) notFound()

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Strona główna', url: '/' },
    { name: 'Kategorie', url: '/' },
    { name: cat.h1, url: `/kategoria/${slug}` },
  ])
  const faq = faqJsonLd(cat.faq)
  const service = legalServiceJsonLd({
    name: cat.h1,
    description: cat.metaDescription,
    url: `/kategoria/${slug}`,
    serviceType: cat.h1,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(service) }}
      />

      <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-iron-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-precision-blue-600">
                Strona główna
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-iron-700 dark:text-iron-300">{cat.h1}</li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
            KATEGORIA
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-iron-950 dark:text-white sm:text-5xl">
            {cat.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-iron-600 dark:text-iron-300">
            {cat.intro}
          </p>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          {cat.caseTypes.map((ct) => (
            <Link
              key={ct}
              href={`/sprawy/nowa?caseType=${ct}`}
              className="rounded-xl border border-iron-200 bg-white p-5 transition hover:border-precision-blue-400 hover:shadow-md dark:border-iron-800 dark:bg-iron-900"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
                {ct}
              </p>
              <p className="mt-2 font-semibold text-iron-900 dark:text-iron-100">
                Wygeneruj pismo →
              </p>
            </Link>
          ))}
        </section>

        <section className="mb-10 rounded-2xl border border-iron-200 bg-iron-50 p-6 dark:border-iron-800 dark:bg-iron-900/40">
          <h2 className="mb-3 font-display text-xl font-bold text-iron-950 dark:text-white">
            Podstawy prawne
          </h2>
          <ul className="space-y-1 text-sm text-iron-700 dark:text-iron-300">
            {cat.podstawyPrawne.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-display text-2xl font-bold text-iron-950 dark:text-white">
            Najczęstsze pytania
          </h2>
          <dl className="space-y-4">
            {cat.faq.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-iron-200 p-5 dark:border-iron-800"
              >
                <dt className="font-semibold text-iron-900 dark:text-iron-100">
                  {item.q}
                </dt>
                <dd className="mt-2 text-sm text-iron-600 dark:text-iron-400">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl bg-precision-blue-600 p-8 text-center text-white">
          <h2 className="font-display text-2xl font-bold">
            Wygeneruj pismo z AI w 60 sekund
          </h2>
          <p className="mt-2 text-precision-blue-100">
            99 zł, gotowy plik PDF z podstawami prawnymi i argumentacją.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/sprawy/nowa"
              className="rounded-md bg-white px-6 py-2.5 text-sm font-medium text-precision-blue-700 hover:bg-precision-blue-50"
            >
              Wygeneruj pismo (99 zł)
            </Link>
            <Link
              href="/sprawdz-szanse"
              className="rounded-md border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/20"
            >
              Najpierw darmowa ocena AI
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 font-display text-lg font-bold text-iron-950 dark:text-white">
            Zobacz też
          </h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {CATEGORIES.filter((c) => c.slug !== slug)
              .slice(0, 6)
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/kategoria/${c.slug}`}
                    className="text-precision-blue-600 hover:underline"
                  >
                    {c.h1} →
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </article>
    </>
  )
}
