import type { MetadataRoute } from 'next'

/**
 * Sitemap — automatyczny dla statycznych stron marketingowych + kategorii.
 * Po MVP: dynamiczne case_type slugi z bazy.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mandatomat.pl'

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/jak-to-dziala', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/kontakt', priority: 0.7, changeFrequency: 'yearly' as const },
  { path: '/o-nas', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/regulamin', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/polityka-prywatnosci', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/rodo', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/login', priority: 0.6, changeFrequency: 'yearly' as const },
  { path: '/rejestracja', priority: 0.8, changeFrequency: 'yearly' as const },
]

const CATEGORY_SLUGS = [
  'mandaty-karne',
  'fotoradary',
  'parking',
  'komunikacja',
  'itd',
  'etoll',
  'ubezpieczenia',
  'punkty-karne',
  'windykacja',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const categoryEntries = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/kategoria/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  return [...staticEntries, ...categoryEntries]
}
