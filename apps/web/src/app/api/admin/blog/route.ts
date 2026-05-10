import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Admin blog API (T6-CMS-030).
 *
 * GET  /api/admin/blog?status=draft|review|published
 * POST /api/admin/blog          (create new draft)
 *
 * Authorization: only users with `profiles.role = 'admin'`.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin(): Promise<{ userId: string } | NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const role = (profile as { role?: string } | null)?.role
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
  }
  return { userId: user.id }
}

const createSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug musi zawierać tylko a-z, 0-9, -'),
  title: z.string().trim().min(10).max(200),
  description: z.string().trim().min(50).max(320),
  excerpt: z.string().trim().min(20).max(500),
  content: z.string().trim().min(200),
  keywords: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  relatedCategorySlug: z.string().trim().max(100).optional().nullable(),
  relatedArticleSlugs: z.array(z.string().trim().max(200)).max(10).default([]),
  scheduledFor: z.string().datetime().optional().nullable(),
  aiGeneratedDraft: z.boolean().default(false),
  aiPromptUsed: z.string().trim().max(2000).optional().nullable(),
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const status = req.nextUrl.searchParams.get('status') ?? undefined
  const supabase = createClient()
  let q = supabase
    .from('blog_posts')
    .select(
      'id,slug,title,status,author_name,published_at,scheduled_for,updated_at,reading_minutes',
    )
    .order('updated_at', { ascending: false })
    .limit(100)

  if (status && ['draft', 'review', 'published', 'archived'].includes(status)) {
    q = q.eq('status', status)
  }

  const { data, error } = await q
  if (error) {
    return NextResponse.json({ error: 'Błąd odczytu' }, { status: 500 })
  }
  return NextResponse.json({ posts: data ?? [] }, { status: 200 })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard
  const { userId } = guard

  const rl = await rateLimit(`admin-blog:${userId}`, 'default')
  const headers = rateLimitHeaders(rl)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Zbyt wiele żądań.' }, { status: 429, headers })
  }

  let body: z.infer<typeof createSchema>
  try {
    const json = await req.json()
    body = createSchema.parse(json)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? 'Walidacja' },
        { status: 400, headers },
      )
    }
    return NextResponse.json({ error: 'Bad body' }, { status: 400, headers })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('blog_posts')
    .insert({
      slug: body.slug,
      title: body.title,
      description: body.description,
      excerpt: body.excerpt,
      content: body.content,
      keywords: body.keywords,
      related_category_slug: body.relatedCategorySlug ?? null,
      related_article_slugs: body.relatedArticleSlugs,
      author_id: userId,
      author_name: 'Redakcja Mandatomatu',
      status: 'draft',
      scheduled_for: body.scheduledFor ?? null,
      ai_generated_draft: body.aiGeneratedDraft,
      ai_prompt_used: body.aiPromptUsed ?? null,
    })
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Slug już istnieje. Wybierz inny.' },
        { status: 409, headers },
      )
    }
    return NextResponse.json({ error: 'Błąd zapisu.' }, { status: 500, headers })
  }

  return NextResponse.json({ ok: true, post: data }, { status: 201, headers })
}
