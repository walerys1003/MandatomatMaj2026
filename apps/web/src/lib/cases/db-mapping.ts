import type { CaseType } from '@mandatomat/db-types'

/**
 * Mapowanie TS-owych wartości CaseType (M1, M4, P1, P3, W1, ...) →
 * wartości ENUM `case_type` w bazie (migracja 002).
 *
 * Uzasadnienie rozjazdu:
 *  - W TS używamy "shortId-style" (M1_mandat_predkosc) bo katalog/UI/AI
 *    łatwiej pracują na shortId.
 *  - W bazie ENUM był stworzony przed katalogiem (mandat_sprzeciw_predkosc).
 *
 * Zamiast modyfikować ENUM (kosztowne i ryzykowne — wymagałoby ALTER TYPE
 * + reindeks), trzymamy mapping w jednym miejscu.
 *
 * UWAGA: jeśli typ MVP nie ma odpowiednika w bazie ENUM, to migracja musi
 * zostać dodana zanim taki case_type zostanie zapisany. Dla 5 MVP poniżej
 * mamy odwzorowania.
 */

/** TS CaseType → DB enum value. */
export const CASE_TYPE_TO_DB: Partial<Record<CaseType, string>> = {
  // Mandaty
  M1_mandat_predkosc: 'mandat_sprzeciw_predkosc',
  M2_mandat_skrzyzowanie: 'mandat_odmowa_przyjecia',
  M3_mandat_telefon: 'mandat_uchylenie_prawomocny',
  M4_mandat_pasy: 'mandat_odwolanie_straz',
  M5_mandat_parkowanie: 'mandat_odwolanie_itd',
  M6_mandat_dokumenty: 'mandat_odroczenie_raty',
  M7_mandat_inny: 'mandat_uchylenie_punktow',

  // Parking
  P1_parking_strefa_platna: 'parking_reklamacja_zdm',
  P2_parking_zakaz_postoju: 'parking_sprzeciw_prywatny',
  P3_parking_oplata_dodatkowa: 'parking_odwolanie_ztm',
  P4_parking_holowanie: 'parking_blad_identyfikacji',

  // Windykacja
  W1_windykacja_przedawnienie: 'windykacja_przedawnienie',
  W2_windykacja_brak_dlugu: 'windykacja_odpowiedz_wezwanie',
  W3_windykacja_naruszenie_rodo: 'windykacja_skarga_rf',
  W4_windykacja_komornik: 'windykacja_sprzeciw_epu',
  W5_windykacja_bik: 'windykacja_usuniecie_krd_bik',

  // Ubezpieczenia
  U1_ubezp_odmowa_wyplaty: 'ubezpieczenie_odwolanie_decyzja',
  U2_ubezp_zanizone: 'ubezpieczenie_wezwanie_wyplata',
  U3_ubezp_oc_komunikacyjne: 'ubezpieczenie_skarga_rf',

  // e-TOLL
  E1_etoll_brak_oplaty: 'etoll_odwolanie_kara',
  E2_etoll_naruszenie: 'etoll_anulowanie',
  E3_etoll_blad_systemu: 'etoll_reklamacja_podwojne',

  // Kontrole
  K1_kontrola_alkomat: 'kontrola_weryfikacja_urzadzenia',
  K2_kontrola_przeszukanie: 'kontrola_cofniecie_decyzji',
  K3_kontrola_zatrzymanie_prawa_jazdy: 'kontrola_sprzeciw_zatrzymanie_pj',
  K4_kontrola_inne: 'kontrola_korekta_punktow',

  // Techniczne
  T1_techn_brak_badan: 'techniczne_lista_zalacznikow',
  T2_techn_negatywny_wynik: 'techniczne_pelnomocnictwo',
  T3_techn_oc_badanie: 'techniczne_rodo_dostep',
  T4_techn_zatrzymanie_dowodu: 'techniczne_rodo_usuniecie',
}

/** DB enum value → TS CaseType (reverse). */
export const DB_TO_CASE_TYPE: Record<string, CaseType> = Object.fromEntries(
  Object.entries(CASE_TYPE_TO_DB).map(([k, v]) => [v as string, k as CaseType]),
) as Record<string, CaseType>

export function caseTypeToDb(t: CaseType): string {
  const v = CASE_TYPE_TO_DB[t]
  if (!v) throw new Error(`Brak mapowania DB enum dla case_type "${t}"`)
  return v
}

export function caseTypeFromDb(v: string): CaseType | undefined {
  return DB_TO_CASE_TYPE[v]
}
