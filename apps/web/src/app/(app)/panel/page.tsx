import Link from 'next/link'

import { Badge } from '@mandatomat/ui/badge'
import { Button } from '@mandatomat/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mandatomat/ui/card'

import { createClient } from '@/lib/supabase/server'

/**
 * Pulpit (dashboard) — strona startowa panelu.
 *
 * Zawiera:
 *  - Powitanie z imieniem
 *  - 3 quick stat cards (sprawy aktywne / terminy / oszczędności)
 *  - CTA "Nowe pismo" + lista 5 ostatnich spraw (jeśli są)
 *  - Empty state dla nowego usera
 */

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = user!.id

  const [profileRes, casesRes, deadlinesRes] = await Promise.all([
    supabase.from('profiles').select('full_name, plan').eq('id', userId).single(),
    supabase
      .from('cases')
      .select('id, case_type, status, created_at, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('deadlines')
      .select('id, due_at, label')
      .eq('user_id', userId)
      .gte('due_at', new Date().toISOString())
      .order('due_at', { ascending: true })
      .limit(3),
  ])

  const profile = profileRes.data
  const cases = casesRes.data ?? []
  const deadlines = deadlinesRes.data ?? []
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Cześć'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
            PULPIT
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 sm:text-4xl dark:text-white">
            {firstName === 'Cześć' ? 'Cześć!' : `Cześć, ${firstName}!`}
          </h1>
          <p className="mt-1 text-iron-600 dark:text-iron-300">
            Zarządzaj swoimi sprawami i pisz odwołania w 3 minuty.
          </p>
        </div>
        <Button asChild size="md" variant="primary">
          <Link href="/kreator">+ Nowe pismo</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Sprawy aktywne</CardDescription>
            <CardTitle className="font-display text-3xl tabular-nums">
              {cases.filter((c) => c.status === 'in_progress' || c.status === 'draft').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Najbliższe terminy</CardDescription>
            <CardTitle className="font-display text-3xl tabular-nums">
              {deadlines.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Wszystkie sprawy</CardDescription>
            <CardTitle className="font-display text-3xl tabular-nums">{cases.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent cases */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
            Ostatnie sprawy
          </h2>
          <Link
            href="/sprawy"
            className="text-sm font-medium text-precision-blue-600 hover:underline dark:text-precision-blue-400"
          >
            Zobacz wszystkie →
          </Link>
        </div>

        {cases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-3xl" aria-hidden>
                📋
              </p>
              <h3 className="mt-4 font-display text-lg font-bold text-iron-950 dark:text-white">
                Nie masz jeszcze żadnych spraw
              </h3>
              <p className="mt-1 text-sm text-iron-600 dark:text-iron-300">
                Zacznij od pierwszego odwołania — zajmie to 3 minuty.
              </p>
              <Button asChild size="md" variant="primary" className="mt-6">
                <Link href="/kreator">Zacznij pierwsze pismo →</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="divide-y divide-iron-100 rounded-xl border border-iron-100 bg-white dark:divide-iron-800 dark:border-iron-800 dark:bg-iron-900">
            {cases.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/sprawy/${c.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-iron-50 dark:hover:bg-iron-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-iron-950 dark:text-white">
                      {c.title ?? c.case_type}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-iron-500">
                      {c.case_type} · {new Date(c.created_at).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <Badge variant="default">{c.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
