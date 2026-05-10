'use client'

import * as React from 'react'

import { Button } from './button'
import { cn } from '../lib/cn'

/**
 * <ConfirmDialog> — natywny modal potwierdzenia (a11y).
 *
 * Roadmap T20 / T3-FE-045: regenerate-confirm + T3-FE-020: anti-bounce w wizardzie.
 *
 * Cechy:
 *  - <dialog> HTML5 — natywne `showModal()` + ESC-to-close + focus trap
 *  - kolory wariantów: default (brand), danger (signal), warning (volt)
 *  - klik backdrop = cancel
 *  - portal NIE jest potrzebny — <dialog> automatycznie nad innymi elementami
 */

export type ConfirmVariant = 'default' | 'danger' | 'warning'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  /** Loading state na confirm — podczas async operacji. */
  isProcessing?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  className?: string
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  variant = 'default',
  isProcessing,
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps): React.JSX.Element | null {
  const ref = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (open && !dlg.open) {
      try {
        dlg.showModal()
      } catch {
        /* HMR edge case */
      }
    } else if (!open && dlg.open) {
      dlg.close()
    }
  }, [open])

  React.useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    const handleClose = () => onCancel()
    dlg.addEventListener('close', handleClose)
    return () => dlg.removeEventListener('close', handleClose)
  }, [onCancel])

  if (!open && typeof window === 'undefined') return null

  const confirmVariant = variant === 'danger' ? 'danger' : 'primary'

  return (
    <dialog
      ref={ref}
      className={cn(
        'rounded-xl border border-iron-200 bg-white p-0 shadow-xl backdrop:bg-iron-950/50',
        'w-[calc(100%-2rem)] max-w-md',
        'dark:border-iron-700 dark:bg-iron-900',
        className,
      )}
      onClick={(e) => {
        // Klik w backdrop (sam <dialog>, nie inner content) → cancel
        if (e.target === e.currentTarget) onCancel()
      }}
      aria-labelledby="confirm-title"
    >
      <div className="p-6">
        <h2
          id="confirm-title"
          className={cn(
            'font-display text-lg font-bold tracking-[-0.01em]',
            variant === 'danger' && 'dark:text-signal-300 text-signal-700',
            variant === 'warning' && 'text-volt-700 dark:text-volt-300',
            variant === 'default' && 'text-iron-950 dark:text-white',
          )}
        >
          {title}
        </h2>
        {description ? (
          <div className="mt-2 text-sm leading-relaxed text-iron-700 dark:text-iron-300">
            {description}
          </div>
        ) : null}
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="md"
            onClick={() => void onConfirm()}
            disabled={isProcessing}
          >
            {isProcessing ? 'Przetwarzanie…' : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
