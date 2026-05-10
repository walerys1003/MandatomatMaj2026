import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { DeadlineCountdown } from '@mandatomat/ui'

import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Terminy',
  description: 'Wszystkie terminy w jednym miejscu — kalendarz + lista nadchodzących.',
}

interface DeadlineRow {
  id: string
  case_id: string
  title: string
  deadline_date: string
  status: string
  legal_basis: string | null
  description: string | null
}

const POLISH_MONTHS = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
]
const POLISH_DAYS = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz']

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

/**
 * /terminy — kalendarz miesięczny + lista nadchodzących.
 */
export default async function DeadlinesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/terminy')

  const { data } = await supabase
    .from('deadlines')
    .select('id, case_id, title, deadline_date, status, legal_basis, description')
    .eq('user_id', user.id)
    .order('deadline_date', { ascending: true })
    .limit(200)

  const allDeadlines = (data ?? []) as DeadlineRow[]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString().slice(0, 10)

  const upcoming = allDeadlines.filter((d) => d.deadline_date >= todayIso && !['cancelled', 'completed'].includes(d.status))
  const past = allDeadlines.filter((d) => d.deadline_date < todayIso || ['cancelled', 'completed'].includes(d.status))

  // Build calendar grid for current month
  const monthStart = startOfMonth(today)
  const totalDays = daysInMonth(today)
  // Polish week starts on Monday (1), JS getDay returns 0=Sun..6=Sat → convert
  const firstDayWeekday = (monthStart.getDay() + 6) % 7

  const cells: Array<{ day: number | null; iso: string | null; deadlines: DeadlineRow[] }> = []
  for (let i = 0; i < firstDayWeekday; i++) cells.push({ day: null, iso: null, deadlines: [] })
  for (let day = 1; day <= totalDays; day++) {
    const dt = new Date(today.getFullYear(), today.getMonth(), day)
    const iso = dt.toISOString().slice(0, 10)
    const dayDeadlines = allDeadlines.filter((d) => d.deadline_date === iso)
    cells.push({ day, iso, deadlines: dayDeadlines })
  }

  const monthLabel = `${POLISH_MONTHS[today.getMonth()]} ${today.getFullYear()}`

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">
          Terminy
        </h1>
        <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
          Łącznie aktywnych: <strong>{upcoming.length}</strong>
        </p>
      </header>

      {/* Kalendarz miesięczny */}
      <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-iron-700 dark:text-iron-300">
          {monthLabel}
        </h2>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-iron-500 dark:text-iron-400">
          {POLISH_DAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            const isToday = cell.iso === todayIso
            const hasDeadlines = cell.deadlines.length > 0
            return (
              <div
                key={idx}
                className={
                  cell.day === null
                    ? 'aspect-square'
                    : 'aspect-square rounded-md border p-1 text-xs ' +
                      (isToday
                        ? 'border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/40'
                        : hasDeadlines
                          ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
                          : 'border-iron-100 bg-white dark:border-iron-800 dark:bg-iron-900')
                }
              >
                {cell.day !== null ? (
                  <>
                    <div className={isToday ? 'font-bold text-brand-700 dark:text-brand-300' : 'text-iron-700 dark:text-iron-300'}>
                      {cell.day}
                    </div>
                    {hasDeadlines ? (
                      <Link
                        href={`/sprawy/${cell.deadlines[0]!.case_id}`}
                        className="mt-0.5 block truncate text-[10px] text-amber-800 hover:underline dark:text-amber-300"
                        title={cell.deadlines.map((d) => d.title).join(', ')}
                      >
                        {cell.deadlines.length === 1
                          ? cell.deadlines[0]!.title
                          : `${cell.deadlines.length} terminy`}
                      </Link>
                    ) : null}
                  </>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista nadchodzących */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-iron-900 dark:text-iron-100">
          Nadchodzące
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-md border border-dashed border-iron-300 bg-white p-6 text-center text-sm text-iron-500 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-400">
            Brak nadchodzących terminów.
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/sprawy/${d.case_id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-iron-200 bg-white px-4 py-3 hover:border-brand-300 dark:border-iron-700 dark:bg-iron-900 dark:hover:border-brand-600"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-iron-900 dark:text-iron-100">
                      {d.title}
                    </p>
                    {d.legal_basis ? (
                      <p className="mt-0.5 text-xs text-iron-500 dark:text-iron-400">{d.legal_basis}</p>
                    ) : null}
                  </div>
                  <DeadlineCountdown deadline={d.deadline_date} format="long" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Historia */}
      {past.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-iron-700 dark:text-iron-300">
            Historia
          </h2>
          <ul className="space-y-1.5">
            {past.slice(0, 20).map((d) => (
              <li key={d.id}>
                <Link
                  href={`/sprawy/${d.case_id}`}
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-iron-600 hover:bg-iron-100 dark:text-iron-400 dark:hover:bg-iron-800"
                >
                  <span className="truncate">{d.title}</span>
                  <span className="text-xs text-iron-500">{d.deadline_date} · {d.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
