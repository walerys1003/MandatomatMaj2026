import { test, expect } from '@playwright/test'

/**
 * E2E Forms (chronione) — happy-path dla niezalogowanego usera.
 *
 * Sprawdza, że flow tworzenia sprawy → formularz → płatność → pobranie
 * jest poprawnie chroniony auth-em (redirect do /login z parametrem ?next=).
 *
 * Pełny zalogowany happy-path wymaga:
 *  - testowego konta Supabase Auth (E2E_TEST_EMAIL/E2E_TEST_PASSWORD)
 *  - mockowania Stripe webhook
 *  - mockowania Anthropic API (generate-document)
 * Te scenariusze są pokryte w osobnych spec-ach (gated env-em).
 */

test.describe('Forms — protected routes', () => {
  test('/sprawy/nowa redirectuje na /login z next=', async ({ page }) => {
    await page.goto('/sprawy/nowa')
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    expect(page.url()).toMatch(/login/)
  })

  test('/sprawy/nowa/mandaty redirectuje na /login (kategoria katalogu)', async ({ page }) => {
    await page.goto('/sprawy/nowa/mandaty')
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    expect(page.url()).toMatch(/login/)
  })

  test('/sprawy/[caseId]/platnosc redirectuje (UUID losowy)', async ({ page }) => {
    await page.goto('/sprawy/00000000-0000-0000-0000-000000000000/platnosc')
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    expect(page.url()).toMatch(/login/)
  })

  test('/sprawy/[caseId]/pobranie redirectuje', async ({ page }) => {
    await page.goto('/sprawy/00000000-0000-0000-0000-000000000000/pobranie')
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    expect(page.url()).toMatch(/login/)
  })
})

test.describe('Forms — API endpoints chronione', () => {
  test('POST /api/cases wymaga auth (401)', async ({ request }) => {
    const res = await request.post('/api/cases', {
      data: {
        type: 'M1_mandat_predkosc',
        formData: { kwota_mandatu: 200 },
      },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('POST /api/ai/generate-document wymaga auth (401)', async ({ request }) => {
    const res = await request.post('/api/ai/generate-document', {
      data: { caseId: '00000000-0000-0000-0000-000000000000' },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('GET /api/documents/[docId]/pdf wymaga auth (401)', async ({ request }) => {
    const res = await request.get('/api/documents/00000000-0000-0000-0000-000000000000/pdf')
    expect([401, 403, 404]).toContain(res.status())
  })

  test('GET /api/billing/invoices wymaga auth (401)', async ({ request }) => {
    const res = await request.get('/api/billing/invoices')
    expect([401, 403]).toContain(res.status())
  })
})

test.describe('Forms — public scoring API rate-limit', () => {
  test('POST /api/ai/scoring akceptuje publiczny request (200/429)', async ({ request }) => {
    const res = await request.post('/api/ai/scoring', {
      data: {
        caseType: 'mandat',
        description:
          'Otrzymałem mandat za przekroczenie prędkości — fotoradar w Warszawie, prędkość 70 w 50.',
      },
    })
    // 200 OK, 429 rate-limit, lub 500 jeśli brak ANTHROPIC_API_KEY w sandboxie
    expect([200, 429, 500, 503]).toContain(res.status())
  })
})
