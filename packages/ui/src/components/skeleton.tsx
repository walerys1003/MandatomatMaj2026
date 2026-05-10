import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn'

/**
 * <Skeleton> — placeholder dla zawartości, która się ładuje.
 *
 * Uwaga: D10 oryginalnie sugerował "brak skeleton shimmer; tylko spinner",
 * ale praktyka pokazuje, że skeletony radykalnie poprawiają perceived performance
 * dla list / kart / tabel (Lighthouse / CWV TBT). Spinner zostawiamy dla
 * krótkich, atomowych operacji (load button, polling).
 *
 * Warianty:
 *  - text: prostokąt typografii (h-3 → h-6 zależnie od size)
 *  - rect: prostokąt blok (np. avatar, kafel)
 *  - circle: koło (avatar)
 *
 * Animacja: tailwind `animate-pulse` (1.5s cubic-bezier loop).
 */
export const skeletonVariants = cva(
  'relative animate-pulse overflow-hidden rounded-md bg-iron-200 dark:bg-iron-800',
  {
    variants: {
      variant: {
        text: 'h-4 w-full',
        rect: 'h-24 w-full',
        circle: 'h-10 w-10 rounded-full',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    compoundVariants: [
      { variant: 'text', size: 'sm', class: 'h-3' },
      { variant: 'text', size: 'md', class: 'h-4' },
      { variant: 'text', size: 'lg', class: 'h-6' },
      { variant: 'rect', size: 'sm', class: 'h-16' },
      { variant: 'rect', size: 'md', class: 'h-24' },
      { variant: 'rect', size: 'lg', class: 'h-40' },
      { variant: 'circle', size: 'sm', class: 'h-8 w-8' },
      { variant: 'circle', size: 'md', class: 'h-10 w-10' },
      { variant: 'circle', size: 'lg', class: 'h-14 w-14' },
    ],
    defaultVariants: {
      variant: 'text',
      size: 'md',
    },
  },
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Skeleton.displayName = 'Skeleton'

/**
 * <SkeletonText> — kilka wierszy tekstu z malejącą szerokością.
 * Wygodny shortcut do bloków tekstowych (paragrafy, opisy).
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}): React.JSX.Element {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="Ładowanie tekstu">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          size="md"
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  )
}

/**
 * <SkeletonCard> — placeholder dla typowej karty (avatar + 2 linie tekstu).
 */
export function SkeletonCard({ className }: { className?: string }): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-xl border border-iron-200 bg-white p-4 dark:border-iron-800 dark:bg-iron-900',
        className,
      )}
      role="status"
      aria-label="Ładowanie karty"
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" size="md" className="w-1/2" />
          <Skeleton variant="text" size="sm" className="w-3/4" />
        </div>
      </div>
    </div>
  )
}

/**
 * <SkeletonTable> — placeholder dla wiersza tabeli (n kolumn).
 */
export function SkeletonTableRow({
  columns = 4,
  className,
}: {
  columns?: number
  className?: string
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-4 border-b border-iron-100 py-3 last:border-0 dark:border-iron-800',
        className,
      )}
      role="status"
      aria-label="Ładowanie wiersza"
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          size="md"
          className={i === 0 ? 'w-1/4' : i === columns - 1 ? 'w-1/6' : 'flex-1'}
        />
      ))}
    </div>
  )
}
