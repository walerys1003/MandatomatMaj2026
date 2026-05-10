'use client'

import { useEffect, useRef, useState } from 'react'

interface DownloadClientProps {
  caseId: string
  caseStatus: string
  documentId: string | null
  sessionId: string | null
}

type DownloadState =
  | { status: 'waiting'; attempts: number }
  | { status: 'ready'; url: string; expiresAt: number }
  | { status: 'error'; message: string }
  | { status: 'fetching' }

/**
 * Client component dla success page.
 *
 * Pipeline:
 *  1. Jeśli case.status !== 'paid' → poll /api/cases/[caseId] co 2s (max 30s).
 *     Webhook Stripe może mieć delay po redirect.
 *  2. Gdy paid + documentId → POST /api/documents/[docId]/pdf → signed URL 1h.
 *  3. Render przycisk "Pobierz PDF" (target=_blank).
 */
export function DownloadClient({
  caseId,
  caseStatus,
  documentId,
  sessionId: _sessionId,
}: DownloadClientProps) {
  const [paid, setPaid] = useState(caseStatus === 'paid' || caseStatus === 'archived')
  const [state, setState] = useState<DownloadState>({ status: 'waiting', attempts: 0 })
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Poll case status until paid (max 15 attempts × 2s = 30s)
  useEffect(() => {
    if (paid) return
    let cancelled = false
    let attempts = 0

    const poll = async () => {
      if (cancelled) return
      attempts++
      try {
        const res = await fetch(`/api/cases/${caseId}`, { cache: 'no-store' })
        if (res.ok) {
          const data = (await res.json()) as { case?: { status?: string } }
          if (data.case?.status === 'paid' || data.case?.status === 'archived') {
            setPaid(true)
            return
          }
        }
      } catch {
        // ignore
      }
      if (attempts >= 15) {
        setState({
          status: 'error',
          message:
            'Płatność nie została jeszcze potwierdzona. Sprawdź skrzynkę za chwilę lub odśwież stronę.',
        })
        return
      }
      setState({ status: 'waiting', attempts })
      pollRef.current = setTimeout(poll, 2000)
    }

    pollRef.current = setTimeout(poll, 1000)
    return () => {
      cancelled = true
      if (pollRef.current) clearTimeout(pollRef.current)
    }
  }, [caseId, paid])

  // Once paid + has documentId → fetch signed URL
  useEffect(() => {
    if (!paid || !documentId) return
    let cancelled = false
    setState({ status: 'fetching' })
    void (async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}/pdf`, {
          method: 'POST',
        })
        if (cancelled) return
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          setState({
            status: 'error',
            message: data.error ?? `Nie udało się wygenerować PDF (${res.status}).`,
          })
          return
        }
        const data = (await res.json()) as { url?: string; expiresAt?: number }
        if (data.url) {
          setState({ status: 'ready', url: data.url, expiresAt: data.expiresAt ?? Date.now() + 3600_000 })
        } else {
          setState({ status: 'error', message: 'Brak URL w odpowiedzi.' })
        }
      } catch {
        if (!cancelled) {
          setState({ status: 'error', message: 'Błąd połączenia.' })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [paid, documentId])

  if (!paid) {
    return (
      <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-medium">Czekamy na potwierdzenie płatności…</p>
        <p className="mt-1 text-xs">
          {state.status === 'waiting'
            ? `Sprawdzam status (próba ${state.attempts}/15)…`
            : 'Stripe wysyła potwierdzenie — to chwilę zajmie.'}
        </p>
        {state.status === 'error' ? (
          <p className="mt-2 text-xs">{state.message}</p>
        ) : null}
      </div>
    )
  }

  if (!documentId) {
    return (
      <div className="mt-6 rounded-md border border-signal-300 bg-signal-50 p-4 text-sm text-signal-900 dark:border-signal-800 dark:bg-signal-950 dark:text-signal-100">
        Brak wygenerowanego pisma. Wróć do podglądu i kliknij „Wygeneruj”.
      </div>
    )
  }

  if (state.status === 'fetching' || state.status === 'waiting') {
    return (
      <div className="mt-6 rounded-md border border-iron-200 bg-white p-4 text-sm dark:border-iron-700 dark:bg-iron-900">
        Generuję plik PDF…
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mt-6 rounded-md border border-signal-300 bg-signal-50 p-4 text-sm text-signal-900 dark:border-signal-800 dark:bg-signal-950 dark:text-signal-100">
        {state.message}
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-3">
      <a
        href={state.url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
      >
        📄 Pobierz PDF
      </a>
      <p className="text-center text-xs text-iron-500 dark:text-iron-400">
        Link ważny 1 godzinę. Zawsze możesz wrócić do tej strony i wygenerować nowy.
      </p>
    </div>
  )
}
