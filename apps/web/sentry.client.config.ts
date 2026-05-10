/**
 * Sentry — client-side init.
 * Auto-importowany przez @sentry/nextjs (build-time hook).
 *
 * Włącza się TYLKO gdy NEXT_PUBLIC_SENTRY_DSN jest ustawione (production).
 * W dev — zero hałasu na konsoli.
 */
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    replaysSessionSampleRate: 0, // RODO — nie zapisujemy session replay
    replaysOnErrorSampleRate: 0,
    // Filtruj noise z 3rd-party
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'NetworkError when attempting to fetch resource',
    ],
    // RODO — sanitize PII
    beforeSend(event) {
      // Usuń ewentualny PESEL z extra/tags
      if (event.extra) {
        for (const k of Object.keys(event.extra)) {
          const v = event.extra[k]
          if (typeof v === 'string' && /^\d{11}$/.test(v)) {
            event.extra[k] = '[PESEL_REDACTED]'
          }
        }
      }
      return event
    },
  })
}
