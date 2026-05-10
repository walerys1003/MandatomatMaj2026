'use client'

import * as React from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '../lib/cn'

/**
 * Lekki, samowystarczalny accordion (bez Radix dependency).
 * Pojedyncze item == <details>, nagłówek == <summary>. Świetnie się indeksuje
 * SEO + działa bez JS (graceful degradation).
 *
 * D10: animacja 150ms snap.
 */

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDetailsElement> {
  question: string
  defaultOpen?: boolean
}

export function AccordionItem({
  question,
  defaultOpen,
  children,
  className,
  ...props
}: AccordionItemProps) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        'group rounded-lg border border-iron-200 bg-white transition-colors duration-150 ease-snap',
        'open:border-precision-blue-200 dark:border-iron-800 dark:bg-iron-900',
        'dark:open:border-precision-blue-700',
        className,
      )}
      {...props}
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4',
          'text-left font-medium text-iron-900 dark:text-iron-50',
          'select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-600/30 rounded-lg',
          '[&::-webkit-details-marker]:hidden',
        )}
      >
        <span>{question}</span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-iron-500 transition-transform duration-150 ease-snap group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="px-5 pb-5 pt-0 text-sm leading-relaxed text-iron-600 dark:text-iron-300">
        {children}
      </div>
    </details>
  )
}

export function Accordion({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-3', className)} {...props} />
}
