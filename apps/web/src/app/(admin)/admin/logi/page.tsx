import Link from 'next/link'
import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Logi audytu',
  robots: { index: false, follow: false },
}

/**
 * /admin/logi — globalny audit log wszystkich mutacji adminów.
 *
 * Filtry (query string):
 *  - admin: UUID admina (filtruje po admin_id)
 *  - action: nazwa akcji (np. 'change_user_role', 'archive_case', 'admin_note')
 *  - target_type: 'case' | 'user' | 'prompt_template' | ...
 *  - from / to: zakres dat YYYY-MM-DD
 *  - page (50/strona)
 *
 * Każdy wpis pokazuje:
 *   - czas, admin, akcja, target_type + link, zmiana (old → new), powód/notatka
 */

const PAGE_SIZE = 50

const TARGET_TYPES = [
  'case',
  'user',
  'prompt_template',
  'case_type_config',
  'payment',
  'document',
  'feedback',
] as const

const KNOWN_ACTIONS = [
  'update_case_status',
  'archive_case',
  'admin_note',
  'change_user_role',
  'change_user_plan',
  'soft_delete_user',
  'update_case_type_config',
  'update_prompt_template',
] as const

type SearchParams = {
  admin?: string
  action?: string
  target_type?: string
  from?: string
  to?: string
  page?: string
}

type LogRow = {
  id: string
  admin_id: string
  action: string
  target_type: string | null
  target_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
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

function targetLink(targetType: string | null, targetId: string | null): string | null {
  if (!targetType || !targetId) return null
  if (targetType === 'case') return `/admin/sprawy/${targetId}`
  if (targetType === 'user') return `/admin/uzytkownicy/${targetId}`
  return null
}

export default async function AdminLogiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const adminFilter = (sp.admin ?? '').trim()
  const actionFilter = (sp.action ?? '').trim()
  const targetType = (sp.target_type ?? '').trim()
  const from = (sp.from ?? '').trim()
  const to = (sp.to ?? '').trim()
  const page = Math.max(1, Number(sp.page ?? '1') || 1)
  const offset = (page - 1) * PAGE_SIZE

  const admin = createAdminClient()

  let query = admin
    .from('admin_logs')
    .select('id, admin_id, action, target_type, target_id, old_data, new_data, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (adminFilter && /^[0-9a-f-]{36}$/i.test(adminFilter)) {
    query = query.eq('admin_id', adminFilter)
  }
  if (actionFilter) {
    query = query.eq('action', actionFilter)
  }
  if (targetType) {
    query = query.eq('target_type', targetType)
  }
  if (from) {
    query = query.gte('created_at', `${from}T00:00:00`)
  }
  if (to) {
    query = query.lte('created_at', `${to}T23:59:59`)
  }

  const { data: rows, count } = await query

  const logs = (rows as unknown as LogRow[] | null) ?? []
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Resolve admin emails (kto wykonał akcję)
  const adminIds = Array.from(new Set(logs.map((l) => l.admin_id)))
  let adminEmails: Record<string, string> = {}
  if (adminIds.length > 0) {
    const { data: adminsRaw } = await admin.from('profiles').select('id, email').in('id', adminIds)
    const adminsTyped = (adminsRaw as unknown as { id: string; email: string }[] | null) ?? []
    adminEmails = adminsTyped.reduce<Record<string, string>>((acc, a) => {
      acc[a.id] = a.email
      return acc
    }, {})
  }

  // Build query string for pagination preserving filters
  const qsParts: string[] = []
  if (adminFilter) qsParts.push(`admin=${encodeURIComponent(adminFilter)}`)
  if (actionFilter) qsParts.push(`action=${encodeURIComponent(actionFilter)}`)
  if (targetType) qsParts.push(`target_type=${encodeURIComponent(targetType)}`)
  if (from) qsParts.push(`from=${encodeURIComponent(from)}`)
  if (to) qsParts.push(`to=${encodeURIComponent(to)}`)
  const baseQs = qsParts.join('&')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">
          Logi audytu
        </h1>
        <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
          Wszystkie mutacje wykonywane przez adminów. Każdy wpis jest trwały i nieedytowalny.
        </p>
      </header>

      {/* Filtry */}
      <form
        method="get"
        className="grid gap-3 rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <label
            htmlFor="action"
            className="block font-mono text-[10px] uppercase tracking-wider text-iron-600 dark:text-iron-300"
          >
            Akcja
          </label>
          <select
            id="action"
            name="action"
            defaultValue={actionFilter}
            className="mt-1 w-full rounded-md border border-iron-300 bg-white px-2 py-1.5 text-sm text-iron-800 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100"
          >
            <option value="">— wszystkie —</option>
            {KNOWN_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="target_type"
            className="block font-mono text-[10px] uppercase tracking-wider text-iron-600 dark:text-iron-300"
          >
            Typ obiektu
          </label>
          <select
            id="target_type"
            name="target_type"
            defaultValue={targetType}
            className="mt-1 w-full rounded-md border border-iron-300 bg-white px-2 py-1.5 text-sm text-iron-800 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100"
          >
            <option value="">— wszystkie —</option>
            {TARGET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="admin"
            className="block font-mono text-[10px] uppercase tracking-wider text-iron-600 dark:text-iron-300"
          >
            Admin (UUID)
          </label>
          <input
            id="admin"
            type="text"
            name="admin"
            defaultValue={adminFilter}
            placeholder="UUID"
            className="mt-1 w-full rounded-md border border-iron-300 bg-white px-2 py-1.5 font-mono text-xs text-iron-800 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100"
          />
        </div>
        <div>
          <label
            htmlFor="from"
            className="block font-mono text-[10px] uppercase tracking-wider text-iron-600 dark:text-iron-300"
          >
            Od
          </label>
          <input
            id="from"
            type="date"
            name="from"
            defaultValue={from}
            className="mt-1 w-full rounded-md border border-iron-300 bg-white px-2 py-1.5 text-sm text-iron-800 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100"
          />
        </div>
        <div>
          <label
            htmlFor="to"
            className="block font-mono text-[10px] uppercase tracking-wider text-iron-600 dark:text-iron-300"
          >
            Do
          </label>
          <input
            id="to"
            type="date"
            name="to"
            defaultValue={to}
            className="mt-1 w-full rounded-md border border-iron-300 bg-white px-2 py-1.5 text-sm text-iron-800 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100"
          />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="rounded-md bg-precision-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-precision-blue-700"
          >
            Filtruj
          </button>
          <Link
            href="/admin/logi"
            className="rounded-md border border-iron-300 bg-white px-4 py-2 text-sm font-medium text-iron-700 hover:bg-iron-50 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-200"
          >
            Wyczyść
          </Link>
          <span className="ml-auto text-xs text-iron-500">
            {total.toLocaleString('pl-PL')} wpisów · strona {page} z {totalPages}
          </span>
        </div>
      </form>

      {/* Tabela */}
      <section className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:bg-iron-800 dark:text-iron-300">
              <tr>
                <th className="px-4 py-2">Czas</th>
                <th className="px-4 py-2">Admin</th>
                <th className="px-4 py-2">Akcja</th>
                <th className="px-4 py-2">Obiekt</th>
                <th className="px-4 py-2">Zmiana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-iron-500 dark:text-iron-400"
                  >
                    Brak wpisów spełniających kryteria.
                  </td>
                </tr>
              )}
              {logs.map((l) => {
                const note = (l.new_data as { note?: string } | null)?.note
                const reason = (l.new_data as { reason?: string } | null)?.reason
                const link = targetLink(l.target_type, l.target_id)
                return (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-iron-600 dark:text-iron-400">
                      {formatDate(l.created_at)}
                    </td>
                    <td className="px-4 py-2 text-xs text-iron-700 dark:text-iron-200">
                      {adminEmails[l.admin_id] ?? l.admin_id.substring(0, 8) + '…'}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-2 text-xs">
                      {l.target_type ? (
                        <>
                          <span className="font-mono text-iron-500">{l.target_type}</span>
                          {link && l.target_id ? (
                            <>
                              {' · '}
                              <Link
                                href={link}
                                className="text-precision-blue-600 hover:underline dark:text-precision-blue-400"
                              >
                                {l.target_id.substring(0, 8)}…
                              </Link>
                            </>
                          ) : l.target_id ? (
                            <span className="text-iron-500"> · {l.target_id.substring(0, 8)}…</span>
                          ) : null}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-iron-700 dark:text-iron-200">
                      {note ? (
                        <span className="italic">📝 {note}</span>
                      ) : (
                        <span>
                          {l.old_data && Object.keys(l.old_data).length > 0
                            ? `${JSON.stringify(l.old_data)} → ${JSON.stringify(l.new_data)}`
                            : l.new_data
                              ? JSON.stringify(l.new_data).substring(0, 120)
                              : '—'}
                          {reason ? (
                            <>
                              <br />
                              <span className="text-iron-500">powód: {reason}</span>
                            </>
                          ) : null}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Paginacja */}
        {totalPages > 1 ? (
          <nav className="flex items-center justify-between border-t border-iron-200 px-4 py-3 dark:border-iron-700">
            <div className="text-xs text-iron-500">
              Strona {page} z {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`/admin/logi?${baseQs ? baseQs + '&' : ''}page=${page - 1}`}
                  className="rounded-md border border-iron-300 bg-white px-3 py-1.5 text-xs hover:bg-iron-50 dark:border-iron-700 dark:bg-iron-900 dark:hover:bg-iron-800"
                >
                  ← Poprzednia
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link
                  href={`/admin/logi?${baseQs ? baseQs + '&' : ''}page=${page + 1}`}
                  className="rounded-md border border-iron-300 bg-white px-3 py-1.5 text-xs hover:bg-iron-50 dark:border-iron-700 dark:bg-iron-900 dark:hover:bg-iron-800"
                >
                  Następna →
                </Link>
              ) : null}
            </div>
          </nav>
        ) : null}
      </section>
    </div>
  )
}
