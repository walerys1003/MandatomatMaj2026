import type { CaseType } from '@mandatomat/db-types'

/**
 * Mapowanie TS-owych wartości CaseType (M1, M4, P1, P3, W1, ...) →
 * wartości ENUM `case_type` w bazie (migracja 002).
 *
 * Uzasadnienie rozjazdu:
 *  - W TS używamy "shortId-style" (np. M2_mandat_odmowa_przyjecia) zgodnie ze
 *    specyfikacją 29 promptów / typów pism.
 *  - W bazie ENUM był stworzony przed katalogiem (mandat_sprzeciw_predkosc itp.).
 *
 * Zamiast modyfikować ENUM (kosztowne i ryzykowne — wymagałoby ALTER TYPE
 * + reindeks), trzymamy mapping w jednym miejscu.
 *
 * UWAGA: jeśli typ MVP nie ma odpowiednika w bazie ENUM, to migracja musi
 * zostać dodana zanim taki case_type zostanie zapisany.
 */

/** TS CaseType → DB enum value. */
export const CASE_TYPE_TO_DB: Partial<Record<CaseType, string>> = {
  // Mandaty
  M1_mandat_predkosc: 'mandat_sprzeciw_predkosc',
  M2_mandat_odmowa_przyjecia: 'mandat_odmowa_przyjecia',
  M3_mandat_uchylenie: 'mandat_uchylenie_prawomocny',
  M4_mandat_straz_gminna: 'mandat_odwolanie_straz',
  // M5 (fotoradar SM/SG) zapisywany na ten sam enum DB co M4 — w bazie nie odróżniamy
  // wariantu fotoradarowego od ogólnej straży miejskiej; rozróżnienie istnieje tylko
  // na poziomie promptu AI i UI (case_type_config.short_name).
  M5_mandat_straz_fotoradar: 'mandat_odwolanie_straz',
  M6_mandat_itd: 'mandat_odwolanie_itd',
  M7_mandat_odroczenie_raty: 'mandat_odroczenie_raty',

  // Parking
  P1_parking_spp: 'parking_reklamacja_spp',
  P2_parking_zdm: 'parking_reklamacja_zdm',
  P3_parking_ztm: 'parking_odwolanie_ztm',
  P4_parking_blad_identyfikacji: 'parking_blad_identyfikacji',

  // Windykacja
  W1_windykacja_przedawnienie: 'windykacja_przedawnienie',
  W2_windykacja_odpowiedz: 'windykacja_odpowiedz_wezwanie',
  W3_windykacja_sprzeciw_epu: 'windykacja_sprzeciw_epu',
  W4_windykacja_krd_bik: 'windykacja_usuniecie_krd_bik',
  W5_windykacja_skarga_rf: 'windykacja_skarga_rf',

  // Ubezpieczenia
  U1_ubezp_odwolanie_decyzja: 'ubezpieczenie_odwolanie_decyzja',
  U2_ubezp_wezwanie_wyplata: 'ubezpieczenie_wezwanie_wyplata',
  U3_ubezp_skarga_rf: 'ubezpieczenie_skarga_rf',

  // e-TOLL
  E1_etoll_odwolanie_kara: 'etoll_odwolanie_kara',
  E2_etoll_reklamacja_podwojne: 'etoll_reklamacja_podwojne',
  E3_etoll_anulowanie: 'etoll_anulowanie',

  // Kontrole
  K1_kontrola_zatrzymanie_pj: 'kontrola_sprzeciw_zatrzymanie_pj',
  K2_kontrola_cofniecie_cepik: 'kontrola_cofniecie_decyzji',
  K3_kontrola_weryfikacja_urzadzenia: 'kontrola_weryfikacja_urzadzenia',
  K4_kontrola_korekta_punktow: 'kontrola_korekta_punktow',

  // Techniczne / pomocnicze
  T1_techn_pelnomocnictwo: 'techniczne_pelnomocnictwo',
  T2_techn_rodo_dostep: 'techniczne_rodo_dostep',
  T3_techn_rodo_usuniecie: 'techniczne_rodo_usuniecie',
  T4_techn_lista_zalacznikow: 'techniczne_lista_zalacznikow',
}

/**
 * DB enum value → TS CaseType (reverse).
 *
 * UWAGA: M4_mandat_straz_gminna i M5_mandat_straz_fotoradar mapują się oba na
 * `mandat_odwolanie_straz` (DB enum). Reverse mapping ustawiamy ręcznie na M4
 * jako kanoniczny wariant — M5 jest specjalnym podtypem rozróżnianym na poziomie
 * UI/promptu (`case_type_config.short_name`), nie na poziomie DB.
 */
export const DB_TO_CASE_TYPE: Record<string, CaseType> = (() => {
  const reverse: Record<string, CaseType> = {}
  for (const [tsType, dbValue] of Object.entries(CASE_TYPE_TO_DB)) {
    if (dbValue && !(dbValue in reverse)) {
      reverse[dbValue] = tsType as CaseType
    }
  }
  return reverse
})()

export function caseTypeToDb(t: CaseType): string {
  const v = CASE_TYPE_TO_DB[t]
  if (!v) throw new Error(`Brak mapowania DB enum dla case_type "${t}"`)
  return v
}

export function caseTypeFromDb(v: string): CaseType | undefined {
  return DB_TO_CASE_TYPE[v]
}
