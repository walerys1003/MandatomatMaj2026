/**
 * Loading skeleton dla /poradnik/[slug] (T5-FE-038).
 */
export default function GuideLoading() {
  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16"
      role="status"
      aria-label="Ładowanie poradnika"
    >
      <div className="mb-6 h-3 w-48 animate-pulse rounded bg-iron-200 dark:bg-iron-800" />
      <div className="mb-3 h-3 w-20 animate-pulse rounded bg-iron-200 dark:bg-iron-800" />
      <div className="mb-4 h-10 w-3/4 animate-pulse rounded bg-iron-200 dark:bg-iron-800" />
      <div className="mb-2 h-4 w-full animate-pulse rounded bg-iron-200 dark:bg-iron-800" />
      <div className="mb-10 h-4 w-1/2 animate-pulse rounded bg-iron-200 dark:bg-iron-800" />

      <div className="mb-10 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg border border-iron-200 bg-iron-100 dark:border-iron-800 dark:bg-iron-900"
          />
        ))}
      </div>
      <span className="sr-only">Ładowanie...</span>
    </div>
  )
}
