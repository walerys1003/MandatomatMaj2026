import Link from 'next/link'
import type { Metadata } from 'next'

import {
  CasesList,
  CasesTable,
  DeadlineWidget,
  EmptyState,
  MetricsGrid,
  QuickActionBar,
  SuccessRateWidget,
  type CaseTableRow,
  type DeadlineItem,
  type MetricItem,
  type SuccessRateData,
} from '@mandatomat/ui'

import { caseTypeFromDb } from '@/lib/cases/db-mapping'
import { getCaseTypeMeta } from '@/lib/cases/catalog'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pulpit',
  description: 'Twój panel — sprawy, terminy, statystyki.',
}

interface CaseRow {
  id: string
  case_type: string
  status: string
  created_at: string
  title: string | null
  institution: string | null
}

interface DeadlineRow {
  id: string
  case_id: string
  title: string
  deadline_date: string
  legal_basis: string | null
}

/**
 * /panel — pulpit (dashboard) B2C.
 *
 * Layout (D06):
 *  - Header z powitaniem + DeadlineWidget (jeśli są terminy)
 *  - QuickActionBar (5 buttonów)
 *  - MetricsGrid (4 kafle KPI)
 *  - SuccessRateWidget (donut + breakdown + sparkline)
 *  - CasesTable (desktop) / CasesList (mobile)
 */
export default async function PanelPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user!.id

  // Parallel data fetch
  const [profileRes, casesRes, deadlinesRes, monthCountRes, successRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, plan, subscription_tier')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('cases')
      .select('id, case_type, status, created_at, title, institution')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('deadlines')
      .select('id, case_id, title, deadline_date, legal_basis')
      .eq('user_id', userId)
      .in('status', ['active', 'reminded_d5', 'reminded_d3', 'reminded_d1'])
      .gte('deadline_date', new Date().toISOString().slice(0, 10))
      .order('deadline_date', { ascending: true })
      .limit(10),
    supabase
      .from('cases')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstOfMonthIso()),
    supabase.from('cases').select('id, status').eq('user_id', userId),
  ])

  const profile = profileRes.data as {
    full_name: string | null
    plan: string | null
    subscription_tier: string | null
  } | null
  const cases = (casesRes.data ?? []) as CaseRow[]
  const deadlines = (deadlinesRes.data ?? []) as DeadlineRow[]
  const monthCount = monthCountRes.count ?? 0

  // Stats — derived
  const allCases = (successRes.data ?? []) as { id: string; status: string }[]
  const accepted = allCases.filter((c) => c.status === 'resolved').length
  const rejected = allCases.filter((c) => c.status === 'archived').length
  const pending = allCases.filter((c) => ['paid', 'sent', 'waiting'].includes(c.status)).length
  const totalFinished = accepted + rejected
  const successRate = totalFinished > 0 ? Math.round((accepted / totalFinished) * 100) : 0
  const pendingCount = allCases.filter((c) =>
    ['draft', 'preview', 'paid_pending'].includes(c.status),
  ).length

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Cześć'

  // Build metric items
  const metrics: MetricItem[] = [
    {
      label: 'Pisma w miesiącu',
      value: monthCount,
      icon: '📝',
      variant: 'neutral',
    },
    {
      label: 'Oczekujące',
      value: pendingCount,
      icon: '⏳',
      variant: pendingCount > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'Uwzględnione',
      value: accepted,
      icon: '✓',
      variant: accepted > 0 ? 'success' : 'neutral',
    },
    {
      label: 'Skuteczność',
      value: totalFinished > 0 ? `${successRate}%` : '—',
      icon: '★',
      variant: 'hero',
      ...(totalFinished > 0 ? { trend: `${accepted}/${totalFinished} spraw` } : {}),
    },
  ]

  const successData: SuccessRateData = {
    successRate,
    totalCases: allCases.length,
    breakdown: { accepted, rejected, pending },
  }

  // Map cases to table rows
  const caseRows: CaseTableRow[] = cases.map((c) => {
    const shortId = caseTypeFromDb(c.case_type) ?? null
    const meta = shortId ? getCaseTypeMeta(shortId) : null
    return {
      id: c.id,
      type: c.case_type,
      typeLabel: meta?.title ?? c.case_type,
      createdAt: c.created_at,
      institution: c.institution,
      status: c.status,
      title: c.title,
      // deadline mapped from deadlines list (first matching case_id)
      ...(deadlines.find((d) => d.case_id === c.id)?.deadline_date
        ? { deadline: deadlines.find((d) => d.case_id === c.id)!.deadline_date }
        : {}),
    }
  })

  const deadlineItems: DeadlineItem[] = deadlines.map((d) => ({
    id: d.id,
    caseId: d.case_id,
    title: d.title,
    deadlineDate: d.deadline_date,
    legalBasis: d.legal_basis,
  }))

  const isEmpty = cases.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">
            {firstName === 'Cześć' ? firstName : `Cześć, ${firstName}!`}
          </h1>
          <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
            Tu znajdziesz wszystkie sprawy, terminy i statystyki.
          </p>
        </div>
        <Link
          href="/sprawy/nowa"
          className="bg-brand-600 hover:bg-brand-700 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          + Nowe pismo
        </Link>
      </header>

      {/* Quick actions */}
      <QuickActionBar />

      {/* Empty state vs full dashboard */}
      {isEmpty ? (
        <EmptyState
          variant="hero"
          size="lg"
          icon="✨"
          title="Witaj w Mandatomacie"
          description="Stwórz pierwsze pismo — kreator zajmie ok. 3 minut. AI wygeneruje dla Ciebie sprzeciw, odwołanie lub odpowiedź."
          action={
            <Link
              href="/sprawy/nowa"
              className="inline-flex items-center gap-2 rounded-md bg-precision-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-precision-blue-500"
            >
              Stwórz pierwsze pismo →
            </Link>
          }
          secondaryAction={
            <Link
              href="/sprawdz-szanse"
              className="text-sm text-iron-600 underline-offset-4 hover:text-iron-900 hover:underline dark:text-iron-300 dark:hover:text-white"
            >
              albo sprawdź szanse za darmo
            </Link>
          }
        />
      ) : (
        <>
          {/* Deadlines */}
          {deadlineItems.length > 0 ? <DeadlineWidget items={deadlineItems} /> : null}

          {/* Metrics grid */}
          <MetricsGrid items={metrics} />

          {/* Success rate */}
          <SuccessRateWidget data={successData} />

          {/* Cases */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-iron-900 dark:text-iron-100">
                Twoje sprawy
              </h2>
              <Link
                href="/sprawy"
                className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium"
              >
                Wszystkie →
              </Link>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <CasesTable rows={caseRows} />
            </div>
            {/* Mobile list */}
            <div className="md:hidden">
              <CasesList rows={caseRows} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function firstOfMonthIso(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}
