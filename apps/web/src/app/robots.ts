import type { MetadataRoute } from 'next'

/**
 * robots.txt — produkcja: pełna indeksacja public, blokujemy /panel, /api, /sprawy, /ustawienia, /profil.
 * Preview environment (Vercel): noindex globalne (przez NEXT_PUBLIC_SITE_URL).
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mandatomat.pl'
const IS_PROD = SITE_URL === 'https://mandatomat.pl'

export default function robots(): MetadataRoute.Robots {
  if (!IS_PROD) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/panel',
          '/panel/',
          '/sprawy',
          '/sprawy/',
          '/profil',
          '/ustawienia',
          '/kreator',
          '/dokumenty',
          '/terminy',
          '/platnosci',
          '/login',
          '/rejestracja',
          '/reset-hasla',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
