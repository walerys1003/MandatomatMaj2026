/**
 * Analytics gate — respektuje cookie consent.
 *
 * Wszystkie trackery (PostHog, Plausible) odpalamy DOPIERO po zgodzie
 * w `analytics: true`. Bez zgody — no-op (zero requestów do third-party).
 *
 * Użycie (client component):
 *   useEffect(() => { initAnalyticsIfConsent() }, [])
 *
 * Lub w gate component:
 *   <AnalyticsGate />
 */

const CONSENT_KEY = 'mandatomat-cookie-consent'

interface ConsentSnapshot {
  v: number
  analytics: boolean
  marketing: boolean
}

function readConsent(): ConsentSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsentSnapshot
  } catch {
    return null
  }
}

let posthogLoaded = false

/**
 * Lazy-init PostHog tylko po zgodzie + tylko gdy klucz jest skonfigurowany.
 */
export function initPostHogIfConsent(): void {
  if (typeof window === 'undefined') return
  if (posthogLoaded) return
  const consent = readConsent()
  if (!consent || !consent.analytics) return

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  // Dynamiczny import — bundle nie ładuje PostHog gdy nie ma zgody
  void import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: 'https://eu.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: false, // bezpieczniej — wybieramy zdarzenia ręcznie
        disable_session_recording: true,
      })
      posthogLoaded = true
    })
    .catch(() => {
      // posthog-js nie jest jeszcze zainstalowane — silently skip
    })
}

/**
 * Track custom event — no-op bez zgody / bez SDK.
 */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const consent = readConsent()
  if (!consent || !consent.analytics) return
  // @ts-expect-error — posthog leniwie ładowane przez initPostHogIfConsent
  if (window.posthog?.capture) {
    // @ts-expect-error
    window.posthog.capture(event, props)
  }
}

/**
 * Identify — np. po zalogowaniu.
 */
export function identify(userId: string, traits?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const consent = readConsent()
  if (!consent || !consent.analytics) return
  // @ts-expect-error
  if (window.posthog?.identify) {
    // @ts-expect-error
    window.posthog.identify(userId, traits)
  }
}

/**
 * Reset — po wylogowaniu.
 */
export function resetAnalytics(): void {
  if (typeof window === 'undefined') return
  // @ts-expect-error
  if (window.posthog?.reset) {
    // @ts-expect-error
    window.posthog.reset()
  }
}
