'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Cookie consent banner — RODO/GDPR compliance.
 *
 * Wymagania:
 *  - Pokazujemy TYLKO jeśli brak zapisu w localStorage (SSR-safe — render po hydracji).
 *  - 3 akcje: "Akceptuj wszystkie", "Tylko niezbędne", "Dostosuj" (link do polityki).
 *  - Po wyborze zapis w localStorage `mandatomat-cookie-consent` (v1).
 *  - Brak zewnętrznych cookies do momentu wyboru (analytics, posthog itp. odpalamy
 *    z `<AnalyticsGate>` po stronie konsumenta — patrz lib/analytics).
 *
 * Schemat zapisu:
 *   {
 *     v: 1,
 *     timestamp: number,
 *     necessary: true,       // zawsze
 *     analytics: boolean,
 *     marketing: boolean,
 *   }
 */

const STORAGE_KEY = 'mandatomat-cookie-consent'
const CONSENT_VERSION = 1

export interface CookieConsent {
  v: number
  timestamp: number
  necessary: true
  analytics: boolean
  marketing: boolean
}

function readConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CookieConsent>
    if (parsed.v !== CONSENT_VERSION) return null
    return parsed as CookieConsent
  } catch {
    return null
  }
}

function writeConsent(c: Omit<CookieConsent, 'v' | 'timestamp' | 'necessary'>): void {
  if (typeof window === 'undefined') return
  const payload: CookieConsent = {
    v: CONSENT_VERSION,
    timestamp: Date.now(),
    necessary: true,
    ...c,
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    // Custom event — analytics gate słucha tego, by zainicjalizować trackery
    window.dispatchEvent(new CustomEvent('mandatomat:consent-changed', { detail: payload }))
  } catch {
    // localStorage może być wyłączony (Safari Private) — degradujemy do session-only
  }
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    // Render TYLKO po hydracji + tylko jeśli brak zapisu
    const existing = readConsent()
    if (!existing) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const handleAcceptAll = () => {
    writeConsent({ analytics: true, marketing: true })
    setVisible(false)
  }

  const handleNecessaryOnly = () => {
    writeConsent({ analytics: false, marketing: false })
    setVisible(false)
  }

  const handleSavePrefs = () => {
    writeConsent({ analytics, marketing })
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-iron-200 bg-white shadow-2xl dark:border-iron-800 dark:bg-iron-950"
    >
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <div className="flex-1">
            <h2
              id="cookie-consent-title"
              className="text-base font-semibold text-iron-900 dark:text-iron-50"
            >
              🍪 Twoja prywatność jest dla nas ważna
            </h2>
            <p
              id="cookie-consent-desc"
              className="mt-2 text-sm leading-relaxed text-iron-700 dark:text-iron-300"
            >
              Używamy plików cookie. <strong>Niezbędne</strong> (logowanie, sesja, bezpieczeństwo)
              są zawsze włączone. <strong>Analityczne</strong> i <strong>marketingowe</strong>{' '}
              wymagają Twojej zgody. Szczegóły znajdziesz w{' '}
              <Link
                href="/polityka-prywatnosci"
                className="font-medium text-precision-blue-600 underline underline-offset-2 hover:text-precision-blue-700 dark:text-precision-blue-400"
              >
                Polityce Prywatności
              </Link>
              .
            </p>

            {showDetails && (
              <div className="mt-4 space-y-3 rounded-md border border-iron-200 bg-iron-50 p-3 text-sm dark:border-iron-800 dark:bg-iron-900">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    aria-label="Niezbędne (zawsze włączone)"
                    className="mt-0.5 h-4 w-4 cursor-not-allowed rounded border-iron-300"
                  />
                  <span>
                    <strong className="font-medium text-iron-900 dark:text-iron-100">
                      Niezbędne
                    </strong>{' '}
                    <span className="text-iron-600 dark:text-iron-400">(zawsze)</span>
                    <span className="block text-xs text-iron-500 dark:text-iron-400">
                      Sesja, logowanie, koszyk, anty-CSRF.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-iron-300 text-precision-blue-600"
                  />
                  <span>
                    <strong className="font-medium text-iron-900 dark:text-iron-100">
                      Analityczne
                    </strong>
                    <span className="block text-xs text-iron-500 dark:text-iron-400">
                      PostHog, Plausible — anonimowe statystyki ruchu.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-iron-300 text-precision-blue-600"
                  />
                  <span>
                    <strong className="font-medium text-iron-900 dark:text-iron-100">
                      Marketingowe
                    </strong>
                    <span className="block text-xs text-iron-500 dark:text-iron-400">
                      Remarketing i reklama dopasowana (opcjonalne).
                    </span>
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col lg:min-w-[200px]">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="rounded-md bg-precision-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-precision-blue-700 focus:outline-none focus:ring-2 focus:ring-precision-blue-500 focus:ring-offset-2"
            >
              Akceptuj wszystkie
            </button>
            {showDetails ? (
              <button
                type="button"
                onClick={handleSavePrefs}
                className="rounded-md border border-iron-300 bg-white px-4 py-2 text-sm font-medium text-iron-900 hover:bg-iron-50 focus:outline-none focus:ring-2 focus:ring-precision-blue-500 focus:ring-offset-2 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100 dark:hover:bg-iron-800"
              >
                Zapisz preferencje
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="rounded-md border border-iron-300 bg-white px-4 py-2 text-sm font-medium text-iron-900 hover:bg-iron-50 focus:outline-none focus:ring-2 focus:ring-precision-blue-500 focus:ring-offset-2 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100 dark:hover:bg-iron-800"
              >
                Dostosuj
              </button>
            )}
            <button
              type="button"
              onClick={handleNecessaryOnly}
              className="rounded-md px-4 py-2 text-sm font-medium text-iron-700 hover:bg-iron-100 focus:outline-none focus:ring-2 focus:ring-precision-blue-500 focus:ring-offset-2 dark:text-iron-300 dark:hover:bg-iron-800"
            >
              Tylko niezbędne
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Helper dla server / client kodu — odczyt aktualnej zgody.
 * Server-side zawsze zwraca null (cookie consent jest client-only).
 */
export function getCookieConsent(): CookieConsent | null {
  return readConsent()
}

/**
 * Hook — subskrypcja zmian zgody (np. dla analytics gate).
 */
export function onConsentChange(callback: (c: CookieConsent) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<CookieConsent>).detail
    if (detail) callback(detail)
  }
  window.addEventListener('mandatomat:consent-changed', handler)
  return () => window.removeEventListener('mandatomat:consent-changed', handler)
}
