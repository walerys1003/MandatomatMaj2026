import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { Badge } from '@mandatomat/ui'

import { caseTypeFromDb } from '@/lib/cases/db-mapping'
import { getCaseTypeMeta } from '@/lib/cases/catalog'
import { createClient } from '@/lib/supabase/server'

import {
  PreviewClient,
  type PreviewDocument,
  type PreviewScoring,
  type ValidationIssue,
} from './preview-client'

interface PageProps {
  params: { caseId: string }
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Podgląd sprawy',
  description: 'Podgląd wygenerowanego pisma — możesz edytować i pobrać.',
}

/**
 * /sprawy/[caseId]/podglad — krok 3 wizarda.
 *
 * Server: ładuje sprawę + ostatni dokument + scoring; przekazuje do klienta.
 * Klient: generowanie, taby preview/edit, ScoringGauge, banner walidacji.
 */
export default async function PodgladPage({ params }: PageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/sprawy/${params.caseId}/podglad`)

  const { data: caseData, error } = await supabase
    .from('cases')
    .select(
      'id, case_type, category, title, status, payment_status, form_data, scoring_result, created_at',
    )
    .eq('id', params.caseId)
    .single()

  if (error || !caseData) notFound()

  const tsType = caseTypeFromDb(caseData.case_type)
  const meta = tsType ? getCaseTypeMeta(tsType) : undefined

  const { data: documents } = await supabase
    .from('documents')
    .select(
      'id, doc_type, title, content_markdown, score, validation_passed, validation_issues, ai_cost_usd, created_at',
    )
    .eq('case_id', caseData.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const rawDoc = documents?.[0] ?? null

  const initialDocument: PreviewDocument | null = rawDoc
    ? {
        id: rawDoc.id,
        doc_type: rawDoc.doc_type,
        title: rawDoc.title ?? null,
        content_markdown: rawDoc.content_markdown ?? '',
        score: typeof rawDoc.score === 'number' ? rawDoc.score : null,
        validation_passed:
          typeof rawDoc.validation_passed === 'boolean' ? rawDoc.validation_passed : null,
        validation_issues: normalizeIssues(rawDoc.validation_issues),
        ai_cost_usd: typeof rawDoc.ai_cost_usd === 'number' ? rawDoc.ai_cost_usd : null,
        created_at: rawDoc.created_at,
      }
    : null

  const initialScoring: PreviewScoring | null = parseScoring(caseData.scoring_result)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-iron-500">
        <Link href="/panel" className="hover:text-precision-blue-600 hover:underline">
          ← Pulpit
        </Link>
      </nav>

      <header className="mb-8">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          Krok 3 z 4 — Podgląd
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
          {caseData.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {meta ? (
            <span className="font-mono text-[11px] uppercase tracking-wider text-iron-500">
              {meta.shortId} · {meta.title}
            </span>
          ) : null}
          <Badge variant={statusBadgeVariant(caseData.status)}>{statusLabel(caseData.status)}</Badge>
          {caseData.payment_status === 'paid' ? (
            <Badge variant="success">Opłacone</Badge>
          ) : null}
        </div>
      </header>

      <PreviewClient
        caseId={caseData.id}
        caseTitle={caseData.title}
        caseStatus={caseData.status}
        initialDocument={initialDocument}
        initialScoring={initialScoring}
      />
    </div>
  )
}

// ============================================================================
// Helpers
// ============================================================================

function normalizeIssues(raw: unknown): ValidationIssue[] | null {
  if (!Array.isArray(raw)) return null
  const out: ValidationIssue[] = []
  for (const x of raw) {
    if (typeof x !== 'object' || x === null) continue
    const obj = x as Record<string, unknown>
    const message = typeof obj.message === 'string' ? obj.message : ''
    if (message.length === 0) continue
    const severity =
      obj.severity === 'error' || obj.severity === 'warning' || obj.severity === 'info'
        ? (obj.severity as 'error' | 'warning' | 'info')
        : undefined
    const issue: ValidationIssue = { message }
    if (severity !== undefined) issue.severity = severity
    if (typeof obj.category === 'string') issue.category = obj.category
    if (typeof obj.suggestion === 'string') issue.suggestion = obj.suggestion
    out.push(issue)
  }
  return out
}

function parseScoring(raw: unknown): PreviewScoring | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const score = typeof r.score === 'number' ? r.score : null
  if (score == null) return null
  return {
    score,
    reasoning: typeof r.reasoning === 'string' ? r.reasoning : undefined,
    warnings: Array.isArray(r.warnings)
      ? (r.warnings.filter((x) => typeof x === 'string') as string[])
      : undefined,
  }
}

function statusLabel(s: string): string {
  switch (s) {
    case 'draft':
      return 'Szkic'
    case 'form_completed':
      return 'Formularz wypełniony'
    case 'generating':
      return 'Generowanie…'
    case 'preview':
      return 'Podgląd'
    case 'editing':
      return 'Edycja'
    case 'payment_pending':
      return 'Oczekuje płatności'
    case 'paid':
      return 'Opłacone'
    case 'downloaded':
      return 'Pobrane'
    case 'sent':
      return 'Wysłane'
    case 'waiting':
      return 'Oczekuje odp.'
    case 'resolved':
      return 'Zakończone'
    case 'archived':
      return 'Zarchiwizowane'
    default:
      return s
  }
}

function statusBadgeVariant(s: string): 'neutral' | 'info' | 'success' | 'danger' | 'warning' {
  switch (s) {
    case 'draft':
    case 'form_completed':
      return 'neutral'
    case 'generating':
    case 'preview':
    case 'editing':
      return 'info'
    case 'payment_pending':
      return 'warning'
    case 'paid':
    case 'downloaded':
    case 'sent':
    case 'resolved':
      return 'success'
    case 'failed':
      return 'danger'
    default:
      return 'neutral'
  }
}
