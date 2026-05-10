import { NextResponse } from 'next/server'

/**
 * GET /api/health
 *
 * Lightweight liveness probe — uses no DB / external service. Used by:
 *  - Vercel deploy preview smoke tests
 *  - Uptime monitor (UptimeRobot / BetterStack)
 *  - CI workflow integration test
 */
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export function GET(): NextResponse {
  return NextResponse.json({
    status: 'ok',
    service: 'mandatomat-web',
    version: process.env['npm_package_version'] ?? '0.1.0',
    env: process.env['VERCEL_ENV'] ?? process.env['NODE_ENV'] ?? 'unknown',
    region: process.env['VERCEL_REGION'] ?? 'local',
    timestamp: new Date().toISOString(),
  })
}
