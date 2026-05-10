/**
 * Prompt loader — mapuje `CaseType` → system prompt + user prompt builder.
 *
 * 29 promptów obsługujących pełen katalog spraw Mandatomat:
 *  - Mandaty (M1-M7), Parking (P1-P4), Windykacja (W1-W5),
 *  - Ubezpieczenia (U1-U3), e-TOLL (E1-E3), Kontrole (K1-K4),
 *  - Techniczne/pomocnicze (T1-T4).
 *
 * Każdy prompt to TS moduł z:
 *  - {SYMBOL}_SYSTEM_PROMPT: string,
 *  - build{Symbol}UserPrompt(data): string,
 *  - {Symbol}Input: interface.
 *
 * Output strict JSON: {tytul, do_organu, podstawy_prawne[], argumentacja[], wnioski[], scoring_szans, ostrzezenia[]}.
 */

import type { CaseType } from '@mandatomat/db-types'

// Mandaty
import { M1_SYSTEM_PROMPT, buildM1UserPrompt, type M1Input } from './m1-sprzeciw-predkosc'
import { M2_SYSTEM_PROMPT, buildM2UserPrompt, type M2Input } from './m2-odmowa-przyjecia'
import { M3_SYSTEM_PROMPT, buildM3UserPrompt, type M3Input } from './m3-uchylenie-prawomocny'
import { M4_SYSTEM_PROMPT, buildM4UserPrompt, type M4Input } from './m4-mandat-pasy'
import { M5_SYSTEM_PROMPT, buildM5UserPrompt, type M5Input } from './m5-odwolanie-straz'
import { M6_SYSTEM_PROMPT, buildM6UserPrompt, type M6Input } from './m6-odwolanie-itd'
import { M7_SYSTEM_PROMPT, buildM7UserPrompt, type M7Input } from './m7-odroczenie-raty'

// Parking
import { P1_SYSTEM_PROMPT, buildP1UserPrompt, type P1Input } from './p1-parking-spp'
import { P2_SYSTEM_PROMPT, buildP2UserPrompt, type P2Input } from './p2-parking-zdm'
import { P3_SYSTEM_PROMPT, buildP3UserPrompt, type P3Input } from './p3-parking-ztm'
import { P4_SYSTEM_PROMPT, buildP4UserPrompt, type P4Input } from './p4-parking-blad-identyfikacji'

// Windykacja
import { W1_SYSTEM_PROMPT, buildW1UserPrompt, type W1Input } from './w1-windykacja-przedawnienie'
import { W2_SYSTEM_PROMPT, buildW2UserPrompt, type W2Input } from './w2-odpowiedz-wezwanie'
import { W3_SYSTEM_PROMPT, buildW3UserPrompt, type W3Input } from './w3-sprzeciw-epu'
import { W4_SYSTEM_PROMPT, buildW4UserPrompt, type W4Input } from './w4-usuniecie-krd-bik'
import { W5_SYSTEM_PROMPT, buildW5UserPrompt, type W5Input } from './w5-skarga-rf'

// Ubezpieczenia
import { U1_SYSTEM_PROMPT, buildU1UserPrompt, type U1Input } from './u1-odwolanie-decyzja'
import { U2_SYSTEM_PROMPT, buildU2UserPrompt, type U2Input } from './u2-wezwanie-wyplata'
import { U3_SYSTEM_PROMPT, buildU3UserPrompt, type U3Input } from './u3-skarga-rf-ubezpieczenia'

// e-TOLL
import { E1_SYSTEM_PROMPT, buildE1UserPrompt, type E1Input } from './e1-odwolanie-kara-etoll'
import { E2_SYSTEM_PROMPT, buildE2UserPrompt, type E2Input } from './e2-reklamacja-podwojne-naliczenie'
import { E3_SYSTEM_PROMPT, buildE3UserPrompt, type E3Input } from './e3-anulowanie-etoll'

// Kontrole
import { K1_SYSTEM_PROMPT, buildK1UserPrompt, type K1Input } from './k1-sprzeciw-zatrzymanie-pj'
import { K2_SYSTEM_PROMPT, buildK2UserPrompt, type K2Input } from './k2-cofniecie-decyzji-cepik'
import { K3_SYSTEM_PROMPT, buildK3UserPrompt, type K3Input } from './k3-weryfikacja-urzadzenia'
import { K4_SYSTEM_PROMPT, buildK4UserPrompt, type K4Input } from './k4-korekta-punktow-karnych'

// Techniczne / pomocnicze
import { T1_SYSTEM_PROMPT, buildT1UserPrompt, type T1Input } from './t1-pelnomocnictwo'
import { T2_SYSTEM_PROMPT, buildT2UserPrompt, type T2Input } from './t2-rodo-dostep'
import { T3_SYSTEM_PROMPT, buildT3UserPrompt, type T3Input } from './t3-rodo-usuniecie'
import { T4_SYSTEM_PROMPT, buildT4UserPrompt, type T4Input } from './t4-lista-zalacznikow'

// ============================================================================
// PromptInput — discriminated union per CaseType
// ============================================================================

export type PromptInput =
  // Mandaty
  | { caseType: 'M1_mandat_predkosc'; data: M1Input }
  | { caseType: 'M2_mandat_odmowa_przyjecia'; data: M2Input }
  | { caseType: 'M3_mandat_uchylenie'; data: M3Input }
  | { caseType: 'M4_mandat_straz_gminna'; data: M4Input }
  | { caseType: 'M5_mandat_straz_fotoradar'; data: M5Input }
  | { caseType: 'M6_mandat_itd'; data: M6Input }
  | { caseType: 'M7_mandat_odroczenie_raty'; data: M7Input }
  // Parking
  | { caseType: 'P1_parking_spp'; data: P1Input }
  | { caseType: 'P2_parking_zdm'; data: P2Input }
  | { caseType: 'P3_parking_ztm'; data: P3Input }
  | { caseType: 'P4_parking_blad_identyfikacji'; data: P4Input }
  // Windykacja
  | { caseType: 'W1_windykacja_przedawnienie'; data: W1Input }
  | { caseType: 'W2_windykacja_odpowiedz'; data: W2Input }
  | { caseType: 'W3_windykacja_sprzeciw_epu'; data: W3Input }
  | { caseType: 'W4_windykacja_krd_bik'; data: W4Input }
  | { caseType: 'W5_windykacja_skarga_rf'; data: W5Input }
  // Ubezpieczenia
  | { caseType: 'U1_ubezp_odwolanie_decyzja'; data: U1Input }
  | { caseType: 'U2_ubezp_wezwanie_wyplata'; data: U2Input }
  | { caseType: 'U3_ubezp_skarga_rf'; data: U3Input }
  // e-TOLL
  | { caseType: 'E1_etoll_odwolanie_kara'; data: E1Input }
  | { caseType: 'E2_etoll_reklamacja_podwojne'; data: E2Input }
  | { caseType: 'E3_etoll_anulowanie'; data: E3Input }
  // Kontrole
  | { caseType: 'K1_kontrola_zatrzymanie_pj'; data: K1Input }
  | { caseType: 'K2_kontrola_cofniecie_cepik'; data: K2Input }
  | { caseType: 'K3_kontrola_weryfikacja_urzadzenia'; data: K3Input }
  | { caseType: 'K4_kontrola_korekta_punktow'; data: K4Input }
  // Techniczne
  | { caseType: 'T1_techn_pelnomocnictwo'; data: T1Input }
  | { caseType: 'T2_techn_rodo_dostep'; data: T2Input }
  | { caseType: 'T3_techn_rodo_usuniecie'; data: T3Input }
  | { caseType: 'T4_techn_lista_zalacznikow'; data: T4Input }

export interface LoadedPrompt {
  systemPrompt: string
  userPrompt: string
  /** Sugerowany model. Default: Sonnet 4.5. Krótkie pisma mogą używać Haiku. */
  preferredModel: string
  /** Sugerowany maxTokens (długość pisma). */
  maxTokens: number
}

const SUPPORTED_CASE_TYPES: ReadonlySet<CaseType> = new Set<CaseType>([
  'M1_mandat_predkosc',
  'M2_mandat_odmowa_przyjecia',
  'M3_mandat_uchylenie',
  'M4_mandat_straz_gminna',
  'M5_mandat_straz_fotoradar',
  'M6_mandat_itd',
  'M7_mandat_odroczenie_raty',
  'P1_parking_spp',
  'P2_parking_zdm',
  'P3_parking_ztm',
  'P4_parking_blad_identyfikacji',
  'W1_windykacja_przedawnienie',
  'W2_windykacja_odpowiedz',
  'W3_windykacja_sprzeciw_epu',
  'W4_windykacja_krd_bik',
  'W5_windykacja_skarga_rf',
  'U1_ubezp_odwolanie_decyzja',
  'U2_ubezp_wezwanie_wyplata',
  'U3_ubezp_skarga_rf',
  'E1_etoll_odwolanie_kara',
  'E2_etoll_reklamacja_podwojne',
  'E3_etoll_anulowanie',
  'K1_kontrola_zatrzymanie_pj',
  'K2_kontrola_cofniecie_cepik',
  'K3_kontrola_weryfikacja_urzadzenia',
  'K4_kontrola_korekta_punktow',
  'T1_techn_pelnomocnictwo',
  'T2_techn_rodo_dostep',
  'T3_techn_rodo_usuniecie',
  'T4_techn_lista_zalacznikow',
])

/** Czy mamy prompt dla tego typu sprawy. */
export function hasPrompt(caseType: CaseType): boolean {
  return SUPPORTED_CASE_TYPES.has(caseType)
}

/**
 * Załaduj prompt (system + user) dla sprawy. TypeScript narzuca pełną zgodność
 * caseType + data Input dzięki discriminated union — switch jest exhaustive.
 */
export function loadPrompt(input: PromptInput): LoadedPrompt {
  const defaults = {
    preferredModel: 'claude-sonnet-4-5-20250929',
    maxTokens: 3072,
  }
  const long = { ...defaults, maxTokens: 3584 }
  const short = { ...defaults, maxTokens: 2048 }

  switch (input.caseType) {
    // ---- Mandaty ----
    case 'M1_mandat_predkosc':
      return { ...defaults, systemPrompt: M1_SYSTEM_PROMPT, userPrompt: buildM1UserPrompt(input.data) }
    case 'M2_mandat_odmowa_przyjecia':
      return { ...short, systemPrompt: M2_SYSTEM_PROMPT, userPrompt: buildM2UserPrompt(input.data) }
    case 'M3_mandat_uchylenie':
      return { ...long, systemPrompt: M3_SYSTEM_PROMPT, userPrompt: buildM3UserPrompt(input.data) }
    case 'M4_mandat_straz_gminna':
      return { ...defaults, systemPrompt: M4_SYSTEM_PROMPT, userPrompt: buildM4UserPrompt(input.data) }
    case 'M5_mandat_straz_fotoradar':
      return { ...defaults, systemPrompt: M5_SYSTEM_PROMPT, userPrompt: buildM5UserPrompt(input.data) }
    case 'M6_mandat_itd':
      return { ...long, systemPrompt: M6_SYSTEM_PROMPT, userPrompt: buildM6UserPrompt(input.data) }
    case 'M7_mandat_odroczenie_raty':
      return { ...short, systemPrompt: M7_SYSTEM_PROMPT, userPrompt: buildM7UserPrompt(input.data) }

    // ---- Parking ----
    case 'P1_parking_spp':
      return { ...defaults, systemPrompt: P1_SYSTEM_PROMPT, userPrompt: buildP1UserPrompt(input.data) }
    case 'P2_parking_zdm':
      return { ...defaults, systemPrompt: P2_SYSTEM_PROMPT, userPrompt: buildP2UserPrompt(input.data) }
    case 'P3_parking_ztm':
      return { ...defaults, systemPrompt: P3_SYSTEM_PROMPT, userPrompt: buildP3UserPrompt(input.data) }
    case 'P4_parking_blad_identyfikacji':
      return { ...defaults, systemPrompt: P4_SYSTEM_PROMPT, userPrompt: buildP4UserPrompt(input.data) }

    // ---- Windykacja ----
    case 'W1_windykacja_przedawnienie':
      return { ...long, systemPrompt: W1_SYSTEM_PROMPT, userPrompt: buildW1UserPrompt(input.data) }
    case 'W2_windykacja_odpowiedz':
      return { ...defaults, systemPrompt: W2_SYSTEM_PROMPT, userPrompt: buildW2UserPrompt(input.data) }
    case 'W3_windykacja_sprzeciw_epu':
      return { ...defaults, systemPrompt: W3_SYSTEM_PROMPT, userPrompt: buildW3UserPrompt(input.data) }
    case 'W4_windykacja_krd_bik':
      return { ...defaults, systemPrompt: W4_SYSTEM_PROMPT, userPrompt: buildW4UserPrompt(input.data) }
    case 'W5_windykacja_skarga_rf':
      return { ...long, systemPrompt: W5_SYSTEM_PROMPT, userPrompt: buildW5UserPrompt(input.data) }

    // ---- Ubezpieczenia ----
    case 'U1_ubezp_odwolanie_decyzja':
      return { ...long, systemPrompt: U1_SYSTEM_PROMPT, userPrompt: buildU1UserPrompt(input.data) }
    case 'U2_ubezp_wezwanie_wyplata':
      return { ...defaults, systemPrompt: U2_SYSTEM_PROMPT, userPrompt: buildU2UserPrompt(input.data) }
    case 'U3_ubezp_skarga_rf':
      return { ...long, systemPrompt: U3_SYSTEM_PROMPT, userPrompt: buildU3UserPrompt(input.data) }

    // ---- e-TOLL ----
    case 'E1_etoll_odwolanie_kara':
      return { ...long, systemPrompt: E1_SYSTEM_PROMPT, userPrompt: buildE1UserPrompt(input.data) }
    case 'E2_etoll_reklamacja_podwojne':
      return { ...defaults, systemPrompt: E2_SYSTEM_PROMPT, userPrompt: buildE2UserPrompt(input.data) }
    case 'E3_etoll_anulowanie':
      return { ...defaults, systemPrompt: E3_SYSTEM_PROMPT, userPrompt: buildE3UserPrompt(input.data) }

    // ---- Kontrole ----
    case 'K1_kontrola_zatrzymanie_pj':
      return { ...long, systemPrompt: K1_SYSTEM_PROMPT, userPrompt: buildK1UserPrompt(input.data) }
    case 'K2_kontrola_cofniecie_cepik':
      return { ...defaults, systemPrompt: K2_SYSTEM_PROMPT, userPrompt: buildK2UserPrompt(input.data) }
    case 'K3_kontrola_weryfikacja_urzadzenia':
      return { ...defaults, systemPrompt: K3_SYSTEM_PROMPT, userPrompt: buildK3UserPrompt(input.data) }
    case 'K4_kontrola_korekta_punktow':
      return { ...short, systemPrompt: K4_SYSTEM_PROMPT, userPrompt: buildK4UserPrompt(input.data) }

    // ---- Techniczne / pomocnicze ----
    case 'T1_techn_pelnomocnictwo':
      return { ...short, systemPrompt: T1_SYSTEM_PROMPT, userPrompt: buildT1UserPrompt(input.data) }
    case 'T2_techn_rodo_dostep':
      return { ...short, systemPrompt: T2_SYSTEM_PROMPT, userPrompt: buildT2UserPrompt(input.data) }
    case 'T3_techn_rodo_usuniecie':
      return { ...short, systemPrompt: T3_SYSTEM_PROMPT, userPrompt: buildT3UserPrompt(input.data) }
    case 'T4_techn_lista_zalacznikow':
      return { ...short, systemPrompt: T4_SYSTEM_PROMPT, userPrompt: buildT4UserPrompt(input.data) }
  }
}

// ============================================================================
// Re-eksporty typów wejściowych — używane przez API route i form builders
// ============================================================================

export type {
  M1Input, M2Input, M3Input, M4Input, M5Input, M6Input, M7Input,
  P1Input, P2Input, P3Input, P4Input,
  W1Input, W2Input, W3Input, W4Input, W5Input,
  U1Input, U2Input, U3Input,
  E1Input, E2Input, E3Input,
  K1Input, K2Input, K3Input, K4Input,
  T1Input, T2Input, T3Input, T4Input,
}
