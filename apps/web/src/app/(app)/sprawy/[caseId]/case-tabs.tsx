'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { DeadlineCountdown, StatusBadge } from '@mandatomat/ui'

interface DocRow {
  id: string
  doc_type: string
  title: string
  version: number
  is_current: boolean
  storage_path: string | null
  file_name: string | null
  ai_model_used: string | null
  created_at: string
}

interface DeadlineRow {
  id: string
  title: string
  deadline_date: string
  status: string
  legal_basis: string | null
  source: string | null
}

interface EventRow {
  id: string
  event_type: string
  data: Record<string, unknown> | null
  created_at: string
}

interface PaymentRow {
  id: string
  status: string
  amount: number
  product_name: string
  created_at: string
}

interface CaseTabsProps {
  caseId: string
  activeTab: 'documents' | 'deadlines' | 'history' | 'details'
  documents: DocRow[]
  deadlines: DeadlineRow[]
  events: EventRow[]
  payments: PaymentRow[]
  formData: Record<string, unknown> | null
  caseType: string
}

const TABS: Array<{ id: CaseTabsProps['activeTab']; label: string }> = [
  { id: 'documents', label: 'Dokumenty' },
  { id: 'deadlines', label: 'Terminy' },
  { id: 'history', label: 'Historia' },
  { id: 'details', label: 'Szczegóły' },
]

const POLISH_MONTHS_SHORT = [
  'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
  'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
]

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${POLISH_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function eventLabel(eventType: string): string {
  const map: Record<string, string> = {
    case_created: 'Utworzono sprawę',
    case_updated: 'Zaktualizowano sprawę',
    case_responded: 'Otrzymano odpowiedź organu',
    document_generated: 'Wygenerowano pismo',
    document_updated: 'Zaktualizowano pismo',
    document_downloaded: 'Pobrano pismo (PDF)',
    document_sent: 'Wysłano pismo',
    payment_initiated: 'Zainicjowano płatność',
    payment_succeeded: 'Płatność zaakceptowana',
    payment_failed: 'Płatność nieudana',
    upload_created: 'Wgrano załącznik',
    ocr_completed: 'OCR zakończony',
    ocr_failed: 'OCR nieudany',
    deadline_created: 'Dodano termin',
    deadline_reminded: 'Wysłano przypomnienie',
    deadline_completed: 'Termin zrealizowany',
  }
  return map[eventType] ?? eventType
}

export function CaseTabs({
  caseId,
  activeTab,
  documents,
  deadlines,
  events,
  payments,
  formData,
  caseType: _caseType,
}: CaseTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  function changeTab(tab: CaseTabsProps['activeTab']) {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'documents') params.delete('tab')
    else params.set('tab', tab)
    const qs = params.toString()
    router.replace(`/sprawy/${caseId}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  async function downloadPdf(docId: string) {
    setDownloadingId(docId)
    setDownloadError(null)
    try {
      const res = await fetch(`/api/documents/${docId}/pdf`, { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setDownloadError(data.error ?? 'Nie udało się pobrać pliku.')
        return
      }
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setDownloadError('Błąd połączenia.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <section>
      {/* Tab nav */}
      <div role="tablist" className="flex gap-1 border-b border-iron-200 dark:border-iron-700">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => changeTab(tab.id)}
              className={
                isActive
                  ? 'border-b-2 border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 dark:text-brand-300'
                  : 'border-b-2 border-transparent px-4 py-2 text-sm font-medium text-iron-600 hover:text-iron-900 dark:text-iron-400 dark:hover:text-iron-200'
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === 'documents' ? (
          <div className="space-y-3">
            {downloadError ? (
              <div role="alert" className="rounded-md border border-signal-300 bg-signal-50 p-3 text-sm text-signal-900 dark:border-signal-800 dark:bg-signal-950 dark:text-signal-100">
                {downloadError}
              </div>
            ) : null}

            {documents.length === 0 ? (
              <div className="rounded-md border border-dashed border-iron-300 bg-white p-6 text-center text-sm text-iron-500 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-400">
                Brak wygenerowanych pism. Wróć do{' '}
                <Link href={`/sprawy/${caseId}/podglad`} className="text-brand-600 underline">
                  podglądu
                </Link>{' '}
                aby wygenerować.
              </div>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-iron-200 bg-white px-4 py-3 dark:border-iron-700 dark:bg-iron-900"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-iron-900 dark:text-iron-100">
                        {doc.title}{' '}
                        <span className="text-xs text-iron-500 dark:text-iron-400">
                          v{doc.version} {doc.is_current ? '(aktualna)' : ''}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-iron-500 dark:text-iron-400">
                        {formatDateTime(doc.created_at)}
                        {doc.ai_model_used ? ` · ${doc.ai_model_used}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadPdf(doc.id)}
                      disabled={downloadingId === doc.id}
                      className="rounded-md border border-iron-300 bg-iron-50 px-3 py-1.5 text-sm font-medium text-iron-800 hover:bg-iron-100 disabled:opacity-50 dark:border-iron-600 dark:bg-iron-800 dark:text-iron-100 dark:hover:bg-iron-700"
                    >
                      {downloadingId === doc.id ? '…' : '📄 PDF'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {activeTab === 'deadlines' ? (
          <div>
            {deadlines.length === 0 ? (
              <div className="rounded-md border border-dashed border-iron-300 bg-white p-6 text-center text-sm text-iron-500 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-400">
                Brak terminów dla tej sprawy.
              </div>
            ) : (
              <ul className="space-y-2">
                {deadlines.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-iron-200 bg-white px-4 py-3 dark:border-iron-700 dark:bg-iron-900"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-iron-900 dark:text-iron-100">{d.title}</p>
                      {d.legal_basis ? (
                        <p className="mt-0.5 text-xs text-iron-500 dark:text-iron-400">{d.legal_basis}</p>
                      ) : null}
                    </div>
                    <DeadlineCountdown deadline={d.deadline_date} format="long" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {activeTab === 'history' ? (
          <div>
            {events.length === 0 ? (
              <div className="rounded-md border border-dashed border-iron-300 bg-white p-6 text-center text-sm text-iron-500 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-400">
                Brak zdarzeń.
              </div>
            ) : (
              <ol className="space-y-2">
                {events.map((e, idx) => (
                  <li key={e.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <span aria-hidden className="h-2 w-2 rounded-full bg-brand-500" />
                      {idx < events.length - 1 ? (
                        <span aria-hidden className="mt-1 w-0.5 flex-1 bg-iron-200 dark:bg-iron-700" />
                      ) : null}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium text-iron-900 dark:text-iron-100">
                        {eventLabel(e.event_type)}
                      </p>
                      <p className="mt-0.5 text-xs text-iron-500 dark:text-iron-400">
                        {formatDateTime(e.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : null}

        {activeTab === 'details' ? (
          <div className="space-y-4">
            {/* Form data */}
            <div className="rounded-md border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
              <h3 className="mb-3 text-sm font-semibold text-iron-900 dark:text-iron-100">
                Dane formularza
              </h3>
              {formData ? (
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="border-b border-iron-100 pb-1 dark:border-iron-800">
                      <dt className="text-xs font-medium uppercase tracking-wider text-iron-500 dark:text-iron-400">
                        {key}
                      </dt>
                      <dd className="mt-0.5 text-sm text-iron-900 dark:text-iron-100">
                        {value === null || value === undefined || value === ''
                          ? '—'
                          : typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-iron-500 dark:text-iron-400">Brak danych.</p>
              )}
            </div>

            {/* Payments */}
            <div className="rounded-md border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
              <h3 className="mb-3 text-sm font-semibold text-iron-900 dark:text-iron-100">
                Płatności
              </h3>
              {payments.length === 0 ? (
                <p className="text-sm text-iron-500 dark:text-iron-400">Brak płatności.</p>
              ) : (
                <ul className="space-y-2">
                  {payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-iron-700 dark:text-iron-300">
                        {p.product_name} · {formatDateTime(p.created_at)}
                      </span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={p.status} />
                        <span className="font-medium tabular-nums text-iron-900 dark:text-iron-100">
                          {(p.amount / 100).toFixed(2).replace('.', ',')} zł
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
