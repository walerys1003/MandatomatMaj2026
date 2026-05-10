'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@mandatomat/ui'

/**
 * Error boundary dla całej grupy (app) — /panel, /sprawy, /terminy, /profil.
 *
 * Łapie błędy w server components / data fetchach z RLS, daje user-friendly
 * komunikat + przycisk reset. W przyszłości (Tier 1.5) wyśle do Sentry.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app] error boundary:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="dark:bg-signal-900 dark:text-signal-300 flex h-16 w-16 items-center justify-center rounded-full bg-signal-100 text-3xl text-signal-700">
        ⚠️
      </div>
      <div className="space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-wider text-signal-600">
          Błąd ładowania
        </p>
        <h1 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-iron-950 dark:text-white sm:text-3xl">
          Coś poszło nie tak.
        </h1>
        <p className="mx-auto max-w-md text-sm text-iron-600 dark:text-iron-300">
          Nie udało się załadować tej sekcji. Spróbuj odświeżyć — jeśli błąd się powtarza, napisz do
          nas:{' '}
          <a className="underline underline-offset-4" href="mailto:pomoc@mandatomat.pl">
            pomoc@mandatomat.pl
          </a>
          .
        </p>
        {error.digest ? (
          <code className="inline-block rounded bg-iron-100 px-2 py-1 font-mono text-xs text-iron-700 dark:bg-iron-800 dark:text-iron-300">
            ref: {error.digest}
          </code>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button variant="primary" onClick={() => reset()}>
          Spróbuj ponownie
        </Button>
        <Button variant="secondary-soft" asChild>
          <Link href="/panel">Wróć do pulpitu</Link>
        </Button>
      </div>
    </div>
  )
}
