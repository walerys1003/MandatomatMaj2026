import * as React from 'react'

import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn'

/**
 * Mandatomat <Alert> — komunikaty inline (formularze, error states, info banners).
 * 4 warianty + auto-icon. Bez auto-dismiss (to nie toast).
 */

const alertVariants = cva(
  'flex items-start gap-3 rounded-md border p-4 text-sm',
  {
    variants: {
      variant: {
        info: 'border-precision-blue-200 bg-precision-blue-50 text-precision-blue-900',
        success: 'border-volt-300 bg-volt-50 text-volt-700',
        warning: 'border-status-amber-500 bg-status-amber-100 text-status-amber-600',
        danger: 'border-signal-400 bg-signal-50 text-signal-700',
      },
    },
    defaultVariants: { variant: 'info' },
  },
)

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
} as const

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, ...props }, ref) => {
    const Icon = ICONS[variant ?? 'info']
    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          {title ? <div className="font-semibold leading-none">{title}</div> : null}
          {children ? <div className="leading-relaxed">{children}</div> : null}
        </div>
      </div>
    )
  },
)
Alert.displayName = 'Alert'
