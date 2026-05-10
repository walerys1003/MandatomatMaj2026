import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { CrossSellBanner, type CrossSellProduct } from '@mandatomat/ui/cross-sell-banner'

import { caseTypeFromDb } from '@/lib/cases/db-mapping'
import { getCaseTypeMeta } from '@/lib/cases/catalog'
import { createClient } from '@/lib/supabase/server'

import { DownloadClient } from './download-client'
import { FeedbackSection } from './feedback-section'

/**
 * Heurystyka dobierania wariantu cross-sell na podstawie kategorii sprawy:
 *  - windykacja (W1-W5)        → Długomat (kanibalizacja działa w drugą stronę:
 *                                 user który ma już sprawę windykacyjną na Mandatomat
 *                                 jest idealnym targetem dla Długomatu)
 *  - mandaty / parking / etoll → generic (ekosystem) — w przyszłości można dodać
 *                                 dedykowane warianty (np. "Rozwodomat" dla persona-based cross-sell)
 *  - alimentomat zostawiamy do osobnego placementu (np. blog / SEO landingi)
 */
function pickCrossSellProduct(caseTypeDb: string): CrossSellProduct {
  const tsType = caseTypeFromDb(caseTypeDb)
  if (!tsType) return 'generic'
  const meta = getCaseTypeMeta(tsType)
  if (!meta) return 'generic'
  if (meta.category === 'windykacja') return 'dlugomat'
  return 'generic'
}

interface PageProps {
  params: { caseId: string }
  searchParams: { session_id?: string }
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pobierz pismo',
  description: 'Twoje pismo jest gotowe — pobierz PDF i wyślij.',
}

/**
 * /sprawy/[caseId]/pobranie — success page po Stripe redirect.
 *
 * Server Component:
 *  - waliduje, że sprawa należy do usera i jest 'paid' (lub czeka na webhook)
 *  - ładuje aktualną wersję dokumentu
 *  - przekazuje do DownloadClient (przycisk "Pobierz PDF" + signed URL z /api/documents/[docId]/pdf)
 *
 * Edge case: webhook może jeszcze nie przyjść (race condition po Stripe redirect).
 *   → DownloadClient polluje status sprawy co 2s przez 30s.
 */
export default async function DownloadPage({ params, searchParams }: PageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=/sprawy/${params.caseId}/pobranie`)
  }

  const { data: caseRow } = await supabase
    .from('cases')
    .select('id, status, title, case_type')
    .eq('id', params.caseId)
    .maybeSingle()

  if (!caseRow) notFound()

  const caseTyped = caseRow as {
    id: string
    status: string
    title: string | null
    case_type: string
  }

  // Najnowszy dokument (is_current = true)
  const { data: docRow } = await supabase
    .from('documents')
    .select('id, title, version, storage_path, file_name')
    .eq('case_id', params.caseId)
    .eq('is_current', true)
    .maybeSingle()

  const doc = docRow as {
    id: string
    title: string | null
    version: number
    storage_path: string | null
    file_name: string | null
  } | null

  return (
    <div className="mx-auto max-w-2xl">
      {/* Hero */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
          Płatność zaakceptowana
        </h1>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
          Twoje pismo jest gotowe do pobrania. Wysłaliśmy też link na e-mail.
        </p>
      </div>

      {/* Info o sprawie */}
      <div className="mt-6 rounded-md border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
        <p className="text-xs uppercase tracking-wider text-iron-500 dark:text-iron-400">Sprawa</p>
        <p className="mt-1 text-sm font-medium text-iron-900 dark:text-iron-50">
          {caseTyped.title ?? 'Pismo'}
        </p>
        {doc ? (
          <p className="mt-1 text-xs text-iron-500 dark:text-iron-400">
            Wersja {doc.version} · {doc.file_name ?? `${doc.title ?? 'pismo'}.pdf`}
          </p>
        ) : null}
      </div>

      <DownloadClient
        caseId={caseTyped.id}
        caseStatus={caseTyped.status}
        documentId={doc?.id ?? null}
        sessionId={searchParams.session_id ?? null}
      />

      {/* Co dalej */}
      <div className="mt-8 rounded-md border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
        <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">Co dalej?</h2>
        <ol className="mt-3 space-y-3 text-sm text-iron-700 dark:text-iron-300">
          <li className="flex gap-3">
            <span className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200 flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold">
              1
            </span>
            <span>Wydrukuj pismo (A4) lub wyślij elektronicznie przez ePUAP/e-mail.</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200 flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold">
              2
            </span>
            <span>
              Podpisz odręcznie i wyślij listem poleconym (zachowaj potwierdzenie nadania).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200 flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold">
              3
            </span>
            <span>
              Dodamy automatyczny termin do Twojego kalendarza — przypomnimy o reakcji organu.
            </span>
          </li>
        </ol>
      </div>

      {/* Feedback widget — Faza 9 (T20): "Oceń pismo" 1-5★ + outcome + komentarz */}
      <div className="mt-8">
        <FeedbackSection caseId={caseTyped.id} />
      </div>

      {/* Cross-sell — P10 (T20 Faza 9): banner do siostrzanego produktu w ekosystemie */}
      <div className="mt-8">
        <CrossSellBanner
          product={pickCrossSellProduct(caseTyped.case_type)}
          utmCampaign={`pobranie_${caseTyped.case_type}`}
        />
      </div>

      <div className="mt-6 flex justify-between text-sm">
        <Link
          href="/dashboard"
          className="text-iron-600 underline hover:text-iron-900 dark:text-iron-400 dark:hover:text-iron-100"
        >
          ← Panel
        </Link>
        <Link
          href={`/sprawy/${caseTyped.id}`}
          className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Szczegóły sprawy →
        </Link>
      </div>
    </div>
  )
}
