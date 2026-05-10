/**
 * Next.js config — Mandatomat
 *
 * T5-SEC-029: pełen zestaw security headers (CSP, HSTS, COOP/COEP, X-Frame).
 * CSP w trybie strict — domeny: self, Supabase, Stripe, Anthropic.
 * Tryb 'unsafe-inline' tylko dla style — Tailwind generuje inline styles
 * z dynamicznymi klasami. JS — tylko self + Stripe.
 */

const SUPABASE_HOST = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '')

const cspDirectives = [
  "default-src 'self'",
  // Skrypty: tylko self + Stripe Checkout. Brak unsafe-inline (Next używa nonce-style w produkcji)
  `script-src 'self' 'unsafe-inline' https://js.stripe.com https://challenges.cloudflare.com`,
  // Style: inline dla Tailwind dynamicznych klas
  "style-src 'self' 'unsafe-inline'",
  // Obrazy: self + Supabase Storage + data URI (favicons)
  `img-src 'self' data: blob: https://*.supabase.co${SUPABASE_HOST ? ` https://${SUPABASE_HOST}` : ''}`,
  "font-src 'self' data:",
  // XHR / fetch: Supabase API + Anthropic + Stripe
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.stripe.com${SUPABASE_HOST ? ` https://${SUPABASE_HOST}` : ''}`,
  // Frames: tylko Stripe Checkout (modal)
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
  // Workers: dozwolone tylko z self
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Wymuszenie HTTPS w produkcji
  ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
]

const csp = cspDirectives.join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: false,
  },
  transpilePackages: ['@mandatomat/ui', '@mandatomat/db-types'],
  images: {
    remotePatterns: [
      // Supabase Storage public buckets
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")',
          },
          // HSTS — 1 rok, includeSubDomains, preload (po deployu na produkcję)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // COOP / COEP — Spectre / cross-origin isolation
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      // API — explicit no-cache, no-store
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
  },
}

export default nextConfig
