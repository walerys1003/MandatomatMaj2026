import { createClient } from '@/lib/supabase/server'

/**
 * Walidacja kodu promocyjnego.
 *
 * Zasady (z chunka T10):
 *  - kod aktywny (is_active = true)
 *  - mieści się w oknie czasowym (valid_from..valid_until)
 *  - nie przekroczono limitu max_uses
 *  - applicable_products: NULL = wszystkie produkty, lub product_code w array
 */

export interface PromoValidationResult {
  valid: boolean
  code?: string
  discountPercent?: number
  reason?: string
}

export async function validatePromoCode(
  rawCode: string,
  productCode: string,
): Promise<PromoValidationResult> {
  const code = rawCode.trim().toUpperCase()
  if (!code || code.length < 3 || code.length > 32) {
    return { valid: false, reason: 'Nieprawidłowy format kodu.' }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('promo_codes')
    .select('code, discount_percent, max_uses, current_uses, valid_from, valid_until, applicable_products, is_active')
    .eq('code', code)
    .maybeSingle()

  if (error) {
    return { valid: false, reason: 'Błąd walidacji kodu.' }
  }
  if (!data) {
    return { valid: false, reason: 'Kod promocyjny nie istnieje.' }
  }

  const row = data as {
    code: string
    discount_percent: number
    max_uses: number | null
    current_uses: number
    valid_from: string | null
    valid_until: string | null
    applicable_products: string[] | null
    is_active: boolean
  }

  if (!row.is_active) {
    return { valid: false, reason: 'Kod promocyjny nieaktywny.' }
  }

  const now = new Date()
  if (row.valid_from && new Date(row.valid_from) > now) {
    return { valid: false, reason: 'Kod jeszcze nie obowiązuje.' }
  }
  if (row.valid_until && new Date(row.valid_until) < now) {
    return { valid: false, reason: 'Kod wygasł.' }
  }

  if (row.max_uses !== null && row.current_uses >= row.max_uses) {
    return { valid: false, reason: 'Limit użyć kodu wyczerpany.' }
  }

  if (row.applicable_products && row.applicable_products.length > 0) {
    if (!row.applicable_products.includes(productCode)) {
      return { valid: false, reason: 'Kod nie obowiązuje na ten produkt.' }
    }
  }

  return {
    valid: true,
    code: row.code,
    discountPercent: row.discount_percent,
  }
}

/** Inkrementacja current_uses — wywoływane po pomyślnej płatności (webhook). */
export async function incrementPromoUsage(code: string): Promise<void> {
  const supabase = createClient()
  // Atomic increment: SQL function call (jeśli istnieje) lub fallback do read-modify-write
  // Próbujemy RPC; jeśli nie ma, pomijamy (idempotency w webhooku zabezpieczy nas przed double-counting)
  const { error } = await supabase.rpc('increment_promo_usage', { p_code: code })
  if (error) {
    // Fallback: zwykły UPDATE (mniej bezpieczny, ale akceptowalny)
    const { data } = await supabase
      .from('promo_codes')
      .select('current_uses')
      .eq('code', code)
      .maybeSingle()
    const current = (data as { current_uses?: number } | null)?.current_uses ?? 0
    await supabase
      .from('promo_codes')
      .update({ current_uses: current + 1 })
      .eq('code', code)
  }
}
