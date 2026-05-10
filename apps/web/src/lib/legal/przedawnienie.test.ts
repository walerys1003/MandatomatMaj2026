/**
 * Testy jednostkowe kalkulatora przedawnienia.
 * Uruchamiane przez Vitest (konfiguracja w T5-DEV).
 */

import { describe, expect, it } from 'vitest'
import {
  calcPrzedawnienie,
  formatDate,
  getSupportedReasons,
  isPrzedawnione,
  PrzedawnienieError,
} from './przedawnienie'

describe('calcPrzedawnienie', () => {
  it('wykroczenie — przedawnienie 1 rok od czynu (KW art. 45 § 1)', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2024-01-15'),
      caseType: 'M1_mandat_predkosc',
      referenceDate: new Date('2025-06-01'),
    })

    expect(result.okresLat).toBe(1)
    expect(result.podstawaPrawna).toContain('art. 45 § 1 KW')
    expect(result.expiresAt.toISOString().slice(0, 10)).toBe('2025-01-15')
    expect(result.isExpired).toBe(true)
    expect(result.daysRemaining).toBeLessThan(0)
  })

  it('e-TOLL — przedawnienie 5 lat (kara administracyjna)', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2024-03-10'),
      caseType: 'E1_etoll_odwolanie_kara',
      referenceDate: new Date('2024-12-01'),
    })

    expect(result.okresLat).toBe(5)
    expect(result.expiresAt.toISOString().slice(0, 10)).toBe('2029-03-10')
    expect(result.isExpired).toBe(false)
  })

  it('SPP parking — 1 rok od naliczenia opłaty', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2024-06-01'),
      caseType: 'P1_parking_spp',
      referenceDate: new Date('2025-12-01'),
    })

    expect(result.okresLat).toBe(1)
    expect(result.isExpired).toBe(true)
  })

  it('windykacja — 3 lata dla działalności gospodarczej', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2022-01-01'),
      caseType: 'W1_windykacja_przedawnienie',
      referenceDate: new Date('2025-06-01'),
    })

    expect(result.okresLat).toBe(3)
    expect(result.isExpired).toBe(true)
  })

  it('OC — 3 lata od zdarzenia (delikt)', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2022-05-15'),
      caseType: 'U1_ubezp_odwolanie_decyzja',
      referenceDate: new Date('2025-06-01'),
    })

    expect(result.okresLat).toBe(3)
    expect(result.isExpired).toBe(true)
    expect(result.uwagi.some((u) => u.includes('10 lat'))).toBe(true)
  })

  it('przerwanie biegu — odlicza od daty przerwy (art. 123 KC)', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2020-01-01'),
      reason: 'KC_DZIALALNOSC',
      przerwanyOd: new Date('2023-06-15'),
      referenceDate: new Date('2024-01-01'),
    })

    expect(result.okresLat).toBe(3)
    expect(result.expiresAt.toISOString().slice(0, 10)).toBe('2026-06-15')
    expect(result.isExpired).toBe(false)
    expect(result.uwagi.some((u) => u.includes('przerwany'))).toBe(true)
  })

  it('zawieszenie biegu — dolicza dni zawieszenia (art. 121 KC)', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2024-01-01'),
      reason: 'KC_OGOLNE',
      zawieszenieDays: 30,
      referenceDate: new Date('2024-06-01'),
    })

    // 6 lat + 30 dni = 2030-01-31
    expect(result.expiresAt.toISOString().slice(0, 10)).toBe('2030-01-31')
    expect(result.uwagi.some((u) => u.includes('30 dni'))).toBe(true)
  })

  it('explicit reason nadpisuje mapowanie z caseType', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2024-01-01'),
      caseType: 'M1_mandat_predkosc', // map: WYKROCZENIE_CZYN (1 rok)
      reason: 'KC_OC_PRZESTEPSTWO', // override: 20 lat
      referenceDate: new Date('2024-06-01'),
    })

    expect(result.okresLat).toBe(20)
    expect(result.reason).toBe('KC_OC_PRZESTEPSTWO')
  })

  it('rzuca błąd gdy brak reason i caseType bez mapowania', () => {
    expect(() =>
      calcPrzedawnienie({
        startDate: new Date('2024-01-01'),
        caseType: 'T1_techn_pelnomocnictwo',
      }),
    ).toThrow(PrzedawnienieError)
  })

  it('rzuca błąd dla nieprawidłowej daty', () => {
    expect(() =>
      calcPrzedawnienie({
        startDate: new Date('invalid'),
        reason: 'WYKROCZENIE_CZYN',
      }),
    ).toThrow(PrzedawnienieError)
  })

  it('rzuca błąd dla ujemnego zawieszenia', () => {
    expect(() =>
      calcPrzedawnienie({
        startDate: new Date('2024-01-01'),
        reason: 'KC_OGOLNE',
        zawieszenieDays: -5,
      }),
    ).toThrow(PrzedawnienieError)
  })

  it('liczba dni do przedawnienia jest dokładna', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2024-01-01'),
      reason: 'WYKROCZENIE_CZYN',
      referenceDate: new Date('2024-06-01'), // 152 dni od 2024-01-01
    })
    // Przedawnienie 2025-01-01, ref 2024-06-01 → ~214 dni
    expect(result.daysRemaining).toBeGreaterThan(200)
    expect(result.daysRemaining).toBeLessThan(220)
  })

  it('EPU nakaz — 6 lat (art. 125 § 1 KC)', () => {
    const result = calcPrzedawnienie({
      startDate: new Date('2018-01-01'),
      caseType: 'W3_windykacja_sprzeciw_epu',
      referenceDate: new Date('2025-01-01'),
    })

    expect(result.okresLat).toBe(6)
    expect(result.isExpired).toBe(true)
  })
})

describe('isPrzedawnione', () => {
  it('zwraca true dla przedawnionego mandatu', () => {
    expect(
      isPrzedawnione(
        new Date('2020-01-01'),
        'M1_mandat_predkosc',
        new Date('2025-01-01'),
      ),
    ).toBe(true)
  })

  it('zwraca false dla świeżej sprawy e-TOLL', () => {
    expect(
      isPrzedawnione(
        new Date('2024-01-01'),
        'E1_etoll_odwolanie_kara',
        new Date('2025-01-01'),
      ),
    ).toBe(false)
  })

  it('zwraca false bezpiecznie gdy brak mapowania', () => {
    expect(
      isPrzedawnione(
        new Date('2020-01-01'),
        'T1_techn_pelnomocnictwo',
        new Date('2025-01-01'),
      ),
    ).toBe(false)
  })
})

describe('formatDate', () => {
  it('formatuje datę w polskim formacie DD.MM.YYYY', () => {
    expect(formatDate(new Date('2024-03-15'))).toBe('15.03.2024')
    expect(formatDate(new Date('2024-12-01'))).toBe('01.12.2024')
  })
})

describe('getSupportedReasons', () => {
  it('zwraca listę wszystkich powodów z opisami', () => {
    const reasons = getSupportedReasons()
    expect(reasons.length).toBeGreaterThan(10)
    expect(reasons.every((r) => r.podstawaPrawna && r.label && r.lata > 0)).toBe(
      true,
    )
  })

  it('zawiera kluczowe kategorie', () => {
    const values = getSupportedReasons().map((r) => r.value)
    expect(values).toContain('WYKROCZENIE_CZYN')
    expect(values).toContain('KC_OGOLNE')
    expect(values).toContain('ETOLL_KARA')
    expect(values).toContain('SPP_OPLATA')
  })
})
