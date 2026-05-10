import Link from 'next/link'

import { cn } from '../../lib/cn'

import { DeadlineCountdown } from './deadline-countdown'

/**
 * <DeadlineWidget> — najbliższe 3 terminy z countdown + akcje.
 *
 * Chunk D06: pokazywany na dashboardzie powyżej tabeli spraw.
 */

export interface DeadlineItem {
  id: string
  caseId: string
  title: string
  deadlineDate: string | Date
  legalBasis?: string | null
}

export interface DeadlineWidgetProps {
  items: DeadlineItem[]
  className?: string
}

export function DeadlineWidget({ items, className }: DeadlineWidgetProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900',
          className,
        )}
      >
        <h3 className="text-sm font-semibold text-iron-900 dark:text-iron-50">
          Nadchodzące terminy
        </h3>
        <p className="mt-2 text-sm text-iron-500 dark:text-iron-400">
          Nie masz aktualnie żadnych terminów. Po opłaceniu pisma dodamy je tutaj automatycznie.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-iron-100 px-4 py-3 dark:border-iron-800">
        <h3 className="text-sm font-semibold text-iron-900 dark:text-iron-50">
          Nadchodzące terminy
        </h3>
        <Link
          href="/terminy"
          className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Zobacz wszystkie →
        </Link>
      </div>
      <ul className="divide-y divide-iron-100 dark:divide-iron-800">
        {items.slice(0, 3).map((item) => (
          <li key={item.id} className="px-4 py-3">
            <Link
              href={`/sprawy/${item.caseId}`}
              className="group flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-iron-900 group-hover:text-brand-700 dark:text-iron-100 dark:group-hover:text-brand-300">
                  {item.title}
                </p>
                {item.legalBasis ? (
                  <p className="mt-0.5 truncate text-xs text-iron-500 dark:text-iron-400">
                    {item.legalBasis}
                  </p>
                ) : null}
              </div>
              <DeadlineCountdown deadline={item.deadlineDate} format="long" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
