'use client'

import * as React from 'react'

import { useRouter } from 'next/navigation'

import {
  Alert,
  Button,
  ConfirmDialog,
  MarkdownPreview,
  ScoringGauge,
  Spinner,
  Textarea,
} from '@mandatomat/ui'

/**
 * Client komponent strony podglądu sprawy.
 *
 * Funkcje:
 *  - Generowanie pisma (POST /api/ai/generate-document) z Idempotency-Key
 *  - Taby Podgląd / Edycja (textarea z auto-save w sessionStorage)
 *  - ScoringGauge z wynikiem (0..100)
 *  - Banner walidacji (z documents.validation_issues)
 *  - Polling odświeżający validation_passed/score po wygenerowaniu (Haiku w tle)
 *
 * Stan początkowy: jeśli `initialDocument` istnieje → tryb podglądu;
 * w przeciwnym razie → CTA „Generuj pismo".
 */

// ============================================================================
// Typy
// ============================================================================

export interface PreviewDocument {
  id: string
  doc_type: string
  title: string | null
  content_markdown: string
  score: number | null
  validation_passed: boolean | null
  validation_issues: ValidationIssue[] | null
  ai_cost_usd: number | null
  created_at: string
}

export interface ValidationIssue {
  severity?: 'error' | 'warning' | 'info'
  category?: string
  message: string
  suggestion?: string
}

export interface PreviewScoring {
  score: number
  reasoning?: string
  warnings?: string[]
}

interface PreviewClientProps {
  caseId: string
  caseTitle: string
  caseStatus: string
  initialDocument: PreviewDocument | null
  initialScoring: PreviewScoring | null
}

type Tab = 'preview' | 'edit'

// ============================================================================
// Komponent
// ============================================================================

export function PreviewClient({
  caseId,
  caseTitle: _caseTitle,
  caseStatus,
  initialDocument,
  initialScoring,
}: PreviewClientProps) {
  const router = useRouter()

  const [doc, setDoc] = React.useState<PreviewDocument | null>(initialDocument)
  const [scoring, setScoring] = React.useState<PreviewScoring | null>(initialScoring)
  const [tab, setTab] = React.useState<Tab>('preview')
  const [content, setContent] = React.useState<string>(initialDocument?.content_markdown ?? '')
  const [generating, setGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pollingValidation, setPollingValidation] = React.useState(false)
  // T3-FE-045: regenerate confirm modal — pojawia się tylko gdy dokument już istnieje
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = React.useState(false)

  // Auto-zapis edycji w sessionStorage (tylko klient — przeładowanie nie zgubi pracy)
  const draftKey = `mm:case:${caseId}:edit`
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (!doc) return
    const saved = window.sessionStorage.getItem(draftKey)
    if (saved && saved !== doc.content_markdown) {
      setContent(saved)
    }
  }, [draftKey, doc])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (!doc) return
    if (content === doc.content_markdown) {
      window.sessionStorage.removeItem(draftKey)
      return
    }
    const t = window.setTimeout(() => {
      window.sessionStorage.setItem(draftKey, content)
    }, 500)
    return () => window.clearTimeout(t)
  }, [content, doc, draftKey])

  // Polling walidacji Haiku (uruchamiany po wygenerowaniu, bo Haiku leci w tle)
  React.useEffect(() => {
    if (!doc) return
    if (!pollingValidation) return
    if (doc.validation_passed !== null) {
      setPollingValidation(false)
      return
    }

    let cancelled = false
    const interval = window.setInterval(async () => {
      if (cancelled) return
      try {
        const res = await fetch(`/api/cases/${caseId}`, { cache: 'no-store' })
        if (!res.ok) return
        const json = (await res.json()) as {
          documents?: PreviewDocument[]
        }
        const fresh = json.documents?.find((d) => d.id === doc.id)
        if (fresh && fresh.validation_passed !== null) {
          setDoc(fresh)
          setPollingValidation(false)
          window.clearInterval(interval)
        }
      } catch {
        /* ignore — kolejny tick spróbuje */
      }
    }, 4000)

    // Stop polling po 60s
    const stopTimer = window.setTimeout(() => {
      cancelled = true
      window.clearInterval(interval)
      setPollingValidation(false)
    }, 60_000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.clearTimeout(stopTimer)
    }
  }, [doc, pollingValidation, caseId])

  // ==========================================================================
  // Handlers
  // ==========================================================================

  /**
   * Wrapper dla przycisków "Generuj"/"Wygeneruj ponownie":
   * - jeśli nie ma jeszcze dokumentu → wywołaj generację bezpośrednio
   * - jeśli istnieje → otwórz ConfirmDialog (regenerate kosztuje token AI + nadpisuje aktualną wersję)
   */
  function handleGenerateClick() {
    if (generating) return
    if (doc) {
      setRegenerateConfirmOpen(true)
      return
    }
    void handleGenerate()
  }

  async function handleGenerate() {
    if (generating) return
    setRegenerateConfirmOpen(false)
    setGenerating(true)
    setError(null)

    // Idempotency-Key: stabilny per próba (nie per case) — pozwalamy regenerację
    // gdy user świadomie kliknie ponownie po np. zmianie danych.
    const idempotencyKey = `${caseId}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`

    try {
      const res = await fetch('/api/ai/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ caseId }),
      })

      const json = (await res.json().catch(() => ({}))) as {
        document?: PreviewDocument
        scoring?: PreviewScoring
        error?: string
        issues?: string[]
      }

      if (!res.ok) {
        const msg = json.error ?? `Błąd ${res.status}. Spróbuj ponownie.`
        setError(json.issues && json.issues.length > 0 ? `${msg} (${json.issues.join('; ')})` : msg)
        return
      }

      if (json.document) {
        const newDoc: PreviewDocument = {
          ...json.document,
          score: json.document.score ?? null,
          validation_passed: json.document.validation_passed ?? null,
          validation_issues: json.document.validation_issues ?? null,
        }
        setDoc(newDoc)
        setContent(newDoc.content_markdown)
        if (json.scoring) setScoring(json.scoring)
        setPollingValidation(true)
        // Odśwież dane SSR (status case przeszedł na preview)
        router.refresh()
      } else {
        setError('AI nie zwrócił dokumentu. Spróbuj ponownie.')
      }
    } catch (e) {
      console.error('[generate]', e)
      setError('Błąd sieci. Sprawdź połączenie i spróbuj ponownie.')
    } finally {
      setGenerating(false)
    }
  }

  function handleResetEdit() {
    if (!doc) return
    setContent(doc.content_markdown)
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(draftKey)
    }
  }

  // ==========================================================================
  // Render: brak dokumentu → CTA
  // ==========================================================================

  if (!doc) {
    return (
      <div className="space-y-6">
        <Alert variant="info" title="Pismo gotowe do wygenerowania">
          Zebrane dane przekażemy do AI Claude. W ciągu kilkunastu sekund otrzymasz pełne pismo z
          podstawą prawną, argumentacją i scoringiem szans powodzenia.
        </Alert>

        {error ? (
          <Alert variant="danger" title="Coś poszło nie tak">
            {error}
          </Alert>
        ) : null}

        <div className="rounded-xl border border-iron-200 bg-white p-6 dark:border-iron-800 dark:bg-iron-900">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
            Co się stanie po kliknięciu „Generuj pismo"?
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-iron-700 dark:text-iron-300">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-precision-blue-100 font-mono text-xs font-bold text-precision-blue-700">
                1
              </span>
              <span>
                AI przeanalizuje Twoje dane i wskaże podstawy prawne (artykuły KW/KPSW/PoRD/KC).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-precision-blue-100 font-mono text-xs font-bold text-precision-blue-700">
                2
              </span>
              <span>Zbuduje argumentację dopasowaną do organu i sytuacji.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-precision-blue-100 font-mono text-xs font-bold text-precision-blue-700">
                3
              </span>
              <span>
                Oszacuje szanse powodzenia (0–100%) i ostrzeże o ryzykach (np. utrata znamion).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-precision-blue-100 font-mono text-xs font-bold text-precision-blue-700">
                4
              </span>
              <span>
                Otrzymasz pełną wersję Markdown — możesz edytować przed wysłaniem do organu.
              </span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" size="md" onClick={() => router.push('/panel')}>
            ← Wróć do pulpitu
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerate}
            disabled={generating || caseStatus === 'generating'}
          >
            {generating || caseStatus === 'generating' ? (
              <>
                <Spinner className="h-4 w-4" />
                Generuję pismo… (15–30 s)
              </>
            ) : (
              <>Generuj pismo</>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // Render: dokument istnieje
  // ==========================================================================

  const score = scoring?.score ?? (doc.score != null ? doc.score / 100 : null)
  const hasUnsavedEdits = content !== doc.content_markdown

  return (
    <div className="space-y-6">
      {error ? (
        <Alert variant="danger" title="Błąd generowania">
          {error}
        </Alert>
      ) : null}

      {/* Top: scoring + walidacja */}
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        {score != null ? (
          <div className="flex justify-center rounded-xl border border-iron-200 bg-white p-4 dark:border-iron-800 dark:bg-iron-900 sm:p-6">
            <ScoringGauge value={score} size={160} strokeWidth={12} />
          </div>
        ) : null}

        <div className="space-y-3">
          <ValidationBanner
            doc={doc}
            polling={pollingValidation}
            onRecheck={() => setPollingValidation(true)}
          />

          {scoring?.reasoning ? (
            <div className="rounded-xl border border-iron-200 bg-iron-50 p-4 text-sm text-iron-700 dark:border-iron-800 dark:bg-iron-950 dark:text-iron-300">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-iron-500">
                Uzasadnienie scoringu
              </p>
              <p className="leading-relaxed">{scoring.reasoning}</p>
            </div>
          ) : null}

          {scoring?.warnings && scoring.warnings.length > 0 ? (
            <Alert variant="warning" title="Ostrzeżenia AI">
              <ul className="ml-4 list-disc space-y-1">
                {scoring.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </Alert>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-iron-200 dark:border-iron-800">
        <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>
          Podgląd
        </TabButton>
        <TabButton active={tab === 'edit'} onClick={() => setTab('edit')}>
          Edycja {hasUnsavedEdits ? <span className="ml-1 text-amber-500">●</span> : null}
        </TabButton>
        <div className="ml-auto pb-2 text-xs text-iron-500">
          {doc.ai_cost_usd != null ? (
            <span className="font-mono tabular-nums">koszt AI: ${doc.ai_cost_usd.toFixed(4)}</span>
          ) : null}
        </div>
      </div>

      {tab === 'preview' ? (
        <div className="rounded-xl border border-iron-200 bg-white p-8 dark:border-iron-800 dark:bg-iron-900 sm:p-12">
          <MarkdownPreview content={hasUnsavedEdits ? content : doc.content_markdown} />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-iron-500">
            Edytuj treść pisma w formacie Markdown. Zmiany zapisują się tymczasowo w przeglądarce
            (sessionStorage). Pełny zapis do bazy + PDF — w kolejnym kroku Tier 3.
          </p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={28}
            className="font-mono text-sm"
            spellCheck
          />
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={handleResetEdit} disabled={!hasUnsavedEdits}>
              Przywróć oryginał
            </Button>
            <Button variant="primary" size="md" onClick={() => setTab('preview')}>
              Pokaż podgląd zmian
            </Button>
          </div>
        </div>
      )}

      {/* Akcje pod spodem */}
      <div className="flex flex-col items-stretch gap-3 border-t border-iron-200 pt-6 dark:border-iron-800 sm:flex-row sm:justify-between">
        <Button variant="ghost" size="md" onClick={() => router.push('/panel')}>
          ← Wróć do pulpitu
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="md" onClick={handleGenerateClick} disabled={generating}>
            {generating ? (
              <>
                <Spinner className="h-4 w-4" />
                Generuję ponownie…
              </>
            ) : (
              <>Wygeneruj ponownie</>
            )}
          </Button>
          <Button variant="primary" size="md" disabled>
            Przejdź do płatności (wkrótce)
          </Button>
        </div>
      </div>

      {/* T3-FE-045: regenerate confirm — modal kosztu/nadpisania */}
      <ConfirmDialog
        open={regenerateConfirmOpen}
        title="Wygenerować pismo ponownie?"
        description={
          <div className="space-y-2">
            <p>
              Aktualna wersja dokumentu zostanie <strong>zastąpiona nową</strong>. Twoje edycje w
              polu tekstowym (jeśli były) — zostaną utracone.
            </p>
            <p className="text-xs text-iron-500 dark:text-iron-400">
              Regeneracja kosztuje token AI z Twojego limitu. Średni koszt: ~$0.03–0.05.
            </p>
          </div>
        }
        confirmLabel="Tak, wygeneruj ponownie"
        cancelLabel="Anuluj"
        variant="warning"
        isProcessing={generating}
        onConfirm={() => void handleGenerate()}
        onCancel={() => setRegenerateConfirmOpen(false)}
      />
    </div>
  )
}

// ============================================================================
// Sub-komponenty
// ============================================================================

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'relative -mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ' +
        (active
          ? 'border-precision-blue-600 text-precision-blue-700 dark:text-precision-blue-400'
          : 'border-transparent text-iron-500 hover:text-iron-800 dark:hover:text-iron-200')
      }
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

function ValidationBanner({
  doc,
  polling,
  onRecheck: _onRecheck,
}: {
  doc: PreviewDocument
  polling: boolean
  onRecheck: () => void
}) {
  // Stan 1: walidacja jeszcze trwa (Haiku w tle)
  if (doc.validation_passed === null) {
    return (
      <Alert variant="info" title="AI sprawdza pismo…">
        <span className="inline-flex items-center gap-2">
          {polling ? <Spinner className="h-3 w-3" /> : null}
          Trwa weryfikacja zgodności z prawem i kompletności pisma. To zajmie do 30 sekund.
        </span>
      </Alert>
    )
  }

  const issues = Array.isArray(doc.validation_issues) ? doc.validation_issues : []
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  // Stan 2: walidacja przeszła
  if (doc.validation_passed && issues.length === 0) {
    return (
      <Alert variant="success" title="Pismo poprawne">
        AI nie znalazł problemów w treści. Możesz przejść do podglądu i pobrania.
      </Alert>
    )
  }

  // Stan 3: walidacja przeszła ale są drobne uwagi
  if (doc.validation_passed) {
    return (
      <Alert variant="warning" title={`Pismo poprawne — ${warnings.length} drobne uwagi`}>
        <ul className="ml-4 mt-1 list-disc space-y-1">
          {warnings.slice(0, 5).map((w, i) => (
            <li key={i}>
              {w.message}
              {w.suggestion ? (
                <span className="text-iron-600 dark:text-iron-400"> — {w.suggestion}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </Alert>
    )
  }

  // Stan 4: walidacja zwróciła błędy
  return (
    <Alert variant="danger" title={`Wykryto ${errors.length} problem(y) w piśmie`}>
      <ul className="ml-4 mt-1 list-disc space-y-1">
        {errors.slice(0, 5).map((e, i) => (
          <li key={i}>
            <strong>{e.category ?? 'Błąd'}:</strong> {e.message}
            {e.suggestion ? (
              <span className="text-iron-700 dark:text-iron-300"> ({e.suggestion})</span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs">
        Zalecamy ponowne wygenerowanie pisma lub edycję ręczną przed wysłaniem.
      </p>
    </Alert>
  )
}
