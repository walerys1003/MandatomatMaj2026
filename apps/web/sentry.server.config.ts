/**
 * Sentry — server-side init (Node runtime).
 * Auto-importowany przez @sentry/nextjs.
 */
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    // RODO — sanitize PII
    beforeSend(event) {
      if (event.extra) {
        for (const k of Object.keys(event.extra)) {
          const v = event.extra[k]
          if (typeof v === 'string' && /^\d{11}$/.test(v)) {
            event.extra[k] = '[PESEL_REDACTED]'
          }
        }
      }
      // Usuń authorization headers
      if (event.request?.headers) {
        delete (event.request.headers as Record<string, unknown>).authorization
        delete (event.request.headers as Record<string, unknown>).cookie
      }
      return event
    },
  })
}
