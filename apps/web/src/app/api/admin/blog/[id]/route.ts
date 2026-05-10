import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Admin blog single-post API (T6-CMS-030).
 *
 * GET    /api/admin/blog/[id]    — full row
 * PATCH  /api/admin/blog/[id]    — update fields (title/content/status/...)
 * DELETE /api/admin/blog/[id]    — soft-delete (archive)
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin(): Promise<NextResponse | true> {
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
  if ((profile as { role?: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
  }
  return true
}

const patchSchema = z.object({
  title: z.string().trim().min(10).max(200).optional(),
  description: z.string().trim().min(50).max(320).optional(),
  excerpt: z.string().trim().min(20).max(500).optional(),
  content: z.string().trim().min(200).optional(),
  keywords: z.array(z.string()).max(20).optional(),
  relatedCategorySlug: z.string().trim().max(100).nullable().optional(),
  relatedArticleSlugs: z.array(z.string()).max(10).optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  coverImageAlt: z.string().trim().max(200).nullable().optional(),
})

export async function GET(
  _req: NextRequest,
  ctx: { params: { id: string } },
): Promise<NextResponse> {
  const guard = await requireAdmin()
  if (guard !== true) return guard

  const supabase = createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', ctx.params.id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'Nie znaleziono.' }, { status: 404 })
  }
  return NextResponse.json({ post: data }, { status: 200 })
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: { id: string } },
): Promise<NextResponse> {
  const guard = await requireAdmin()
  if (guard !== true) return guard

  let body: z.infer<typeof patchSchema>
  try {
    const json = await req.json()
    body = patchSchema.parse(json)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Walidacja' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Bad body' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.title !== undefined) update.title = body.title
  if (body.description !== undefined) update.description = body.description
  if (body.excerpt !== undefined) update.excerpt = body.excerpt
  if (body.content !== undefined) update.content = body.content
  if (body.keywords !== undefined) update.keywords = body.keywords
  if (body.relatedCategorySlug !== undefined)
    update.related_category_slug = body.relatedCategorySlug
  if (body.relatedArticleSlugs !== undefined)
    update.related_article_slugs = body.relatedArticleSlugs
  if (body.status !== undefined) {
    update.status = body.status
    if (body.status === 'published' && !body.publishedAt) {
      update.published_at = new Date().toISOString()
    }
  }
  if (body.scheduledFor !== undefined) update.scheduled_for = body.scheduledFor
  if (body.publishedAt !== undefined) update.published_at = body.publishedAt
  if (body.coverImageUrl !== undefined) update.cover_image_url = body.coverImageUrl
  if (body.coverImageAlt !== undefined) update.cover_image_alt = body.coverImageAlt

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('blog_posts')
    .update(update)
    .eq('id', ctx.params.id)
    .select('id, slug, status, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Błąd zapisu.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, post: data }, { status: 200 })
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: { id: string } },
): Promise<NextResponse> {
  const guard = await requireAdmin()
  if (guard !== true) return guard

  const admin = createAdminClient()
  const { error } = await admin
    .from('blog_posts')
    .update({ status: 'archived' })
    .eq('id', ctx.params.id)

  if (error) {
    return NextResponse.json({ error: 'Błąd usuwania.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true }, { status: 200 })
}
