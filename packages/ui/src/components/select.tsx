import * as React from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '../lib/cn'

/**
 * Native <select> wrapper z chevronem i stylem zgodnym z Input.
 * Dla bardziej zaawansowanego selecta (search, multi) — Radix Select w osobnym komponencie.
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <span className="relative inline-flex w-full">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex h-10 w-full appearance-none rounded-md border bg-white pr-9 pl-3 py-2 text-sm',
          'border-iron-200 text-iron-900',
          'dark:bg-iron-900 dark:text-iron-50 dark:border-iron-700',
          'transition-colors duration-150 ease-snap',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-600/30 focus-visible:border-precision-blue-600',
          'disabled:cursor-not-allowed disabled:opacity-50',
          invalid && 'border-signal-500 focus-visible:ring-signal-500/30 focus-visible:border-signal-600',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-iron-500"
        aria-hidden="true"
      />
    </span>
  ),
)
Select.displayName = 'Select'
