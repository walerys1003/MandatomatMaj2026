import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

import { UserAdminControls } from './admin-controls'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Szczegóły użytkownika',
}

/**
 * /admin/uzytkownicy/[id] — pełen profil użytkownika.
 *
 * Sekcje:
 *  - Dane podstawowe (email, telefon, adres, plan, rola)
 *  - Statystyki (sprawy total/paid, total revenue grosze→zł)
 *  - Lista 20 ostatnich spraw
 *  - Lista 20 ostatnich płatności
 */

type ProfileFull = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address_street: string | null
  address_city: string | null
  address_zip: string | null
  subscription_plan: string | null
  subscription_tier: string | null
  subscription_ends_at: string | null
  documents_this_month: number | null
  documents_limit: number | null
  role: string | null
  notification_email: boolean | null
  newsletter: boolean | null
  referral_code: string | null
  referred_by: string | null
  deleted_at: string | null
  created_at: string
}

type AdminLogRow = {
  id: string
  admin_id: string
  action: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

type CaseRow = {
  id: string
  title: string
  case_type: string
  status: string
  payment_status: string | null
  amount_paid: number | null
  created_at: string
}

type PaymentRow = {
  id: string
  amount: number
  currency: string | null
  status: string
  type: string | null
  product_code: string | null
  invoice_url: string | null
  created_at: string
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

function formatPln(grosze: number): string {
  return (grosze / 100).toFixed(2).replace('.', ',') + ' zł'
}

function planLabel(plan: string | null): string {
  if (plan === 'kierowca') return 'Kierowca'
  if (plan === 'pro') return 'Pro'
  return 'Free'
}

function statusBadge(status: string): string {
  if (status === 'paid' || status === 'succeeded')
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (status === 'pending' || status === 'paid_pending')
    return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
  if (status === 'failed' || status === 'refunded')
    return 'bg-signal-100 text-signal-700 dark:bg-signal-950 dark:text-signal-300'
  return 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-300'
}

export default async function AdminUzytkownikDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const [profileRes, casesRes, paymentsRes, casesCountRes, paidCountRes, adminLogsRes] =
    await Promise.all([
      admin.from('profiles').select('*').eq('id', id).maybeSingle(),
      admin
        .from('cases')
        .select('id, title, case_type, status, payment_status, amount_paid, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
      admin
        .from('payments')
        .select('id, amount, currency, status, type, product_code, invoice_url, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
      admin.from('cases').select('id', { count: 'exact', head: true }).eq('user_id', id),
      admin
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id)
        .eq('payment_status', 'paid'),
      admin
        .from('admin_logs')
        .select('id, admin_id, action, old_data, new_data, created_at')
        .eq('target_type', 'user')
        .eq('target_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

  // Aktualnie zalogowany admin — do oznaczenia 'isSelf' w UserAdminControls
  const supabase = createClient()
  const {
    data: { user: currentAdmin },
  } = await supabase.auth.getUser()

  const profile = profileRes.data as unknown as ProfileFull | null
  if (!profile) notFound()

  const cases = (casesRes.data as unknown as CaseRow[] | null) ?? []
  const payments = (paymentsRes.data as unknown as PaymentRow[] | null) ?? []
  const totalCases = casesCountRes.count ?? 0
  const paidCases = paidCountRes.count ?? 0
  const adminLogs = (adminLogsRes.data as unknown as AdminLogRow[] | null) ?? []

  // Resolve admin emails (kto wykonał akcję)
  const adminIds = Array.from(new Set(adminLogs.map((l) => l.admin_id)))
  let adminEmails: Record<string, string> = {}
  if (adminIds.length > 0) {
    const { data: adminsRaw } = await admin.from('profiles').select('id, email').in('id', adminIds)
    const adminsTyped = (adminsRaw as unknown as { id: string; email: string }[] | null) ?? []
    adminEmails = adminsTyped.reduce<Record<string, string>>((acc, a) => {
      acc[a.id] = a.email
      return acc
    }, {})
  }

  const totalRevenue = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((s, p) => s + p.amount, 0)
  // (uwaga: total_revenue z 20 ostatnich tylko — full sum poniżej)

  // pełna suma succeeded
  const { data: allPayments } = await admin
    .from('payments')
    .select('amount')
    .eq('user_id', id)
    .eq('status', 'succeeded')
  const fullRevenue = ((allPayments as unknown as { amount: number }[] | null) ?? []).reduce(
    (s, p) => s + p.amount,
    0,
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/uzytkownicy"
            className="text-brand-600 dark:text-brand-400 text-xs hover:underline"
          >
            ← Lista użytkowników
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">
            {profile.full_name ?? profile.email}
          </h1>
          <p className="text-sm text-iron-600 dark:text-iron-400">
            {profile.email} · ID: <code className="text-xs">{profile.id}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              profile.role === 'admin'
                ? 'text-signal-800 dark:bg-signal-950 dark:text-signal-300 bg-signal-100'
                : 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-300'
            }`}
          >
            {profile.role ?? 'user'}
          </span>
          <span className="bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 rounded-full px-3 py-1 text-xs font-medium">
            {planLabel(profile.subscription_plan)}
          </span>
        </div>
      </header>

      {/* Admin controls — rola / plan / soft-delete / notatki */}
      <UserAdminControls
        userId={profile.id}
        currentRole={profile.role}
        currentPlan={profile.subscription_tier ?? profile.subscription_plan}
        isDeleted={Boolean(profile.deleted_at)}
        isSelf={currentAdmin?.id === profile.id}
      />

      {/* Statystyki */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
            Sprawy łącznie
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-iron-900 dark:text-iron-50">
            {totalCases}
          </p>
        </div>
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
            Sprawy opłacone
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {paidCases}
          </p>
        </div>
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
            Przychód
          </p>
          <p className="text-brand-700 dark:text-brand-300 mt-1 text-2xl font-bold tabular-nums">
            {formatPln(fullRevenue)}
          </p>
        </div>
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <p className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
            Limit miesięczny
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-iron-900 dark:text-iron-50">
            {profile.documents_this_month ?? 0}/{profile.documents_limit ?? 0}
          </p>
        </div>
      </section>

      {/* Dane podstawowe */}
      <section className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
        <h2 className="mb-4 text-base font-semibold text-iron-900 dark:text-iron-50">
          Dane profilu
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Email
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Imię i nazwisko
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">{profile.full_name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Telefon
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">{profile.phone ?? '—'}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Adres
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">
              {[profile.address_street, profile.address_zip, profile.address_city]
                .filter(Boolean)
                .join(', ') || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Plan kończy się
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">
              {profile.subscription_ends_at ? formatDate(profile.subscription_ends_at) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Kod referral
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">
              <code className="text-xs">{profile.referral_code ?? '—'}</code>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Polecony przez
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">
              <code className="text-xs">{profile.referred_by ?? '—'}</code>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Newsletter
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">
              {profile.newsletter ? 'Tak' : 'Nie'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Email powiadomienia
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">
              {profile.notification_email ? 'Tak' : 'Nie'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-iron-500 dark:text-iron-400">
              Utworzony
            </dt>
            <dd className="text-iron-900 dark:text-iron-50">{formatDate(profile.created_at)}</dd>
          </div>
        </dl>
      </section>

      {/* Sprawy */}
      <section className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <header className="flex items-center justify-between border-b border-iron-200 px-6 py-4 dark:border-iron-700">
          <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">
            Ostatnie sprawy ({cases.length})
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-2">Tytuł</th>
                <th className="px-4 py-2">Typ</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Płatność</th>
                <th className="px-4 py-2 text-right">Kwota</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {cases.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-iron-500 dark:text-iron-400"
                  >
                    Brak spraw.
                  </td>
                </tr>
              )}
              {cases.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/sprawy/${c.id}`}
                      className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-iron-600 dark:text-iron-400">
                    {c.case_type}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusBadge(c.status)}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-iron-700 dark:text-iron-300">
                    {c.payment_status ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {c.amount_paid ? formatPln(c.amount_paid) : '—'}
                  </td>
                  <td className="px-4 py-2 text-iron-600 dark:text-iron-400">
                    {formatDate(c.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Płatności */}
      <section className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <header className="flex items-center justify-between border-b border-iron-200 px-6 py-4 dark:border-iron-700">
          <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">
            Ostatnie płatności ({payments.length})
          </h2>
          <span className="text-xs text-iron-500 dark:text-iron-400">
            Suma succeeded (20 ostatnich): {formatPln(totalRevenue)}
          </span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-2">Produkt</th>
                <th className="px-4 py-2">Typ</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Kwota</th>
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Faktura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {payments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-iron-500 dark:text-iron-400"
                  >
                    Brak płatności.
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-mono text-xs">{p.product_code ?? '—'}</td>
                  <td className="px-4 py-2 text-iron-700 dark:text-iron-300">{p.type ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusBadge(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatPln(p.amount)}</td>
                  <td className="px-4 py-2 text-iron-600 dark:text-iron-400">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-4 py-2">
                    {p.invoice_url ? (
                      <a
                        href={p.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 dark:text-brand-400 text-xs hover:underline"
                      >
                        PDF →
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Logi administracyjne (admin_logs) */}
      <section className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <header className="border-b border-iron-200 px-6 py-4 dark:border-iron-700">
          <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">
            Logi administracyjne ({adminLogs.length})
          </h2>
          <p className="mt-1 text-xs text-iron-500 dark:text-iron-400">
            Mutacje wykonane przez adminów na tym użytkowniku. Trwałe, nieedytowalne.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-2">Akcja</th>
                <th className="px-4 py-2">Admin</th>
                <th className="px-4 py-2">Zmiana</th>
                <th className="px-4 py-2">Czas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {adminLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-iron-500 dark:text-iron-400"
                  >
                    Brak akcji administracyjnych.
                  </td>
                </tr>
              )}
              {adminLogs.map((l) => {
                const note = (l.new_data as { note?: string } | null)?.note
                const reason = (l.new_data as { reason?: string } | null)?.reason
                return (
                  <tr key={l.id}>
                    <td className="px-4 py-2 font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-2 text-xs text-iron-700 dark:text-iron-200">
                      {adminEmails[l.admin_id] ?? l.admin_id.substring(0, 8) + '…'}
                    </td>
                    <td className="px-4 py-2 text-xs text-iron-700 dark:text-iron-200">
                      {note ? (
                        <span className="italic">📝 {note}</span>
                      ) : reason ? (
                        <span>
                          {l.old_data && Object.keys(l.old_data).length > 0
                            ? `${JSON.stringify(l.old_data)} → ${JSON.stringify(l.new_data)}`
                            : JSON.stringify(l.new_data)}
                          <br />
                          <span className="text-iron-500">powód: {reason}</span>
                        </span>
                      ) : (
                        <code className="text-xs text-iron-600 dark:text-iron-400">
                          {JSON.stringify({ old: l.old_data, new: l.new_data }).substring(0, 100)}
                        </code>
                      )}
                    </td>
                    <td className="px-4 py-2 text-iron-600 dark:text-iron-400">
                      {formatDate(l.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
