'use client'

import Link from 'next/link'
import { useEffect } from 'react'

/**
 * Error boundary dla /kategoria/[slug] (T5-FE-039).
 * Sentry capture przez global hook.
 */
export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Category page error:', error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-5 px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-signal-600 dark:text-signal-400">
        Błąd ładowania kategorii
      </p>
      <h1 className="font-display text-3xl font-bold text-iron-950 dark:text-white">
        Coś poszło nie tak
      </h1>
      <p className="text-iron-600 dark:text-iron-300">
        Nie udało się załadować tej kategorii. Spróbuj ponownie lub wróć na stronę główną.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-iron-500">ID błędu: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-precision-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-precision-blue-700"
        >
          Spróbuj ponownie
        </button>
        <Link
          href="/"
          className="rounded-md border border-iron-300 bg-white px-4 py-2 text-sm font-medium text-iron-700 hover:bg-iron-50 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-300"
        >
          Strona główna
        </Link>
      </div>
    </div>
  )
}
