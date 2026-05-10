/**
 * Sentry stub — T5-DEV-046.
 *
 * Lekka warstwa abstrakcji dla error trackingu. W MVP używamy console,
 * po dodaniu @sentry/nextjs (post-launch) podmieniamy implementacje.
 *
 * Cel: wszystkie miejsca, gdzie chcemy zgłosić błąd, używają jednego API,
 * dzięki czemu migracja na Sentry to zmiana wewnątrz tego pliku.
 */

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

/**
 * Zgłoś błąd do systemu monitoringu.
 * W MVP — console.error. Po dodaniu Sentry — Sentry.captureException.
 */
export function captureError(error: unknown, context?: ErrorContext): void {
  const level = context?.level ?? 'error'

  if (process.env.NODE_ENV === 'test') {
    return // w testach nie spamujemy konsoli
  }

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

  // TODO post-launch: Sentry.captureException(error, { tags, extra, level, user: { id: userId } })
}

/**
 * Zgłoś wiadomość (info / warning) bez Error obiektu.
 */
export function captureMessage(message: string, context?: ErrorContext): void {
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
  // TODO: Sentry.addBreadcrumb(params)
  void params
}

/**
 * Ustaw kontekst usera dla wszystkich kolejnych zgłoszeń w tej sesji.
 * W MVP — no-op. Po dodaniu Sentry — Sentry.setUser({ id }).
 */
export function setUserContext(userId: string | null): void {
  void userId
  // TODO: Sentry.setUser({ id: userId })
}
