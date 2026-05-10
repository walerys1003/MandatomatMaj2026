import * as React from 'react'

import { cn } from '../lib/cn'

/**
 * Mandatomat <Card>.
 *
 * Domyślny radius 12px, padding 24px (kompaktowy), gap 16px.
 * Hover: shadow sm→md, border-color iron-200→precision-blue-200, translateY -1px (subtle).
 * Source: D06_dashboard_b2c, D08_komponenty_unikalne, D10_animacje (1px hover).
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-iron-200 bg-white p-6',
        'dark:border-iron-800 dark:bg-iron-900',
        'shadow-sm',
        interactive &&
          'transition-[transform,box-shadow,border-color] duration-150 ease-snap hover:-translate-y-px hover:shadow-md hover:border-precision-blue-200',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 mb-4', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'font-display text-h4 text-iron-900 dark:text-iron-50',
        className,
      )}
      {...props}
    />
  ),
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-iron-500 dark:text-iron-400', className)} {...props} />
  ),
)
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-4', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-3 mt-4', className)} {...props} />
  ),
)
CardFooter.displayName = 'CardFooter'
