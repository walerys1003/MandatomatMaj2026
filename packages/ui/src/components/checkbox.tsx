import * as React from 'react'

import { Check } from 'lucide-react'

import { cn } from '../lib/cn'

/**
 * Mandatomat <Checkbox>.
 *
 * Native input + visual mask. Focus ring precision-blue 600 @ 18%.
 * 18×18px (standard Mandatomat — kompaktowy UI).
 */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  invalid?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, invalid, checked, defaultChecked, ...props }, ref) => (
    <span className={cn('relative inline-flex h-[18px] w-[18px] shrink-0', className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        className={cn(
          'peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded',
          'border bg-white transition-colors duration-150 ease-snap',
          'border-iron-300 dark:border-iron-700 dark:bg-iron-900',
          'checked:border-precision-blue-600 checked:bg-precision-blue-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-600/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          invalid && 'border-signal-500 focus-visible:ring-signal-500/30',
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
      <Check
        className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
        strokeWidth={3}
        aria-hidden="true"
      />
    </span>
  ),
)
Checkbox.displayName = 'Checkbox'
