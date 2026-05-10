import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { CASE_STATUSES } from '@mandatomat/db-types'

import { createClient } from '@/lib/supabase/server'

/**
 * GET    /api/cases/[caseId] — szczegóły sprawy + powiązane dokumenty/uploady
 * PATCH  /api/cases/[caseId] — edycja form_data / status / title (RLS chroni)
 * DELETE /api/cases/[caseId] — usuń sprawę (TYLKO status=draft, RLS-policy)
 *
 * RLS na `cases` zapewnia, że user widzi/edytuje tylko swoje sprawy.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: { caseId: string }
}

const uuidSchema = z.string().uuid()

// ============================================================================
// GET
// ============================================================================

export async function GET(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  if (!uuidSchema.safeParse(ctx.params.caseId).success) {
    return NextResponse.json({ error: 'Nieprawidłowy caseId' }, { status: 400 })
  }

  const [caseRes, docsRes, uploadsRes] = await Promise.all([
    supabase
      .from('cases')
      .select(
        'id, user_id, case_type, category, title, status, priority, form_data, ocr_data, scoring_result, payment_status, amount_paid, deadline_date, deadline_source, created_at, updated_at',
      )
      .eq('id', ctx.params.caseId)
      .single(),
    supabase
      .from('documents')
      .select(
        'id, doc_type, title, content_markdown, score, validation_passed, validation_issues, ai_cost_usd, created_at, updated_at',
      )
      .eq('case_id', ctx.params.caseId)
      .order('created_at', { ascending: false }),
    supabase
      .from('uploads')
      .select('id, file_name, file_path, ocr_status, ocr_parsed_data, created_at')
      .eq('case_id', ctx.params.caseId)
      .order('created_at', { ascending: false }),
  ])

  if (caseRes.error) {
    if (caseRes.error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Sprawa nie znaleziona' }, { status: 404 })
    }
    return NextResponse.json({ error: caseRes.error.message }, { status: 500 })
  }

  return NextResponse.json({
    case: caseRes.data,
    documents: docsRes.data ?? [],
    uploads: uploadsRes.data ?? [],
  })
}

// ============================================================================
// PATCH
// ============================================================================

const patchSchema = z.object({
  formData: z.record(z.unknown()).optional(),
  status: z.enum(CASE_STATUSES).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
})

export async function PATCH(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  if (!uuidSchema.safeParse(ctx.params.caseId).success) {
    return NextResponse.json({ error: 'Nieprawidłowy caseId' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.formData !== undefined) update['form_data'] = parsed.data.formData
  if (parsed.data.status !== undefined) update['status'] = parsed.data.status
  if (parsed.data.title !== undefined) update['title'] = parsed.data.title
  if (parsed.data.deadlineDate !== undefined) update['deadline_date'] = parsed.data.deadlineDate

  const { data, error } = await supabase
    .from('cases')
    .update(update)
    .eq('id', ctx.params.caseId)
    .select('id, case_type, category, title, status, form_data, updated_at')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Sprawa nie znaleziona' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ case: data })
}

// ============================================================================
// DELETE
// ============================================================================

export async function DELETE(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  if (!uuidSchema.safeParse(ctx.params.caseId).success) {
    return NextResponse.json({ error: 'Nieprawidłowy caseId' }, { status: 400 })
  }

  // RLS-policy "Users delete draft cases only" — wymaga status='draft'.
  // Sprawdzamy najpierw, żeby dać sensowny błąd zamiast "0 rows".
  const { data: existing, error: fetchErr } = await supabase
    .from('cases')
    .select('id, status')
    .eq('id', ctx.params.caseId)
    .single()

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Sprawa nie znaleziona' }, { status: 404 })
  }

  if (existing.status !== 'draft') {
    return NextResponse.json(
      { error: 'Tylko szkice (draft) można usuwać. Sprawy ze statusem innym wymagają archiwizacji.' },
      { status: 403 },
    )
  }

  const { error: deleteErr } = await supabase
    .from('cases')
    .delete()
    .eq('id', ctx.params.caseId)

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
