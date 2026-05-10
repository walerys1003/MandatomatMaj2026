import { describe, expect, it } from 'vitest'

import { extractPriorDefaults, shouldShowSkipOcr } from './funnel'

describe('shouldShowSkipOcr', () => {
  it('returns false before 15s', () => {
    const startedAt = Date.now() - 5_000
    expect(shouldShowSkipOcr(startedAt)).toBe(false)
  })

  it('returns true after 15s', () => {
    const startedAt = Date.now() - 16_000
    expect(shouldShowSkipOcr(startedAt)).toBe(true)
  })
})

describe('extractPriorDefaults', () => {
  it('returns empty object for no cases', () => {
    expect(extractPriorDefaults([])).toEqual({})
  })

  it('picks last case with values', () => {
    const result = extractPriorDefaults([
      { form_data: { imie: 'Jan' } },
      { form_data: null },
      { form_data: { imie: 'Anna', nazwisko: 'Kowalska', adres: 'Krakowska 1' } },
    ])
    expect(result.imie).toBe('Anna')
    expect(result.nazwisko).toBe('Kowalska')
    expect(result.adres).toBe('Krakowska 1')
  })

  it('falls back to older cases if newest is empty', () => {
    const result = extractPriorDefaults([
      { form_data: { imie: 'Jan' } },
      { form_data: {} },
      { form_data: null },
    ])
    expect(result.imie).toBe('Jan')
  })

  it('ignores PESEL or sensitive fields', () => {
    const result = extractPriorDefaults([
      {
        form_data: { imie: 'Jan', pesel: '12345678901', dowod: 'AAA123456' },
      },
    ])
    expect(result).toEqual({ imie: 'Jan' })
  })

  it('ignores non-string values', () => {
    const result = extractPriorDefaults([
      { form_data: { imie: 123 as unknown as string, nazwisko: 'OK' } },
    ])
    expect(result.imie).toBeUndefined()
    expect(result.nazwisko).toBe('OK')
  })
})
