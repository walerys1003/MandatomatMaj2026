import Link from 'next/link'
import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Szablony',
}

/**
 * /admin/szablony — lista wszystkich case_type_config (szablonów spraw).
 *
 * Pozwala filtrować po kategorii i statusie aktywności, edytować pojedynczy
 * szablon na osobnej podstronie /admin/szablony/[caseType].
 */

const CATEGORIES = [
  ['mandaty', 'Mandaty'],
  ['parking', 'Parking'],
  ['windykacja', 'Windykacja'],
  ['ubezpieczenia', 'Ubezpieczenia'],
  ['etoll', 'e-TOLL'],
  ['kontrole', 'Kontrole'],
  ['techniczne', 'Techniczne'],
] as const

type SearchParams = {
  category?: string
  active?: string
}

type ConfigRow = {
  id: string
  case_type: string
  category: string
  display_name: string
  short_name: string
  price_pln: number
  default_deadline_days: number | null
  prompt_file: string
  ai_model: string | null
  slug: string
  is_active: boolean | null
  sort_order: number | null
  popularity: number | null
  success_rate: number | null
  updated_at: string
}

function formatPln(grosze: number): string {
  return (grosze / 100).toFixed(2).replace('.', ',') + ' zł'
}

export default async function AdminSzablonyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const category = (sp.category ?? '').trim()
  const active = (sp.active ?? '').trim()

  const admin = createAdminClient()

  let query = admin
    .from('case_type_config')
    .select(
      'id, case_type, category, display_name, short_name, price_pln, default_deadline_days, prompt_file, ai_model, slug, is_active, sort_order, popularity, success_rate, updated_at',
    )

  if (category) query = query.eq('category', category)
  if (active === 'true') query = query.eq('is_active', true)
  if (active === 'false') query = query.eq('is_active', false)

  query = query.order('category').order('sort_order')

  const { data, error } = await query
  const rows = (data as unknown as ConfigRow[] | null) ?? []

  // Grupowanie po kategoriach
  const byCategory = new Map<string, ConfigRow[]>()
  for (const r of rows) {
    const list = byCategory.get(r.category) ?? []
    list.push(r)
    byCategory.set(r.category, list)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">Szablony spraw</h1>
          <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
            Konfiguracja {rows.length} szablon{rows.length === 1 ? 'u' : 'ów'} (case_type_config)
          </p>
        </div>
        <Link href="/admin/dashboard" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          ← Dashboard
        </Link>
      </header>

      <form
        method="get"
        className="grid grid-cols-1 gap-3 rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900 sm:grid-cols-3"
      >
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
          <label htmlFor="active" className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
            Aktywne
          </label>
          <select
            id="active"
            name="active"
            defaultValue={active}
            className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
          >
            <option value="">Wszystkie</option>
            <option value="true">Tylko aktywne</option>
            <option value="false">Tylko wyłączone</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Zastosuj
          </button>
          <Link
            href="/admin/szablony"
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

      {rows.length === 0 ? (
        <div className="rounded-lg border border-iron-200 bg-white p-12 text-center text-iron-500 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-400">
          Brak szablonów odpowiadających filtrom.
        </div>
      ) : (
        Array.from(byCategory.entries()).map(([cat, items]) => {
          const catLabel = CATEGORIES.find(([v]) => v === cat)?.[1] ?? cat
          return (
            <section
              key={cat}
              className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900"
            >
              <header className="border-b border-iron-200 px-6 py-4 dark:border-iron-700">
                <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">
                  {catLabel}{' '}
                  <span className="ml-2 text-sm font-normal text-iron-500 dark:text-iron-400">
                    ({items.length})
                  </span>
                </h2>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-iron-50 text-left text-xs font-semibold uppercase tracking-wide text-iron-600 dark:bg-iron-800 dark:text-iron-300">
                    <tr>
                      <th className="px-4 py-2">Nazwa / case_type</th>
                      <th className="px-4 py-2 text-right">Cena</th>
                      <th className="px-4 py-2 text-right">Termin</th>
                      <th className="px-4 py-2">Prompt</th>
                      <th className="px-4 py-2">Slug</th>
                      <th className="px-4 py-2">Aktywny</th>
                      <th className="px-4 py-2 text-right">Popularność</th>
                      <th className="px-4 py-2 text-right">Skuteczność</th>
                      <th className="px-4 py-2 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
                    {items.map((r) => (
                      <tr key={r.id} className="hover:bg-iron-50/50 dark:hover:bg-iron-800/50">
                        <td className="px-4 py-2">
                          <div className="font-medium text-iron-900 dark:text-iron-50">{r.display_name}</div>
                          <div className="font-mono text-xs text-iron-500 dark:text-iron-400">{r.case_type}</div>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">{formatPln(r.price_pln)}</td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {r.default_deadline_days ? `${r.default_deadline_days} dni` : '—'}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-iron-600 dark:text-iron-400">
                          {r.prompt_file}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">{r.slug}</td>
                        <td className="px-4 py-2">
                          {r.is_active ? (
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              ✓ aktywny
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-iron-200 px-2 py-0.5 text-xs text-iron-600 dark:bg-iron-800 dark:text-iron-400">
                              ✗ wyłączony
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">{r.popularity ?? 0}</td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {r.success_rate != null ? `${r.success_rate}%` : '—'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Link
                            href={`/admin/szablony/${r.case_type}`}
                            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                          >
                            Edytuj →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
