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

/** All 34 case sub-types grouped by category prefix. */
export const CASE_TYPES = [
  // Mandaty (M1-M7)
  'M1_mandat_predkosc',
  'M2_mandat_skrzyzowanie',
  'M3_mandat_telefon',
  'M4_mandat_pasy',
  'M5_mandat_parkowanie',
  'M6_mandat_dokumenty',
  'M7_mandat_inny',
  // Parking (P1-P4)
  'P1_parking_strefa_platna',
  'P2_parking_zakaz_postoju',
  'P3_parking_oplata_dodatkowa',
  'P4_parking_holowanie',
  // Windykacja (W1-W5)
  'W1_windykacja_przedawnienie',
  'W2_windykacja_brak_dlugu',
  'W3_windykacja_naruszenie_rodo',
  'W4_windykacja_komornik',
  'W5_windykacja_bik',
  // Ubezpieczenia (U1-U3)
  'U1_ubezp_odmowa_wyplaty',
  'U2_ubezp_zanizone',
  'U3_ubezp_oc_komunikacyjne',
  // e-TOLL (E1-E3)
  'E1_etoll_brak_oplaty',
  'E2_etoll_naruszenie',
  'E3_etoll_blad_systemu',
  // Kontrole drogowe (K1-K4)
  'K1_kontrola_alkomat',
  'K2_kontrola_przeszukanie',
  'K3_kontrola_zatrzymanie_prawa_jazdy',
  'K4_kontrola_inne',
  // Techniczne (T1-T4)
  'T1_techn_brak_badan',
  'T2_techn_negatywny_wynik',
  'T3_techn_oc_badanie',
  'T4_techn_zatrzymanie_dowodu',
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
