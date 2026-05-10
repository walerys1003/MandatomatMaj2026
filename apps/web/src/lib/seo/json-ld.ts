/**
 * JSON-LD helpers — strukturyzowane dane (schema.org) dla SEO.
 *
 * T5-SEO-019..023: BreadcrumbList, FAQPage, Service, LegalService.
 * Funkcje czyste — zwracają obiekt do osadzenia jako `<script type="application/ld+json">`.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mandatomat.pl'

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

export interface FaqItem {
  q: string
  a: string
}

export function faqJsonLd(items: readonly FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a,
      },
    })),
  }
}

export function legalServiceJsonLd(params: {
  name: string
  description: string
  url: string
  serviceType: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: params.name,
    description: params.description,
    url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    serviceType: params.serviceType,
    provider: {
      '@type': 'Organization',
      name: 'Mandatomat',
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Polska',
    },
    offers: {
      '@type': 'Offer',
      price: '99.00',
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
    },
  }
}

/**
 * T5-SEO-019: Product schema dla stron kategoryjnych/long-tail.
 *
 * Schema.org/Product — Google używa do Rich Results (cena, dostępność,
 * ratingValue gdy podane). SKU = case_type (deterministyczny ID).
 */
export function productJsonLd(params: {
  name: string
  description: string
  sku: string
  url: string
  price?: string
  currency?: string
  imageUrl?: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description,
    sku: params.sku,
    url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    image: params.imageUrl ?? `${SITE_URL}/logo.png`,
    brand: {
      '@type': 'Brand',
      name: 'Mandatomat',
    },
    offers: {
      '@type': 'Offer',
      price: params.price ?? '99.00',
      priceCurrency: params.currency ?? 'PLN',
      availability: 'https://schema.org/InStock',
      url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
      seller: {
        '@type': 'Organization',
        name: 'Mandatomat',
        url: SITE_URL,
      },
    },
  }
}

export function organizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mandatomat',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'AI-generator pism prawnych: sprzeciw od mandatu, reklamacje SPP/ZDM, sprzeciw EPU, odwołania OC.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/kontakt`,
      availableLanguage: ['Polish'],
    },
  }
}

export function articleJsonLd(params: {
  headline: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
}): object {
  const now = new Date().toISOString()
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    datePublished: params.datePublished ?? now,
    dateModified: params.dateModified ?? now,
    author: {
      '@type': 'Organization',
      name: 'Mandatomat',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mandatomat',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  }
}

/**
 * Helper komponent renderujący JSON-LD jako script tag.
 * Użycie: <JsonLd data={breadcrumbJsonLd([...])} />
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data, null, 0)
}
