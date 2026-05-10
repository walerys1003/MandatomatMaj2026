import { beforeEach, describe, expect, it } from 'vitest'

import {
  buildCachedSystemBlock,
  cacheStats,
  isWorthCaching,
  recordCacheUsage,
} from './prompt-cache'

describe('buildCachedSystemBlock', () => {
  it('builds a content block with ephemeral cache_control', () => {
    const b = buildCachedSystemBlock('hello world')
    expect(b.type).toBe('text')
    expect(b.text).toBe('hello world')
    expect(b.cache_control.type).toBe('ephemeral')
  })
})

describe('isWorthCaching', () => {
  it('returns false for short text', () => {
    expect(isWorthCaching('short prompt')).toBe(false)
  })

  it('returns true for long text >= 4000 chars', () => {
    const long = 'x'.repeat(4000)
    expect(isWorthCaching(long)).toBe(true)
  })
})

describe('cacheStats', () => {
  beforeEach(() => {
    cacheStats.reset()
  })

  it('starts empty', () => {
    expect(cacheStats.snapshot()).toEqual({
      hits: 0,
      misses: 0,
      writes: 0,
      hitRate: 0,
    })
  })

  it('records hits via recordCacheUsage', () => {
    recordCacheUsage({ cache_read_input_tokens: 100 })
    expect(cacheStats.snapshot().hits).toBe(1)
  })

  it('records writes via recordCacheUsage', () => {
    recordCacheUsage({ cache_creation_input_tokens: 100 })
    expect(cacheStats.snapshot().writes).toBe(1)
  })

  it('records both hits and writes', () => {
    recordCacheUsage({
      cache_creation_input_tokens: 50,
      cache_read_input_tokens: 200,
    })
    expect(cacheStats.snapshot()).toMatchObject({ hits: 1, writes: 1 })
  })

  it('reset clears stats', () => {
    recordCacheUsage({ cache_read_input_tokens: 100 })
    cacheStats.reset()
    expect(cacheStats.snapshot().hits).toBe(0)
  })
})
