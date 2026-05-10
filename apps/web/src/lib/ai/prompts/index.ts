/**
 * Prompt loader — mapuje `CaseType` → system prompt + user prompt builder.
 *
 * Dlaczego nie .md + gray-matter? Bo to jest:
 *  - prostsze (typescript = autocompletion + sprawdzanie typów wejścia)
 *  - szybsze (bez fs read na Edge runtime)
 *  - 5 promptów MVP — gray-matter nie daje istotnego zysku
 *
 * Po MVP: jeśli liczba promptów wzrośnie do 30+, można rozważyć .md w R2/storage
 * + dynamic import. Na teraz: TypeScript moduły.
 */

import type { CaseType } from '@mandatomat/db-types'

import {
  M1_SYSTEM_PROMPT,
  buildM1UserPrompt,
  type M1Input,
} from './m1-sprzeciw-predkosc'
import { M4_SYSTEM_PROMPT, buildM4UserPrompt, type M4Input } from './m4-mandat-pasy'
import { P1_SYSTEM_PROMPT, buildP1UserPrompt, type P1Input } from './p1-parking-spp'
import { P3_SYSTEM_PROMPT, buildP3UserPrompt, type P3Input } from './p3-parking-ztm'
import {
  W1_SYSTEM_PROMPT,
  buildW1UserPrompt,
  type W1Input,
} from './w1-windykacja-przedawnienie'

// ============================================================================
// PromptInput — discriminated union per CaseType
// ============================================================================

export type PromptInput =
  | { caseType: 'M1_mandat_predkosc'; data: M1Input }
  | { caseType: 'M4_mandat_pasy'; data: M4Input }
  | { caseType: 'P1_parking_strefa_platna'; data: P1Input }
  | { caseType: 'P3_parking_oplata_dodatkowa'; data: P3Input }
  | { caseType: 'W1_windykacja_przedawnienie'; data: W1Input }

export interface LoadedPrompt {
  systemPrompt: string
  userPrompt: string
  /** Sugerowany model. Default: Sonnet. Niektóre proste sprawy mogą używać Haiku. */
  preferredModel: string
  /** Sugerowany maxTokens (długość pisma). */
  maxTokens: number
}

/** Czy mamy prompt dla tego typu sprawy. */
export function hasPrompt(caseType: CaseType): boolean {
  return SUPPORTED_CASE_TYPES.has(caseType)
}

const SUPPORTED_CASE_TYPES: Set<string> = new Set([
  'M1_mandat_predkosc',
  'M4_mandat_pasy',
  'P1_parking_strefa_platna',
  'P3_parking_oplata_dodatkowa',
  'W1_windykacja_przedawnienie',
])

/** Załaduj prompt (system + user) dla sprawy. Rzuca jeśli case_type nie obsługiwany. */
export function loadPrompt(input: PromptInput): LoadedPrompt {
  const defaults = {
    preferredModel: 'claude-sonnet-4-5-20250929',
    maxTokens: 3072,
  }

  switch (input.caseType) {
    case 'M1_mandat_predkosc':
      return {
        ...defaults,
        systemPrompt: M1_SYSTEM_PROMPT,
        userPrompt: buildM1UserPrompt(input.data),
      }
    case 'M4_mandat_pasy':
      return {
        ...defaults,
        systemPrompt: M4_SYSTEM_PROMPT,
        userPrompt: buildM4UserPrompt(input.data),
      }
    case 'P1_parking_strefa_platna':
      return {
        ...defaults,
        systemPrompt: P1_SYSTEM_PROMPT,
        userPrompt: buildP1UserPrompt(input.data),
      }
    case 'P3_parking_oplata_dodatkowa':
      return {
        ...defaults,
        systemPrompt: P3_SYSTEM_PROMPT,
        userPrompt: buildP3UserPrompt(input.data),
      }
    case 'W1_windykacja_przedawnienie':
      return {
        ...defaults,
        // W1 wymaga więcej miejsca na argumentację prawniczą
        maxTokens: 3584,
        systemPrompt: W1_SYSTEM_PROMPT,
        userPrompt: buildW1UserPrompt(input.data),
      }
  }
}

// Re-eksporty typów wejściowych — używane przez API route
export type { M1Input, M4Input, P1Input, P3Input, W1Input }
