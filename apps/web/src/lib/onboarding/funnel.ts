/**
 * Onboarding funnel tracking + helpers (T6-ONB-005, T6-ONB-010).
 *
 * Funnel stages:
 *   visit → signup → first_case_created → first_document_paid
 *
 * Każdy event tracking przez PostHog + Plausible (gdy consent).
 * Tutaj definiujemy typed wrappers + funkcje agregujące dla admin dashboardu.
 */

import { track } from '@/lib/analytics'

export type FunnelEvent =
  | 'onboarding_visit'
  | 'onboarding_signup_start'
  | 'onboarding_signup_complete'
  | 'onboarding_first_case_created'
  | 'onboarding_first_paid'
  | 'onboarding_skipped_ocr'
  | 'onboarding_tour_step'
  | 'onboarding_tour_completed'
  | 'onboarding_tour_skipped'

export interface FunnelEventProps {
  step?: number
  total?: number
  caseType?: string
  source?: string
  durationMs?: number
}

/**
 * Track funnel event - no-op without consent.
 */
export function trackFunnel(event: FunnelEvent, props?: FunnelEventProps): void {
  track(event, props as Record<string, unknown>)
}

/**
 * Heurystyka "Skip OCR" — gdy user > 15s na step uploadu.
 * Wraca true gdy powinniśmy pokazać CTA do ręcznego wypełnienia.
 */
export function shouldShowSkipOcr(uploadStartedAt: number): boolean {
  const elapsed = Date.now() - uploadStartedAt
  return elapsed > 15_000
}

/**
 * Smart defaults — wyciąga znane pola z poprzednich case'ów usera.
 * Zwraca obiekt z polami jak `imie`, `nazwisko`, `adres`, jeśli były wpisane.
 *
 * NIE czyta PESEL ani danych wrażliwych — tylko adres/imię (do prefillu).
 */
export interface PriorCaseDefaults {
  imie?: string
  nazwisko?: string
  adres?: string
  kodPocztowy?: string
  miejscowosc?: string
}

export function extractPriorDefaults(
  cases: Array<{ form_data?: Record<string, unknown> | null }>,
): PriorCaseDefaults {
  // Bierzemy ostatnią sprawę z wypełnionymi polami
  for (let i = cases.length - 1; i >= 0; i -= 1) {
    const fd = cases[i]?.form_data
    if (!fd || typeof fd !== 'object') continue
    const result: PriorCaseDefaults = {}
    if (typeof fd['imie'] === 'string') result.imie = fd['imie']
    if (typeof fd['nazwisko'] === 'string') result.nazwisko = fd['nazwisko']
    if (typeof fd['adres'] === 'string') result.adres = fd['adres']
    if (typeof fd['kodPocztowy'] === 'string') result.kodPocztowy = fd['kodPocztowy']
    if (typeof fd['miejscowosc'] === 'string') result.miejscowosc = fd['miejscowosc']
    if (Object.keys(result).length > 0) return result
  }
  return {}
}
