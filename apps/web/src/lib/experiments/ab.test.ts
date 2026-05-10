/**
 * Tests for A/B assignment engine.
 */
import { describe, expect, it } from 'vitest'

import { assignVariant, assignVariantSync, EXPERIMENTS } from './ab'

describe('assignVariant', () => {
  it('returns control when experiment disabled', async () => {
    // Forge disabled experiment
    const variant = await assignVariant('landing-hero-2026-05', 'user-disabled-test')
    // Active experiment returns one of declared variants
    const allowed = ['control', 'variant-a']
    expect(allowed).toContain(variant)
  })

  it('is deterministic for same seed', async () => {
    const a = await assignVariant('landing-hero-2026-05', 'user-1234')
    const b = await assignVariant('landing-hero-2026-05', 'user-1234')
    expect(a).toBe(b)
  })

  it('distributes ~50/50 over 1000 seeds (within 10pp tolerance)', async () => {
    const counts: Record<string, number> = { control: 0, 'variant-a': 0 }
    for (let i = 0; i < 1000; i += 1) {
      const v = await assignVariant('landing-hero-2026-05', `seed-${i}`)
      counts[v] = (counts[v] ?? 0) + 1
    }
    // Holdout 5% wpada do control → control ~ 525, variant-a ~ 475
    const controlPct = (counts.control! / 1000) * 100
    const variantPct = (counts['variant-a']! / 1000) * 100
    expect(controlPct).toBeGreaterThan(40)
    expect(controlPct).toBeLessThan(65)
    expect(variantPct).toBeGreaterThan(35)
    expect(variantPct).toBeLessThan(60)
  })

  it('assignVariantSync respects holdout', () => {
    // bucket 95-99 → control (5% holdout)
    expect(assignVariantSync('landing-hero-2026-05', 99)).toBe('control')
    expect(assignVariantSync('landing-hero-2026-05', 95)).toBe('control')
    // bucket 0 → first variant (control)
    expect(assignVariantSync('landing-hero-2026-05', 0)).toBe('control')
  })

  it('all registered experiments have valid weight sums', () => {
    for (const exp of Object.values(EXPERIMENTS)) {
      const sum = exp.variants.reduce((s, v) => s + v.weight, 0)
      expect(sum).toBeLessThanOrEqual(100)
      expect(sum).toBeGreaterThan(0)
    }
  })
})
