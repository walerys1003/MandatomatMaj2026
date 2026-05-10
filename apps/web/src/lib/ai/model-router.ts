/**
 * Multi-model routing (T7-AI-009).
 *
 * Strategia:
 *  - Haiku — scoring (szybki, tani, /sprawdz-szanse)
 *  - Sonnet — generate document (default, jakość prawnicza)
 *  - Opus — edge cases (sprawy > 18 miesięcy, kwoty > 5000 zł, złożone wezwania)
 *
 * Heurystyka edge-case → Opus:
 *  1. `caseAgeMonths > 18` — stara sprawa, więcej kontekstu prawnego
 *  2. `amountPln > 5000` — wysoka stawka, lepiej zapłacić extra
 *  3. `attachmentCount > 5` — złożone dokumenty (np. EPU z wieloma załącznikami)
 *  4. Manualny override przez admina (per-user flag).
 */

export type ClaudeModel = 'claude-haiku-4-5' | 'claude-sonnet-4-5-20250929' | 'claude-opus-4-5'

export type Purpose = 'scoring' | 'generate' | 'validate' | 'ocr' | 'chat'

export interface RoutingContext {
  purpose: Purpose
  /** Wiek sprawy w miesiącach (od daty zdarzenia). */
  caseAgeMonths?: number
  /** Kwota w PLN. */
  amountPln?: number
  /** Liczba załączników OCR. */
  attachmentCount?: number
  /** Force Opus per admin override. */
  forceOpus?: boolean
  /** Force Haiku (dev / testing). */
  forceHaiku?: boolean
}

const OPUS_AGE_MONTHS_THRESHOLD = 18
const OPUS_AMOUNT_PLN_THRESHOLD = 5000
const OPUS_ATTACHMENT_THRESHOLD = 5

export function pickModel(ctx: RoutingContext): ClaudeModel {
  if (ctx.forceHaiku) return 'claude-haiku-4-5'
  if (ctx.forceOpus) return 'claude-opus-4-5'

  // Scoring + validate + ocr → Haiku zawsze (cost-sensitive)
  if (ctx.purpose === 'scoring' || ctx.purpose === 'validate') {
    return 'claude-haiku-4-5'
  }

  if (ctx.purpose === 'ocr') {
    // OCR wymaga vision → Sonnet (Haiku też ma vision, ale Sonnet daje lepsze wyniki)
    return 'claude-sonnet-4-5-20250929'
  }

  if (ctx.purpose === 'chat') {
    // Assistant — Sonnet z prompt cache
    return 'claude-sonnet-4-5-20250929'
  }

  // generate — domyślnie Sonnet, edge case → Opus
  if (ctx.purpose === 'generate') {
    const isEdgeCase =
      (ctx.caseAgeMonths ?? 0) > OPUS_AGE_MONTHS_THRESHOLD ||
      (ctx.amountPln ?? 0) > OPUS_AMOUNT_PLN_THRESHOLD ||
      (ctx.attachmentCount ?? 0) > OPUS_ATTACHMENT_THRESHOLD

    return isEdgeCase ? 'claude-opus-4-5' : 'claude-sonnet-4-5-20250929'
  }

  return 'claude-sonnet-4-5-20250929'
}

/**
 * Estymacja kosztu (cents) przed wywołaniem — używana do budgetingu.
 * Konserwatywna — bazuje na typowych długościach promptów.
 */
export function estimateCostCents(model: ClaudeModel, purpose: Purpose): number {
  // Typowe długości (input + output tokens)
  const PROFILES: Record<Purpose, { input: number; output: number }> = {
    scoring: { input: 1500, output: 400 },
    generate: { input: 4000, output: 1500 },
    validate: { input: 2000, output: 300 },
    ocr: { input: 3000, output: 600 },
    chat: { input: 3000, output: 800 },
  }

  // $ per 1M tokens
  const PRICES: Record<ClaudeModel, { input: number; output: number }> = {
    'claude-haiku-4-5': { input: 1.0, output: 5.0 },
    'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0 },
    'claude-opus-4-5': { input: 15.0, output: 75.0 },
  }

  const profile = PROFILES[purpose]
  const price = PRICES[model]
  const inputUsd = (profile.input / 1_000_000) * price.input
  const outputUsd = (profile.output / 1_000_000) * price.output
  const totalUsd = inputUsd + outputUsd
  return Math.round(totalUsd * 100 * 100) / 100 // cents with 2 decimal places
}
