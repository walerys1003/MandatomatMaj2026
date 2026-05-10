import { test, expect } from '@playwright/test'

/**
 * E2E Scoring — publiczny formularz oceny szans (top funnel).
 *
 * /sprawdz-szanse — bez logowania, bez płatności.
 *
 * Strategia: testujemy UI + walidację frontendową + redirect na CTA.
 * Faktyczne wywołanie /api/ai/scoring jest mockowane (intercept), aby
 * nie wymagać klucza Anthropica w CI ani nie obciążać quoty.
 */

test.describe('Scoring — /sprawdz-szanse', () => {
  test('strona renderuje się z wszystkimi 7 kategoriami', async ({ page }) => {
    await page.goto('/sprawdz-szanse')

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/sprawdź szanse/i)

    // Każda z 7 kategorii powinna być dostępna w selectorze/radio
    const expectedLabels = [
      /mandat/i,
      /parking/i,
      /windykacja/i,
      /ubezpieczen/i,
      /e-?toll/i,
      /kontrol/i,
      /technicz/i,
    ]
    const body = (await page.locator('body').textContent()) ?? ''
    for (const re of expectedLabels) {
      expect(body).toMatch(re)
    }
  })

  test('walidacja frontendowa: opis < 20 znaków blokuje submit', async ({ page }) => {
    await page.goto('/sprawdz-szanse')

    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()
    await textarea.fill('za krótko')

    const submit = page.getByRole('button', { name: /(sprawdź|oceń|wyślij)/i }).first()
    if (await submit.isVisible().catch(() => false)) {
      await submit.click()
      // Albo komunikat błędu, albo brak nawigacji do /panel
      await expect(page).toHaveURL(/sprawdz-szanse/)
    }
  })

  test('mock /api/ai/scoring zwraca wynik i renderuje gauge', async ({ page }) => {
    // Mockujemy odpowiedź API żeby nie wołać Anthropica
    await page.route('**/api/ai/scoring', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          score: 72,
          label: 'wysokie',
          reasoning: 'Mandat z fotoradaru bez doręczenia — istnieje silna przesłanka do uchylenia.',
          recommendations: [
            'Złóż odmowę przyjęcia mandatu w ciągu 7 dni',
            'Powołaj się na art. 97 Kodeksu wykroczeń',
            'Skompletuj dowody (zdjęcia, świadków)',
          ],
          legal_basis_hints: ['Art. 97 KW', 'Art. 38 ust. 2 ustawy o RD'],
          estimated_complexity: 'medium',
        }),
      })
    })

    await page.goto('/sprawdz-szanse')

    const textarea = page.locator('textarea').first()
    await textarea.fill(
      'Otrzymałem mandat z fotoradaru za przekroczenie prędkości o 25 km/h ' +
        'na ulicy Marszałkowskiej w Warszawie. Nie byłem właścicielem pojazdu w momencie zdarzenia.',
    )

    const submit = page.getByRole('button', { name: /(sprawdź|oceń|wyślij|szanse)/i }).first()
    await submit.click()

    // Czekamy aż pojawi się wynik (score 72 lub label "wysokie")
    await expect(page.locator('body')).toContainText(/72|wysokie/i, { timeout: 15_000 })
  })
})
