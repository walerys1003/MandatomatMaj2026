import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Metadata } from 'next'

import { CodeEditor } from '@mandatomat/ui'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Edycja promptu',
}

/**
 * /admin/prompty/[caseType] — edytor Markdown promptu z historią wersji.
 *
 * Layout:
 *  - Header: case_type, nazwa konfiguracji, model
 *  - Lewa kolumna (md+): textarea Markdown (font monospace) + meta
 *  - Prawa kolumna: lista wersji z linkiem do podglądu
 *  - Akcja zapisu: tworzy nową wersję (insert do prompt_template_versions),
 *    aktualizuje prompt_templates (upsert), wpis do admin_logs.
 */

const VERSIONS_LIMIT = 30

type ConfigRow = {
  case_type: string
  category: string
  display_name: string
  prompt_file: string
  ai_model: string | null
}

type TemplateRow = {
  id: string
  case_type: string
  content: string
  version: number
  description: string | null
  model: string | null
  temperature: number | null
  max_tokens: number | null
  last_edited_by: string | null
  updated_at: string
}

type VersionRow = {
  id: string
  version: number
  edit_note: string | null
  edited_by: string | null
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

async function savePrompt(formData: FormData) {
  'use server'

  const caseType = String(formData.get('case_type') ?? '')
  if (!caseType) throw new Error('case_type wymagany')

  // Auth + rola admina
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if ((profile as { role?: string } | null)?.role !== 'admin') {
    throw new Error('Forbidden — wymagana rola admin')
  }

  const content = String(formData.get('content') ?? '').trim()
  if (!content || content.length < 50) {
    throw new Error('Treść promptu jest zbyt krótka (min 50 znaków)')
  }
  const description = String(formData.get('description') ?? '').trim() || null
  const model = String(formData.get('model') ?? 'claude-sonnet-4-6').trim() || 'claude-sonnet-4-6'
  const temperatureRaw = String(formData.get('temperature') ?? '0.30').trim()
  const temperature = Number(temperatureRaw)
  const maxTokensRaw = String(formData.get('max_tokens') ?? '4000').trim()
  const max_tokens = Math.max(100, Math.min(20000, Number(maxTokensRaw) || 4000))
  const editNote = String(formData.get('edit_note') ?? '').trim() || null

  const admin = createAdminClient()

  // Sprawdź istniejący wpis
  const { data: existingRaw } = await admin
    .from('prompt_templates')
    .select('id, version, content')
    .eq('case_type', caseType)
    .maybeSingle()
  const existing = existingRaw as { id: string; version: number; content: string } | null

  const newVersion = (existing?.version ?? 0) + 1

  let templateId: string

  if (existing) {
    // UPDATE wartość bieżącą
    const { error: upErr } = await admin
      .from('prompt_templates')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({
        content,
        version: newVersion,
        description,
        model,
        temperature: Number.isFinite(temperature) ? temperature : 0.3,
        max_tokens,
        last_edited_by: user.id,
      } as any)
      .eq('id', existing.id)
    if (upErr) throw new Error(`Błąd zapisu: ${upErr.message}`)
    templateId = existing.id
  } else {
    // INSERT nowy
    const { data: inserted, error: insErr } = await admin
      .from('prompt_templates')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({
        case_type: caseType,
        content,
        version: 1,
        description,
        model,
        temperature: Number.isFinite(temperature) ? temperature : 0.3,
        max_tokens,
        last_edited_by: user.id,
      } as any)
      .select('id')
      .single()
    if (insErr || !inserted) throw new Error(`Błąd zapisu: ${insErr?.message ?? 'unknown'}`)
    templateId = (inserted as { id: string }).id
  }

  // Zapisz do historii wersji
  const { error: verErr } = await admin
    .from('prompt_template_versions')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({
      template_id: templateId,
      case_type: caseType,
      version: existing ? newVersion : 1,
      content,
      model,
      temperature: Number.isFinite(temperature) ? temperature : 0.3,
      max_tokens,
      edited_by: user.id,
      edit_note: editNote,
    } as any)
  if (verErr) console.error('prompt_template_versions insert failed', verErr)

  // Audit log
  await admin
    .from('admin_logs')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({
      admin_id: user.id,
      action: 'update_prompt_template',
      target_type: 'prompt_template',
      target_id: templateId,
      old_data: existing
        ? { version: existing.version, content_length: existing.content.length }
        : null,
      new_data: {
        version: existing ? newVersion : 1,
        content_length: content.length,
        edit_note: editNote,
      },
    } as any)

  revalidatePath(`/admin/prompty/${caseType}`)
  revalidatePath('/admin/prompty')
  redirect(`/admin/prompty/${caseType}?saved=1`)
}

export default async function AdminPromptEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ caseType: string }>
  searchParams: Promise<{ saved?: string; ver?: string }>
}) {
  const { caseType } = await params
  const sp = await searchParams
  const saved = sp.saved === '1'
  const verToShow = sp.ver ? Number(sp.ver) : null

  const admin = createAdminClient()

  const [cfgRes, tplRes] = await Promise.all([
    admin
      .from('case_type_config')
      .select('case_type, category, display_name, prompt_file, ai_model')
      .eq('case_type', caseType)
      .maybeSingle(),
    admin.from('prompt_templates').select('*').eq('case_type', caseType).maybeSingle(),
  ])

  const cfg = cfgRes.data as unknown as ConfigRow | null
  if (!cfg) notFound()
  const tpl = tplRes.data as unknown as TemplateRow | null

  // Historia wersji
  let versions: VersionRow[] = []
  let oldVersionContent: string | null = null
  if (tpl) {
    const { data: verData } = await admin
      .from('prompt_template_versions')
      .select('id, version, edit_note, edited_by, created_at')
      .eq('template_id', tpl.id)
      .order('version', { ascending: false })
      .limit(VERSIONS_LIMIT)
    versions = (verData as unknown as VersionRow[] | null) ?? []

    if (verToShow != null) {
      const { data: oldRaw } = await admin
        .from('prompt_template_versions')
        .select('content')
        .eq('template_id', tpl.id)
        .eq('version', verToShow)
        .maybeSingle()
      oldVersionContent = (oldRaw as { content?: string } | null)?.content ?? null
    }
  }

  // Resolve edited_by → email
  const editorIds = Array.from(
    new Set(versions.map((v) => v.edited_by).filter((x): x is string => !!x)),
  )
  const editorMap = new Map<string, ProfileShort>()
  if (editorIds.length > 0) {
    const { data: profs } = await admin.from('profiles').select('id, email').in('id', editorIds)
    for (const p of (profs as unknown as ProfileShort[] | null) ?? []) editorMap.set(p.id, p)
  }

  const initialContent = tpl?.content ?? defaultPromptScaffold(cfg)

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/prompty"
          className="text-brand-600 dark:text-brand-400 text-xs hover:underline"
        >
          ← Lista promptów
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">
          {cfg.display_name}
        </h1>
        <p className="text-sm text-iron-600 dark:text-iron-400">
          <span className="font-mono">{cfg.case_type}</span> · kategoria: {cfg.category}
          {tpl && (
            <>
              {' · '}wersja <strong className="tabular-nums">v{tpl.version}</strong> ·
              zaktualizowano {formatDate(tpl.updated_at)}
            </>
          )}
        </p>
      </header>

      {saved && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          ✓ Prompt zapisany. Nowa wersja dodana do historii.
        </div>
      )}

      {oldVersionContent != null && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <header className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Podgląd wersji v{verToShow}
            </h2>
            <Link
              href={`/admin/prompty/${caseType}`}
              className="text-xs text-amber-700 hover:underline dark:text-amber-300"
            >
              Zamknij ✕
            </Link>
          </header>
          <pre className="max-h-96 overflow-auto rounded-md bg-white p-3 font-mono text-xs text-iron-800 dark:bg-iron-950 dark:text-iron-200">
            {oldVersionContent}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Edytor */}
        <form action={savePrompt} className="space-y-4 lg:col-span-2">
          <input type="hidden" name="case_type" value={cfg.case_type} />

          <div className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="model"
                  className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300"
                >
                  Model
                </label>
                <input
                  id="model"
                  name="model"
                  defaultValue={tpl?.model ?? cfg.ai_model ?? 'claude-sonnet-4-6'}
                  className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
                />
              </div>
              <div>
                <label
                  htmlFor="temperature"
                  className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300"
                >
                  Temperature (0–1)
                </label>
                <input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  defaultValue={String(tpl?.temperature ?? 0.3)}
                  className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
                />
              </div>
              <div>
                <label
                  htmlFor="max_tokens"
                  className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300"
                >
                  Max tokens
                </label>
                <input
                  id="max_tokens"
                  name="max_tokens"
                  type="number"
                  min="100"
                  max="20000"
                  defaultValue={String(tpl?.max_tokens ?? 4000)}
                  className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300"
              >
                Opis (krótka notka co prompt robi)
              </label>
              <input
                id="description"
                name="description"
                defaultValue={tpl?.description ?? ''}
                placeholder="np. Generuje sprzeciw od mandatu drogowego za przekroczenie prędkości."
                className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300"
              >
                Treść promptu (Markdown)
              </label>
              <CodeEditor
                name="content"
                language="markdown"
                rows={28}
                required
                defaultValue={initialContent}
                ariaLabel="Treść promptu (Markdown)"
              />
              <p className="mt-1 text-xs text-iron-500 dark:text-iron-400">
                Min. 50 znaków. Każdy zapis tworzy nową wersję — możesz wrócić do poprzedniej.
              </p>
            </div>

            <div className="mt-4">
              <label
                htmlFor="edit_note"
                className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300"
              >
                Notatka do tej wersji (opcjonalnie)
              </label>
              <input
                id="edit_note"
                name="edit_note"
                placeholder="np. dodano sekcję o przedawnieniu"
                className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-iron-200 pt-4 dark:border-iron-700">
            <Link
              href="/admin/prompty"
              className="text-sm text-iron-600 hover:underline dark:text-iron-400"
            >
              Anuluj
            </Link>
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 focus:ring-brand-500 rounded-md px-6 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              {tpl ? 'Zapisz nową wersję' : 'Utwórz prompt'}
            </button>
          </div>
        </form>

        {/* Historia */}
        <aside className="space-y-3">
          <div className="rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900">
            <header className="border-b border-iron-200 px-4 py-3 dark:border-iron-700">
              <h2 className="text-sm font-semibold text-iron-900 dark:text-iron-50">
                Historia wersji ({versions.length})
              </h2>
            </header>
            {versions.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-iron-500 dark:text-iron-400">
                Brak historii. Zapisz prompt po raz pierwszy aby utworzyć v1.
              </p>
            ) : (
              <ul className="divide-y divide-iron-100 text-sm dark:divide-iron-800">
                {versions.map((v) => {
                  const editor = v.edited_by ? editorMap.get(v.edited_by) : null
                  const isCurrent = tpl && v.version === tpl.version
                  return (
                    <li key={v.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium tabular-nums text-iron-900 dark:text-iron-50">
                          v{v.version}
                          {isCurrent && (
                            <span className="bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 ml-2 rounded-full px-2 py-0.5 text-xs font-normal">
                              aktualna
                            </span>
                          )}
                        </span>
                        <Link
                          href={`/admin/prompty/${caseType}?ver=${v.version}`}
                          className="text-brand-600 dark:text-brand-400 text-xs hover:underline"
                        >
                          Podgląd →
                        </Link>
                      </div>
                      <p className="mt-1 text-xs text-iron-500 dark:text-iron-400">
                        {formatDate(v.created_at)}
                        {editor && <span> · {editor.email}</span>}
                      </p>
                      {v.edit_note && (
                        <p className="mt-1 text-xs italic text-iron-600 dark:text-iron-300">
                          "{v.edit_note}"
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-iron-200 bg-white p-4 text-xs text-iron-600 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-400">
            <h3 className="mb-2 text-sm font-semibold text-iron-900 dark:text-iron-50">
              Zmienne dostępne
            </h3>
            <ul className="space-y-1 font-mono">
              <li>{'{{form_data}}'} — JSON danych z formularza</li>
              <li>{'{{ocr_data}}'} — dane z OCR (jeśli dostępne)</li>
              <li>{'{{user_full_name}}'} — imię i nazwisko</li>
              <li>{'{{user_address}}'} — adres</li>
              <li>{'{{deadline_date}}'} — termin (PL format)</li>
              <li>{'{{today}}'} — dzisiejsza data</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function defaultPromptScaffold(cfg: ConfigRow): string {
  return `# Prompt: ${cfg.display_name}

## Rola
Jesteś prawnikiem specjalizującym się w sprawach z kategorii **${cfg.category}**. Twoim zadaniem jest wygenerowanie pisma "${cfg.display_name}" w języku polskim, zgodnie z polskim prawem.

## Dane wejściowe
- Dane formularza: \`{{form_data}}\`
- Dane OCR: \`{{ocr_data}}\`
- Imię i nazwisko klienta: \`{{user_full_name}}\`
- Adres klienta: \`{{user_address}}\`
- Termin: \`{{deadline_date}}\`
- Data dzisiejsza: \`{{today}}\`

## Wymagania
1. Pismo musi być formalne, w języku polskim, w 1. osobie liczby pojedynczej.
2. Zawiera podstawę prawną z odpowiednich aktów (KPA, KW, KC, KK).
3. Strukturalne sekcje: nagłówek z miejscem i datą, dane stron, treść, podpis.
4. Format: Markdown (h1, h2, p, ul/ol, podstawy prawne wytłuszczone).
5. Długość: 400–800 słów.
6. Bez "PROJEKT" — to dodaje system po stronie generatora PDF.

## Format odpowiedzi
Tylko treść pisma w Markdown — bez komentarzy, bez kodu, bez nagłówka "OTO PISMO".
`
}
