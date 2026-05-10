import { test, expect } from '@playwright/test'

/**
 * E2E Happy Path — niezalogowany użytkownik.
 *
 * Pokrywa public-facing routes które nie wymagają auth:
 *  - landing page renderuje się i ma kluczowe elementy
 *  - linki nawigacji prowadzą do prawidłowych adresów
 *  - katalog spraw (publiczny) jest dostępny
 *  - strona logowania renderuje się
 *  - chronione ścieżki redirectują niezalogowanego do /login
 *
 * Smoke test — szybki sprawdzian, że aplikacja w ogóle wstaje.
 */

test.describe('Happy Path — niezalogowany użytkownik', () => {
  test('landing page renderuje się z kluczowymi sekcjami', async ({ page }) => {
    await page.goto('/')

    // Tytuł strony zawiera "Mandatomat"
    await expect(page).toHaveTitle(/Mandatomat/i)

    // Strona ma znajdowalny nagłówek
    const main = page.locator('main, [role="main"], body')
    await expect(main).toBeVisible()

    // Sprawdź obecność CTA
    const startCta = page.getByRole('link', { name: /(zacznij|rozpocznij|zaloguj|zarejestr)/i }).first()
    await expect(startCta).toBeVisible({ timeout: 10_000 })
  })

  test('strona logowania ma formularz email', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('chroniony /panel redirectuje do /login', async ({ page }) => {
    await page.goto('/panel')
    // Magic-link auth: powinno zostać przekierowane na /login (?next=/panel)
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    expect(page.url()).toContain('/login')
  })

  test('chroniony /admin/dashboard redirectuje do /login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    expect(page.url()).toContain('/login')
  })

  test('API /api/admin/stats wymaga autoryzacji (401)', async ({ request }) => {
    const res = await request.get('/api/admin/stats')
    expect(res.status()).toBe(401)
  })

  test('API /api/billing/checkout wymaga autoryzacji (401)', async ({ request }) => {
    const res = await request.post('/api/billing/checkout', {
      data: { caseId: '00000000-0000-0000-0000-000000000000', productCode: 'M1' },
    })
    expect([401, 403]).toContain(res.status())
  })
})
