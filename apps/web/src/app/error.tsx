'use client'

import { useEffect } from 'react'

import { Button } from '@mandatomat/ui'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Sentry capture trafi tu po podpięciu w Tier 1.5 (T1-DEV-043).
    console.error('App error boundary:', error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-prose flex-col items-start justify-center gap-6 px-6">
      <p className="font-mono text-sm text-signal-600">Błąd aplikacji</p>
      <h1 className="font-display text-h2 text-iron-900 dark:text-iron-50">
        Coś poszło nie tak.
      </h1>
      <p className="text-iron-600 dark:text-iron-300">
        System odnotował błąd. Spróbuj ponownie — jeśli problem się powtarza,
        skontaktuj się z nami:{' '}
        <a className="underline" href="mailto:pomoc@mandatomat.pl">
          pomoc@mandatomat.pl
        </a>
        .
      </p>
      {error.digest ? (
        <code className="rounded bg-iron-100 px-2 py-1 font-mono text-xs text-iron-700 dark:bg-iron-800 dark:text-iron-300">
          ref: {error.digest}
        </code>
      ) : null}
      <Button variant="primary" onClick={() => reset()}>
        Spróbuj ponownie
      </Button>
    </main>
  )
}
