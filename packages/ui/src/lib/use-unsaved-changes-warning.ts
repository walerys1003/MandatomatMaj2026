'use client'

import * as React from 'react'

/**
 * Hook ostrzeżenia przed wyjściem ze strony z niezapisanymi zmianami.
 *
 * Roadmap T20 / T3-FE-020: anti-bounce — modal "Czy na pewno wyjść?"
 *
 * Strategia 2-warstwowa:
 *  1. `beforeunload` — natywne (zamknięcie taba / refresh / cofnij). Browser
 *     pokazuje swoje generic confirm; nie da się go customizować, ale działa.
 *  2. Dla in-app navigation Next.js (Link / router.push) — `usePathname`
 *     monitoring + custom confirm; wstrzykiwane przez wrapper komponent.
 *
 * Użycie:
 *   const ref = React.useRef<HTMLFormElement>(null)
 *   useUnsavedChangesWarning(hasUnsavedChanges, 'Masz niezapisane zmiany — wyjść?')
 */
export function useUnsavedChangesWarning(
  hasUnsavedChanges: boolean,
  message = 'Masz niezapisane zmiany. Czy na pewno chcesz opuścić tę stronę?',
): void {
  React.useEffect(() => {
    if (!hasUnsavedChanges) return

    const handler = (e: BeforeUnloadEvent) => {
      // Większość przeglądarek ignoruje custom message i pokazuje swoje generic prompt,
      // ale wymaga preventDefault + returnValue żeby w ogóle pokazać dialog.
      e.preventDefault()
      e.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges, message])
}
