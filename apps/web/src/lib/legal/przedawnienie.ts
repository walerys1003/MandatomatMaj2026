/**
 * Kalkulator przedawnienia — moduł T5-AI
 *
 * Oblicza datę przedawnienia dla różnych typów spraw zgodnie z polskim
 * prawem (KW, KPSW, KC, KPA, Ordynacja Podatkowa, ustawa o e-TOLL).
 *
 * Każda kategoria spraw ma własny okres przedawnienia:
 *   - Wykroczenia (KW): 1 rok (czyn) / 2 lata (orzeczenie)
 *   - Roszczenia z umów (KC): 6 lat / 3 lata (działalność gospodarcza)
 *   - Roszczenia okresowe (czynsz, abonament): 3 lata
 *   - Roszczenia z OC: 3 lata (od zdarzenia) / 20 lat (przestępstwo)
 *   - Decyzje administracyjne (KPA): 5/10 lat zależnie od typu
 *   - Mandaty skarbowe (Ordynacja Podatkowa): 3 lata + przerwy
 *   - e-TOLL: 5 lat (kara administracyjna)
 *   - SPP/ZDM: 1 rok (opłata dodatkowa) / 3 lata (wezwanie)
 *
 * Funkcje czyste — testowalne, deterministyczne. Brak zależności od
 * Date.now() — zawsze przyjmuje `referenceDate` jako argument.
 */

import type { CaseType } from '@mandatomat/db-types'

export type PrzedawnienieReason =
  | 'WYKROCZENIE_CZYN' // KW art. 45 § 1 — przedawnienie karalności czynu
  | 'WYKROCZENIE_ORZECZENIE' // KW art. 45 § 2 — przedawnienie wykonania orzeczenia
  | 'KC_OGOLNE' // KC art. 118 — 6 lat
  | 'KC_DZIALALNOSC' // KC art. 118 — 3 lata (przedsiębiorca)
  | 'KC_OKRESOWE' // KC art. 118 — 3 lata (świadczenia okresowe)
  | 'KC_OC_DELIKT' // KC art. 442¹ — 3 lata od zdarzenia
  | 'KC_OC_PRZESTEPSTWO' // KC art. 442¹ § 2 — 20 lat
  | 'KPA_DECYZJA' // KPA art. 156-159
  | 'ORD_PODATKOWA_KARA' // Ord. Pod. art. 68 — 3 lata
  | 'ETOLL_KARA' // ustawa o autostradach — 5 lat
  | 'SPP_OPLATA' // ustawa o drogach publicznych
  | 'BANK_KREDYT' // pr. bankowe — 3 lata
  | 'EPU_NAKAZ' // 6 lat (KC) lub 3 lata (przedsiębiorca)

export interface PrzedawnienieResult {
  /** Data przedawnienia (po niej roszczenie wygasłe) */
  expiresAt: Date
  /** Liczba dni do przedawnienia (ujemna jeśli już przedawnione) */
  daysRemaining: number
  /** Czy roszczenie jest już przedawnione */
  isExpired: boolean
  /** Podstawa prawna wyliczenia */
  podstawaPrawna: string
  /** Reason / kategoria okresu */
  reason: PrzedawnienieReason
  /** Liczba lat okresu przedawnienia */
  okresLat: number
  /** Czy bieg był przerwany lub zawieszony (info dla użytkownika) */
  uwagi: string[]
}

/**
 * Tabela okresów przedawnienia z podstawami prawnymi.
 * Wszystkie okresy w pełnych latach (KC, KW, KPA stosują pełne lata).
 */
const OKRESY: Record<
  PrzedawnienieReason,
  { lata: number; podstawaPrawna: string; opis: string }
> = {
  WYKROCZENIE_CZYN: {
    lata: 1,
    podstawaPrawna: 'art. 45 § 1 KW',
    opis: 'Karalność wykroczenia ustaje, jeżeli od czasu jego popełnienia upłynął rok',
  },
  WYKROCZENIE_ORZECZENIE: {
    lata: 3,
    podstawaPrawna: 'art. 45 § 3 KW',
    opis: 'Wykonanie orzeczenia nie może nastąpić po upływie 3 lat od uprawomocnienia',
  },
  KC_OGOLNE: {
    lata: 6,
    podstawaPrawna: 'art. 118 KC',
    opis: 'Termin przedawnienia wynosi 6 lat (po nowelizacji 9.07.2018)',
  },
  KC_DZIALALNOSC: {
    lata: 3,
    podstawaPrawna: 'art. 118 KC',
    opis: 'Roszczenia związane z prowadzeniem działalności gospodarczej — 3 lata',
  },
  KC_OKRESOWE: {
    lata: 3,
    podstawaPrawna: 'art. 118 KC',
    opis: 'Roszczenia o świadczenia okresowe (czynsz, abonament) — 3 lata',
  },
  KC_OC_DELIKT: {
    lata: 3,
    podstawaPrawna: 'art. 442¹ § 1 KC',
    opis: 'Roszczenie o naprawienie szkody z czynu niedozwolonego — 3 lata od dowiedzenia się',
  },
  KC_OC_PRZESTEPSTWO: {
    lata: 20,
    podstawaPrawna: 'art. 442¹ § 2 KC',
    opis: 'Jeżeli szkoda wynikła ze zbrodni lub występku — 20 lat',
  },
  KPA_DECYZJA: {
    lata: 10,
    podstawaPrawna: 'art. 156 § 2 KPA',
    opis: 'Stwierdzenie nieważności decyzji nie po 10 latach od doręczenia',
  },
  ORD_PODATKOWA_KARA: {
    lata: 3,
    podstawaPrawna: 'art. 68 § 1 Ordynacji podatkowej',
    opis: 'Zobowiązanie podatkowe nie powstaje, jeżeli upłynęło 3 lata od końca roku',
  },
  ETOLL_KARA: {
    lata: 5,
    podstawaPrawna: 'art. 13k ustawy o autostradach płatnych',
    opis: 'Kara pieniężna z e-TOLL przedawnia się po 5 latach',
  },
  SPP_OPLATA: {
    lata: 1,
    podstawaPrawna: 'art. 40d ust. 3 ustawy o drogach publicznych',
    opis: 'Opłata dodatkowa SPP przedawnia się po roku od dnia naliczenia',
  },
  BANK_KREDYT: {
    lata: 3,
    podstawaPrawna: 'art. 118 KC w zw. z prawem bankowym',
    opis: 'Roszczenia banku z umowy kredytu (działalność gospodarcza) — 3 lata',
  },
  EPU_NAKAZ: {
    lata: 6,
    podstawaPrawna: 'art. 125 § 1 KC',
    opis: 'Roszczenie stwierdzone prawomocnym orzeczeniem — 6 lat',
  },
}

/**
 * Mapa typów spraw → domyślny powód przedawnienia.
 * Niektóre sprawy wymagają dodatkowego kontekstu (np. windykacja —
 * czy to konsument czy przedsiębiorca), dla nich zwracamy null
 * i wymagamy explicit `reason`.
 */
const CASE_TYPE_TO_REASON: Partial<Record<CaseType, PrzedawnienieReason>> = {
  M1_mandat_predkosc: 'WYKROCZENIE_CZYN',
  M2_mandat_odmowa_przyjecia: 'WYKROCZENIE_CZYN',
  M3_mandat_uchylenie: 'WYKROCZENIE_ORZECZENIE',
  M4_mandat_straz_gminna: 'WYKROCZENIE_CZYN',
  M5_mandat_straz_fotoradar: 'WYKROCZENIE_CZYN',
  M6_mandat_itd: 'KPA_DECYZJA',
  M7_mandat_odroczenie_raty: 'ORD_PODATKOWA_KARA',
  P1_parking_spp: 'SPP_OPLATA',
  P2_parking_zdm: 'SPP_OPLATA',
  P3_parking_ztm: 'KC_OKRESOWE',
  P4_parking_blad_identyfikacji: 'SPP_OPLATA',
  W1_windykacja_przedawnienie: 'KC_DZIALALNOSC',
  W3_windykacja_sprzeciw_epu: 'EPU_NAKAZ',
  U1_ubezp_odwolanie_decyzja: 'KC_OC_DELIKT',
  U2_ubezp_wezwanie_wyplata: 'KC_OC_DELIKT',
  E1_etoll_odwolanie_kara: 'ETOLL_KARA',
  E2_etoll_reklamacja_podwojne: 'ETOLL_KARA',
  E3_etoll_anulowanie: 'ETOLL_KARA',
  K1_kontrola_zatrzymanie_pj: 'KPA_DECYZJA',
  K2_kontrola_cofniecie_cepik: 'KPA_DECYZJA',
}

export interface CalcPrzedawnienieParams {
  /** Data zdarzenia (popełnienie czynu, doręczenie decyzji, wymagalność) */
  startDate: Date
  /** Typ sprawy — domyślnie określa reason */
  caseType?: CaseType
  /** Explicit reason — nadpisuje mapowanie z caseType */
  reason?: PrzedawnienieReason
  /** Data odniesienia (domyślnie today) — dla testów deterministycznych */
  referenceDate?: Date
  /** Czy bieg był przerwany (np. uznanie długu, pozew) — wtedy odlicz od nowa */
  przerwanyOd?: Date
  /** Liczba dni zawieszenia biegu (np. mediacja) */
  zawieszenieDays?: number
}

export class PrzedawnienieError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PrzedawnienieError'
  }
}

/**
 * Główna funkcja kalkulatora.
 *
 * @throws PrzedawnienieError jeśli nie można określić reason ani z caseType, ani z explicit
 */
export function calcPrzedawnienie(
  params: CalcPrzedawnienieParams,
): PrzedawnienieResult {
  const {
    startDate,
    caseType,
    reason: explicitReason,
    referenceDate = new Date(),
    przerwanyOd,
    zawieszenieDays = 0,
  } = params

  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
    throw new PrzedawnienieError('startDate musi być prawidłową datą')
  }
  if (zawieszenieDays < 0) {
    throw new PrzedawnienieError('zawieszenieDays nie może być ujemne')
  }

  // Określenie reason: explicit ma priorytet, potem mapa z caseType
  const reason: PrzedawnienieReason | undefined =
    explicitReason ?? (caseType ? CASE_TYPE_TO_REASON[caseType] : undefined)

  if (!reason) {
    throw new PrzedawnienieError(
      `Nie można określić okresu przedawnienia dla caseType='${caseType ?? '(brak)'}'. ` +
        'Podaj explicit reason w parametrach.',
    )
  }

  const config = OKRESY[reason]
  // Po przerwie biegu liczymy od daty przerwania (art. 124 KC)
  const baseDate = przerwanyOd ?? startDate
  const expiresAt = new Date(baseDate)
  expiresAt.setFullYear(expiresAt.getFullYear() + config.lata)
  // Doliczenie zawieszenia
  if (zawieszenieDays > 0) {
    expiresAt.setDate(expiresAt.getDate() + zawieszenieDays)
  }

  const msPerDay = 24 * 60 * 60 * 1000
  const daysRemaining = Math.floor(
    (expiresAt.getTime() - referenceDate.getTime()) / msPerDay,
  )
  const isExpired = daysRemaining < 0

  const uwagi: string[] = []
  if (przerwanyOd) {
    uwagi.push(
      `Bieg przedawnienia został przerwany w dniu ${formatDate(przerwanyOd)} ` +
        '(art. 123-124 KC) — biegnie od nowa.',
    )
  }
  if (zawieszenieDays > 0) {
    uwagi.push(
      `Bieg był zawieszony przez ${zawieszenieDays} dni (np. mediacja, ` +
        'siła wyższa — art. 121 KC).',
    )
  }
  if (reason === 'WYKROCZENIE_CZYN') {
    uwagi.push(
      'Uwaga: jeżeli w okresie przedawnienia wszczęto postępowanie, ' +
        'karalność ustaje po upływie 2 lat od końca okresu (art. 45 § 1 KW).',
    )
  }
  if (reason === 'KC_OC_DELIKT') {
    uwagi.push(
      'Uwaga: termin liczy się od dnia, w którym poszkodowany dowiedział się ' +
        'o szkodzie i osobie obowiązanej, jednak nie dłużej niż 10 lat od zdarzenia.',
    )
  }

  return {
    expiresAt,
    daysRemaining,
    isExpired,
    podstawaPrawna: config.podstawaPrawna,
    reason,
    okresLat: config.lata,
    uwagi,
  }
}

/**
 * Pomocnicza funkcja formatowania daty w formacie polskim DD.MM.YYYY
 */
export function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

/**
 * Funkcja pomocnicza — czy roszczenie z danej daty jest już przedawnione.
 */
export function isPrzedawnione(
  startDate: Date,
  caseType: CaseType,
  referenceDate: Date = new Date(),
): boolean {
  try {
    const r = calcPrzedawnienie({ startDate, caseType, referenceDate })
    return r.isExpired
  } catch {
    return false
  }
}

/**
 * Lista wszystkich obsługiwanych powodów (do UI selecta).
 */
export function getSupportedReasons(): Array<{
  value: PrzedawnienieReason
  label: string
  podstawaPrawna: string
  lata: number
}> {
  return (Object.keys(OKRESY) as PrzedawnienieReason[]).map((value) => ({
    value,
    label: OKRESY[value].opis,
    podstawaPrawna: OKRESY[value].podstawaPrawna,
    lata: OKRESY[value].lata,
  }))
}
