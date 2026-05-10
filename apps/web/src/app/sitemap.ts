import type { MetadataRoute } from 'next'

import { getAllCategorySlugs, getAllLongTailSlugs } from '@/lib/seo/categories'

/**
 * Sitemap — automatyczny dla statycznych stron marketingowych +
 * 9 kategorii (/kategoria/<slug>) + 17 long-tail (/poradnik/<slug>).
 *
 * T5-SEO-016: pełny sitemap.xml zgodny z Google Search Console.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mandatomat.pl'

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/jak-to-dziala', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/sprawdz-szanse', priority: 0.95, changeFrequency: 'weekly' as const },
  { path: '/kalkulator-przedawnienia', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/kontakt', priority: 0.7, changeFrequency: 'yearly' as const },
  { path: '/o-nas', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/regulamin', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/polityka-prywatnosci', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/rodo', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/login', priority: 0.6, changeFrequency: 'yearly' as const },
  { path: '/rejestracja', priority: 0.8, changeFrequency: 'yearly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const categoryEntries = getAllCategorySlugs().map((slug) => ({
    url: `${SITE_URL}/kategoria/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const longTailEntries = getAllLongTailSlugs().map((slug) => ({
    url: `${SITE_URL}/poradnik/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  return [...staticEntries, ...categoryEntries, ...longTailEntries]
}
