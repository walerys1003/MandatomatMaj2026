import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { CasesList, CasesTable, type CaseTableRow } from '@mandatomat/ui'

import { caseTypeFromDb } from '@/lib/cases/db-mapping'
import { getCaseTypeMeta } from '@/lib/cases/catalog'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Moje sprawy',
  description: 'Wszystkie Twoje sprawy w jednym miejscu.',
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
  case_id: string
  deadline_date: string
}

/**
 * /sprawy — lista wszystkich spraw użytkownika.
 *
 * Filtry (przyszłość): ?status, ?type, ?from, ?to.
 */
export default async function CasesListPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/sprawy')

  const [casesRes, deadlinesRes] = await Promise.all([
    supabase
      .from('cases')
      .select('id, case_type, status, created_at, title, institution')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('deadlines')
      .select('case_id, deadline_date')
      .eq('user_id', user.id)
      .gte('deadline_date', new Date().toISOString().slice(0, 10)),
  ])

  const cases = (casesRes.data ?? []) as CaseRow[]
  const deadlines = (deadlinesRes.data ?? []) as DeadlineRow[]

  const rows: CaseTableRow[] = cases.map((c) => {
    const shortId = caseTypeFromDb(c.case_type)
    const meta = shortId ? getCaseTypeMeta(shortId) : null
    const dl = deadlines.find((d) => d.case_id === c.id)
    return {
      id: c.id,
      type: c.case_type,
      typeLabel: meta?.title ?? c.case_type,
      createdAt: c.created_at,
      institution: c.institution,
      status: c.status,
      title: c.title,
      ...(dl ? { deadline: dl.deadline_date } : {}),
    }
  })

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">
            Moje sprawy
          </h1>
          <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
            Łącznie: <strong>{rows.length}</strong>
          </p>
        </div>
        <Link
          href="/sprawy/nowa"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          + Nowe pismo
        </Link>
      </header>

      <div className="hidden md:block">
        <CasesTable rows={rows} emptyMessage="Nie masz jeszcze żadnych spraw — stwórz pierwszą." />
      </div>
      <div className="md:hidden">
        <CasesList rows={rows} emptyMessage="Brak spraw." />
      </div>
    </div>
  )
}
