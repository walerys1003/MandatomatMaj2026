import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Referral system — Faza 9 z roadmapy T20:
 *   "Referral system (polecenie = 20% zniżka)".
 *
 * Każdy user dostaje przy rejestracji `profiles.referral_code` (format `MND-XXXXXXXX`,
 * trigger w migracji 001). Kod jest globalnie unikalny.
 *
 * Flow:
 *   1. User A udostępnia kod znajomym (URL: ?ref=MND-XXXXXXXX)
 *   2. User B rejestruje się — w form `referral_code` zapisuje się do `profiles.referred_by`
 *      (atrybucja). Po confirm emaila B → /witaj.
 *   3. Przy pierwszym checkout B (status='preview', brak wcześniejszych płatności)
 *      `applyReferralDiscount` daje 20% zniżki — bez konieczności wpisywania kodu.
 *   4. Po pomyślnej płatności B emit event `referral_redeemed` (best-effort).
 *
 * Walidacje:
 *   - kod nie może być własnym kodem (anti-self-referral)
 *   - referrer musi istnieć i być != deleted
 *   - 1× zniżka 20% per user (tylko pierwszy zakup)
 */

export const REFERRAL_DISCOUNT_PERCENT = 20

export interface ReferralStats {
  /** Twój kod referral (np. "MND-A1B2C3D4"). */
  code: string
  /** Liczba osób, które zarejestrowały się z Twoim kodem. */
  signups: number
  /** Liczba osób, które dokonały płatności po rejestracji z Twoim kodem. */
  conversions: number
}

export interface ReferralValidationResult {
  valid: boolean
  /** Kod referrera (po walidacji, uppercased). */
  code?: string
  /** UUID referrera w `profiles`. */
  referrerId?: string
  reason?: string
}

const REFERRAL_CODE_RE = /^MND-[A-F0-9]{8}$/i

/**
 * Walidacja kodu referral — sprawdza, czy kod istnieje i należy do innego usera.
 * NIE sprawdza, czy aktualny user już użył referral (to robi `applyReferralDiscount`).
 */
export async function validateReferralCode(
  rawCode: string,
  currentUserId: string | null,
): Promise<ReferralValidationResult> {
  const code = rawCode.trim().toUpperCase()
  if (!REFERRAL_CODE_RE.test(code)) {
    return { valid: false, reason: 'Nieprawidłowy format kodu (oczekiwany: MND-XXXXXXXX).' }
  }

  // Service-role: musi czytać z `profiles` poza RLS żeby znaleźć referrera po kodzie.
  // Sam profile referrera NIE jest zwracany — zwracamy tylko UUID + kod.
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('id, referral_code, deleted_at')
    .eq('referral_code', code)
    .maybeSingle()

  if (error || !data) {
    return { valid: false, reason: 'Kod referral nie istnieje.' }
  }
  const row = data as { id: string; referral_code: string; deleted_at: string | null }

  if (row.deleted_at) {
    return { valid: false, reason: 'Kod referral nieaktywny.' }
  }
  if (currentUserId && row.id === currentUserId) {
    return { valid: false, reason: 'Nie możesz użyć własnego kodu referral.' }
  }

  return { valid: true, code: row.referral_code, referrerId: row.id }
}

/**
 * Atrybucja referrala — zapisuje `referred_by` do profilu nowo zarejestrowanego usera.
 * Wywoływane przez API `POST /api/referral/redeem` po potwierdzeniu emaila.
 *
 * Idempotentne: jeśli user już ma `referred_by`, zwracamy `{updated: false}`.
 */
export async function attributeReferral(
  userId: string,
  referralCode: string,
): Promise<{ updated: boolean; referrerId?: string; reason?: string }> {
  const validation = await validateReferralCode(referralCode, userId)
  if (!validation.valid || !validation.referrerId || !validation.code) {
    return { updated: false, reason: validation.reason ?? 'Kod referral nieprawidłowy.' }
  }

  const supabase = createClient()
  const { data: existing } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', userId)
    .maybeSingle()

  const existingRef = (existing as { referred_by: string | null } | null)?.referred_by
  if (existingRef && existingRef.length > 0) {
    return { updated: false, reason: 'Referral już został wcześniej przypisany.' }
  }

  const { error: updErr } = await supabase
    .from('profiles')
    .update({ referred_by: validation.code, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (updErr) {
    return { updated: false, reason: 'Nie udało się zapisać referrala.' }
  }

  return { updated: true, referrerId: validation.referrerId }
}

/**
 * Sprawdza, czy user kwalifikuje się do referral discount na pierwszym zakupie.
 * Zwraca `discountPercent` jeśli tak, w przeciwnym razie 0.
 *
 * Reguły:
 *   - user ma `referred_by`
 *   - user nie ma żadnej `payments` o status='succeeded' (tylko pierwszy zakup)
 */
export async function getReferralDiscount(userId: string): Promise<{
  applicable: boolean
  discountPercent: number
  referredBy: string | null
}> {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', userId)
    .maybeSingle()

  const referredBy = (profile as { referred_by: string | null } | null)?.referred_by ?? null
  if (!referredBy) {
    return { applicable: false, discountPercent: 0, referredBy: null }
  }

  // Czy user ma już udane płatności? Jeśli tak — nie kwalifikuje się.
  const { data: payments } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'succeeded')
    .limit(1)

  const hasPaidBefore = Array.isArray(payments) && payments.length > 0
  if (hasPaidBefore) {
    return { applicable: false, discountPercent: 0, referredBy }
  }

  return {
    applicable: true,
    discountPercent: REFERRAL_DISCOUNT_PERCENT,
    referredBy,
  }
}

/**
 * Statystyki referrali dla danego usera.
 * Liczy ile osób zarejestrowało się z jego kodem (`profiles.referred_by = code`)
 * oraz ile z nich ma payments.status='succeeded'.
 */
export async function getReferralStats(userId: string): Promise<ReferralStats | null> {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .maybeSingle()

  const code = (profile as { referral_code: string | null } | null)?.referral_code
  if (!code) return null

  // Service-role: liczymy referees (RLS by ich nie pokazał — to dane innych userów)
  const admin = createAdminClient()
  const { data: signupsData } = await admin.from('profiles').select('id').eq('referred_by', code)

  const signups = Array.isArray(signupsData) ? signupsData.length : 0
  let conversions = 0
  if (signups > 0 && signupsData) {
    const ids = (signupsData as { id: string }[]).map((r) => r.id)
    const { data: paid } = await admin
      .from('payments')
      .select('user_id')
      .in('user_id', ids)
      .eq('status', 'succeeded')

    if (Array.isArray(paid)) {
      const distinct = new Set((paid as { user_id: string }[]).map((p) => p.user_id))
      conversions = distinct.size
    }
  }

  return { code, signups, conversions }
}
