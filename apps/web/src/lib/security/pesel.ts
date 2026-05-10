/**
 * PESEL — helpers walidacji i maskowania.
 *
 * Szyfrowanie odbywa się na poziomie bazy (migration 012):
 *  - trigger `profiles_encrypt_pesel` BEFORE INSERT/UPDATE szyfruje
 *    `NEW.pesel` do `NEW.pesel_encrypted` (BYTEA, AES-256 via pgcrypto)
 *    i zeruje plaintext (NEW.pesel = NULL).
 *  - klucz w GUC `app.settings.pesel_encryption_key` (env PESEL_ENCRYPTION_KEY,
 *    min. 32 znaki, ustawiony na poziomie Supabase project settings).
 *  - odczyt: `SELECT public.decrypt_pesel(pesel_encrypted)` — tylko service_role
 *    (RLS bypass) oraz w server-only kontekstach (Server Action / API route).
 *
 * Ten plik dostarcza walidację (algorytm sumy kontrolnej) + maskowanie
 * (`12345678901` → `*****8901`) dla UI / promptów AI.
 */

const PESEL_WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3] as const

/**
 * Walidacja PESEL — sprawdza długość, cyfry oraz cyfrę kontrolną.
 * Algorytm: suma (cyfra_i * waga_i) mod 10, wynik powinien równać się
 * (10 - ostatnia cyfra) mod 10.
 */
export function isValidPesel(pesel: string): boolean {
  if (typeof pesel !== 'string') return false
  if (!/^\d{11}$/.test(pesel)) return false

  let sum = 0
  for (let i = 0; i < 10; i++) {
    const digit = Number(pesel[i])
    const weight = PESEL_WEIGHTS[i]
    if (Number.isNaN(digit) || weight === undefined) return false
    sum += digit * weight
  }
  const checksum = (10 - (sum % 10)) % 10
  return checksum === Number(pesel[10])
}

/**
 * Maskowanie PESEL — pokazuje tylko ostatnie 4 cyfry.
 * Używane w UI po pobraniu z `decrypt_pesel(...)` oraz w promptach AI
 * (prompt `m1-sprzeciw-predkosc.ts` zaznacza `pesel_zaszyfrowany: string`).
 */
export function maskPesel(pesel: string): string {
  if (!pesel || pesel.length < 4) return '*'.repeat(pesel.length || 0)
  const last4 = pesel.slice(-4)
  return `${'*'.repeat(pesel.length - 4)}${last4}`
}

/**
 * Wyciąga datę urodzenia z PESEL.
 * Stulecie kodowane w miesiącu:
 *   1800-1899: +80 (np. 81-92)
 *   1900-1999: +0  (01-12)
 *   2000-2099: +20 (21-32)
 *   2100-2199: +40 (41-52)
 *   2200-2299: +60 (61-72)
 */
export function getBirthDateFromPesel(pesel: string): Date | null {
  if (!isValidPesel(pesel)) return null
  const yy = Number(pesel.slice(0, 2))
  const mm = Number(pesel.slice(2, 4))
  const dd = Number(pesel.slice(4, 6))

  let year: number
  let month: number
  if (mm >= 1 && mm <= 12) {
    year = 1900 + yy
    month = mm
  } else if (mm >= 21 && mm <= 32) {
    year = 2000 + yy
    month = mm - 20
  } else if (mm >= 41 && mm <= 52) {
    year = 2100 + yy
    month = mm - 40
  } else if (mm >= 61 && mm <= 72) {
    year = 2200 + yy
    month = mm - 60
  } else if (mm >= 81 && mm <= 92) {
    year = 1800 + yy
    month = mm - 80
  } else {
    return null
  }

  const date = new Date(Date.UTC(year, month - 1, dd))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== dd
  ) {
    return null
  }
  return date
}

/**
 * Płeć z PESEL — przedostatnia cyfra: parzysta=K, nieparzysta=M.
 */
export function getGenderFromPesel(pesel: string): 'M' | 'K' | null {
  if (!isValidPesel(pesel)) return null
  const digit = Number(pesel[9])
  if (Number.isNaN(digit)) return null
  return digit % 2 === 0 ? 'K' : 'M'
}
