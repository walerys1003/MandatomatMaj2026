/**
 * Golden evals — 87 scenariuszy testowych (3 × 29 promptów).
 *
 * Każdy eval definiuje:
 *  - input: dane wejściowe pasujące do PromptInput dla danego case_type
 *  - expectedScoring: zakres oczekiwanej skuteczności (np. [0.6, 0.9])
 *  - mustContainPodstawy: lista art./ustaw, które MUSZĄ pojawić się w "podstawy_prawne"
 *  - mustContainArgumenty: fragmenty tekstu (case-insensitive substring) wymagane w "argumentacja"
 *  - mustNotContain: zakazane fragmenty (np. halucynacje, błędne paragrafy)
 *
 * Uruchomienie: `pnpm --filter @mandatomat/web test:evals` (do dodania w T5-ORCH).
 *
 * Eval test driver waliduje output AI przez:
 *  1) sprawdzenie poprawności struktury JSON (tytul, do_organu, podstawy_prawne[], argumentacja[], wnioski[], scoring_szans, ostrzezenia[])
 *  2) sprawdzenie że scoring_szans ∈ [expectedScoring.min, expectedScoring.max]
 *  3) sprawdzenie obecności wszystkich mustContainPodstawy w podstawy_prawne[].join(' ')
 *  4) sprawdzenie obecności wszystkich mustContainArgumenty w argumentacja[].join(' ')
 *  5) sprawdzenie braku mustNotContain
 *
 * Próg passing: 70% evals musi przejść (tj. ≥61 z 87).
 */

import type { PromptInput } from '../prompts'

export interface ScoringRange {
  min: number
  max: number
}

export interface GoldenEval {
  /** Unikalny identyfikator (np. "M1-A1", "M1-A2", "M1-A3"). */
  id: string
  /** Krótki opis scenariusza po polsku. */
  description: string
  /** Wejście promptu — discriminated union zgodny z PromptInput. */
  input: PromptInput
  /** Oczekiwany zakres scoring_szans. */
  expectedScoring: ScoringRange
  /** Fragmenty wymagane w polu "podstawy_prawne" (case-insensitive substring). */
  mustContainPodstawy: string[]
  /** Fragmenty wymagane w polu "argumentacja" (case-insensitive substring). */
  mustContainArgumenty: string[]
  /** Fragmenty zakazane (case-insensitive). */
  mustNotContain?: string[]
  /** Czy "do_organu" musi zawierać te fragmenty. */
  mustContainDoOrganu?: string[]
}

// ============================================================================
// Eval Runner — czysta logika walidacji (nie wykonuje LLM, tylko sprawdza output)
// ============================================================================

export interface EvalOutput {
  tytul: string
  do_organu: string
  podstawy_prawne: string[]
  argumentacja: string[]
  wnioski: string[]
  scoring_szans: number
  ostrzezenia: string[]
}

export interface EvalResult {
  evalId: string
  passed: boolean
  failures: string[]
}

/**
 * Waliduje output AI względem golden eval. Czyste, deterministyczne sprawdzenie.
 * Driver (vitest) najpierw wywołuje LLM, otrzymuje EvalOutput JSON, a następnie
 * przekazuje go tutaj.
 */
export function validateEvalOutput(eval_: GoldenEval, output: EvalOutput): EvalResult {
  const failures: string[] = []

  // 1. Struktura
  if (typeof output.tytul !== 'string' || output.tytul.length < 5) {
    failures.push('tytul missing or too short')
  }
  if (typeof output.do_organu !== 'string' || output.do_organu.length < 3) {
    failures.push('do_organu missing or too short')
  }
  if (!Array.isArray(output.podstawy_prawne) || output.podstawy_prawne.length === 0) {
    failures.push('podstawy_prawne empty or not array')
  }
  if (!Array.isArray(output.argumentacja) || output.argumentacja.length === 0) {
    failures.push('argumentacja empty or not array')
  }
  if (!Array.isArray(output.wnioski) || output.wnioski.length === 0) {
    failures.push('wnioski empty or not array')
  }
  if (typeof output.scoring_szans !== 'number') {
    failures.push('scoring_szans not number')
  }
  if (!Array.isArray(output.ostrzezenia)) {
    failures.push('ostrzezenia not array')
  }

  // 2. Scoring
  if (typeof output.scoring_szans === 'number') {
    if (output.scoring_szans < eval_.expectedScoring.min) {
      failures.push(
        `scoring_szans ${output.scoring_szans} < expected min ${eval_.expectedScoring.min}`,
      )
    }
    if (output.scoring_szans > eval_.expectedScoring.max) {
      failures.push(
        `scoring_szans ${output.scoring_szans} > expected max ${eval_.expectedScoring.max}`,
      )
    }
  }

  // 3. Podstawy prawne
  const podstawyJoined = (output.podstawy_prawne ?? []).join(' | ').toLowerCase()
  for (const wymagane of eval_.mustContainPodstawy) {
    if (!podstawyJoined.includes(wymagane.toLowerCase())) {
      failures.push(`podstawy_prawne missing: "${wymagane}"`)
    }
  }

  // 4. Argumentacja
  const argJoined = (output.argumentacja ?? []).join(' | ').toLowerCase()
  for (const wymagane of eval_.mustContainArgumenty) {
    if (!argJoined.includes(wymagane.toLowerCase())) {
      failures.push(`argumentacja missing: "${wymagane}"`)
    }
  }

  // 5. mustNotContain
  if (eval_.mustNotContain) {
    const fullText = [
      output.tytul,
      output.do_organu,
      podstawyJoined,
      argJoined,
      (output.wnioski ?? []).join(' | '),
      (output.ostrzezenia ?? []).join(' | '),
    ]
      .join(' ')
      .toLowerCase()
    for (const zakazane of eval_.mustNotContain) {
      if (fullText.includes(zakazane.toLowerCase())) {
        failures.push(`mustNotContain found: "${zakazane}"`)
      }
    }
  }

  // 6. do_organu
  if (eval_.mustContainDoOrganu) {
    const doOrgLower = (output.do_organu ?? '').toLowerCase()
    for (const wymagane of eval_.mustContainDoOrganu) {
      if (!doOrgLower.includes(wymagane.toLowerCase())) {
        failures.push(`do_organu missing: "${wymagane}"`)
      }
    }
  }

  return { evalId: eval_.id, passed: failures.length === 0, failures }
}

// ============================================================================
// Re-export wszystkich evals
// ============================================================================

import { MANDATY_EVALS } from './mandaty.evals'
import { PARKING_EVALS } from './parking.evals'
import { WINDYKACJA_EVALS } from './windykacja.evals'
import { UBEZPIECZENIA_EVALS } from './ubezpieczenia.evals'
import { ETOLL_EVALS } from './etoll.evals'
import { KONTROLE_EVALS } from './kontrole.evals'
import { TECHNICZNE_EVALS } from './techniczne.evals'

export const ALL_EVALS: GoldenEval[] = [
  ...MANDATY_EVALS,
  ...PARKING_EVALS,
  ...WINDYKACJA_EVALS,
  ...UBEZPIECZENIA_EVALS,
  ...ETOLL_EVALS,
  ...KONTROLE_EVALS,
  ...TECHNICZNE_EVALS,
]

export {
  MANDATY_EVALS,
  PARKING_EVALS,
  WINDYKACJA_EVALS,
  UBEZPIECZENIA_EVALS,
  ETOLL_EVALS,
  KONTROLE_EVALS,
  TECHNICZNE_EVALS,
}
