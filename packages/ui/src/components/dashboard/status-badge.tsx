import { cn } from '../../lib/cn'

/**
 * <StatusBadge> — wszystkie warianty statusu sprawy.
 *
 * Statusy z chunka D06 / case_status enum:
 *  - draft:        szkic (jeszcze nie opłacone)
 *  - preview:      podgląd wygenerowany
 *  - paid_pending: oczekuje na potwierdzenie płatności
 *  - paid:         opłacone (final)
 *  - sent:         wysłane do organu
 *  - waiting:      czeka na odpowiedź
 *  - resolved:     rozstrzygnięte
 *  - archived:     archiwum
 */

export type CaseStatus =
  | 'draft'
  | 'preview'
  | 'paid_pending'
  | 'paid'
  | 'sent'
  | 'waiting'
  | 'resolved'
  | 'archived'

export interface StatusBadgeProps {
  status: CaseStatus | string
  className?: string
}

interface StatusConfig {
  label: string
  classes: string
  icon: string
}

const STATUS_MAP: Record<string, StatusConfig> = {
  draft: {
    label: 'Szkic',
    classes: 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-300',
    icon: '✎',
  },
  preview: {
    label: 'Podgląd',
    classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    icon: '👁',
  },
  paid_pending: {
    label: 'Płatność…',
    classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    icon: '⌛',
  },
  paid: {
    label: 'Opłacone',
    classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    icon: '✓',
  },
  sent: {
    label: 'Wysłane',
    classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    icon: '→',
  },
  waiting: {
    label: 'Czeka na odp.',
    classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    icon: '⏳',
  },
  resolved: {
    label: 'Rozstrzygnięte',
    classes: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100',
    icon: '★',
  },
  archived: {
    label: 'Archiwum',
    classes: 'bg-iron-100 text-iron-500 dark:bg-iron-800 dark:text-iron-400',
    icon: '📦',
  },
}

const FALLBACK: StatusConfig = {
  label: 'Nieznany',
  classes: 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-300',
  icon: '·',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? FALLBACK
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        cfg.classes,
        className,
      )}
    >
      <span aria-hidden>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  )
}
