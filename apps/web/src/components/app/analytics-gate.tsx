'use client'

import { useEffect } from 'react'

import { initPlausibleIfConsent, initPostHogIfConsent } from '@/lib/analytics'

/**
 * AnalyticsGate — montowany raz w root layout (client component).
 *
 * Słucha eventu `mandatomat:consent-changed` z cookie banner-a oraz
 * inicjalizuje PostHog + Plausible przy mount jeśli zgoda już istnieje
 * (powrót usera). Oba trackery są gate-owane przez `analytics: true`.
 */
export function AnalyticsGate() {
  useEffect(() => {
    // Przy mount — odpal jeśli zgoda już zapisana (powrót usera)
    initPostHogIfConsent()
    initPlausibleIfConsent()

    // Subskrypcja: po zmianie zgody (akceptacja w bannerze) — natychmiast odpal
    const handler = () => {
      initPostHogIfConsent()
      initPlausibleIfConsent()
    }
    window.addEventListener('mandatomat:consent-changed', handler)
    return () => window.removeEventListener('mandatomat:consent-changed', handler)
  }, [])

  return null
}
