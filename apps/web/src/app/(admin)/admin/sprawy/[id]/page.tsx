import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Szczegóły sprawy',
}

/**
 * /admin/sprawy/[id] — pełen widok sprawy w panelu admina.
 *
 * Sekcje:
 *  - Nagłówek (tytuł/status/kategoria/typ + użytkownik)
 *  - Dane formularza (form_data JSON pretty)
 *  - Dokumenty
 *  - Płatności
 *  - Eventy (telemetry log) — ostatnie 50
 *  - Termin
 */

type CaseFull = {
  id: string
  user_id: string
  category: string
  case_type: string
  title: string
  status: string
  priority: number | null
  form_data: Record<string, unknown> | null
  ocr_data: Record<string, unknown> | null
  scoring_result: Record<string, unknown> | null
  parent_case_id: string | null
  payment_status: string | null
  stripe_payment_intent_id: string | null
  amount_paid: number | null
  deadline_date: string | null
  deadline_source: string | null
  is_demo: boolean | null
  created_at: string
  updated_at: string
}

type DocumentRow = {
  id: string
  title: string | null
  version: number | null
  storage_path: string | null
  file_size: number | null
  mime_type: string | null
  created_at: string
}

type PaymentRow = {
  id: string
  amount: number
  status: string
  type: string | null
  product_code: string | null
  invoice_url: string | null
  stripe_session_id: string | null
  created_at: string
}

type EventRow = {
  id: string
  event_type: string
  metadata: Record<string, unknown> | null
  created_at: string
}

type ProfileShort = {
  id: string
  email: string
  full_name: string | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPln(grosze: number | null): string {
  if (!grosze) return '—'
  return (grosze / 100).toFixed(2).replace('.', ',') + ' zł'
}

export default async function AdminSprawaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const [caseRes, docsRes, paymentsRes, eventsRes] = await Promise.all([
    admin.from('cases').select('*').eq('id', id).maybeSingle(),
    admin
      .from('documents')
      .select('id, title, version, storage_path, file_size, mime_type, created_at')
      .eq('case_id', id)
      .order('created_at', { ascending: false }),
    admin
      .from('payments')
      .select('id, amount, status, type, product_code, invoice_url, stripe_session_id, created_at')
      .eq('case_id', id)
      .order('created_at', { ascending: false }),
    admin
      .from('events')
      .select('id, event_type, metadata, created_at')
      .eq('case_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const c = caseRes.data as unknown as CaseFull | null
  if (!c) notFound()

  const docs = (docsRes.data as unknown as DocumentRow[] | null) ?? []
  const payments = (paymentsRes.data as unknown as PaymentRow[] | null) ?? []
  const events = (eventsRes.data as unknown as EventRow[] | null) ?? []

  // Pobierz dane użytkownika
  const { data: profileRaw } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', c.user_id)
    .maybeSingle()
  const user = profileRaw as unknown as ProfileShort | null

  const formData = c.form_data ?? {}

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/sprawy" className="text-xs text-brand-600 hover:underline dark:text-brand-400">
            ← Lista spraw
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">{c.title}</h1>
          <p className="text-sm text-iron-600 dark:text-iron-400">
            <span className="font-mono text-xs">{c.case_type}</span> · {c.category} · ID:{' '}
            <code className="text-xs">{c.id}</code>
          </p>
          {user && (
            <p className="mt-1 text-sm text-iron-700 dark:text-iron-300">
              👤 Użytkownik:{' '}
              <Link
                href={`/admin/uzytkownicy/${user.id}`}
                className="text-brand-600 hover:underline dark:text-brand-400"
              >
                {user.email}
              </Link>{' '}
              {user.full_name && <span className="text-iron-500">({user.full_name})</span>}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-iron-100 px-3 py-1 text-xs font-medium text-iron-800 dark:bg-iron-800 dark:text-iron-200">
            {c.status}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            payment: {c.payment_status ?? '—'}
          </span>
          {c.is_demo && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              DEMO
            </span>
          )}
        </div>
      </header>

      {/* Statystyki */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">Kwota</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-iron-900 dark:text-iron-50">
            {formatPln(c.amount_paid)}
          </p>
        </div>
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">Termin</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-iron-900 dark:text-iron-50">
            {c.deadline_date
              ? new Date(c.deadline_date).toLocaleDateString('pl-PL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : '—'}
          </p>
          {c.deadline_source && (
            <p className="mt-1 text-xs text-iron-500 dark:text-iron-400">{c.deadline_source}</p>
          )}
        </div>
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">Dokumenty</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-iron-900 dark:text-iron-50">{docs.length}</p>
        </div>
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">Płatności</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-iron-900 dark:text-iron-50">{payments.length}</p>
        </div>
      </section>

      {/* Form data */}
      <section className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
        <h2 className="mb-4 text-base font-semibold text-iron-900 dark:text-iron-50">Dane formularza</h2>
        {Object.keys(formData).length === 0 ? (
          <p className="text-sm text-iron-500 dark:text-iron-400">Brak danych formularza.</p>
        ) : (
          <pre className="max-h-96 overflow-auto rounded-md bg-iron-50 p-4 text-xs text-iron-800 dark:bg-iron-950 dark:text-iron-200">
            {JSON.stringify(formData, null, 2)}
          </pre>
        )}
      </section>

      {/* Dokumenty */}
      <section className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <header className="border-b border-iron-200 px-6 py-4 dark:border-iron-700">
          <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">
            Dokumenty ({docs.length})
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-2">Tytuł</th>
                <th className="px-4 py-2">Wersja</th>
                <th className="px-4 py-2">Storage</th>
                <th className="px-4 py-2">Rozmiar</th>
                <th className="px-4 py-2">Utworzono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {docs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-iron-500 dark:text-iron-400">
                    Brak dokumentów.
                  </td>
                </tr>
              )}
              {docs.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2 font-medium text-iron-900 dark:text-iron-50">{d.title ?? '—'}</td>
                  <td className="px-4 py-2 tabular-nums">v{d.version ?? 1}</td>
                  <td className="px-4 py-2 font-mono text-xs text-iron-600 dark:text-iron-400">
                    {d.storage_path ?? '—'}
                  </td>
                  <td className="px-4 py-2 tabular-nums text-iron-700 dark:text-iron-300">
                    {d.file_size ? `${Math.round(d.file_size / 1024)} kB` : '—'}
                  </td>
                  <td className="px-4 py-2 text-iron-600 dark:text-iron-400">{formatDate(d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Płatności */}
      <section className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <header className="border-b border-iron-200 px-6 py-4 dark:border-iron-700">
          <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">
            Płatności ({payments.length})
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-2">Produkt</th>
                <th className="px-4 py-2">Typ</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Kwota</th>
                <th className="px-4 py-2">Stripe Session</th>
                <th className="px-4 py-2">Faktura</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-iron-500 dark:text-iron-400">
                    Brak płatności.
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-mono text-xs">{p.product_code ?? '—'}</td>
                  <td className="px-4 py-2">{p.type ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block rounded-full bg-iron-100 px-2 py-0.5 text-xs dark:bg-iron-800">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatPln(p.amount)}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {p.stripe_session_id ? (
                      <a
                        href={`https://dashboard.stripe.com/payments/${p.stripe_session_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {p.stripe_session_id.substring(0, 16)}…
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2">
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
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2 text-iron-600 dark:text-iron-400">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Eventy */}
      <section className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <header className="border-b border-iron-200 px-6 py-4 dark:border-iron-700">
          <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">
            Eventy / log telemetrii ({events.length})
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-2">Typ</th>
                <th className="px-4 py-2">Metadata</th>
                <th className="px-4 py-2">Czas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {events.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-iron-500 dark:text-iron-400">
                    Brak eventów.
                  </td>
                </tr>
              )}
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2 font-mono text-xs">{e.event_type}</td>
                  <td className="px-4 py-2">
                    {e.metadata && Object.keys(e.metadata).length > 0 ? (
                      <code className="text-xs text-iron-600 dark:text-iron-400">
                        {JSON.stringify(e.metadata).substring(0, 80)}
                      </code>
                    ) : (
                      <span className="text-iron-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-iron-600 dark:text-iron-400">{formatDate(e.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
