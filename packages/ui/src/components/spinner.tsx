import * as React from 'react'

import { cn } from '../lib/cn'

/**
 * Mandatomat <Spinner>.
 *
 * D10: BRAK skeleton shimmer. Spinner: 24px, border 2px iron-100 / top precision-blue-500,
 * rotate 360deg, 600ms linear infinite.
 *
 * "System przetwarza Twoje dane" — nie "ładuje się strona".
 */

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  label?: string
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 24, label, className, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2 text-iron-500', className)}
      {...props}
    >
      <span
        className="inline-block animate-spinner rounded-full border-2 border-iron-100 border-t-precision-blue-500"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label ? <span className="text-sm">{label}</span> : <span className="sr-only">Ładowanie</span>}
    </div>
  ),
)
Spinner.displayName = 'Spinner'
