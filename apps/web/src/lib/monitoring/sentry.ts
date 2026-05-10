/**
 * Sentry abstraction — używa realnego @sentry/nextjs gdy DSN jest skonfigurowane,
 * w przeciwnym razie spada do console (dev / preview bez DSN).
 *
 * Cel: wszystkie miejsca w kodzie, gdzie zgłaszamy błąd, używają jednego API,
 * dzięki czemu można wyłączyć Sentry zmieniając tylko env (bez zmiany kodu).
 */

import * as Sentry from '@sentry/nextjs'

export interface ErrorContext {
  /** Identyfikator user-a (z auth.uid()) — opcjonalny */
  userId?: string
  /** Tag (case_id, payment_id, etc.) */
  tags?: Record<string, string>
  /** Dodatkowy kontekst (request body, params) — sanitize before passing */
  extra?: Record<string, unknown>
  /** Severity */
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
}

const HAS_DSN = Boolean(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
)

/**
 * Zgłoś błąd do systemu monitoringu.
 * Jeśli skonfigurowane DSN — Sentry; inaczej console.
 */
export function captureError(error: unknown, context?: ErrorContext): void {
  const level = context?.level ?? 'error'

  if (process.env.NODE_ENV === 'test') {
    return // w testach nie spamujemy konsoli
  }

  if (HAS_DSN) {
    const err = error instanceof Error ? error : new Error(String(error))
    Sentry.captureException(err, {
      level,
      tags: context?.tags,
      extra: context?.extra,
      user: context?.userId ? { id: context.userId } : undefined,
    })
    return
  }

  // Fallback: console
  const payload = {
    level,
    error:
      error instanceof Error
        ? { message: error.message, stack: error.stack, name: error.name }
        : error,
    userId: context?.userId,
    tags: context?.tags,
    extra: context?.extra,
    timestamp: new Date().toISOString(),
  }

  if (level === 'fatal' || level === 'error') {
    console.error('[monitoring]', JSON.stringify(payload))
  } else if (level === 'warning') {
    console.warn('[monitoring]', JSON.stringify(payload))
  } else {
    console.info('[monitoring]', JSON.stringify(payload))
  }
}

/**
 * Zgłoś wiadomość (info / warning) bez Error obiektu.
 */
export function captureMessage(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'test') return

  if (HAS_DSN) {
    Sentry.captureMessage(message, {
      level: context?.level ?? 'info',
      tags: context?.tags,
      extra: context?.extra,
      user: context?.userId ? { id: context.userId } : undefined,
    })
    return
  }

  captureError(new Error(message), { ...context, level: context?.level ?? 'info' })
}

/**
 * Breadcrumb — ślad nawigacji / akcji użytkownika.
 * Dodawany do następnego raportu Sentry (kontekst).
 */
export function addBreadcrumb(params: {
  category: string
  message: string
  level?: 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
}): void {
  if (process.env.NODE_ENV === 'test') return
  if (HAS_DSN) {
    Sentry.addBreadcrumb({
      category: params.category,
      message: params.message,
      level: params.level ?? 'info',
      data: params.data,
    })
  }
}

/**
 * Ustaw kontekst usera dla wszystkich kolejnych zgłoszeń w tej sesji.
 */
export function setUserContext(userId: string | null): void {
  if (process.env.NODE_ENV === 'test') return
  if (HAS_DSN) {
    if (userId) {
      Sentry.setUser({ id: userId })
    } else {
      Sentry.setUser(null)
    }
  }
}
