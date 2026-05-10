/**
 * Blog CMS layer (T6-CMS-029, T6-CMS-030).
 *
 * Abstrakcja nad `blog_posts` z fallbackiem na inline TS (lib/blog/posts.ts)
 * dla compat z istniejącym kodem `/blog/[slug]`.
 *
 * Strategia migracji:
 *   1. Nowe artykuły dodaje admin → `blog_posts` table.
 *   2. Stare 5 inline artykułów pozostają w `posts.ts` jako fallback.
 *   3. `getAllPosts()` zwraca union (DB ∪ inline, deduped by slug).
 */

import { createClient } from '@/lib/supabase/server'
import type { BlogPost } from './posts'
import { BLOG_POSTS as INLINE_POSTS } from './posts'

export interface DbBlogPost {
  id: string
  slug: string
  title: string
  description: string
  excerpt: string
  content: string
  author_name: string
  reading_minutes: number
  keywords: string[]
  related_category_slug: string | null
  related_article_slugs: string[]
  published_at: string | null
  updated_at: string
  cover_image_url: string | null
  cover_image_alt: string | null
  status: string
}

/**
 * Convert DB row → public BlogPost (compatible with existing renderers).
 */
function fromDbRow(row: DbBlogPost): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    excerpt: row.excerpt,
    publishedAt: (row.published_at ?? row.updated_at).slice(0, 10),
    updatedAt: row.updated_at.slice(0, 10),
    author: row.author_name,
    readingMinutes: row.reading_minutes,
    keywords: row.keywords,
    relatedCategorySlug: row.related_category_slug ?? '',
    relatedArticleSlugs: row.related_article_slugs,
    content: row.content,
  }
}

/**
 * Pobierz wszystkie published artykuły (DB + inline merged).
 * SSG-safe — wywoływane w generateStaticParams.
 */
export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  let dbPosts: BlogPost[] = []
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        'id,slug,title,description,excerpt,content,author_name,reading_minutes,keywords,related_category_slug,related_article_slugs,published_at,updated_at,cover_image_url,cover_image_alt,status',
      )
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })

    if (!error && Array.isArray(data)) {
      dbPosts = (data as unknown as DbBlogPost[]).map(fromDbRow)
    }
  } catch {
    // DB unavailable at build time — fallback to inline only
  }

  // Merge: prefer DB version if slug collides
  const dbSlugs = new Set(dbPosts.map((p: BlogPost) => p.slug))
  const inlineFiltered = INLINE_POSTS.filter((p: BlogPost) => !dbSlugs.has(p.slug))

  return [...dbPosts, ...inlineFiltered].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select(
        'id,slug,title,description,excerpt,content,author_name,reading_minutes,keywords,related_category_slug,related_article_slugs,published_at,updated_at,cover_image_url,cover_image_alt,status',
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (data) return fromDbRow(data as unknown as DbBlogPost)
  } catch {
    // fallthrough
  }

  return INLINE_POSTS.find((p: BlogPost) => p.slug === slug) ?? null
}
