import { test, expect } from '@playwright/test'

/**
 * E2E Auth Flows — rejestracja, logowanie, reset hasła.
 *
 * Strategia: testujemy UI i walidację formularzy bez faktycznego
 * wysyłania emaili (Supabase Auth). Sprawdzamy że formularze są
 * renderowane poprawnie i obsługują podstawowe scenariusze.
 */

test.describe('Auth — rejestracja', () => {
  test('strona /rejestracja ma pełny formularz', async ({ page }) => {
    await page.goto('/rejestracja')

    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /(załóż|zarejestr|utwórz)/i })).toBeVisible()
  })

  test('walidacja: za krótkie hasło wyświetla komunikat lub nie submituje', async ({ page }) => {
    await page.goto('/rejestracja')

    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[type="password"]').fill('123')

    const submit = page.getByRole('button', { name: /(załóż|zarejestr|utwórz)/i }).first()
    await submit.click()

    // Powinniśmy zostać na /rejestracja (nie redirect do /panel)
    await expect(page).toHaveURL(/rejestracja/)
  })

  test('link "Zaloguj się" prowadzi do /login', async ({ page }) => {
    await page.goto('/rejestracja')
    const loginLink = page.getByRole('link', { name: /zaloguj/i }).first()
    await expect(loginLink).toBeVisible()
    await loginLink.click()
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Auth — logowanie', () => {
  test('strona /login ma formularz z linkiem do rejestracji', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('input[type="email"]')).toBeVisible()
    const registerLink = page.getByRole('link', { name: /zarejestr/i }).first()
    await expect(registerLink).toBeVisible()
  })

  test('strona /reset-hasla istnieje', async ({ page }) => {
    const res = await page.goto('/reset-hasla', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBeLessThan(400)
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })
})

test.describe('Auth — chronione ścieżki', () => {
  const protectedPaths = ['/panel', '/profil', '/ustawienia', '/sprawy', '/sprawy/nowa', '/terminy']

  for (const path of protectedPaths) {
    test(`${path} redirectuje niezalogowanego na /login`, async ({ page }) => {
      await page.goto(path)
      await page.waitForURL(/\/login/, { timeout: 15_000 })
      expect(page.url()).toContain('/login')
    })
  }
})
