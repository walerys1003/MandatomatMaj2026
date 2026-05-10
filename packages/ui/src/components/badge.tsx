import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn'

/**
 * Mandatomat <Badge>.
 *
 * Pill domyślnie + wariant `mono` z JetBrains Mono dla numerów spraw / kategorii.
 * Wariant `status-*` mapuje 1:1 na case_status z DB (chunki T06, D06).
 */

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border',
  {
    variants: {
      variant: {
        neutral:
          'bg-iron-100 text-iron-700 border-iron-200 dark:bg-iron-800 dark:text-iron-200 dark:border-iron-700',
        info: 'bg-precision-blue-50 text-precision-blue-700 border-precision-blue-200',
        success: 'bg-volt-100 text-volt-700 border-volt-300',
        danger: 'bg-signal-100 text-signal-600 border-signal-400',
        warning: 'bg-status-amber-100 text-status-amber-600 border-status-amber-500',
      },
      mono: {
        true: 'font-mono tracking-tight',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      mono: false,
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, mono, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, mono }), className)} {...props} />
  ),
)
Badge.displayName = 'Badge'

/**
 * StatusBadge — mapping case_status → kolor + label PL.
 */
export type CaseStatusLite =
  | 'draft'
  | 'in_progress'
  | 'awaiting_payment'
  | 'generating'
  | 'ready'
  | 'sent'
  | 'archived'
  | 'failed'

type StatusEntry = {
  label: string
  variant: NonNullable<VariantProps<typeof badgeVariants>['variant']>
}

const STATUS_MAP: Record<string, StatusEntry> = {
  // CaseStatusLite (UI-friendly)
  draft: { label: 'Szkic', variant: 'neutral' },
  in_progress: { label: 'W toku', variant: 'info' },
  awaiting_payment: { label: 'Oczekuje płatności', variant: 'warning' },
  generating: { label: 'Generowanie', variant: 'info' },
  ready: { label: 'Gotowe', variant: 'success' },
  sent: { label: 'Wysłane', variant: 'success' },
  archived: { label: 'Zarchiwizowane', variant: 'neutral' },
  failed: { label: 'Błąd', variant: 'danger' },
  // case_status enum (DB) — dodatkowe wartości spoza CaseStatusLite
  form_completed: { label: 'Formularz wypełniony', variant: 'info' },
  preview: { label: 'Podgląd', variant: 'info' },
  editing: { label: 'Edycja', variant: 'info' },
  payment_pending: { label: 'Oczekuje płatności', variant: 'warning' },
  paid: { label: 'Opłacone', variant: 'success' },
  downloaded: { label: 'Pobrane', variant: 'success' },
  waiting: { label: 'Oczekiwanie', variant: 'warning' },
  resolved: { label: 'Rozstrzygnięte', variant: 'success' },
  // payment status
  succeeded: { label: 'Zrealizowane', variant: 'success' },
  pending: { label: 'Oczekuje', variant: 'warning' },
  refunded: { label: 'Zwrócone', variant: 'neutral' },
  disputed: { label: 'Sporne', variant: 'danger' },
  processing: { label: 'Przetwarzanie', variant: 'info' },
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  /** Akceptuje CaseStatusLite, case_status (DB enum) lub dowolny string (fallback). */
  status: CaseStatusLite | string | null | undefined
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const key = typeof status === 'string' ? status : ''
    const entry: StatusEntry = STATUS_MAP[key] ?? {
      label: key || 'Nieznany',
      variant: 'neutral',
    }
    return (
      <Badge ref={ref} variant={entry.variant} className={className} {...props}>
        {entry.label}
      </Badge>
    )
  },
)
StatusBadge.displayName = 'StatusBadge'
