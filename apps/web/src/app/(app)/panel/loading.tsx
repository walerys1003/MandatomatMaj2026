import { SkeletonCard, SkeletonTableRow } from '@mandatomat/ui'

/**
 * Loading UI dla /panel — skeleton-based (P9).
 *
 * Mirror of dashboard structure: header → quick actions → metrics grid (4) →
 * cases table (5 rows). Lepszy perceived performance niż spinner — user widzi
 * od razu układ strony i wie czego się spodziewać.
 */
export default function PanelLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Ładowanie pulpitu">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-iron-100 dark:bg-iron-800/60" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-iron-200 bg-iron-50 dark:border-iron-800 dark:bg-iron-900"
          />
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Cases table */}
      <div className="rounded-xl border border-iron-200 bg-white p-4 dark:border-iron-800 dark:bg-iron-900">
        <div className="mb-3 h-5 w-40 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonTableRow key={i} columns={4} />
        ))}
      </div>

      <span className="sr-only">Ładujemy Twój panel…</span>
    </div>
  )
}
