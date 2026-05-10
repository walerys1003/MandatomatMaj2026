import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/testimonials (T6-REF-027)
 *
 * Authenticated user submituje opinię — wymaga statusu 'pending' do moderacji.
 * Rate limit: 1/dzień per user (anti-spam).
 *
 * GET /api/testimonials?caseType=...&limit=...
 * Public — zwraca approved testimonials.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const submitSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  city: z.string().trim().max(50).optional().nullable(),
  caseTypeSlug: z.string().trim().max(100).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(20).max(2000),
  outcome: z.enum(['won', 'in_progress', 'lost', 'unknown']).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const rl = await rateLimit(`testimonial-submit:${user.id}`, 'default')
  const headers = rateLimitHeaders(rl)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Można dodać 1 opinię dziennie.' }, { status: 429, headers })
  }

  let body: z.infer<typeof submitSchema>
  try {
    const json = await req.json()
    body = submitSchema.parse(json)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? 'Walidacja' },
        { status: 400, headers },
      )
    }
    return NextResponse.json({ error: 'Nieprawidłowe body' }, { status: 400, headers })
  }

  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      user_id: user.id,
      display_name: body.displayName,
      city: body.city ?? null,
      case_type_slug: body.caseTypeSlug ?? null,
      rating: body.rating,
      body: body.body,
      outcome: body.outcome ?? 'unknown',
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Błąd zapisu opinii.' }, { status: 500, headers })
  }

  return NextResponse.json(
    {
      ok: true,
      id: (data as { id: string }).id,
      message: 'Dziękujemy! Opinia trafiła do moderacji.',
    },
    { status: 201, headers },
  )
}

const querySchema = z.object({
  caseType: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  let query: z.infer<typeof querySchema>
  try {
    query = querySchema.parse({
      caseType: req.nextUrl.searchParams.get('caseType') ?? undefined,
      limit: req.nextUrl.searchParams.get('limit') ?? undefined,
    })
  } catch {
    return NextResponse.json({ error: 'Bad query' }, { status: 400 })
  }

  const supabase = createClient()
  let q = supabase
    .from('testimonials')
    .select('id, display_name, city, case_type_slug, rating, body, outcome, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(query.limit)

  if (query.caseType) {
    q = q.eq('case_type_slug', query.caseType)
  }

  const { data, error } = await q
  if (error) {
    return NextResponse.json({ error: 'Błąd odczytu' }, { status: 500 })
  }

  return NextResponse.json({ testimonials: data ?? [] }, { status: 200 })
}
