import { describe, expect, it } from 'vitest'

import { estimateCostCents, pickModel } from './model-router'

describe('pickModel', () => {
  it('returns Haiku for scoring', () => {
    expect(pickModel({ purpose: 'scoring' })).toBe('claude-haiku-4-5')
  })

  it('returns Haiku for validate', () => {
    expect(pickModel({ purpose: 'validate' })).toBe('claude-haiku-4-5')
  })

  it('returns Sonnet for OCR (vision quality)', () => {
    expect(pickModel({ purpose: 'ocr' })).toBe('claude-sonnet-4-5-20250929')
  })

  it('returns Sonnet for generate default', () => {
    expect(pickModel({ purpose: 'generate' })).toBe('claude-sonnet-4-5-20250929')
  })

  it('routes to Opus for old cases', () => {
    expect(pickModel({ purpose: 'generate', caseAgeMonths: 24 })).toBe('claude-opus-4-5')
  })

  it('routes to Opus for high-stakes amounts', () => {
    expect(pickModel({ purpose: 'generate', amountPln: 10000 })).toBe('claude-opus-4-5')
  })

  it('routes to Opus for many attachments', () => {
    expect(pickModel({ purpose: 'generate', attachmentCount: 8 })).toBe('claude-opus-4-5')
  })

  it('respects forceHaiku override', () => {
    expect(pickModel({ purpose: 'generate', amountPln: 9999, forceHaiku: true })).toBe(
      'claude-haiku-4-5',
    )
  })

  it('respects forceOpus override', () => {
    expect(pickModel({ purpose: 'scoring', forceOpus: true })).toBe('claude-opus-4-5')
  })
})

describe('estimateCostCents', () => {
  it('Haiku scoring cheapest', () => {
    const c = estimateCostCents('claude-haiku-4-5', 'scoring')
    expect(c).toBeLessThan(1)
  })

  it('Opus generate most expensive', () => {
    const c = estimateCostCents('claude-opus-4-5', 'generate')
    expect(c).toBeGreaterThan(10)
  })

  it('Sonnet generate is between Haiku and Opus', () => {
    const haiku = estimateCostCents('claude-haiku-4-5', 'generate')
    const sonnet = estimateCostCents('claude-sonnet-4-5-20250929', 'generate')
    const opus = estimateCostCents('claude-opus-4-5', 'generate')
    expect(sonnet).toBeGreaterThan(haiku)
    expect(opus).toBeGreaterThan(sonnet)
  })
})
