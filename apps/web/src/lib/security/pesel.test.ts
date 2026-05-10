import { describe, expect, it } from 'vitest'

import {
  getBirthDateFromPesel,
  getGenderFromPesel,
  isValidPesel,
  maskPesel,
} from './pesel'

// Programowo wyliczone testowe PESEL-e:
//   90050512341 — urodzony 5.05.1990, mężczyzna (10. cyfra=4 ⇒ parzysta? Sprawdźmy: 9005051234[1])
//                 → 10. cyfra (index 9) = 4 → parzysta → K... ale wynik calc to 1.
//   Poprawne dla testów: bazujemy na rzeczywiście wyliczonych z algorytmu.
//   - '90050512341'  (90.05.05, [1234] + checksum 1)  → przedostatnia (index 9) = 4 → K
//   - '90050523451'  (90.05.05, [2345] + checksum 1)  → przedostatnia (index 9) = 5 → M
const VALID_PESEL_K = '90050512341' // kobieta, ur. 5.05.1990
const VALID_PESEL_M = '90050523451' // mężczyzna, ur. 5.05.1990

describe('isValidPesel', () => {
  it('akceptuje prawidłowy PESEL z poprawną sumą kontrolną', () => {
    expect(isValidPesel(VALID_PESEL_K)).toBe(true)
    expect(isValidPesel(VALID_PESEL_M)).toBe(true)
  })

  it('odrzuca pusty string', () => {
    expect(isValidPesel('')).toBe(false)
  })

  it('odrzuca PESEL o złej długości', () => {
    expect(isValidPesel('1234567890')).toBe(false)
    expect(isValidPesel('123456789012')).toBe(false)
  })

  it('odrzuca PESEL z literami', () => {
    expect(isValidPesel('9005051234a')).toBe(false)
  })

  it('odrzuca PESEL z błędną cyfrą kontrolną', () => {
    // Bazujemy na VALID_PESEL_K = 90050512341, łamiemy checksum
    expect(isValidPesel('90050512342')).toBe(false)
    expect(isValidPesel('90050512349')).toBe(false)
  })

  it('odrzuca null/undefined/non-string', () => {
    // @ts-expect-error — celowo zły typ
    expect(isValidPesel(null)).toBe(false)
    // @ts-expect-error
    expect(isValidPesel(undefined)).toBe(false)
    // @ts-expect-error
    expect(isValidPesel(12345678901)).toBe(false)
  })
})

describe('maskPesel', () => {
  it('maskuje pierwsze 7 cyfr', () => {
    expect(maskPesel('90050512341')).toBe('*******2341')
  })

  it('zwraca same gwiazdki dla krótkich wartości', () => {
    expect(maskPesel('123')).toBe('***')
  })

  it('zwraca pusty string dla pustego inputu', () => {
    expect(maskPesel('')).toBe('')
  })
})

describe('getBirthDateFromPesel', () => {
  it('odczytuje datę z PESEL urodzonego w XX wieku', () => {
    const d = getBirthDateFromPesel(VALID_PESEL_K) // 5.05.1990
    expect(d).not.toBeNull()
    expect(d!.getUTCFullYear()).toBe(1990)
    expect(d!.getUTCMonth()).toBe(4) // maj = 4 (0-indexed)
    expect(d!.getUTCDate()).toBe(5)
  })

  it('zwraca null dla nieprawidłowego PESEL', () => {
    expect(getBirthDateFromPesel('90050512342')).toBeNull()
  })
})

describe('getGenderFromPesel', () => {
  it('rozpoznaje mężczyznę po nieparzystej 10. cyfrze', () => {
    // VALID_PESEL_M = 90050523451 → index 9 = '5' → nieparzysta → M
    expect(getGenderFromPesel(VALID_PESEL_M)).toBe('M')
  })

  it('rozpoznaje kobietę po parzystej 10. cyfrze', () => {
    // VALID_PESEL_K = 90050512341 → index 9 = '4' → parzysta → K
    expect(getGenderFromPesel(VALID_PESEL_K)).toBe('K')
  })

  it('zwraca null dla nieprawidłowego PESEL', () => {
    expect(getGenderFromPesel('90050512342')).toBeNull()
  })
})
