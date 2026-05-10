import Link from 'next/link'
import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Płatności',
}

/**
 * /admin/platnosci — lista płatności z dziennymi sumaryzacjami.
 *
 * Filtry:
 *  - q: stripe_session_id / stripe_payment_intent_id substring
 *  - status: pending | succeeded | failed | refunded
 *  - type: one_time | subscription | pack
 *  - product: M1, M2, P1, ... PACK_5, SUB_KIEROWCA
 *  - from / to: zakres dat YYYY-MM-DD
 *  - page (50/strona)
 *
 * U góry: KPI dla wybranego zakresu — total revenue, count succeeded, refunds.
 * Pod tabelą: dzienne agregaty (succeeded only) ostatnich 14 dni.
 */

const PAGE_SIZE = 50

const STATUSES = ['pending', 'succeeded', 'failed', 'refunded'] as const
const TYPES = ['one_time', 'subscription', 'pack'] as const

type SearchParams = {
  q?: string
  status?: string
  type?: string
  product?: string
  from?: string
  to?: string
  page?: string
}

type PaymentRow = {
  id: string
  user_id: string | null
  case_id: string | null
  amount: number
  currency: string | null
  status: string
  type: string | null
  product_code: string | null
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  invoice_url: string | null
  created_at: string
}

type ProfileShort = { id: string; email: string }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatPln(grosze: number): string {
  return (grosze / 100).toFixed(2).replace('.', ',') + ' zł'
}

function statusBadge(status: string): string {
  if (status === 'succeeded') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (status === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  if (status === 'failed') return 'bg-signal-100 text-signal-700 dark:bg-signal-950 dark:text-signal-300'
  if (status === 'refunded') return 'bg-iron-200 text-iron-600 dark:bg-iron-800 dark:text-iron-400'
  return 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-300'
}

function getDailyAggregates(payments: PaymentRow[], days: number): Array<{ date: string; total: number; count: number }> {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const buckets = new Map<string, { total: number; count: number }>()

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().substring(0, 10)
    buckets.set(key, { total: 0, count: 0 })
  }

  for (const p of payments) {
    if (p.status !== 'succeeded') continue
    const key = p.created_at.substring(0, 10)
    const b = buckets.get(key)
    if (b) {
      b.total += p.amount
      b.count += 1
    }
  }

  return Array.from(buckets.entries()).map(([date, v]) => ({ date, total: v.total, count: v.count }))
}

export default async function AdminPlatnosciPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const status = (sp.status ?? '').trim()
  const type = (sp.type ?? '').trim()
  const product = (sp.product ?? '').trim()
  const from = (sp.from ?? '').trim()
  const to = (sp.to ?? '').trim()
  const page = Math.max(1, Number(sp.page ?? '1') || 1)
  const offset = (page - 1) * PAGE_SIZE

  const admin = createAdminClient()

  let query = admin
    .from('payments')
    .select(
      'id, user_id, case_id, amount, currency, status, type, product_code, stripe_session_id, stripe_payment_intent_id, invoice_url, created_at',
      { count: 'exact' },
    )

  if (q) {
    const safe = q.replace(/[%,]/g, '')
    query = query.or(
      `stripe_session_id.ilike.%${safe}%,stripe_payment_intent_id.ilike.%${safe}%,product_code.ilike.%${safe}%`,
    )
  }
  if (status && (STATUSES as readonly string[]).includes(status)) query = query.eq('status', status)
  if (type && (TYPES as readonly string[]).includes(type)) query = query.eq('type', type)
  if (product) query = query.eq('product_code', product)
  if (from) query = query.gte('created_at', `${from}T00:00:00.000Z`)
  if (to) query = query.lte('created_at', `${to}T23:59:59.999Z`)

  query = query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1)

  const { data, count, error } = await query
  const rows = (data as unknown as PaymentRow[] | null) ?? []
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // KPI dla wybranego okna (max 30 dni domyślnie)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const { data: recentPayments } = await admin
    .from('payments')
    .select('amount, status, created_at')
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  const recent = (recentPayments as unknown as PaymentRow[] | null) ?? []
  const totalRevenue14d = recent.filter((p) => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0)
  const countSucceeded14d = recent.filter((p) => p.status === 'succeeded').length
  const countRefunded14d = recent.filter((p) => p.status === 'refunded').length
  const countFailed14d = recent.filter((p) => p.status === 'failed').length

  // Resolve user_id → email
  const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter((u): u is string => !!u)))
  const userMap = new Map<string, ProfileShort>()
  if (userIds.length > 0) {
    const { data: profiles } = await admin.from('profiles').select('id, email').in('id', userIds)
    for (const p of ((profiles as unknown as ProfileShort[] | null) ?? [])) userMap.set(p.id, p)
  }

  const daily = getDailyAggregates(recent, 14)
  const maxDailyTotal = Math.max(1, ...daily.map((d) => d.total))

  function paramsWith(overrides: Partial<SearchParams>): string {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (status) next.set('status', status)
    if (type) next.set('type', type)
    if (product) next.set('product', product)
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
          <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">Płatności</h1>
          <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
            Łącznie po filtrach: <strong className="tabular-nums">{total}</strong>
          </p>
        </div>
        <Link href="/admin/dashboard" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          ← Dashboard
        </Link>
      </header>

      {/* KPI 14d */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">Przychód (14d)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-brand-700 dark:text-brand-300">
            {formatPln(totalRevenue14d)}
          </p>
        </div>
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">Succeeded (14d)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {countSucceeded14d}
          </p>
        </div>
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">Refunded (14d)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-iron-700 dark:text-iron-300">
            {countRefunded14d}
          </p>
        </div>
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">Failed (14d)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-signal-600 dark:text-signal-400">
            {countFailed14d}
          </p>
        </div>
      </section>

      {/* Wykres dzienny */}
      <section className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
        <h2 className="mb-4 text-base font-semibold text-iron-900 dark:text-iron-50">
          Przychód dzienny — ostatnie 14 dni
        </h2>
        <div className="flex h-32 items-end gap-1">
          {daily.map((d) => {
            const heightPct = (d.total / maxDailyTotal) * 100
            return (
              <div
                key={d.date}
                className="group relative flex flex-1 flex-col items-center"
                title={`${d.date}: ${formatPln(d.total)} (${d.count})`}
              >
                <div
                  className="w-full rounded-t-sm bg-brand-500 transition-all hover:bg-brand-600"
                  style={{ height: `${Math.max(2, heightPct)}%` }}
                />
                <span className="mt-1 text-[10px] tabular-nums text-iron-500 dark:text-iron-400">
                  {d.date.substring(8, 10)}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Filtry */}
      <form
        method="get"
        className="grid grid-cols-1 gap-3 rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900 sm:grid-cols-2 lg:grid-cols-6"
      >
        <div className="lg:col-span-2">
          <label htmlFor="q" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Szukaj (Stripe ID / produkt)
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="np. cs_test_..."
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          />
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
          <label htmlFor="type" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Typ
          </label>
          <select
            id="type"
            name="type"
            defaultValue={type}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          >
            <option value="">Wszystkie</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="product" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Produkt
          </label>
          <input
            id="product"
            name="product"
            type="text"
            defaultValue={product}
            placeholder="np. M1"
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          />
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
            href="/admin/platnosci"
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

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-iron-200 bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Użytkownik</th>
                <th className="px-4 py-3">Produkt</th>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Kwota</th>
                <th className="px-4 py-3">Stripe</th>
                <th className="px-4 py-3">Faktura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-iron-500 dark:text-iron-400">
                    Brak płatności odpowiadających filtrom.
                  </td>
                </tr>
              )}
              {rows.map((p) => {
                const u = p.user_id ? userMap.get(p.user_id) : null
                return (
                  <tr key={p.id} className="hover:bg-iron-50/50 dark:hover:bg-iron-800/50">
                    <td className="px-4 py-3 text-iron-600 dark:text-iron-400">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      {u ? (
                        <Link
                          href={`/admin/uzytkownicy/${u.id}`}
                          className="text-iron-700 hover:underline dark:text-iron-300"
                        >
                          {u.email}
                        </Link>
                      ) : (
                        <span className="text-iron-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-iron-700 dark:text-iron-300">
                      {p.product_code ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-iron-600 dark:text-iron-400">{p.type ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-iron-900 dark:text-iron-50">
                      {formatPln(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {p.stripe_session_id ? (
                        <a
                          href={`https://dashboard.stripe.com/payments/${p.stripe_payment_intent_id ?? p.stripe_session_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {(p.stripe_session_id ?? '').substring(0, 14)}…
                        </a>
                      ) : (
                        <span className="text-iron-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.case_id && (
                        <Link
                          href={`/admin/sprawy/${p.case_id}`}
                          className="mr-2 text-xs text-iron-500 hover:underline dark:text-iron-400"
                        >
                          sprawa
                        </Link>
                      )}
                      {p.invoice_url ? (
                        <a
                          href={p.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                        >
                          PDF →
                        </a>
                      ) : (
                        <span className="text-iron-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela dziennych agregatów */}
      <section className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <header className="border-b border-iron-200 px-6 py-4 dark:border-iron-700">
          <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">
            Dzienne sumy succeeded (14 dni)
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-2">Dzień</th>
                <th className="px-4 py-2 text-right">Liczba</th>
                <th className="px-4 py-2 text-right">Suma</th>
                <th className="px-4 py-2 text-right">AOV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {daily
                .slice()
                .reverse()
                .map((d) => (
                  <tr key={d.date}>
                    <td className="px-4 py-2 text-iron-700 dark:text-iron-300">{formatDateShort(d.date)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{d.count}</td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium text-brand-700 dark:text-brand-300">
                      {formatPln(d.total)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-iron-600 dark:text-iron-400">
                      {d.count > 0 ? formatPln(Math.round(d.total / d.count)) : '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

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
                href={`/admin/platnosci${paramsWith({ page: String(page - 1) })}`}
                className="rounded-md border border-iron-200 px-3 py-1.5 hover:bg-iron-50 dark:border-iron-700 dark:hover:bg-iron-800"
              >
                ← Poprzednia
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/platnosci${paramsWith({ page: String(page + 1) })}`}
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
