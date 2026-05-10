import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Metadata } from 'next'

import { CodeEditor } from '@mandatomat/ui'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Edycja szablonu',
}

/**
 * /admin/szablony/[caseType] — edytor pojedynczego case_type_config.
 *
 * Edytowalne pola: display_name, short_name, description, price_pln,
 * default_deadline_days, deadline_legal_basis, prompt_file, ai_model,
 * default_addressee_type, seo_title, seo_description, slug, is_active,
 * sort_order, form_schema (JSON textarea).
 *
 * Server Action 'updateConfig' zapisuje zmiany do DB + admin_logs.
 */

const CATEGORIES = [
  'mandaty',
  'parking',
  'windykacja',
  'ubezpieczenia',
  'etoll',
  'kontrole',
  'techniczne',
] as const

type ConfigFull = {
  id: string
  case_type: string
  category: string
  display_name: string
  short_name: string
  description: string | null
  icon: string | null
  price_pln: number
  price_package_pln: number | null
  form_schema: Record<string, unknown>
  default_deadline_days: number | null
  deadline_legal_basis: string | null
  remind_days: number[] | null
  prompt_file: string
  ai_model: string | null
  default_addressee_type: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string[] | null
  slug: string
  is_active: boolean | null
  sort_order: number | null
  popularity: number | null
  success_rate: number | null
  created_at: string
  updated_at: string
}

async function updateConfig(formData: FormData) {
  'use server'

  const caseType = String(formData.get('case_type') ?? '')
  if (!caseType) throw new Error('case_type is required')

  // Auth: zweryfikuj że użytkownik jest adminem (mimo, że layout robi gating —
  // Server Action może być wywołana z innej origin, więc dublujemy)
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
    throw new Error('Forbidden — admin role required')
  }

  // Parse form fields
  const display_name = String(formData.get('display_name') ?? '').trim()
  const short_name = String(formData.get('short_name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const icon = String(formData.get('icon') ?? '').trim() || null
  const price_pln = Number(formData.get('price_pln') ?? 0)
  const default_deadline_days_raw = String(formData.get('default_deadline_days') ?? '').trim()
  const default_deadline_days = default_deadline_days_raw ? Number(default_deadline_days_raw) : null
  const deadline_legal_basis = String(formData.get('deadline_legal_basis') ?? '').trim() || null
  const prompt_file = String(formData.get('prompt_file') ?? '').trim()
  const ai_model = String(formData.get('ai_model') ?? '').trim() || null
  const default_addressee_type = String(formData.get('default_addressee_type') ?? '').trim() || null
  const seo_title = String(formData.get('seo_title') ?? '').trim() || null
  const seo_description = String(formData.get('seo_description') ?? '').trim() || null
  const slug = String(formData.get('slug') ?? '').trim()
  const is_active = formData.get('is_active') === 'on'
  const sort_order = Number(formData.get('sort_order') ?? 0)
  const remind_days_raw = String(formData.get('remind_days') ?? '5,3,1,0')
  const remind_days = remind_days_raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n))
  const seo_keywords_raw = String(formData.get('seo_keywords') ?? '').trim()
  const seo_keywords = seo_keywords_raw
    ? seo_keywords_raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : null

  const form_schema_raw = String(formData.get('form_schema') ?? '{}')
  let form_schema: Record<string, unknown>
  try {
    form_schema = JSON.parse(form_schema_raw) as Record<string, unknown>
    if (typeof form_schema !== 'object' || Array.isArray(form_schema)) {
      throw new Error('form_schema musi być obiektem JSON')
    }
  } catch (err) {
    throw new Error(
      `Nieprawidłowy JSON w form_schema: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  const admin = createAdminClient()

  // Pobierz stary stan dla audit logu
  const { data: oldData } = await admin
    .from('case_type_config')
    .select('*')
    .eq('case_type', caseType)
    .maybeSingle()

  const update = {
    display_name,
    short_name,
    description,
    icon,
    price_pln,
    default_deadline_days,
    deadline_legal_basis,
    remind_days,
    prompt_file,
    ai_model,
    default_addressee_type,
    seo_title,
    seo_description,
    seo_keywords,
    slug,
    is_active,
    sort_order,
    form_schema,
  }

  const { error: upErr } = await admin
    .from('case_type_config')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(update as any)
    .eq('case_type', caseType)

  if (upErr) throw new Error(`Błąd zapisu: ${upErr.message}`)

  // Zapisz w admin_logs
  await admin.from('admin_logs').insert({
    admin_id: user.id,
    action: 'update_case_type_config',
    target_type: 'case_type_config',
    target_id: (oldData as { id?: string } | null)?.id ?? null,
    old_data: oldData as Record<string, unknown> | null,
    new_data: update,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

  revalidatePath(`/admin/szablony/${caseType}`)
  revalidatePath('/admin/szablony')
  redirect(`/admin/szablony/${caseType}?saved=1`)
}

export default async function AdminSzablonEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ caseType: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  const { caseType } = await params
  const sp = await searchParams
  const saved = sp.saved === '1'

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('case_type_config')
    .select('*')
    .eq('case_type', caseType)
    .maybeSingle()

  if (error || !data) notFound()

  const c = data as unknown as ConfigFull

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/szablony"
          className="text-brand-600 dark:text-brand-400 text-xs hover:underline"
        >
          ← Lista szablonów
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">
          {c.display_name}
        </h1>
        <p className="text-sm text-iron-600 dark:text-iron-400">
          <span className="font-mono">{c.case_type}</span> · kategoria: {c.category} · slug:{' '}
          <code className="text-xs">/{c.slug}</code>
        </p>
      </header>

      {saved && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          ✓ Zmiany zapisane.
        </div>
      )}

      <form action={updateConfig} className="space-y-6">
        <input type="hidden" name="case_type" value={c.case_type} />

        {/* Sekcja: Wyświetlanie */}
        <section className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
          <h2 className="mb-4 text-base font-semibold text-iron-900 dark:text-iron-50">
            Wyświetlanie
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Nazwa wyświetlana"
              name="display_name"
              defaultValue={c.display_name}
              required
            />
            <Field label="Krótka nazwa" name="short_name" defaultValue={c.short_name} required />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
                Opis
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={c.description ?? ''}
                className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
              />
            </div>
            <Field label="Ikona (Lucide name)" name="icon" defaultValue={c.icon ?? ''} />
            <Field
              label="Slug (URL)"
              name="slug"
              defaultValue={c.slug}
              required
              hint="np. mandat-sprzeciw-predkosc"
            />
          </div>
        </section>

        {/* Sekcja: Cennik & terminy */}
        <section className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
          <h2 className="mb-4 text-base font-semibold text-iron-900 dark:text-iron-50">
            Cennik & terminy
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label="Cena (grosze)"
              name="price_pln"
              type="number"
              defaultValue={String(c.price_pln)}
              required
              hint={`= ${(c.price_pln / 100).toFixed(2)} zł`}
            />
            <Field
              label="Termin domyślny (dni)"
              name="default_deadline_days"
              type="number"
              defaultValue={c.default_deadline_days != null ? String(c.default_deadline_days) : ''}
            />
            <Field
              label="Remind days (csv)"
              name="remind_days"
              defaultValue={(c.remind_days ?? [5, 3, 1, 0]).join(',')}
              hint="np. 5,3,1,0"
            />
            <div className="sm:col-span-3">
              <Field
                label="Podstawa prawna terminu"
                name="deadline_legal_basis"
                defaultValue={c.deadline_legal_basis ?? ''}
                hint="np. Art. 96 § 4 KW (7 dni od doręczenia)"
              />
            </div>
          </div>
        </section>

        {/* Sekcja: AI */}
        <section className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
          <h2 className="mb-4 text-base font-semibold text-iron-900 dark:text-iron-50">AI</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Plik z promptem"
              name="prompt_file"
              defaultValue={c.prompt_file}
              required
              hint="np. M1.md"
            />
            <Field
              label="Model AI"
              name="ai_model"
              defaultValue={c.ai_model ?? 'claude-sonnet-4-6'}
            />
            <Field
              label="Domyślny adresat"
              name="default_addressee_type"
              defaultValue={c.default_addressee_type ?? ''}
              hint="np. policja, straz_miejska, sad"
            />
          </div>
        </section>

        {/* Sekcja: SEO */}
        <section className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
          <h2 className="mb-4 text-base font-semibold text-iron-900 dark:text-iron-50">SEO</h2>
          <div className="grid grid-cols-1 gap-4">
            <Field label="SEO title" name="seo_title" defaultValue={c.seo_title ?? ''} />
            <div>
              <label className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300">
                SEO description
              </label>
              <textarea
                name="seo_description"
                rows={2}
                defaultValue={c.seo_description ?? ''}
                className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
              />
            </div>
            <Field
              label="Keywords (csv)"
              name="seo_keywords"
              defaultValue={(c.seo_keywords ?? []).join(', ')}
              hint="np. mandat, sprzeciw, fotoradar"
            />
          </div>
        </section>

        {/* Sekcja: Form schema */}
        <section className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">
              Form schema (JSON)
            </h2>
            <span className="text-xs text-iron-500 dark:text-iron-400">
              Zostaje walidowane jako JSON object
            </span>
          </header>
          <CodeEditor
            name="form_schema"
            language="json"
            rows={20}
            defaultValue={JSON.stringify(c.form_schema ?? {}, null, 2)}
            ariaLabel="Form schema (JSON)"
          />
        </section>

        {/* Sekcja: Status */}
        <section className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
          <h2 className="mb-4 text-base font-semibold text-iron-900 dark:text-iron-50">Status</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={c.is_active ?? true}
                className="text-brand-600 focus:ring-brand-500 h-4 w-4 rounded border-iron-300"
              />
              <span className="text-iron-700 dark:text-iron-200">
                Aktywny (widoczny w katalogu)
              </span>
            </label>
            <Field
              label="Sort order"
              name="sort_order"
              type="number"
              defaultValue={String(c.sort_order ?? 0)}
            />
          </div>
        </section>

        {/* Akcje */}
        <div className="flex items-center justify-between border-t border-iron-200 pt-4 dark:border-iron-700">
          <Link
            href="/admin/szablony"
            className="text-sm text-iron-600 hover:underline dark:text-iron-400"
          >
            Anuluj
          </Link>
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 focus:ring-brand-500 rounded-md px-6 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Zapisz zmiany
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
  hint,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  required?: boolean
  hint?: string
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-xs font-medium text-iron-600 dark:text-iron-300"
      >
        {label} {required && <span className="text-signal-600">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-md border border-iron-200 bg-white px-3 py-2 text-sm dark:border-iron-700 dark:bg-iron-800 dark:text-iron-50"
      />
      {hint && <p className="mt-1 text-xs text-iron-500 dark:text-iron-400">{hint}</p>}
    </div>
  )
}
