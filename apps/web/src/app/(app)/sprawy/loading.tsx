import { SkeletonTableRow } from '@mandatomat/ui'

/**
 * Loading UI dla /sprawy — skeleton-based (P9).
 *
 * Mirror listy spraw: header + 8 wierszy tabeli.
 */
export default function SprawyLoading() {
  return (
    <div className="space-y-4" role="status" aria-label="Ładowanie listy spraw">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-iron-100 dark:bg-iron-800/60" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
      </div>

      <div className="rounded-xl border border-iron-200 bg-white p-4 dark:border-iron-800 dark:bg-iron-900">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonTableRow key={i} columns={5} />
        ))}
      </div>

      <span className="sr-only">Ładujemy Twoje sprawy…</span>
    </div>
  )
}
