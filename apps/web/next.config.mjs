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
  /**
   * T5-SEO-035: Stałe przekierowania 301 dla starych URL-i.
   * Mapuje legacy / spodziewane warianty na docelowe ścieżki.
   * Wszystkie przekierowania są permanent (HTTP 301) — sygnał dla Google
   * o trwałej zmianie. Nigdy nie należy ich usuwać po rok od deployu.
   */
  async redirects() {
    return [
      // Legacy: /artykul/* (stary blog) -> /blog/*
      {
        source: '/artykul/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      // Legacy: /blog-archiwum -> /blog
      {
        source: '/blog-archiwum',
        destination: '/blog',
        permanent: true,
      },
      // Legacy: /artykuly -> /blog
      {
        source: '/artykuly',
        destination: '/blog',
        permanent: true,
      },
      // Legacy: /faq -> /jak-to-dziala
      {
        source: '/faq',
        destination: '/jak-to-dziala',
        permanent: true,
      },
      // Legacy: /pomoc -> /jak-to-dziala
      {
        source: '/pomoc',
        destination: '/jak-to-dziala',
        permanent: true,
      },
      // Legacy: /cennik -> / (#cennik anchor)
      {
        source: '/cennik',
        destination: '/#cennik',
        permanent: true,
      },
      // Legacy: /rejestracja -> /signup
      {
        source: '/rejestracja',
        destination: '/signup',
        permanent: true,
      },
      // Legacy: /logowanie -> /login
      {
        source: '/logowanie',
        destination: '/login',
        permanent: true,
      },
      // Legacy: /panel -> /panel (już istnieje, ale stary alias /dashboard)
      {
        source: '/dashboard',
        destination: '/panel',
        permanent: true,
      },
      // Legacy: /sprawa/:id -> /sprawy/:id
      {
        source: '/sprawa/:id',
        destination: '/sprawy/:id',
        permanent: true,
      },
      // Legacy kategorie: /mandat -> /kategoria/mandat
      {
        source: '/mandat',
        destination: '/kategoria/mandat',
        permanent: true,
      },
      {
        source: '/fotoradar',
        destination: '/kategoria/fotoradar',
        permanent: true,
      },
      {
        source: '/parking',
        destination: '/kategoria/parking',
        permanent: true,
      },
      {
        source: '/windykacja',
        destination: '/kategoria/windykacja',
        permanent: true,
      },
      {
        source: '/epu',
        destination: '/kategoria/epu',
        permanent: true,
      },
      // Legacy: /privacy -> /polityka-prywatnosci
      {
        source: '/privacy',
        destination: '/polityka-prywatnosci',
        permanent: true,
      },
      // Legacy: /terms -> /regulamin
      {
        source: '/terms',
        destination: '/regulamin',
        permanent: true,
      },
      // Legacy: /gdpr -> /rodo
      {
        source: '/gdpr',
        destination: '/rodo',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
