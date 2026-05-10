/**
 * Testy modułu SEO — categories i long-tail.
 * T5-DEV-044: pokrycie helperów SEO.
 */

import { describe, expect, it } from 'vitest'

import {
  CATEGORIES,
  findCategory,
  findLongTail,
  getAllCategorySlugs,
  getAllLongTailSlugs,
  LONG_TAIL,
} from './categories'

describe('CATEGORIES', () => {
  it('zawiera 9 kategorii głównych', () => {
    expect(CATEGORIES).toHaveLength(9)
  })

  it('każda kategoria ma unikalny slug', () => {
    const slugs = CATEGORIES.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('każda kategoria ma title, h1, metaDescription, intro', () => {
    for (const cat of CATEGORIES) {
      expect(cat.title.length).toBeGreaterThan(10)
      expect(cat.h1.length).toBeGreaterThan(5)
      expect(cat.metaDescription.length).toBeGreaterThan(50)
      expect(cat.metaDescription.length).toBeLessThan(200)
      expect(cat.intro.length).toBeGreaterThan(50)
      expect(cat.podstawyPrawne.length).toBeGreaterThan(0)
      expect(cat.faq.length).toBeGreaterThan(0)
      expect(cat.caseTypes.length).toBeGreaterThan(0)
    }
  })

  it('każda kategoria ma keyword array', () => {
    for (const cat of CATEGORIES) {
      expect(cat.keywords.length).toBeGreaterThan(0)
    }
  })

  it('FAQ items mają niepuste pytanie i odpowiedź', () => {
    for (const cat of CATEGORIES) {
      for (const item of cat.faq) {
        expect(item.q.length).toBeGreaterThan(5)
        expect(item.a.length).toBeGreaterThan(20)
      }
    }
  })
})

describe('LONG_TAIL', () => {
  it('zawiera co najmniej 17 long-tail stron', () => {
    expect(LONG_TAIL.length).toBeGreaterThanOrEqual(17)
  })

  it('każda strona long-tail ma unikalny slug', () => {
    const slugs = LONG_TAIL.map((l) => l.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('parentCategory każdej long-tail wskazuje istniejącą kategorię', () => {
    const categorySlugs = new Set(CATEGORIES.map((c) => c.slug))
    for (const lt of LONG_TAIL) {
      expect(categorySlugs.has(lt.parentCategory)).toBe(true)
    }
  })

  it('każda long-tail ma steps i FAQ', () => {
    for (const lt of LONG_TAIL) {
      expect(lt.steps.length).toBeGreaterThan(0)
      expect(lt.faq.length).toBeGreaterThan(0)
    }
  })

  it('metaDescription mieści się w limitach SEO (50-200)', () => {
    for (const lt of LONG_TAIL) {
      expect(lt.metaDescription.length).toBeGreaterThanOrEqual(50)
      expect(lt.metaDescription.length).toBeLessThanOrEqual(200)
    }
  })

  it('slug jest URL-safe (kebab-case, ASCII)', () => {
    for (const lt of LONG_TAIL) {
      expect(lt.slug).toMatch(/^[a-z0-9-]+$/)
    }
    for (const cat of CATEGORIES) {
      expect(cat.slug).toMatch(/^[a-z0-9-]+$/)
    }
  })
})

describe('findCategory / findLongTail', () => {
  it('findCategory zwraca poprawną kategorię', () => {
    const cat = findCategory('mandaty-karne')
    expect(cat).toBeDefined()
    expect(cat?.slug).toBe('mandaty-karne')
  })

  it('findCategory zwraca undefined dla nieistniejącego slugu', () => {
    expect(findCategory('nieistnieje')).toBeUndefined()
  })

  it('findLongTail zwraca poprawną stronę', () => {
    const lt = findLongTail('mandat-fotoradar-przedawnienie')
    expect(lt).toBeDefined()
    expect(lt?.parentCategory).toBe('fotoradary')
  })
})

describe('getAllCategorySlugs / getAllLongTailSlugs', () => {
  it('zwraca wszystkie slugi kategorii', () => {
    expect(getAllCategorySlugs().length).toBe(CATEGORIES.length)
  })

  it('zwraca wszystkie slugi long-tail', () => {
    expect(getAllLongTailSlugs().length).toBe(LONG_TAIL.length)
  })
})
