import * as React from 'react'

import { cn } from '../lib/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex min-h-[100px] w-full rounded-md border bg-white px-3 py-2 text-sm',
        'border-iron-200 text-iron-900 placeholder:text-iron-400',
        'dark:bg-iron-900 dark:text-iron-50 dark:border-iron-700 dark:placeholder:text-iron-500',
        'transition-colors duration-150 ease-snap resize-y',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-600/30 focus-visible:border-precision-blue-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-signal-500 focus-visible:ring-signal-500/30 focus-visible:border-signal-600',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
