import { cn } from '../../lib/cn'

/**
 * <DeadlineCountdown> — kolory wg dni do terminu.
 *
 * Reguły z chunka D06:
 *  - >14 dni → iron-500 (szary, neutral)
 *  - 7-14    → amber (uwaga)
 *  - <7      → signal (krytyczne)
 *  - <0      → expired (czerwony, bold)
 */

export interface DeadlineCountdownProps {
  /** ISO date string lub Date. */
  deadline: string | Date
  /** Format: 'short' = "5 dni", 'long' = "Za 5 dni (15 maja)". */
  format?: 'short' | 'long'
  className?: string
}

function calcDaysLeft(deadline: Date): number {
  const now = new Date()
  // Reset hours dla deterministic comparison
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const b = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
  const diffMs = b.getTime() - a.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

const POLISH_MONTHS_SHORT = [
  'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
  'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
]

function formatPolishShort(d: Date): string {
  return `${d.getDate()} ${POLISH_MONTHS_SHORT[d.getMonth()]}`
}

export function DeadlineCountdown({ deadline, format = 'short', className }: DeadlineCountdownProps) {
  const date = deadline instanceof Date ? deadline : new Date(deadline)
  const days = calcDaysLeft(date)

  let colorClass: string
  let prefix = ''
  let label: string

  if (days < 0) {
    colorClass = 'text-signal-700 font-bold dark:text-signal-300'
    label = `${Math.abs(days)} dni po terminie`
  } else if (days === 0) {
    colorClass = 'text-signal-600 font-bold dark:text-signal-300'
    label = 'Dzisiaj!'
  } else if (days < 7) {
    colorClass = 'text-signal-600 font-semibold dark:text-signal-400'
    label = days === 1 ? 'Jutro' : `Za ${days} dni`
  } else if (days <= 14) {
    colorClass = 'text-amber-700 font-medium dark:text-amber-400'
    label = `Za ${days} dni`
  } else {
    colorClass = 'text-iron-500 dark:text-iron-400'
    label = `Za ${days} dni`
  }

  if (format === 'long' && days >= 0) {
    label = `${label} (${formatPolishShort(date)})`
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-sm tabular-nums', colorClass, className)}
      title={date.toISOString().slice(0, 10)}
    >
      {prefix}
      {label}
    </span>
  )
}
