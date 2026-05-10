import { type Page, type BrowserContext, expect } from '@playwright/test'

/**
 * E2E auth helpers.
 *
 * Pełny happy-path (zalogowany) wymaga testowego konta Supabase.
 * Konfiguracja przez env:
 *   E2E_TEST_EMAIL    — istniejący user w Supabase Auth (test@mandatomat.local)
 *   E2E_TEST_PASSWORD — hasło ww. konta
 *
 * Brak env → testy są skip-owane (test.skip).
 *
 * Strategia: korzystamy z password-based login (server action `loginAction`),
 * a NIE z magic-linka (wymagałby skrzynki email).
 */

export interface E2ECredentials {
  email: string
  password: string
}

/**
 * Pobiera dane testowego konta z env (lub null jeśli nie skonfigurowane).
 */
export function getTestCredentials(): E2ECredentials | null {
  const email = process.env['E2E_TEST_EMAIL']
  const password = process.env['E2E_TEST_PASSWORD']
  if (!email || !password) return null
  return { email, password }
}

/**
 * Sprawdza czy testy zalogowanego usera mogą być wykonane.
 * Jeżeli brak credentials, woła test.skip(true, reason).
 */
export function requireE2ECredentials(
  skipFn: (condition: boolean, reason: string) => void,
): E2ECredentials {
  const creds = getTestCredentials()
  if (!creds) {
    skipFn(true, 'Brak E2E_TEST_EMAIL / E2E_TEST_PASSWORD — pominięto testy wymagające auth')
    return { email: '', password: '' }
  }
  return creds
}

/**
 * Loguje użytkownika przez stronę /login (password flow).
 * Po sukcesie przekierowuje na /panel — czeka aż URL będzie zawierał /panel.
 */
export async function loginAs(page: Page, creds: E2ECredentials): Promise<void> {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(creds.email)

  // Niektóre instalacje używają tylko magic-linka — sprawdź czy jest pole password
  const passwordInput = page.locator('input[type="password"]')
  const hasPassword = await passwordInput.isVisible().catch(() => false)

  if (!hasPassword) {
    throw new Error(
      'Login form bez pola password — magic-link only. Skonfiguruj password auth w Supabase dla E2E.',
    )
  }

  await passwordInput.fill(creds.password)
  await page
    .getByRole('button', { name: /zaloguj/i })
    .first()
    .click()

  // Czekaj na redirect do panelu (max 30s — Supabase Auth może być wolny)
  await page.waitForURL(/\/panel/, { timeout: 30_000 })
}

/**
 * Wylogowuje użytkownika (czyści cookies + localStorage).
 */
export async function logout(context: BrowserContext): Promise<void> {
  await context.clearCookies()
  // Page-level clear localStorage musi być w kontekście strony
  for (const page of context.pages()) {
    await page.evaluate(() => {
      try {
        window.localStorage.clear()
        window.sessionStorage.clear()
      } catch {
        /* no-op */
      }
    })
  }
}

/**
 * Asserts że user jest zalogowany — sprawdza, że /panel nie redirectuje.
 */
export async function assertLoggedIn(page: Page): Promise<void> {
  await page.goto('/panel')
  await expect(page).toHaveURL(/\/panel/, { timeout: 10_000 })
}
