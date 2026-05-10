import Link from 'next/link'
import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Użytkownicy',
}

/**
 * /admin/uzytkownicy — lista wszystkich użytkowników (profiles).
 *
 * Filtry (query string):
 *  - q: email/full_name/pesel substring
 *  - plan: free | kierowca | pro
 *  - role: user | admin | moderator
 *  - sort: created_at_desc | created_at_asc | last_active
 *  - page: 1..N (paginacja po 50)
 *
 * Wyświetla 50 wierszy/stronę, z linkiem do szczegółów /admin/uzytkownicy/[id].
 */

const PAGE_SIZE = 50

type SearchParams = {
  q?: string
  plan?: string
  role?: string
  sort?: string
  page?: string
}

type ProfileRow = {
  id: string
  email: string
  full_name: string | null
  subscription_plan: string | null
  documents_this_month: number | null
  documents_limit: number | null
  role: string | null
  created_at: string
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function planLabel(plan: string | null): string {
  switch (plan) {
    case 'kierowca':
      return 'Kierowca'
    case 'pro':
      return 'Pro'
    case 'free':
    default:
      return 'Free'
  }
}

function planBadgeClass(plan: string | null): string {
  switch (plan) {
    case 'kierowca':
      return 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
    case 'pro':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    default:
      return 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-300'
  }
}

function roleBadgeClass(role: string | null): string {
  switch (role) {
    case 'admin':
      return 'bg-signal-100 text-signal-800 dark:bg-signal-950 dark:text-signal-300'
    case 'moderator':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    default:
      return 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-300'
  }
}

export default async function AdminUzytkownicyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const plan = (sp.plan ?? '').trim()
  const role = (sp.role ?? '').trim()
  const sort = sp.sort ?? 'created_at_desc'
  const page = Math.max(1, Number(sp.page ?? '1') || 1)
  const offset = (page - 1) * PAGE_SIZE

  const admin = createAdminClient()

  let query = admin
    .from('profiles')
    .select(
      'id, email, full_name, subscription_plan, documents_this_month, documents_limit, role, created_at',
      { count: 'exact' },
    )

  if (q) {
    // OR search across email + full_name
    const safe = q.replace(/[%,]/g, '')
    query = query.or(`email.ilike.%${safe}%,full_name.ilike.%${safe}%`)
  }
  if (plan && ['free', 'kierowca', 'pro'].includes(plan)) {
    query = query.eq('subscription_plan', plan)
  }
  if (role && ['user', 'admin', 'moderator'].includes(role)) {
    query = query.eq('role', role)
  }

  const ascending = sort === 'created_at_asc'
  query = query.order('created_at', { ascending }).range(offset, offset + PAGE_SIZE - 1)

  const { data, count, error } = await query
  const rows = (data as unknown as ProfileRow[] | null) ?? []
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function paramsWith(overrides: Partial<SearchParams>): string {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (plan) next.set('plan', plan)
    if (role) next.set('role', role)
    if (sort) next.set('sort', sort)
    if (page > 1) next.set('page', String(page))
    for (const [k, v] of Object.entries(overrides)) {
      if (v == null || v === '') next.delete(k)
      else next.set(k, String(v))
    }
    const s = next.toString()
    return s ? `?${s}` : ''
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">Użytkownicy</h1>
          <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
            Łącznie: <strong className="tabular-nums">{total}</strong>
            {q || plan || role ? ' (po filtrach)' : ''}
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          ← Dashboard
        </Link>
      </header>

      {/* Filtry */}
      <form
        method="get"
        className="grid grid-cols-1 gap-3 rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="lg:col-span-2">
          <label htmlFor="q" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Szukaj (email lub imię)
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="np. jan@example.com"
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm text-iron-900 placeholder:text-iron-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          />
        </div>
        <div>
          <label htmlFor="plan" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Plan
          </label>
          <select
            id="plan"
            name="plan"
            defaultValue={plan}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm text-iron-900 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          >
            <option value="">Wszystkie</option>
            <option value="free">Free</option>
            <option value="kierowca">Kierowca</option>
            <option value="pro">Pro</option>
          </select>
        </div>
        <div>
          <label htmlFor="role" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Rola
          </label>
          <select
            id="role"
            name="role"
            defaultValue={role}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm text-iron-900 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          >
            <option value="">Wszystkie</option>
            <option value="user">user</option>
            <option value="moderator">moderator</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Sortowanie
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm text-iron-900 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          >
            <option value="created_at_desc">Najnowsi</option>
            <option value="created_at_asc">Najstarsi</option>
          </select>
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Zastosuj
          </button>
          <Link
            href="/admin/uzytkownicy"
            className="rounded-md border border-iron-200 px-4 py-2 text-sm font-medium text-iron-700 hover:bg-iron-50 dark:border-iron-700 dark:text-iron-300 dark:hover:bg-iron-800"
          >
            Wyczyść
          </Link>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-signal-200 bg-signal-50 p-4 text-sm text-signal-800 dark:border-signal-900 dark:bg-signal-950/30 dark:text-signal-300">
          Błąd zapytania: {error.message}
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-iron-200 bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-3">Email / Imię</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Limit</th>
                <th className="px-4 py-3">Rola</th>
                <th className="px-4 py-3">Utworzony</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-iron-500 dark:text-iron-400">
                    Brak użytkowników odpowiadających filtrom.
                  </td>
                </tr>
              )}
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-iron-50/50 dark:hover:bg-iron-800/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-iron-900 dark:text-iron-50">{u.email}</div>
                    {u.full_name && (
                      <div className="text-xs text-iron-500 dark:text-iron-400">{u.full_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${planBadgeClass(u.subscription_plan)}`}
                    >
                      {planLabel(u.subscription_plan)}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-iron-700 dark:text-iron-300">
                    {u.documents_this_month ?? 0}/{u.documents_limit ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(u.role)}`}
                    >
                      {u.role ?? 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-iron-600 dark:text-iron-400">{formatDateShort(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/uzytkownicy/${u.id}`}
                      className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Szczegóły →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginacja */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-iron-200 pt-4 text-sm dark:border-iron-700"
          aria-label="Paginacja"
        >
          <span className="text-iron-600 dark:text-iron-400">
            Strona {page} z {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/uzytkownicy${paramsWith({ page: String(page - 1) })}`}
                className="rounded-md border border-iron-200 px-3 py-1.5 hover:bg-iron-50 dark:border-iron-700 dark:hover:bg-iron-800"
              >
                ← Poprzednia
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/uzytkownicy${paramsWith({ page: String(page + 1) })}`}
                className="rounded-md border border-iron-200 px-3 py-1.5 hover:bg-iron-50 dark:border-iron-700 dark:hover:bg-iron-800"
              >
                Następna →
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
