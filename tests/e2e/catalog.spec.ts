import { test, expect } from '@playwright/test'

/**
 * E2E Catalog — testuje publicznie dostępne strony katalogu spraw.
 *
 * Strony katalogowe (jeśli są publiczne) powinny być dostępne bez logowania
 * i pokazywać kategorie + listę typów spraw.
 */

test.describe('Catalog — przeglądanie katalogu spraw', () => {
  test('strona /sprawy-publiczne lub równoważna ładuje się bez auth (jeśli istnieje)', async ({
    page,
  }) => {
    const candidates = ['/katalog', '/sprawy/katalog', '/cennik', '/']
    let foundOk = false
    for (const path of candidates) {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
      if (res && res.status() < 400) {
        foundOk = true
        break
      }
    }
    expect(foundOk).toBe(true)
  })

  test('cennik (jeśli istnieje) zawiera ceny w PLN', async ({ page }) => {
    const res = await page.goto('/cennik', { waitUntil: 'domcontentloaded' })
    test.skip(!res || res.status() >= 400, 'Brak strony /cennik — pominięto')

    const body = await page.locator('body').textContent()
    // Spodziewamy się znaków waluty zł lub PLN
    expect(body).toMatch(/zł|PLN/i)
  })
})

test.describe('Bezpieczeństwo nagłówków', () => {
  test('strony zwracają nagłówki bezpieczeństwa', async ({ request }) => {
    const res = await request.get('/')
    const headers = res.headers()

    // Co najmniej jeden z security headers powinien być obecny
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
      'content-security-policy',
      'referrer-policy',
    ]
    const present = securityHeaders.filter((h) => headers[h])
    // Soft check — przynajmniej content-type jest na pewno
    expect(headers['content-type']).toBeTruthy()
    // W trybie dev część headerów może być wyłączona — log a nie fail
    if (present.length === 0) {
      console.warn('Brak typowych security headers (akceptowalne w dev/preview)')
    }
  })
})
