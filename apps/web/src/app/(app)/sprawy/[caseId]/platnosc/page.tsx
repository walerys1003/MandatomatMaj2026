import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { caseTypeFromDb } from '@/lib/cases/db-mapping'
import { getCaseTypeMeta } from '@/lib/cases/catalog'
import { getProduct } from '@/lib/payments/stripe'
import { createClient } from '@/lib/supabase/server'

import { PaymentClient } from './payment-client'

interface PageProps {
  params: { caseId: string }
  searchParams: { canceled?: string }
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Płatność',
  description: 'Opłać pismo — bezpieczna płatność Stripe (karta, BLIK, Przelewy24).',
}

/**
 * /sprawy/[caseId]/platnosc — krok 4 wizarda.
 *
 * Server Component:
 *  - ładuje sprawę + product code
 *  - renderuje preview ceny + PaymentClient (kod promo + przycisk Zapłać)
 *  - jeśli sprawa już opłacona → redirect /pobranie
 */
export default async function PaymentPage({ params, searchParams }: PageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=/sprawy/${params.caseId}/platnosc`)
  }

  const { data: caseRow } = await supabase
    .from('cases')
    .select('id, case_type, status, title')
    .eq('id', params.caseId)
    .maybeSingle()

  if (!caseRow) notFound()

  const caseTyped = caseRow as {
    id: string
    case_type: string
    status: string
    title: string | null
  }

  if (caseTyped.status === 'paid' || caseTyped.status === 'archived') {
    redirect(`/sprawy/${params.caseId}/pobranie`)
  }

  // Mapowanie case_type (DB enum) → product code
  const shortId = caseTypeFromDb(caseTyped.case_type) ?? 'M1_mandat_predkosc'
  const meta = getCaseTypeMeta(shortId)
  const product = getProduct(shortId)

  if (!product) {
    return (
      <div className="rounded-md border border-signal-300 bg-signal-50 p-6 text-signal-900 dark:border-signal-800 dark:bg-signal-950 dark:text-signal-100">
        <h1 className="text-xl font-bold">Brak cennika dla tego typu sprawy</h1>
        <p className="mt-2 text-sm">
          Skontaktuj się z supportem: <a href="mailto:pomoc@mandatomat.pl" className="underline">pomoc@mandatomat.pl</a>
        </p>
      </div>
    )
  }

  // Sprawdź subskrypcję — jeśli aktywna, pokaż info bypass
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, monthly_quota_remaining, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const profileTyped = profile as {
    subscription_tier?: string | null
    subscription_status?: string | null
    monthly_quota_remaining?: number | null
    full_name?: string | null
    email?: string | null
  } | null

  const hasActiveSub =
    profileTyped?.subscription_status === 'active' &&
    profileTyped.subscription_tier &&
    ['kierowca', 'pro', 'pro_plus'].includes(profileTyped.subscription_tier) &&
    (profileTyped.monthly_quota_remaining ?? 0) > 0

  const canceled = searchParams.canceled === '1'

  return (
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <nav className="mb-4 text-xs text-iron-500 dark:text-iron-400" aria-label="Kroki">
        <ol className="flex items-center gap-2">
          <li><span className="rounded bg-iron-100 px-2 py-0.5 dark:bg-iron-800">RODZAJ</span></li>
          <li aria-hidden>›</li>
          <li><span className="rounded bg-iron-100 px-2 py-0.5 dark:bg-iron-800">DANE</span></li>
          <li aria-hidden>›</li>
          <li><span className="rounded bg-iron-100 px-2 py-0.5 dark:bg-iron-800">PODGLĄD</span></li>
          <li aria-hidden>›</li>
          <li><span className="rounded bg-brand-600 px-2 py-0.5 font-medium text-white">PŁATNOŚĆ</span></li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">
        Płatność
      </h1>
      <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
        {caseTyped.title ?? meta?.title ?? 'Pismo'}
      </p>

      {canceled ? (
        <div
          role="alert"
          className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
        >
          Płatność anulowana. Możesz spróbować ponownie.
        </div>
      ) : null}

      {/* Cena + breakdown */}
      <div className="mt-6 rounded-lg border border-iron-200 bg-white p-6 shadow-sm dark:border-iron-700 dark:bg-iron-900">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm font-medium text-iron-700 dark:text-iron-300">{product.name}</p>
            <p className="mt-1 text-xs text-iron-500 dark:text-iron-400">{product.description}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-iron-900 dark:text-iron-50">
              {(product.amount / 100).toFixed(2).replace('.', ',')} zł
            </p>
            <p className="text-xs text-iron-500 dark:text-iron-400">brutto</p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 border-t border-iron-100 pt-4 text-sm dark:border-iron-800">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
            <span className="text-iron-700 dark:text-iron-300">Pełen tekst pisma w PDF (drukowalny, A4)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
            <span className="text-iron-700 dark:text-iron-300">Edycja przed płatnością — zawsze możliwa</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
            <span className="text-iron-700 dark:text-iron-300">Faktura VAT na życzenie</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
            <span className="text-iron-700 dark:text-iron-300">Gwarancja: jeśli pismo nie skutkuje — zwracamy 100%</span>
          </li>
        </ul>
      </div>

      {hasActiveSub ? (
        <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
          <p className="font-medium">
            ✨ Masz aktywną subskrypcję {profileTyped?.subscription_tier?.toUpperCase()}
          </p>
          <p className="mt-1">
            Pozostało pism w tym miesiącu: <strong>{profileTyped?.monthly_quota_remaining ?? 0}</strong>. Płatność zostanie pominięta.
          </p>
        </div>
      ) : null}

      <PaymentClient
        caseId={caseTyped.id}
        productCode={shortId}
        productName={product.name}
        originalAmount={product.amount}
        hasActiveSub={Boolean(hasActiveSub)}
      />

      <div className="mt-6 text-center text-xs text-iron-500 dark:text-iron-400">
        <Link href={`/sprawy/${caseTyped.id}/podglad`} className="underline hover:text-iron-700 dark:hover:text-iron-200">
          ← Wróć do podglądu
        </Link>
      </div>
    </div>
  )
}
