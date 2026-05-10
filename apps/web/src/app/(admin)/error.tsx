'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@mandatomat/ui'

/**
 * Error boundary dla grupy (admin) — /admin/*.
 *
 * Łapie błędy w admin server components (np. RLS deny dla service-role,
 * niespójność typów po migracjach). Pokazuje krótki, techniczny komunikat
 * — admin nie potrzebuje pełnej pisanki marketingowej.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin] error boundary:', error)
  }, [error])

  return (
    <div className="space-y-6">
      <header className="border-l-4 border-signal-500 pl-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-signal-600">
          ADMIN ERROR
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.02em] text-iron-950 dark:text-white">
          Błąd panelu admina
        </h1>
      </header>

      <div className="border-signal-200 dark:border-signal-900 dark:bg-signal-950/40 rounded-lg border bg-signal-50 p-4">
        <p className="text-sm text-iron-700 dark:text-iron-200">
          {error.message || 'Wystąpił nieoczekiwany błąd przy ładowaniu danych.'}
        </p>
        {error.digest ? (
          <code className="mt-2 inline-block rounded bg-iron-100 px-2 py-1 font-mono text-xs text-iron-700 dark:bg-iron-800 dark:text-iron-300">
            digest: {error.digest}
          </code>
        ) : null}
      </div>

      <div className="flex gap-3">
        <Button variant="primary" onClick={() => reset()}>
          Spróbuj ponownie
        </Button>
        <Button variant="secondary-soft" asChild>
          <Link href="/admin/dashboard">Wróć do dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
