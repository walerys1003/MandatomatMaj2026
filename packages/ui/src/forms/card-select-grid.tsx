'use client'

import * as React from 'react'

import { cn } from '../lib/cn'

/**
 * <CardSelectGrid> — krok 1 wizarda Mandatomatu (chunk D07).
 *
 * 2-kolumnowy grid kart wyboru:
 *  - border 1.5px iron-200, radius 12px, padding 16px 20px, min-h 80px
 *  - selected: border 2px blue-500 + bg blue-50 + ikona blue-600
 *  - hover (unselected): border iron-300 + shadow sm
 *
 * Przeznaczenie: wybór kategorii sprawy (mandat / fotoradar / parking / ZTM / ITD / e-TOLL / OC/AC / inne).
 * Można też użyć jako pojedyncze pole "select" w wizardzie.
 */

export interface CardSelectOption {
  value: string
  title: string
  description?: string
  /** Lucide icon component lub emoji string. */
  icon?: React.ReactNode
  disabled?: boolean
  /** Highlight (np. "polecane" / "promocja"). */
  badge?: string
}

export interface CardSelectGridProps {
  options: CardSelectOption[]
  value?: string
  onChange?: (value: string) => void
  /** Liczba kolumn — default 2. */
  columns?: 1 | 2 | 3
  className?: string
  /** Aria label dla grupy radio. */
  ariaLabel?: string
}

export function CardSelectGrid({
  options,
  value,
  onChange,
  columns = 2,
  className,
  ariaLabel,
}: CardSelectGridProps) {
  const colsClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('grid gap-3', colsClass, className)}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange?.(opt.value)}
            className={cn(
              'group relative flex min-h-[80px] cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 text-left transition-all duration-150 ease-snap',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-500 focus-visible:ring-offset-2',
              'dark:bg-iron-900',
              selected
                ? 'border-2 border-precision-blue-500 bg-precision-blue-50 dark:border-precision-blue-500 dark:bg-precision-blue-950'
                : 'border-[1.5px] border-iron-200 hover:-translate-y-px hover:border-iron-300 hover:shadow-sm dark:border-iron-800 dark:hover:border-iron-700',
              opt.disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {opt.icon ? (
              <span
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center text-2xl transition-colors',
                  selected
                    ? 'text-precision-blue-600 dark:text-precision-blue-300'
                    : 'text-iron-400 group-hover:text-iron-600 dark:text-iron-500',
                )}
              >
                {opt.icon}
              </span>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span
                className={cn(
                  'text-sm font-semibold leading-tight',
                  selected
                    ? 'text-precision-blue-900 dark:text-precision-blue-100'
                    : 'text-iron-900 dark:text-iron-100',
                )}
              >
                {opt.title}
              </span>
              {opt.description ? (
                <span className="text-xs text-iron-500 dark:text-iron-400">{opt.description}</span>
              ) : null}
            </div>
            {opt.badge ? (
              <span className="absolute right-3 top-3 rounded-full bg-volt-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-volt-700">
                {opt.badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
