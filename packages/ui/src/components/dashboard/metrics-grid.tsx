import { cn } from '../../lib/cn'

/**
 * <MetricsGrid> — 4 kafle KPI dla dashboard B2C.
 *
 * Layout: grid 1/2/4 col (mobile/tablet/desktop).
 * Kafle: Pisma w miesiącu / Oczekujące / Uwzględnione / Skuteczność %.
 *
 * Chunk D06: jeden hero metric (Skuteczność) z kolorem signal/emerald,
 * pozostałe — neutralny iron.
 */

export interface MetricItem {
  label: string
  value: string | number
  /** Opcjonalny sub-label (np. "+12 vs poprzedni mies."). */
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  /** Wariant koloru. */
  variant?: 'neutral' | 'success' | 'warning' | 'hero'
  /** Ikona (emoji lub komponent). */
  icon?: React.ReactNode
}

export interface MetricsGridProps {
  items: MetricItem[]
  className?: string
}

const VARIANT_CLASSES: Record<NonNullable<MetricItem['variant']>, string> = {
  neutral: 'border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900',
  success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
  hero: 'border-brand-200 bg-gradient-to-br from-brand-50 to-white dark:border-brand-800 dark:from-brand-950 dark:to-iron-900',
}

const VALUE_CLASSES: Record<NonNullable<MetricItem['variant']>, string> = {
  neutral: 'text-iron-900 dark:text-iron-50',
  success: 'text-emerald-700 dark:text-emerald-300',
  warning: 'text-amber-700 dark:text-amber-300',
  hero: 'text-brand-700 dark:text-brand-200',
}

const TREND_CLASSES = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-signal-600 dark:text-signal-400',
  neutral: 'text-iron-500 dark:text-iron-400',
}

export function MetricsGrid({ items, className }: MetricsGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item, idx) => {
        const variant = item.variant ?? 'neutral'
        const direction = item.trendDirection ?? 'neutral'
        return (
          <div
            key={`${item.label}-${idx}`}
            className={cn(
              'rounded-lg border p-5 shadow-sm',
              VARIANT_CLASSES[variant],
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-iron-600 dark:text-iron-400">
                {item.label}
              </p>
              {item.icon ? (
                <span aria-hidden className="text-lg leading-none opacity-60">
                  {item.icon}
                </span>
              ) : null}
            </div>
            <p
              className={cn(
                'mt-2 text-3xl font-bold tabular-nums',
                VALUE_CLASSES[variant],
              )}
            >
              {item.value}
            </p>
            {item.trend ? (
              <p className={cn('mt-1 text-xs', TREND_CLASSES[direction])}>
                {direction === 'up' ? '↗' : direction === 'down' ? '↘' : '·'} {item.trend}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
