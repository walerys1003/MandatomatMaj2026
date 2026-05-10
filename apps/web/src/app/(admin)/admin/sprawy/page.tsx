import Link from 'next/link'
import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Sprawy',
}

/**
 * /admin/sprawy — lista wszystkich spraw z filtrami.
 *
 * Filtry:
 *  - q: title substring
 *  - category: mandaty | parking | windykacja | ...
 *  - status: draft | preview | paid | sent | resolved | ...
 *  - payment: unpaid | pending | paid | refunded
 *  - from / to: zakres dat YYYY-MM-DD
 *  - page (50/strona)
 */

const PAGE_SIZE = 50

const CATEGORIES = [
  ['mandaty', 'Mandaty'],
  ['parking', 'Parking'],
  ['windykacja', 'Windykacja'],
  ['ubezpieczenia', 'Ubezpieczenia'],
  ['etoll', 'e-TOLL'],
  ['kontrole', 'Kontrole'],
  ['techniczne', 'Techniczne'],
] as const

const STATUSES = [
  'draft',
  'form_completed',
  'generating',
  'preview',
  'editing',
  'payment_pending',
  'paid',
  'downloaded',
  'sent',
  'waiting',
  'resolved',
  'archived',
] as const

const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'refunded', 'free'] as const

type SearchParams = {
  q?: string
  category?: string
  status?: string
  payment?: string
  from?: string
  to?: string
  page?: string
}

type CaseRow = {
  id: string
  user_id: string
  title: string
  category: string
  case_type: string
  status: string
  payment_status: string | null
  amount_paid: number | null
  deadline_date: string | null
  created_at: string
}

type ProfileShort = { id: string; email: string; full_name: string | null }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatPln(grosze: number | null): string {
  if (!grosze) return '—'
  return (grosze / 100).toFixed(2).replace('.', ',') + ' zł'
}

function statusBadge(status: string): string {
  if (status === 'paid' || status === 'resolved') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (status === 'sent' || status === 'downloaded') return 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
  if (status === 'payment_pending' || status === 'preview' || status === 'editing' || status === 'waiting')
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  if (status === 'archived') return 'bg-iron-200 text-iron-600 dark:bg-iron-800 dark:text-iron-400'
  return 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-300'
}

function paymentBadge(payment: string | null): string {
  if (payment === 'paid') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (payment === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  if (payment === 'refunded') return 'bg-signal-100 text-signal-700 dark:bg-signal-950 dark:text-signal-300'
  if (payment === 'free') return 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
  return 'bg-iron-100 text-iron-600 dark:bg-iron-800 dark:text-iron-400'
}

export default async function AdminSprawyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const category = (sp.category ?? '').trim()
  const status = (sp.status ?? '').trim()
  const payment = (sp.payment ?? '').trim()
  const from = (sp.from ?? '').trim()
  const to = (sp.to ?? '').trim()
  const page = Math.max(1, Number(sp.page ?? '1') || 1)
  const offset = (page - 1) * PAGE_SIZE

  const admin = createAdminClient()

  let query = admin
    .from('cases')
    .select(
      'id, user_id, title, category, case_type, status, payment_status, amount_paid, deadline_date, created_at',
      { count: 'exact' },
    )

  if (q) {
    const safe = q.replace(/[%,]/g, '')
    query = query.ilike('title', `%${safe}%`)
  }
  if (category) query = query.eq('category', category)
  if (status) query = query.eq('status', status)
  if (payment) query = query.eq('payment_status', payment)
  if (from) query = query.gte('created_at', `${from}T00:00:00.000Z`)
  if (to) query = query.lte('created_at', `${to}T23:59:59.999Z`)

  query = query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1)

  const { data, count, error } = await query
  const rows = (data as unknown as CaseRow[] | null) ?? []
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Resolve user_id → email/full_name (jeden batch)
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)))
  let userMap = new Map<string, ProfileShort>()
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)
    for (const p of ((profiles as unknown as ProfileShort[] | null) ?? [])) {
      userMap.set(p.id, p)
    }
  }

  // Statystyki nagłówka
  const paidCount = rows.filter((r) => r.payment_status === 'paid').length
  const totalRevenue = rows.reduce((s, r) => s + (r.amount_paid ?? 0), 0)

  function paramsWith(overrides: Partial<SearchParams>): string {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (category) next.set('category', category)
    if (status) next.set('status', status)
    if (payment) next.set('payment', payment)
    if (from) next.set('from', from)
    if (to) next.set('to', to)
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
          <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">Sprawy</h1>
          <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
            Łącznie: <strong className="tabular-nums">{total}</strong>
            {' · '}Strona {page}: opłacone {paidCount}/{rows.length} · suma {formatPln(totalRevenue)}
          </p>
        </div>
        <Link href="/admin/dashboard" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          ← Dashboard
        </Link>
      </header>

      <form
        method="get"
        className="grid grid-cols-1 gap-3 rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900 sm:grid-cols-2 lg:grid-cols-6"
      >
        <div className="lg:col-span-2">
          <label htmlFor="q" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Szukaj (tytuł)
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="np. mandat, parking..."
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Kategoria
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          >
            <option value="">Wszystkie</option>
            {CATEGORIES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          >
            <option value="">Wszystkie</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="payment" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Płatność
          </label>
          <select
            id="payment"
            name="payment"
            defaultValue={payment}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          >
            <option value="">Wszystkie</option>
            {PAYMENT_STATUSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Od
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Do
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Zastosuj
          </button>
          <Link
            href="/admin/sprawy"
            className="rounded-md border border-iron-200 px-4 py-2 text-sm font-medium text-iron-700 hover:bg-iron-50 dark:border-iron-700 dark:text-iron-300 dark:hover:bg-iron-800"
          >
            Wyczyść
          </Link>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-signal-200 bg-signal-50 p-4 text-sm text-signal-800 dark:border-signal-900 dark:bg-signal-950/30 dark:text-signal-300">
          Błąd: {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-iron-200 bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-3">Tytuł</th>
                <th className="px-4 py-3">Użytkownik</th>
                <th className="px-4 py-3">Kategoria</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Płatność</th>
                <th className="px-4 py-3 text-right">Kwota</th>
                <th className="px-4 py-3">Termin</th>
                <th className="px-4 py-3">Utworzone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-iron-500 dark:text-iron-400">
                    Brak spraw odpowiadających filtrom.
                  </td>
                </tr>
              )}
              {rows.map((c) => {
                const u = userMap.get(c.user_id)
                return (
                  <tr key={c.id} className="hover:bg-iron-50/50 dark:hover:bg-iron-800/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/sprawy/${c.id}`}
                        className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {c.title}
                      </Link>
                      <div className="font-mono text-xs text-iron-500 dark:text-iron-400">{c.case_type}</div>
                    </td>
                    <td className="px-4 py-3">
                      {u ? (
                        <Link
                          href={`/admin/uzytkownicy/${u.id}`}
                          className="text-iron-700 hover:underline dark:text-iron-300"
                        >
                          {u.email}
                        </Link>
                      ) : (
                        <span className="text-iron-500">{c.user_id.substring(0, 8)}…</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-iron-700 dark:text-iron-300">{c.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${paymentBadge(c.payment_status)}`}
                      >
                        {c.payment_status ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPln(c.amount_paid)}</td>
                    <td className="px-4 py-3 text-iron-600 dark:text-iron-400">
                      {c.deadline_date ? formatDate(c.deadline_date) : '—'}
                    </td>
                    <td className="px-4 py-3 text-iron-600 dark:text-iron-400">{formatDate(c.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                href={`/admin/sprawy${paramsWith({ page: String(page - 1) })}`}
                className="rounded-md border border-iron-200 px-3 py-1.5 hover:bg-iron-50 dark:border-iron-700 dark:hover:bg-iron-800"
              >
                ← Poprzednia
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/sprawy${paramsWith({ page: String(page + 1) })}`}
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
