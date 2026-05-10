/**
 * Testy JSON-LD helpers (T5-DEV-044).
 */

import { describe, expect, it } from 'vitest'

import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  legalServiceJsonLd,
  organizationJsonLd,
  serializeJsonLd,
} from './json-ld'

describe('breadcrumbJsonLd', () => {
  it('generuje BreadcrumbList z poprawną strukturą', () => {
    const data = breadcrumbJsonLd([
      { name: 'Home', url: '/' },
      { name: 'Kategorie', url: '/kategorie' },
      { name: 'Mandaty', url: '/kategoria/mandaty-karne' },
    ]) as { '@type': string; itemListElement: Array<{ position: number; name: string }> }

    expect(data['@type']).toBe('BreadcrumbList')
    expect(data.itemListElement).toHaveLength(3)
    expect(data.itemListElement[0]?.position).toBe(1)
    expect(data.itemListElement[2]?.name).toBe('Mandaty')
  })
})

describe('faqJsonLd', () => {
  it('generuje FAQPage ze wszystkimi pytaniami', () => {
    const data = faqJsonLd([
      { q: 'Pytanie 1?', a: 'Odpowiedź 1.' },
      { q: 'Pytanie 2?', a: 'Odpowiedź 2.' },
    ]) as { '@type': string; mainEntity: Array<{ '@type': string; name: string }> }

    expect(data['@type']).toBe('FAQPage')
    expect(data.mainEntity).toHaveLength(2)
    expect(data.mainEntity[0]?.['@type']).toBe('Question')
    expect(data.mainEntity[0]?.name).toBe('Pytanie 1?')
  })
})

describe('legalServiceJsonLd', () => {
  it('zawiera offer z PLN i Polska', () => {
    const data = legalServiceJsonLd({
      name: 'Sprzeciw od mandatu',
      description: 'AI generator',
      url: '/kategoria/mandaty-karne',
      serviceType: 'Mandaty',
    }) as { offers: { priceCurrency: string }; areaServed: { name: string } }

    expect(data.offers.priceCurrency).toBe('PLN')
    expect(data.areaServed.name).toBe('Polska')
  })
})

describe('organizationJsonLd', () => {
  it('zwraca dane Mandatomat', () => {
    const data = organizationJsonLd() as { name: string; '@type': string }
    expect(data.name).toBe('Mandatomat')
    expect(data['@type']).toBe('Organization')
  })
})

describe('articleJsonLd', () => {
  it('domyślnie ustawia datePublished i dateModified', () => {
    const data = articleJsonLd({
      headline: 'Tytuł',
      description: 'Opis',
      url: '/poradnik/test',
    }) as { datePublished: string; dateModified: string }

    expect(data.datePublished).toBeDefined()
    expect(data.dateModified).toBeDefined()
  })
})

describe('serializeJsonLd', () => {
  it('zwraca poprawny JSON string', () => {
    const data = { '@context': 'https://schema.org', '@type': 'Test' }
    const str = serializeJsonLd(data)
    expect(JSON.parse(str)).toEqual(data)
  })
})
