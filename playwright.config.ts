import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration — E2E tests dla apps/web (Mandatomat).
 *
 * Założenia:
 *  - testy uruchamiane lokalnie z dev serverem na :3000 (lub w CI z built app)
 *  - PLAYWRIGHT_BASE_URL env override dla preview deploymentów
 *  - retry x2 w CI, screenshot/video on failure
 *
 * Uruchamianie:
 *   pnpm test:e2e               # headless, wszystkie testy
 *   pnpm test:e2e --ui          # interaktywny tryb UI
 *   pnpm test:e2e tests/e2e/happy-path.spec.ts
 */

const baseURL = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:3000'
const isCI = !!process.env['CI']

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Webserver auto-start tylko gdy NIE ma zewnętrznego baseURL
  webServer: process.env['PLAYWRIGHT_BASE_URL']
    ? undefined
    : {
        command: 'pnpm --filter @mandatomat/web dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !isCI,
        timeout: 180_000,
      },
})
