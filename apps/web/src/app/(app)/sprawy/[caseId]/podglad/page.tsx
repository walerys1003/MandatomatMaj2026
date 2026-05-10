import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { Alert, Badge, Button } from '@mandatomat/ui'

import { caseTypeFromDb } from '@/lib/cases/db-mapping'
import { getCaseTypeMeta } from '@/lib/cases/catalog'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: { caseId: string }
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Podgląd sprawy',
  description: 'Podgląd wygenerowanego pisma — możesz edytować i pobrać.',
}

/**
 * /sprawy/[caseId]/podglad — krok 3 wizarda.
 *
 * MVP placeholder: ładuje sprawę + pokazuje status. Pełna funkcjonalność
 * (Markdown preview, edycja, scoring, walidacja, regeneracja, CTA płatność)
 * dokleja się w kolejnych krokach Tier 3.
 *
 * Tu sprawdzamy: czy sprawa istnieje, czy należy do usera (RLS), czy ma
 * dokument. Jeśli nie — pokazujemy CTA "wygeneruj pismo".
 */
export default async function PodgladPage({ params }: PageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/sprawy/${params.caseId}/podglad`)

  const { data: caseData, error } = await supabase
    .from('cases')
    .select('id, case_type, category, title, status, payment_status, form_data, created_at')
    .eq('id', params.caseId)
    .single()

  if (error || !caseData) notFound()

  const tsType = caseTypeFromDb(caseData.case_type)
  const meta = tsType ? getCaseTypeMeta(tsType) : undefined

  const { data: documents } = await supabase
    .from('documents')
    .select('id, document_type, content_md, score, validation_passed, created_at')
    .eq('case_id', caseData.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const latestDoc = documents?.[0]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-iron-500">
        <Link href="/panel" className="hover:text-precision-blue-600 hover:underline">
          ← Pulpit
        </Link>
      </nav>

      <header className="mb-8">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          Krok 3 z 4 — Podgląd
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
          {caseData.title}
        </h1>
        <div className="mt-3 flex items-center gap-2">
          {meta ? (
            <span className="font-mono text-[11px] uppercase tracking-wider text-iron-500">
              {meta.shortId} · {meta.title}
            </span>
          ) : null}
          <Badge variant="default">{caseData.status}</Badge>
        </div>
      </header>

      {!latestDoc ? (
        <div className="space-y-6">
          <Alert variant="info" title="Pismo jeszcze nie wygenerowane">
            Zebraliśmy Twoje dane. Następny krok: AI wygeneruje pismo na podstawie wybranych
            argumentów. Ten widok zostanie wkrótce uzupełniony o automatyczne generowanie.
          </Alert>

          <div className="rounded-xl border border-iron-200 bg-white p-6 dark:border-iron-800 dark:bg-iron-900">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
              Zebrane dane formularza
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              {Object.entries(caseData.form_data ?? {})
                .filter(([k]) => !k.startsWith('_'))
                .map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-start justify-between gap-4 border-b border-iron-100 pb-2 dark:border-iron-800"
                  >
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-iron-500">
                      {k}
                    </dt>
                    <dd className="text-right text-iron-800 dark:text-iron-200">
                      {formatValue(v)}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>

          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="md">
              <Link href="/panel">← Wróć do pulpitu</Link>
            </Button>
            <Button variant="primary" size="md" disabled>
              Generuj pismo (wkrótce)
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Alert variant="success" title="Pismo gotowe do podglądu">
            Pełna edycja, scoring i pobranie pojawią się w kolejnym kroku Tier 3.
          </Alert>
          <pre className="overflow-auto rounded-xl border border-iron-200 bg-iron-50 p-6 text-sm dark:border-iron-800 dark:bg-iron-950">
            {latestDoc.content_md}
          </pre>
        </div>
      )}
    </div>
  )
}

function formatValue(v: unknown): string {
  if (v == null || v === '') return '—'
  if (Array.isArray(v)) return v.length === 0 ? '—' : v.join(', ')
  if (typeof v === 'boolean') return v ? 'Tak' : 'Nie'
  return String(v)
}
