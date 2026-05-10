import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import {
  DeadlineCountdown,
  DocumentTimeline,
  StatusBadge,
  buildDefaultSteps,
  type TimelineStep,
} from '@mandatomat/ui'

import { caseTypeFromDb } from '@/lib/cases/db-mapping'
import { getCaseTypeMeta } from '@/lib/cases/catalog'
import { createClient } from '@/lib/supabase/server'

import { CaseTabs } from './case-tabs'

interface PageProps {
  params: { caseId: string }
  searchParams: { tab?: string }
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Szczegóły sprawy',
  description: 'Pełen widok sprawy — dokumenty, terminy, historia.',
}

interface CaseRow {
  id: string
  user_id: string
  case_type: string
  status: string
  title: string | null
  institution: string | null
  form_data: Record<string, unknown> | null
  created_at: string
  updated_at: string | null
}

interface DocRow {
  id: string
  doc_type: string
  title: string
  version: number
  is_current: boolean
  storage_path: string | null
  file_name: string | null
  ai_model_used: string | null
  created_at: string
}

interface DeadlineRow {
  id: string
  title: string
  deadline_date: string
  status: string
  legal_basis: string | null
  source: string | null
}

interface EventRow {
  id: string
  event_type: string
  data: Record<string, unknown> | null
  created_at: string
}

interface PaymentRow {
  id: string
  status: string
  amount: number
  product_name: string
  created_at: string
}

/**
 * /sprawy/[caseId] — pełen widok sprawy.
 *
 * Tabs (T14):
 *  - Dokumenty (default): timeline + lista wersji
 *  - Terminy:    lista deadlines
 *  - Historia:   pełen event log z events table
 *  - Szczegóły:  form_data + meta
 */
export default async function CaseDetailPage({ params, searchParams }: PageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/sprawy/${params.caseId}`)

  const [caseRes, docsRes, deadlinesRes, eventsRes, paymentsRes] = await Promise.all([
    supabase
      .from('cases')
      .select('id, user_id, case_type, status, title, institution, form_data, created_at, updated_at')
      .eq('id', params.caseId)
      .maybeSingle(),
    supabase
      .from('documents')
      .select('id, doc_type, title, version, is_current, storage_path, file_name, ai_model_used, created_at')
      .eq('case_id', params.caseId)
      .order('version', { ascending: false }),
    supabase
      .from('deadlines')
      .select('id, title, deadline_date, status, legal_basis, source')
      .eq('case_id', params.caseId)
      .order('deadline_date', { ascending: true }),
    supabase
      .from('events')
      .select('id, event_type, data, created_at')
      .eq('case_id', params.caseId)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('payments')
      .select('id, status, amount, product_name, created_at')
      .eq('case_id', params.caseId)
      .order('created_at', { ascending: false }),
  ])

  const caseRow = caseRes.data as CaseRow | null
  if (!caseRow) notFound()
  if (caseRow.user_id !== user.id) {
    return (
      <div className="rounded-md border border-signal-300 bg-signal-50 p-4 text-sm text-signal-900">
        Brak dostępu do tej sprawy.
      </div>
    )
  }

  const docs = (docsRes.data ?? []) as DocRow[]
  const deadlines = (deadlinesRes.data ?? []) as DeadlineRow[]
  const events = (eventsRes.data ?? []) as EventRow[]
  const payments = (paymentsRes.data ?? []) as PaymentRow[]

  const shortId = caseTypeFromDb(caseRow.case_type)
  const meta = shortId ? getCaseTypeMeta(shortId) : null

  // Build timeline z events table
  const timelineEvents: Parameters<typeof buildDefaultSteps>[0] = {
    createdAt: new Date(caseRow.created_at),
    generatedAt: pickEventDate(events, 'document_generated'),
    paidAt: pickEventDate(events, 'payment_succeeded'),
    downloadedAt: pickEventDate(events, 'document_downloaded'),
    sentAt: pickEventDate(events, 'document_sent'),
    respondedAt: pickEventDate(events, 'case_responded'),
  }
  const timelineSteps: TimelineStep[] = buildDefaultSteps(timelineEvents)

  const activeTab = (searchParams.tab as 'documents' | 'deadlines' | 'history' | 'details') ?? 'documents'

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/panel"
            className="mb-2 inline-flex items-center gap-1 text-xs text-iron-500 hover:text-iron-800 dark:text-iron-400 dark:hover:text-iron-200"
          >
            ← Pulpit
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">
            {caseRow.title ?? meta?.title ?? 'Sprawa'}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge status={caseRow.status} />
            {caseRow.institution ? (
              <span className="text-iron-600 dark:text-iron-400">· {caseRow.institution}</span>
            ) : null}
            {deadlines[0] ? (
              <>
                <span aria-hidden className="text-iron-400">·</span>
                <DeadlineCountdown deadline={deadlines[0].deadline_date} format="long" />
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {caseRow.status === 'preview' || caseRow.status === 'draft' ? (
            <Link
              href={`/sprawy/${caseRow.id}/podglad`}
              className="rounded-md border border-iron-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-iron-50 dark:border-iron-600 dark:bg-iron-800 dark:text-iron-100 dark:hover:bg-iron-700"
            >
              Podgląd / edycja
            </Link>
          ) : null}
          {caseRow.status === 'preview' || caseRow.status === 'draft' ? (
            <Link
              href={`/sprawy/${caseRow.id}/platnosc`}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Zapłać
            </Link>
          ) : caseRow.status === 'paid' || caseRow.status === 'archived' ? (
            <Link
              href={`/sprawy/${caseRow.id}/pobranie`}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Pobierz PDF
            </Link>
          ) : null}
        </div>
      </header>

      {/* Timeline (D08) */}
      <div className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-iron-600 dark:text-iron-400">
          Postęp
        </h2>
        <DocumentTimeline steps={timelineSteps} />
      </div>

      {/* Tabs */}
      <CaseTabs
        caseId={caseRow.id}
        activeTab={activeTab}
        documents={docs}
        deadlines={deadlines}
        events={events}
        payments={payments}
        formData={caseRow.form_data}
        caseType={caseRow.case_type}
      />
    </div>
  )
}

function pickEventDate(events: EventRow[], type: string): Date | null {
  const found = events.find((e) => e.event_type === type)
  return found ? new Date(found.created_at) : null
}
