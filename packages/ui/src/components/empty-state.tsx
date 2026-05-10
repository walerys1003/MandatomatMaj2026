import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn'

/**
 * <EmptyState> — uniwersalny "puste stany" komponent.
 *
 * Używaj wszędzie gdzie lista/dashboard/sekcja jest pusta:
 *  - /panel (brak spraw)
 *  - /sprawy (brak spraw)
 *  - /terminy (brak terminów)
 *  - /admin/* (brak rekordów po filtrach)
 *  - /profil/polecenia (brak poleceń)
 *
 * Warianty:
 *  - default: neutralna ramka (lista jest pusta)
 *  - hero: kolorowa ramka + większa typografia (dla głównych ekranów takich jak /panel pusty)
 *  - compact: mniejszy padding (do sekcji wewnątrz strony)
 *  - error: czerwone akcenty (np. po nieudanym fetchu)
 */
export const emptyStateVariants = cva(
  [
    'flex flex-col items-center justify-center text-center',
    'rounded-xl border border-dashed transition-colors',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-iron-200 bg-iron-50/50 dark:border-iron-700 dark:bg-iron-900/40',
        hero: 'border-precision-blue-200 bg-precision-blue-50/50 dark:border-precision-blue-900 dark:bg-precision-blue-950/30',
        compact: 'border-iron-200 bg-white dark:border-iron-800 dark:bg-iron-900',
        error: 'border-signal-200 dark:border-signal-900 dark:bg-signal-950/30 bg-signal-50/50',
      },
      size: {
        sm: 'gap-3 p-6',
        md: 'gap-4 p-10',
        lg: 'gap-5 p-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof emptyStateVariants> {
  /** Emoji lub krótki znak (np. "✨", "📅", "🔍"). Renderowany w kółku. */
  icon?: React.ReactNode
  /** Tytuł — H2 lub H3 (zależy od size). */
  title: string
  /** Opis pod tytułem. */
  description?: string
  /** CTA — typowo <Link><Button>...</Button></Link>. */
  action?: React.ReactNode
  /** Drugi, mniej priorytetowy CTA (link tekstowy). */
  secondaryAction?: React.ReactNode
}

const iconBgByVariant: Record<NonNullable<EmptyStateProps['variant']>, string> = {
  default: 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-200',
  hero: 'bg-precision-blue-100 text-precision-blue-700 dark:bg-precision-blue-900 dark:text-precision-blue-300',
  compact: 'bg-iron-100 text-iron-700 dark:bg-iron-800 dark:text-iron-200',
  error: 'bg-signal-100 text-signal-700 dark:bg-signal-900 dark:text-signal-300',
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      icon,
      title,
      description,
      action,
      secondaryAction,
      ...props
    },
    ref,
  ) => {
    const v = variant ?? 'default'
    const isHero = v === 'hero'
    const headingClass = isHero
      ? 'font-display text-2xl font-extrabold tracking-[-0.02em] text-iron-950 dark:text-white sm:text-3xl'
      : 'font-display text-lg font-bold tracking-tight text-iron-950 dark:text-white'

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(emptyStateVariants({ variant, size }), className)}
        {...props}
      >
        {icon ? (
          <div
            aria-hidden="true"
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full text-2xl',
              iconBgByVariant[v],
            )}
          >
            {icon}
          </div>
        ) : null}
        <div className="space-y-1.5">
          <h2 className={headingClass}>{title}</h2>
          {description ? (
            <p className="mx-auto max-w-md text-sm text-iron-600 dark:text-iron-300">
              {description}
            </p>
          ) : null}
        </div>
        {(action || secondaryAction) && (
          <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    )
  },
)
EmptyState.displayName = 'EmptyState'
