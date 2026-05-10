import type { NextRequest } from 'next/server'

/**
 * Best-effort client IP extraction.
 *
 * Vercel: `x-forwarded-for` lub `x-real-ip`. W edge runtime też `request.ip`
 * (typed jako `string | undefined`).
 */
export function getIp(request: NextRequest | Request): string {
  const r = request as NextRequest
  if (typeof r.ip === 'string' && r.ip) return r.ip

  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? 'unknown'

  const real = request.headers.get('x-real-ip')
  if (real) return real.trim()

  return 'unknown'
}

/**
 * Alias dla `getIp`. Zachowany dla kompatybilności z istniejącymi importami.
 */
export const getClientIp = getIp
