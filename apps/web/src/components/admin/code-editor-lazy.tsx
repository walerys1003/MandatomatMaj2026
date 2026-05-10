'use client'

/**
 * T5-PERF-039: client wrapper dla CodeEditor z dynamic import.
 *
 * Powód: CodeEditor jest tylko w admin (~5% ruchu) — chcemy go odciąć
 * od głównego bundle. `next/dynamic` z `ssr: false` działa tylko w client
 * komponencie, więc admin pages (Server Components) renderują ten wrapper,
 * a wrapper lazy-loaduje właściwy CodeEditor po stronie klienta.
 *
 * Skutek: bundle pages /admin/szablony/[caseType] i /admin/prompty/[caseType]
 * traci ~5KB (CodeEditor + jego setState/useEffect).
 */

import dynamic from 'next/dynamic'

const CodeEditorClient = dynamic(
  () => import('@mandatomat/ui').then((m) => ({ default: m.CodeEditor })),
  {
    ssr: false,
    loading: () => (
      <div
        aria-busy="true"
        className="rounded-md border border-iron-200 bg-iron-50 p-4 font-mono text-xs text-iron-500 dark:border-iron-700 dark:bg-iron-950 dark:text-iron-400"
      >
        Ładowanie edytora…
      </div>
    ),
  },
)

export { CodeEditorClient as CodeEditor }
export type { CodeEditorProps } from '@mandatomat/ui'
