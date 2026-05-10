import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  serializeJsonLd,
} from '@/lib/seo/json-ld'
import {
  findCategory,
  findLongTail,
  getAllLongTailSlugs,
  LONG_TAIL,
} from '@/lib/seo/categories'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllLongTailSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const lt = findLongTail(slug)
  if (!lt) return { title: 'Poradnik nie znaleziony' }

  return {
    title: lt.title,
    description: lt.metaDescription,
    keywords: lt.keywords.join(', '),
    alternates: { canonical: `/poradnik/${slug}` },
    openGraph: {
      title: lt.title,
      description: lt.metaDescription,
      type: 'article',
      url: `/poradnik/${slug}`,
    },
  }
}

export default async function LongTailPage({ params }: PageProps) {
  const { slug } = await params
  const lt = findLongTail(slug)
  if (!lt) notFound()

  const parentCat = findCategory(lt.parentCategory)
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Strona główna', url: '/' },
    { name: 'Poradnik', url: '/' },
    ...(parentCat
      ? [{ name: parentCat.h1, url: `/kategoria/${parentCat.slug}` }]
      : []),
    { name: lt.h1, url: `/poradnik/${slug}` },
  ])
  const faq = faqJsonLd(lt.faq)
  const article = articleJsonLd({
    headline: lt.h1,
    description: lt.metaDescription,
    url: `/poradnik/${slug}`,
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(article) }}
      />

      <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-iron-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-precision-blue-600">
                Strona główna
              </Link>
            </li>
            <li aria-hidden>/</li>
            {parentCat && (
              <>
                <li>
                  <Link
                    href={`/kategoria/${parentCat.slug}`}
                    className="hover:text-precision-blue-600"
                  >
                    {parentCat.h1}
                  </Link>
                </li>
                <li aria-hidden>/</li>
              </>
            )}
            <li className="text-iron-700 dark:text-iron-300">{lt.h1}</li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
            PORADNIK
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-iron-950 dark:text-white sm:text-4xl">
            {lt.h1}
          </h1>
          <p className="mt-4 text-base text-iron-600 dark:text-iron-300">
            {lt.intro}
          </p>
        </header>

        <section className="mb-10 space-y-5">
          <h2 className="font-display text-xl font-bold text-iron-950 dark:text-white">
            Krok po kroku
          </h2>
          <ol className="space-y-4">
            {lt.steps.map((step, i) => (
              <li
                key={i}
                className="rounded-lg border border-iron-200 bg-white p-5 dark:border-iron-800 dark:bg-iron-900"
              >
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-semibold text-iron-900 dark:text-iron-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-iron-600 dark:text-iron-400">
                  {step.content}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-10 rounded-2xl bg-precision-blue-600 p-8 text-center text-white">
          <h2 className="font-display text-xl font-bold">
            Wygeneruj pismo dopasowane do Twojej sprawy
          </h2>
          <p className="mt-2 text-sm text-precision-blue-100">
            AI Mandatomat — 99 zł, 60 sekund, gotowy PDF.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/sprawy/nowa?caseType=${lt.primaryCaseType}`}
              className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-precision-blue-700 hover:bg-precision-blue-50"
            >
              Wygeneruj pismo (99 zł)
            </Link>
            <Link
              href="/kalkulator-przedawnienia"
              className="rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20"
            >
              Najpierw sprawdź przedawnienie
            </Link>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl font-bold text-iron-950 dark:text-white">
            Pytania i odpowiedzi
          </h2>
          <dl className="space-y-4">
            {lt.faq.map((item, i) => (
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

        <section className="border-t border-iron-200 pt-8 dark:border-iron-800">
          <h2 className="mb-4 font-display text-base font-bold text-iron-950 dark:text-white">
            Zobacz inne poradniki
          </h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {LONG_TAIL.filter((l) => l.slug !== slug)
              .slice(0, 6)
              .map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/poradnik/${l.slug}`}
                    className="text-precision-blue-600 hover:underline"
                  >
                    {l.h1} →
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </article>
    </>
  )
}
