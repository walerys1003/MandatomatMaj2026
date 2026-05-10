import * as React from 'react'

import { Check } from 'lucide-react'

import { cn } from '../lib/cn'

/**
 * Mandatomat <Stepper>.
 *
 * Source: D07_wizard.
 *
 * BREADCRUMB TABS (NIE numbered dots) — Mandatomat różni się od pozostałych
 * SaaS-ów LexMate24. Każdy krok to tab z numerem + label, połączone separatorem.
 * Aktualny krok ma blue-600 underline; ukończone — check icon volt-600.
 */

export interface StepperStep {
  id: string
  label: string
}

export interface StepperProps {
  steps: ReadonlyArray<StepperStep>
  currentIndex: number
  /** Indeks ostatniego ukończonego kroku (default: currentIndex - 1). */
  completedThrough?: number
  className?: string
  onStepClick?: (index: number) => void
}

export function Stepper({
  steps,
  currentIndex,
  completedThrough,
  className,
  onStepClick,
}: StepperProps) {
  const doneIndex = completedThrough ?? currentIndex - 1
  return (
    <ol
      className={cn('flex flex-wrap items-center gap-x-2 gap-y-3 font-mono text-xs', className)}
      aria-label="Postęp wypełniania"
    >
      {steps.map((step, idx) => {
        const isActive = idx === currentIndex
        const isDone = idx <= doneIndex
        const isUpcoming = !isActive && !isDone
        const clickable = onStepClick != null && (isDone || isActive)

        return (
          <React.Fragment key={step.id}>
            <li className="flex items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onStepClick?.(idx) : undefined}
                className={cn(
                  'inline-flex items-center gap-2 px-2 py-1 rounded transition-colors duration-150 ease-snap',
                  isActive &&
                    'text-precision-blue-700 border-b-2 border-precision-blue-600 -mb-[2px]',
                  isDone && 'text-volt-700 hover:bg-volt-50 cursor-pointer',
                  isUpcoming && 'text-iron-400 cursor-default',
                  clickable && 'cursor-pointer',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <span className="font-mono tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                )}
                <span className="font-sans font-medium uppercase tracking-wider">
                  {step.label}
                </span>
              </button>
            </li>
            {idx < steps.length - 1 ? (
              <li
                className={cn(
                  'h-px w-6 sm:w-10',
                  isDone ? 'bg-volt-400' : 'bg-iron-200 dark:bg-iron-700',
                )}
                aria-hidden="true"
              />
            ) : null}
          </React.Fragment>
        )
      })}
    </ol>
  )
}
