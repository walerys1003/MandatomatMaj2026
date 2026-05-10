/**
 * Loading UI dla /terminy — skeleton-based (P9).
 *
 * Mirror: header + grid kalendarza 7×6 + lista nadchodzących.
 */
export default function TerminyLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Ładowanie terminów">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
        <div className="h-4 w-48 animate-pulse rounded-md bg-iron-100 dark:bg-iron-800/60" />
      </div>

      {/* Kalendarz */}
      <div className="rounded-xl border border-iron-200 bg-white p-4 dark:border-iron-800 dark:bg-iron-900">
        <div className="mb-3 h-4 w-32 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-md bg-iron-100 dark:bg-iron-800/50"
            />
          ))}
        </div>
      </div>

      {/* Lista nadchodzących */}
      <div className="space-y-2">
        <div className="h-5 w-32 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md border border-iron-200 bg-white p-3 dark:border-iron-800 dark:bg-iron-900"
          >
            <div className="space-y-1.5">
              <div className="h-4 w-48 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
              <div className="h-3 w-32 animate-pulse rounded-md bg-iron-100 dark:bg-iron-800/60" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-md bg-iron-200 dark:bg-iron-800" />
          </div>
        ))}
      </div>

      <span className="sr-only">Wczytujemy kalendarz terminów…</span>
    </div>
  )
}
