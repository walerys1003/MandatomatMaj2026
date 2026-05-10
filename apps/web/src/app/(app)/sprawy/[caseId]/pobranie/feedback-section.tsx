'use client'

import * as React from 'react'

import { FeedbackWidget, type FeedbackInitial } from '@mandatomat/ui'

interface Props {
  caseId: string
}

/**
 * Wrapper Client Component dla FeedbackWidget — ładuje initial state z
 * GET /api/feedback?caseId=... i renderuje widget z prefillowanymi polami.
 *
 * Trzymamy w osobnym pliku, żeby strona pobierania (Server Component) mogła
 * wciąż renderować się statycznie/SSR-owo, a tylko ten fragment był interaktywny.
 */
export function FeedbackSection({ caseId }: Props) {
  const [initial, setInitial] = React.useState<FeedbackInitial | null>(null)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/feedback?caseId=${encodeURIComponent(caseId)}`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          if (!cancelled) setLoaded(true)
          return
        }
        const body = (await res.json().catch(() => ({}))) as {
          feedback?: FeedbackInitial | null
        }
        if (!cancelled) {
          setInitial(body.feedback ?? null)
          setLoaded(true)
        }
      } catch {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [caseId])

  if (!loaded) {
    return (
      <div
        aria-hidden="true"
        className="h-48 animate-pulse rounded-xl border border-iron-200 bg-iron-50 dark:border-iron-800 dark:bg-iron-900/40"
      />
    )
  }

  return <FeedbackWidget caseId={caseId} initial={initial ?? undefined} />
}
