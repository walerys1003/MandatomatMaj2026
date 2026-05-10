/**
 * Loading skeleton dla /kategoria/[slug] (T5-FE-038).
 * Pokazuje się przez Suspense gdy strona jest renderowana SSG/ISR.
 */
export default function CategoryLoading() {
  return (
    <div
      className="mx-auto w-full max-w-4xl px-4 py-12 sm:py-16"
      role="status"
      aria-label="Ładowanie strony kategorii"
    >
      <div className="mb-6 h-3 w-40 animate-pulse rounded bg-iron-200 dark:bg-iron-800" />
      <div className="mb-3 h-3 w-24 animate-pulse rounded bg-iron-200 dark:bg-iron-800" />
      <div className="mb-4 h-12 w-3/4 animate-pulse rounded bg-iron-200 dark:bg-iron-800" />
      <div className="mb-2 h-4 w-full animate-pulse rounded bg-iron-200 dark:bg-iron-800" />
      <div className="mb-10 h-4 w-2/3 animate-pulse rounded bg-iron-200 dark:bg-iron-800" />

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-iron-200 bg-iron-100 dark:border-iron-800 dark:bg-iron-900"
          />
        ))}
      </div>

      <div className="mb-10 h-48 animate-pulse rounded-2xl bg-iron-100 dark:bg-iron-900" />
      <span className="sr-only">Ładowanie...</span>
    </div>
  )
}
