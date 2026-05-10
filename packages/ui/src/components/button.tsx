import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn'

/**
 * Mandatomat <Button>.
 *
 * Warianty zgodne z chunkiem D08_komponenty_unikalne (i odwołania w D03/D05/D06).
 * - primary: precision-blue-600 — domyślny CTA (max 1 na sekcji)
 * - secondary-soft: iron-100 tło, iron-900 tekst — mniej priorytetowe akcje
 * - ghost: bez tła, hover iron-100 — akcje pomocnicze
 * - danger: signal-600 — destrukcyjne (anuluj sprawę)
 * - success: volt-600 — potwierdzenie (rzadko, np. confirm payment)
 *
 * Animacja kliknięcia: scale 1→0.98→1 w 80ms (najkrótsza w LexMate24).
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium select-none',
    'rounded-md',
    'transition-[transform,background-color,border-color,color,box-shadow]',
    'duration-150 ease-snap',
    'active:scale-[0.98] active:duration-80',
    'disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-600/30',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-precision-blue-600 text-white hover:bg-precision-blue-500 shadow-sm',
        'secondary-soft':
          'bg-iron-100 text-iron-900 hover:bg-iron-200 dark:bg-iron-800 dark:text-iron-50 dark:hover:bg-iron-700',
        ghost:
          'bg-transparent text-iron-700 hover:bg-iron-100 dark:text-iron-200 dark:hover:bg-iron-800',
        danger: 'bg-signal-600 text-white hover:bg-signal-500',
        success: 'bg-volt-600 text-white hover:bg-volt-500',
        outline:
          'border border-iron-200 bg-transparent text-iron-900 hover:bg-iron-100 dark:border-iron-700 dark:text-iron-50 dark:hover:bg-iron-800',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
