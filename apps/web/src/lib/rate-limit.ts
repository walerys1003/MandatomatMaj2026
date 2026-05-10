/**
 * Rate limiter — Upstash Redis (REST API, edge-compatible).
 *
 * Source: knowledge base T08_backend_middleware_claude + plan T2-SEC-010.
 *
 * Tryby:
 *   auth: 10 req / min / IP — login/signup/reset
 *   ai:   30 req / min / user — generation endpoints
 *   default: 60 req / min / IP — pozostałe API
 *
 * Falls back to "allow" gdy UPSTASH_* env nie ustawione (lokalny dev) — żeby
 * nie blokować pracy bez zewnętrznych zależności. W produkcji Sentry zgłosi
 * brak konfiguracji (assertion w `getOrThrow`).
 */

type Bucket = 'auth' | 'ai' | 'default'

const LIMITS: Record<Bucket, { tokens: number; windowSec: number }> = {
  auth: { tokens: 10, windowSec: 60 },
  ai: { tokens: 30, windowSec: 60 },
  default: { tokens: 60, windowSec: 60 },
}

export interface RateLimitResult {
  ok: boolean
  /** Alias dla `ok` — zachowany dla kompatybilności z istniejącymi consumerami. */
  success: boolean
  remaining: number
  limit: number
  reset: number
  bucket: Bucket
}

const MEMORY_FALLBACK = new Map<string, { count: number; expiresAt: number }>()

function memoryLimit(key: string, limit: { tokens: number; windowSec: number }): RateLimitResult {
  const now = Date.now()
  const entry = MEMORY_FALLBACK.get(key)
  if (!entry || entry.expiresAt <= now) {
    MEMORY_FALLBACK.set(key, { count: 1, expiresAt: now + limit.windowSec * 1000 })
    return {
      ok: true,
      success: true,
      remaining: limit.tokens - 1,
      limit: limit.tokens,
      reset: Math.floor((now + limit.windowSec * 1000) / 1000),
      bucket: 'default',
    }
  }
  entry.count += 1
  const ok = entry.count <= limit.tokens
  return {
    ok,
    success: ok,
    remaining: Math.max(0, limit.tokens - entry.count),
    limit: limit.tokens,
    reset: Math.floor(entry.expiresAt / 1000),
    bucket: 'default',
  }
}

export async function rateLimit(
  identifier: string,
  bucket: Bucket = 'default',
): Promise<RateLimitResult> {
  const limit = LIMITS[bucket]
  const url = process.env['UPSTASH_REDIS_REST_URL']
  const token = process.env['UPSTASH_REDIS_REST_TOKEN']
  const key = `mandatomat:ratelimit:${bucket}:${identifier}`

  if (!url || !token) {
    const r = memoryLimit(key, limit)
    return { ...r, bucket }
  }

  // Atomic INCR + EXPIRE via pipeline (Upstash REST)
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, String(limit.windowSec), 'NX'],
      ['PTTL', key],
    ]),
    cache: 'no-store',
  }).catch(() => null)

  if (!res || !res.ok) {
    // Network failure — fail-open (lepiej puścić niż zablokować legalny ruch)
    return { ok: true, success: true, remaining: limit.tokens, limit: limit.tokens, reset: 0, bucket }
  }

  const json = (await res.json()) as Array<{ result: number }>
  const count = json[0]?.result ?? 0
  const ttlMs = json[2]?.result ?? limit.windowSec * 1000
  const ok = count <= limit.tokens
  return {
    ok,
    success: ok,
    remaining: Math.max(0, limit.tokens - count),
    limit: limit.tokens,
    reset: Math.floor((Date.now() + ttlMs) / 1000),
    bucket,
  }
}

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(r.limit),
    'X-RateLimit-Remaining': String(r.remaining),
    'X-RateLimit-Reset': String(r.reset),
  }
}
