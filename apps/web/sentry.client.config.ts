/**
 * Sentry — browser SDK init (client side errors + performance).
 *
 * Aktywne wyłącznie gdy NEXT_PUBLIC_SENTRY_DSN jest ustawione (production / preview).
 * Pełna konfiguracja (replay, breadcrumbs, filtering) — Tier 5.
 *
 * Aby aktywować: pnpm add @sentry/nextjs i odkomentuj poniżej.
 */

// import * as Sentry from '@sentry/nextjs'
//
// if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
//   Sentry.init({
//     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//     environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
//     tracesSampleRate: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 0.2 : 1.0,
//     replaysSessionSampleRate: 0.1,
//     replaysOnErrorSampleRate: 1.0,
//   })
// }

export {}
