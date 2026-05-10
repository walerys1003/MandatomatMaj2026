import * as React from 'react'

import { cn } from '../lib/cn'

/**
 * Mandatomat <Input>.
 *
 * Krótkie formularze — wizard 560px, gap 16px. Focus ring precision-blue 600 @ 18%.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
        'border-iron-200 text-iron-900 placeholder:text-iron-400',
        'dark:bg-iron-900 dark:text-iron-50 dark:border-iron-700 dark:placeholder:text-iron-500',
        'transition-colors duration-150 ease-snap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-600/30 focus-visible:border-precision-blue-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-signal-500 focus-visible:ring-signal-500/30 focus-visible:border-signal-600',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-sm font-medium text-iron-700 dark:text-iron-200',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    )}
    {...props}
  />
))
Label.displayName = 'Label'
