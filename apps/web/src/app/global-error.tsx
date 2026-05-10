'use client'

import { useEffect } from 'react'

/**
 * Global error boundary — łapie błędy które uciekły z root layout.tsx.
 *
 * KRYTYCZNE: ten plik MUSI samodzielnie renderować <html> i <body>,
 * bo jest renderowany ZAMIAST root layout (Next.js 14 spec).
 *
 * Nie używamy tu UI library — tylko gołe HTML + minimalny inline style,
 * żeby zminimalizować ryzyko kolejnego błędu (jeśli to layout się sypie).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global] critical error:', error)
  }, [error])

  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: '#FAFAFA',
          color: '#09090B',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <main
          style={{
            maxWidth: 560,
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
            aria-hidden="true"
          >
            🛑
          </div>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#DC2626',
              margin: 0,
            }}
          >
            Krytyczny błąd aplikacji
          </p>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              margin: '12px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Mandatomat tymczasowo nie działa
          </h1>
          <p style={{ color: '#52525B', margin: '0 0 24px', fontSize: 16 }}>
            Spróbuj odświeżyć stronę. Jeśli błąd się powtarza, napisz na{' '}
            <a
              href="mailto:pomoc@mandatomat.pl"
              style={{ color: '#2563EB', textDecoration: 'underline' }}
            >
              pomoc@mandatomat.pl
            </a>
            .
          </p>
          {error.digest ? (
            <code
              style={{
                display: 'inline-block',
                background: '#F4F4F5',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 12,
                fontFamily: 'monospace',
                marginBottom: 24,
              }}
            >
              ref: {error.digest}
            </code>
          ) : null}
          <div>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: '#2563EB',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Spróbuj ponownie
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
