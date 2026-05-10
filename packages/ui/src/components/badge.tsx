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

const STATUS_MAP: Record<
  CaseStatusLite,
  { label: string; variant: NonNullable<VariantProps<typeof badgeVariants>['variant']> }
> = {
  draft: { label: 'Szkic', variant: 'neutral' },
  in_progress: { label: 'W toku', variant: 'info' },
  awaiting_payment: { label: 'Oczekuje płatności', variant: 'warning' },
  generating: { label: 'Generowanie', variant: 'info' },
  ready: { label: 'Gotowe', variant: 'success' },
  sent: { label: 'Wysłane', variant: 'success' },
  archived: { label: 'Zarchiwizowane', variant: 'neutral' },
  failed: { label: 'Błąd', variant: 'danger' },
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: CaseStatusLite
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const { label, variant } = STATUS_MAP[status]
    return (
      <Badge ref={ref} variant={variant} className={className} {...props}>
        {label}
      </Badge>
    )
  },
)
StatusBadge.displayName = 'StatusBadge'
