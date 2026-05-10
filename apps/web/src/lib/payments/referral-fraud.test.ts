import { describe, expect, it } from 'vitest'

import {
  assessFraud,
  isSuspiciousEmailPair,
  normalizeEmail,
  REFERRAL_REWARD_CAP,
} from './referral-fraud'

describe('normalizeEmail', () => {
  it('strips "+xxx" suffix from gmail', () => {
    expect(normalizeEmail('Jan.Kowalski+test@gmail.com')).toBe('jankowalski@gmail.com')
  })

  it('strips dots in gmail localpart', () => {
    expect(normalizeEmail('jan.kowalski@gmail.com')).toBe('jankowalski@gmail.com')
  })

  it('does not strip dots in non-gmail', () => {
    expect(normalizeEmail('jan.kowalski@onet.pl')).toBe('jan.kowalski@onet.pl')
  })

  it('handles uppercase', () => {
    expect(normalizeEmail('JAN@WP.PL')).toBe('jan@wp.pl')
  })
})

describe('isSuspiciousEmailPair', () => {
  it('detects same normalized email', () => {
    expect(isSuspiciousEmailPair('jan+1@gmail.com', 'jan+2@gmail.com')).toBe(true)
  })

  it('detects numeric suffix variant', () => {
    expect(isSuspiciousEmailPair('jan@onet.pl', 'jan2@onet.pl')).toBe(true)
  })

  it('returns false for clearly different emails', () => {
    expect(isSuspiciousEmailPair('jan@onet.pl', 'anna@wp.pl')).toBe(false)
  })

  it('returns false for similar but distinct emails', () => {
    expect(isSuspiciousEmailPair('jan@onet.pl', 'janka@onet.pl')).toBe(false)
  })
})

describe('assessFraud', () => {
  const base = {
    referrerEmail: 'referrer@example.com',
    refereeEmail: 'referee@other.com',
    rewardsCount: 0,
    velocity24h: 0,
  }

  it('allows clean pair', () => {
    const v = assessFraud(base)
    expect(v.allow).toBe(true)
    expect(v.needsReview).toBe(false)
    expect(v.flags).toEqual([])
  })

  it('hard-rejects email fraud', () => {
    const v = assessFraud({ ...base, refereeEmail: 'referrer+evil@example.com' })
    expect(v.allow).toBe(false)
    expect(v.needsReview).toBe(false)
    expect(v.flags).toContain('email_pattern_fraud')
  })

  it('hard-rejects when cap reached', () => {
    const v = assessFraud({ ...base, rewardsCount: REFERRAL_REWARD_CAP })
    expect(v.allow).toBe(false)
    expect(v.needsReview).toBe(false)
    expect(v.flags[0]).toMatch(/cap_reached/)
  })

  it('soft-blocks IP collision', () => {
    const v = assessFraud({
      ...base,
      referrerIp: '1.2.3.4',
      refereeIp: '1.2.3.4',
    })
    expect(v.allow).toBe(false)
    expect(v.needsReview).toBe(true)
    expect(v.flags).toContain('ip_collision')
  })

  it('soft-blocks device collision', () => {
    const v = assessFraud({
      ...base,
      referrerDeviceId: 'dev-abc',
      refereeDeviceId: 'dev-abc',
    })
    expect(v.needsReview).toBe(true)
    expect(v.flags).toContain('device_collision')
  })

  it('soft-blocks velocity exceeded', () => {
    const v = assessFraud({ ...base, velocity24h: 10 })
    expect(v.needsReview).toBe(true)
    expect(v.flags[0]).toMatch(/velocity_exceeded/)
  })

  it('combines multiple soft signals', () => {
    const v = assessFraud({
      ...base,
      referrerIp: '1.1.1.1',
      refereeIp: '1.1.1.1',
      velocity24h: 99,
    })
    expect(v.flags.length).toBeGreaterThanOrEqual(2)
    expect(v.needsReview).toBe(true)
  })
})
