import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { CASE_TYPES } from '@mandatomat/db-types'

import { caseTypeToDb } from '@/lib/cases/db-mapping'
import { getCaseTypeMeta } from '@/lib/cases/catalog'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/cases — utwórz nową sprawę (status: draft).
 * GET  /api/cases — lista spraw zalogowanego usera (paginacja przez ?limit&offset).
 *
 * RLS na `cases` zapewnia, że user widzi tylko swoje sprawy.
 * Service role NIE używany — zwykły server client z cookies.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ============================================================================
// POST — create case
// ============================================================================

const postSchema = z.object({
  caseType: z.enum(CASE_TYPES),
  formData: z.record(z.unknown()),
  formSchemaVersion: z.number().int().positive().default(1),
  /** Optional: powiązane upload IDs (OCR załączników). */
  uploadIds: z.array(z.string().uuid()).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { caseType, formData, formSchemaVersion } = parsed.data

  const meta = getCaseTypeMeta(caseType)
  if (!meta) {
    return NextResponse.json({ error: 'Nieznany typ sprawy' }, { status: 400 })
  }
  if (!meta.mvp) {
    return NextResponse.json(
      { error: 'Ten typ sprawy nie jest jeszcze dostępny w MVP' },
      { status: 403 },
    )
  }

  let dbCaseType: string
  try {
    dbCaseType = caseTypeToDb(caseType)
  } catch {
    return NextResponse.json(
      { error: 'Brak mapowania DB dla tego typu sprawy' },
      { status: 500 },
    )
  }

  // Title — generujemy z meta + krótkiego summary
  const title = buildCaseTitle(meta.title, formData)

  const { data, error } = await supabase
    .from('cases')
    .insert({
      user_id: user.id,
      category: meta.category,
      case_type: dbCaseType,
      title,
      status: 'draft',
      form_data: { ...formData, _form_schema_version: formSchemaVersion },
      payment_status: 'unpaid',
    })
    .select('id, case_type, category, title, status, created_at')
    .single()

  if (error) {
    console.error('[api/cases POST]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ case: data }, { status: 201 })
}

// ============================================================================
// GET — list cases
// ============================================================================

const getQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  category: z.string().optional(),
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const url = new URL(req.url)
  const parsed = getQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja query', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { limit, offset, status, category } = parsed.data

  let query = supabase
    .from('cases')
    .select(
      'id, case_type, category, title, status, payment_status, deadline_date, created_at, updated_at',
      { count: 'exact' },
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    cases: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  })
}

// ============================================================================
// Helpers
// ============================================================================

/** Generuj zwięzły title sprawy z meta + form_data. */
function buildCaseTitle(baseTitle: string, formData: Record<string, unknown>): string {
  const parts: string[] = [baseTitle]

  // Numer mandatu / sprawy / wezwania (jeśli jest)
  const numer =
    pickString(formData, 'numer_mandatu') ??
    pickString(formData, 'numer_wezwania') ??
    pickString(formData, 'numer_sprawy')
  if (numer) parts.push(`#${numer}`)

  // Wierzyciel (W1)
  const wierzyciel = pickString(formData, 'wierzyciel')
  if (wierzyciel && parts.length < 3) parts.push(wierzyciel)

  return parts.join(' · ').slice(0, 200)
}

function pickString(data: Record<string, unknown>, key: string): string | null {
  const v = data[key]
  if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  return null
}
