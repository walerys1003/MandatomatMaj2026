import Link from 'next/link'

import { cn } from '../../lib/cn'

import { DeadlineCountdown } from './deadline-countdown'
import { StatusBadge, type CaseStatus } from './status-badge'

/**
 * <CasesTable> — desktop tabela 6 kolumn.
 *
 * Chunk D06:
 *   Typ / Data / Instytucja / Status / Termin / Akcje
 *
 * Renderowana tylko na ≥md. Na mobile używaj <CasesList>.
 */

export interface CaseTableRow {
  id: string
  type: string
  /** Skrócona etykieta typu (np. "Mandat — prędkość"). */
  typeLabel: string
  createdAt: string | Date
  /** Adresat / instytucja (Policja / ZTM / Sąd). */
  institution: string | null
  status: CaseStatus | string
  /** Najbliższy termin (ISO) lub null. */
  deadline?: string | Date | null
  /** Tytuł roboczy (mandat za prędkość 60 km/h itp.). */
  title?: string | null
}

export interface CasesTableProps {
  rows: CaseTableRow[]
  className?: string
  /** Komunikat gdy brak danych. */
  emptyMessage?: string
}

const POLISH_MONTHS_SHORT = [
  'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
  'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
]

function formatShortDate(d: Date): string {
  return `${d.getDate()} ${POLISH_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

export function CasesTable({ rows, className, emptyMessage = 'Brak spraw.' }: CasesTableProps) {
  if (rows.length === 0) {
    return (
      <div className={cn('rounded-lg border border-iron-200 bg-white p-8 text-center text-sm text-iron-500 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-400', className)}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-iron-200 bg-white dark:border-iron-700 dark:bg-iron-900',
        className,
      )}
    >
      <table className="min-w-full text-sm">
        <thead className="bg-iron-50 text-xs font-medium uppercase tracking-wider text-iron-600 dark:bg-iron-950 dark:text-iron-400">
          <tr>
            <th scope="col" className="px-4 py-3 text-left">Typ</th>
            <th scope="col" className="px-4 py-3 text-left">Data</th>
            <th scope="col" className="px-4 py-3 text-left">Instytucja</th>
            <th scope="col" className="px-4 py-3 text-left">Status</th>
            <th scope="col" className="px-4 py-3 text-left">Termin</th>
            <th scope="col" className="px-4 py-3 text-right">Akcje</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-iron-100 dark:divide-iron-800">
          {rows.map((row) => {
            const date = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt)
            return (
              <tr
                key={row.id}
                className="transition hover:bg-iron-50 dark:hover:bg-iron-800/50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-iron-900 dark:text-iron-100">{row.typeLabel}</div>
                  {row.title ? (
                    <div className="mt-0.5 text-xs text-iron-500 dark:text-iron-400 line-clamp-1">{row.title}</div>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-iron-600 dark:text-iron-400">
                  {formatShortDate(date)}
                </td>
                <td className="px-4 py-3 text-iron-700 dark:text-iron-300">
                  {row.institution ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {row.deadline ? (
                    <DeadlineCountdown deadline={row.deadline} />
                  ) : (
                    <span className="text-iron-400 dark:text-iron-500">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/sprawy/${row.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Szczegóły →
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * <CasesList> — mobile, lista kart.
 */
export function CasesList({ rows, className, emptyMessage = 'Brak spraw.' }: CasesTableProps) {
  if (rows.length === 0) {
    return (
      <div className={cn('rounded-lg border border-iron-200 bg-white p-6 text-center text-sm text-iron-500 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-400', className)}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <ul className={cn('space-y-2', className)}>
      {rows.map((row) => {
        const date = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt)
        return (
          <li key={row.id}>
            <Link
              href={`/sprawy/${row.id}`}
              className="flex items-center gap-3 rounded-lg border border-iron-200 bg-white px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/30 dark:border-iron-700 dark:bg-iron-900 dark:hover:border-brand-600 dark:hover:bg-brand-950/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-iron-900 dark:text-iron-100">
                    {row.typeLabel}
                  </span>
                  <StatusBadge status={row.status} />
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-iron-500 dark:text-iron-400">
                  <span>{formatShortDate(date)}</span>
                  {row.institution ? <><span aria-hidden>·</span><span className="truncate">{row.institution}</span></> : null}
                </div>
                {row.deadline ? (
                  <div className="mt-1">
                    <DeadlineCountdown deadline={row.deadline} format="short" />
                  </div>
                ) : null}
              </div>
              <span aria-hidden className="text-iron-400">→</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
