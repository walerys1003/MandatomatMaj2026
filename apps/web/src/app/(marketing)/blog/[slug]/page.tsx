import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { MarkdownPreview, RelatedArticles } from '@mandatomat/ui'

import { BLOG_POSTS, getAllPostSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog/posts'
import { CATEGORIES } from '@/lib/seo/categories'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Nie znaleziono artykułu' }
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mandatomat.pl'

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(post.slug)
  const category = CATEGORIES.find((c) => c.slug === post.relatedCategorySlug)

  // JSON-LD: Article (Google search snippet)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Mandatomat',
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    keywords: post.keywords.join(', '),
  }

  // JSON-LD: BreadcrumbList
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  }

  const relatedItems = related.map((p) => ({
    href: `/blog/${p.slug}`,
    title: p.title,
    description: p.excerpt,
    category: 'Blog',
    readingTime: `${p.readingMinutes} min`,
  }))

  // Plus link do kategorii (T5-SEO-025: internal linking)
  if (category && relatedItems.length < 3) {
    relatedItems.push({
      href: `/kategoria/${category.slug}`,
      title: category.h1,
      description: category.metaDescription,
      category: 'Strona kategorii',
      readingTime: '',
    })
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      {/* Breadcrumb visual */}
      <nav aria-label="Okruchy" className="mb-6 text-xs text-iron-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:underline">
              Strona główna
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-iron-700 dark:text-iron-300" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-wider text-iron-500">
          {formatPolishDate(post.publishedAt)}
          {post.updatedAt ? ` · zaktualizowano ${formatPolishDate(post.updatedAt)}` : ''}
          {' · '}
          {post.readingMinutes} min czytania
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-iron-700 dark:text-iron-300">
          {post.excerpt}
        </p>
      </header>

      {/* Content */}
      <div className="prose-style">
        <MarkdownPreview content={post.content} />
      </div>

      {/* CTA do kategorii */}
      {category ? (
        <aside className="mt-12 rounded-xl border border-precision-blue-200 bg-precision-blue-50 p-6 dark:border-precision-blue-800 dark:bg-precision-blue-950/30">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
            Potrzebujesz pisma na ten temat?
          </h2>
          <p className="mt-2 text-sm text-iron-700 dark:text-iron-300">
            Mandatomat generuje gotowe pismo w 60 sekund — wybierz typ z kategorii{' '}
            <strong>{category.h1.replace(' — generator AI', '')}</strong>.
          </p>
          <Link
            href={`/kategoria/${category.slug}`}
            className="mt-4 inline-flex items-center rounded-md bg-precision-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-precision-blue-500"
          >
            Zobacz kategorię →
          </Link>
        </aside>
      ) : null}

      {/* Related articles */}
      {relatedItems.length > 0 ? (
        <div className="mt-12">
          <RelatedArticles items={relatedItems} />
        </div>
      ) : null}

      {/* Back to blog */}
      <div className="mt-10 text-sm">
        <Link
          href="/blog"
          className="text-iron-600 underline hover:text-iron-900 dark:text-iron-400 dark:hover:text-iron-100"
        >
          ← Wszystkie artykuły
        </Link>
      </div>
    </article>
  )
}

// Avoid unused warnings if BLOG_POSTS imported only for future filters
void BLOG_POSTS
