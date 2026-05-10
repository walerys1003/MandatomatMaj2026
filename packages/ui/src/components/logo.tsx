import * as React from 'react'

import { cn } from '../lib/cn'

/**
 * Mandatomat <Logo>.
 *
 * Source: D06_dashboard_b2c (sekcja Logo).
 * Wordmark "Mandatomat" w Inter Tight 800 + suffix ".pl" w precision-blue-400.
 * Letter-spacing -0.04em (zgodnie z systemem display).
 *
 * Wariant `compact` — tylko monogram "M." (sidebar collapsed).
 */
export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'full' | 'compact'
  invert?: boolean
}

export const Logo = React.forwardRef<HTMLSpanElement, LogoProps>(
  ({ className, variant = 'full', invert = false, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-baseline font-display font-extrabold tracking-[-0.04em] leading-none',
        invert ? 'text-iron-50' : 'text-iron-950 dark:text-iron-50',
        className,
      )}
      aria-label="Mandatomat.pl"
      {...props}
    >
      {variant === 'full' ? (
        <>
          <span>Mandatomat</span>
          <span className="text-precision-blue-400">.pl</span>
        </>
      ) : (
        <>
          <span>M</span>
          <span className="text-precision-blue-400">.</span>
        </>
      )}
    </span>
  ),
)
Logo.displayName = 'Logo'
