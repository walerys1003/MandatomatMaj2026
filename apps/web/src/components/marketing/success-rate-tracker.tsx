/**
 * Success Rate Tracker — wskaźniki skuteczności per kategoria.
 * Statyczne dane (po MVP: live z `daily_stats` w Supabase).
 *
 * Layout: 2 kolumny — lewa headline + opis, prawa lista metryk z paskami progress.
 */

const RATES = [
  { label: 'Fotoradary', value: 89, count: '2,341 spraw' },
  { label: 'Parking', value: 81, count: '1,876 spraw' },
  { label: 'e-TOLL', value: 78, count: '624 spraw' },
  { label: 'ZTM / MPK', value: 74, count: '1,103 spraw' },
  { label: 'Mandaty drogowe', value: 67, count: '4,892 spraw' },
  { label: 'Patrol policji', value: 45, count: '2,107 spraw' },
] as const

export function SuccessRateTracker() {
  return (
    <section className="border-b border-iron-100 bg-iron-50/50 dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto grid max-w-landing gap-12 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
            SKUTECZNOŚĆ
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.03em] text-iron-950 sm:text-5xl dark:text-white">
            Liczby, nie obietnice.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-iron-600 dark:text-iron-300">
            Pokazujemy realne wskaźniki sukcesu — uchylone mandaty, umorzenia, częściowe
            zmniejszenia kary. Dane aktualizowane co 24 godziny.
          </p>
          <p className="mt-3 font-mono text-xs text-iron-500">
            Stan na podstawie ostatnich 12 miesięcy. N = 12,943 spraw.
          </p>
        </div>

        <ul className="space-y-5">
          {RATES.map((r) => (
            <li key={r.label}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-iron-950 dark:text-white">
                  {r.label}
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-iron-950 dark:text-white">
                  {r.value}%
                  <span className="ml-2 text-[11px] font-normal text-iron-500">{r.count}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-iron-200 dark:bg-iron-800">
                <div
                  className="h-full rounded-full bg-precision-blue-500 transition-[width] duration-150"
                  style={{ width: `${r.value}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
