'use client'

import { useEffect } from 'react'

import { initPostHogIfConsent } from '@/lib/analytics'

/**
 * AnalyticsGate — montowany raz w root layout (client component).
 *
 * Słucha eventu `mandatomat:consent-changed` z cookie banner-a oraz
 * inicjalizuje PostHog przy mount jeśli zgoda już istnieje (powrót usera).
 */
export function AnalyticsGate() {
  useEffect(() => {
    // Przy mount — odpal jeśli zgoda już zapisana (powrót usera)
    initPostHogIfConsent()

    // Subskrypcja: po zmianie zgody (akceptacja w bannerze) — natychmiast odpal
    const handler = () => {
      initPostHogIfConsent()
    }
    window.addEventListener('mandatomat:consent-changed', handler)
    return () => window.removeEventListener('mandatomat:consent-changed', handler)
  }, [])

  return null
}
