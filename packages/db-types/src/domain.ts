/**
 * Domain enums shared across web/api/jobs.
 *
 * These mirror Postgres ENUM types from migrations 002–015. Until the
 * Supabase generator is wired up, treat these as the source of truth on the
 * TypeScript side.
 */

export const CASE_CATEGORIES = [
  'mandaty',
  'parking',
  'windykacja',
  'ubezpieczenia',
  'etoll',
  'kontrole',
  'techniczne',
] as const

export type CaseCategory = (typeof CASE_CATEGORIES)[number]

/** All 29 case sub-types — typ pisma/procedura zgodnie ze specyfikacją Mandatomat. */
export const CASE_TYPES = [
  // Mandaty (M1-M7) — drogowe + administracyjne
  'M1_mandat_predkosc',           // Sprzeciw od mandatu za przekroczenie prędkości
  'M2_mandat_odmowa_przyjecia',   // Odmowa przyjęcia mandatu (art. 97 § 2 KPSW)
  'M3_mandat_uchylenie',          // Wniosek o uchylenie prawomocnego mandatu (art. 101 KPSW)
  'M4_mandat_straz_gminna',       // Odwołanie od mandatu straży gminnej/miejskiej
  'M5_mandat_straz_fotoradar',    // Odwołanie SM/SG fotoradar mobilny (kompetencje od 2016)
  'M6_mandat_itd',                // Odwołanie od kary ITD (transport drogowy)
  'M7_mandat_odroczenie_raty',    // Wniosek o odroczenie/raty (Ordynacja podatkowa)
  // Parking (P1-P4)
  'P1_parking_spp',               // Reklamacja opłaty dodatkowej SPP
  'P2_parking_zdm',               // Reklamacja opłaty ZDM
  'P3_parking_ztm',               // Odwołanie ZTM/MPK (jazda bez biletu)
  'P4_parking_blad_identyfikacji',// Sprzeciw od opłaty z błędem identyfikacji ANPR
  // Windykacja (W1-W5)
  'W1_windykacja_przedawnienie',  // Odpowiedź na wezwanie z zarzutem przedawnienia
  'W2_windykacja_odpowiedz',      // Odpowiedź na wezwanie windykacyjne
  'W3_windykacja_sprzeciw_epu',   // Sprzeciw od nakazu zapłaty w EPU (Lublin-Zachód)
  'W4_windykacja_krd_bik',        // Wniosek o usunięcie wpisu KRD/BIK/ERIF
  'W5_windykacja_skarga_rf',      // Skarga do RF na windykatora
  // Ubezpieczenia (U1-U3)
  'U1_ubezp_odwolanie_decyzja',   // Odwołanie od decyzji ubezpieczyciela (OC/AC/NNW)
  'U2_ubezp_wezwanie_wyplata',    // Wezwanie do wypłaty odszkodowania
  'U3_ubezp_skarga_rf',           // Skarga do RF na ubezpieczyciela
  // e-TOLL (E1-E3)
  'E1_etoll_odwolanie_kara',      // Odwołanie od kary GITD e-TOLL
  'E2_etoll_reklamacja_podwojne', // Reklamacja podwójnego naliczenia
  'E3_etoll_anulowanie',          // Wniosek o umorzenie/odstąpienie/raty (e-TOLL)
  // Kontrole drogowe (K1-K4)
  'K1_kontrola_zatrzymanie_pj',   // Sprzeciw od zatrzymania prawa jazdy
  'K2_kontrola_cofniecie_cepik',  // Wniosek o cofnięcie decyzji o cofnięciu uprawnień
  'K3_kontrola_weryfikacja_urzadzenia', // Wniosek dowodowy o weryfikację urządzenia
  'K4_kontrola_korekta_punktow',  // Wniosek o korektę punktów karnych w CEPiK
  // Techniczne / pomocnicze (T1-T4)
  'T1_techn_pelnomocnictwo',      // Pełnomocnictwo procesowe/administracyjne
  'T2_techn_rodo_dostep',         // Wniosek RODO o dostęp (art. 15)
  'T3_techn_rodo_usuniecie',      // Wniosek RODO o usunięcie (art. 17)
  'T4_techn_lista_zalacznikow',   // Generator listy załączników
] as const

export type CaseType = (typeof CASE_TYPES)[number]

export const CASE_STATUSES = [
  'draft',
  'in_progress',
  'awaiting_payment',
  'generating',
  'ready',
  'sent',
  'archived',
  'failed',
] as const

export type CaseStatus = (typeof CASE_STATUSES)[number]

export const SUBSCRIPTION_PLANS = ['free', 'kierowca', 'pro'] as const
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number]

export const USER_ROLES = ['user', 'admin', 'moderator'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const DOCUMENT_TYPES = [
  'odwolanie',
  'wniosek',
  'reklamacja',
  'odpowiedz',
  'sprzeciw',
  'pozew',
] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const OCR_STATUSES = ['pending', 'processing', 'done', 'failed'] as const
export type OcrStatus = (typeof OCR_STATUSES)[number]

export const PAYMENT_TYPES = ['pay_per_doc', 'subscription', 'topup'] as const
export type PaymentType = (typeof PAYMENT_TYPES)[number]

export const PAYMENT_STATUSES = ['pending', 'succeeded', 'failed', 'refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

/** Mapping category → human readable label (PL). */
export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  mandaty: 'Mandaty drogowe',
  parking: 'Mandaty parkingowe',
  windykacja: 'Windykacja i długi',
  ubezpieczenia: 'Ubezpieczenia',
  etoll: 'e-TOLL',
  kontrole: 'Kontrole drogowe',
  techniczne: 'Badania techniczne',
}
