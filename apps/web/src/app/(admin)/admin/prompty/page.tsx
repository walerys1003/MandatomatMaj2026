import Link from 'next/link'
import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Prompty',
}

/**
 * /admin/prompty — lista wszystkich promptów AI per case_type.
 *
 * Łączy prompt_templates (treść + wersja) z case_type_config (display_name, kategoria).
 * Każdy wpis ma link do /admin/prompty/[caseType] (edytor + historia).
 *
 * Jeśli prompt_templates nie istnieje dla danego case_type — pokazujemy "brak"
 * z linkiem do utworzenia (POST /admin/prompty/[caseType] — patrz edytor).
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

type ConfigRow = {
  case_type: string
  category: string
  display_name: string
  prompt_file: string
  ai_model: string | null
  is_active: boolean | null
}

type TemplateRow = {
  id: string
  case_type: string
  version: number
  model: string | null
  updated_at: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function AdminPromptyPage() {
  const admin = createAdminClient()

  const [configsRes, templatesRes] = await Promise.all([
    admin
      .from('case_type_config')
      .select('case_type, category, display_name, prompt_file, ai_model, is_active')
      .order('category')
      .order('sort_order'),
    admin.from('prompt_templates').select('id, case_type, version, model, updated_at'),
  ])

  const configs = (configsRes.data as unknown as ConfigRow[] | null) ?? []
  const templates = (templatesRes.data as unknown as TemplateRow[] | null) ?? []

  const tplByType = new Map<string, TemplateRow>()
  for (const t of templates) tplByType.set(t.case_type, t)

  const byCategory = new Map<string, ConfigRow[]>()
  for (const c of configs) {
    const list = byCategory.get(c.category) ?? []
    list.push(c)
    byCategory.set(c.category, list)
  }

  const totalConfigs = configs.length
  const totalTemplates = templates.length
  const missing = totalConfigs - totalTemplates

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">Prompty AI</h1>
          <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
            <strong className="tabular-nums">{totalTemplates}</strong> z {totalConfigs} szablonów ma własny
            prompt w bazie {missing > 0 && <span className="text-amber-600">· brakuje: {missing}</span>}
          </p>
        </div>
        <Link href="/admin/dashboard" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          ← Dashboard
        </Link>
      </header>

      {configsRes.error && (
        <div className="rounded-md border border-signal-200 bg-signal-50 p-4 text-sm text-signal-800 dark:border-signal-900 dark:bg-signal-950/30 dark:text-signal-300">
          Błąd: {configsRes.error.message}
        </div>
      )}

      {Array.from(byCategory.entries()).map(([cat, items]) => {
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
                    <th className="px-4 py-2">Plik źródłowy</th>
                    <th className="px-4 py-2">Model</th>
                    <th className="px-4 py-2 text-right">Wersja</th>
                    <th className="px-4 py-2">Ostatnia edycja</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
                  {items.map((cfg) => {
                    const tpl = tplByType.get(cfg.case_type)
                    return (
                      <tr key={cfg.case_type} className="hover:bg-iron-50/50 dark:hover:bg-iron-800/50">
                        <td className="px-4 py-2">
                          <div className="font-medium text-iron-900 dark:text-iron-50">
                            {cfg.display_name}
                          </div>
                          <div className="font-mono text-xs text-iron-500 dark:text-iron-400">
                            {cfg.case_type}
                          </div>
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-iron-600 dark:text-iron-400">
                          {cfg.prompt_file}
                        </td>
                        <td className="px-4 py-2 text-iron-700 dark:text-iron-300">
                          {tpl?.model ?? cfg.ai_model ?? '—'}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {tpl ? `v${tpl.version}` : <span className="text-iron-400">—</span>}
                        </td>
                        <td className="px-4 py-2 text-iron-600 dark:text-iron-400">
                          {tpl ? formatDate(tpl.updated_at) : '—'}
                        </td>
                        <td className="px-4 py-2">
                          {tpl ? (
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              ✓ w bazie
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                              brak
                            </span>
                          )}
                          {!cfg.is_active && (
                            <span className="ml-2 inline-block rounded-full bg-iron-200 px-2 py-0.5 text-xs text-iron-600 dark:bg-iron-800 dark:text-iron-400">
                              wyłączony
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Link
                            href={`/admin/prompty/${cfg.case_type}`}
                            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                          >
                            {tpl ? 'Edytuj' : 'Utwórz'} →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}
