'use client'

/**
 * In-app tooltip tour (T6-ONB-003).
 *
 * Lekki tour bez zależności (`shepherd.js` to ~80kb). Wsparcie:
 *  - 5 kroków na `/sprawy/nowa`
 *  - localStorage flag `mnd-tour-completed` (nie pokazuje ponownie)
 *  - klawiatura (←/→/Esc) + CTA "Pomiń"
 *  - tracking PostHog/Plausible przez `trackFunnel`
 */

import { useCallback, useEffect, useState } from 'react'

import { trackFunnel } from '@/lib/onboarding/funnel'

const TOUR_KEY = 'mnd-tour-completed-v1'

export interface TourStep {
  /** CSS selector dla elementu który tour highlightuje. */
  target: string
  title: string
  body: string
  /** Pozycja relatywna do targetu. */
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const DEFAULT_STEPS: TourStep[] = [
  {
    target: '[data-tour="step-category"]',
    title: 'Krok 1 — Wybierz kategorię',
    body: 'Zacznij od kategorii: mandat, parking, e-TOLL, windykacja, ubezpieczenie...',
    placement: 'bottom',
  },
  {
    target: '[data-tour="step-subtype"]',
    title: 'Krok 2 — Doprecyzuj typ sprawy',
    body: 'Każda kategoria ma kilka podtypów. Wybierz najbliższy Twojej sytuacji.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="step-form"]',
    title: 'Krok 3 — Wypełnij formularz',
    body: '15 pól, ok. 3-5 min. Wszystkie obowiązkowe — od tego zależy jakość pisma.',
    placement: 'right',
  },
  {
    target: '[data-tour="step-ocr"]',
    title: 'Krok 4 — Skan dokumentu (opcjonalnie)',
    body: 'Załącz zdjęcie mandatu/wezwania — OCR wypełni pola automatycznie.',
    placement: 'top',
  },
  {
    target: '[data-tour="step-generate"]',
    title: 'Krok 5 — Wygeneruj pismo',
    body: 'AI analizuje sprawę → ocenia szanse → pisze profesjonalny tekst. Pobierz PDF.',
    placement: 'top',
  },
]

export interface TooltipTourProps {
  steps?: TourStep[]
  /** Wymuś otwarcie nawet jeśli już completed. */
  force?: boolean
}

export function TooltipTour({ steps = DEFAULT_STEPS, force = false }: TooltipTourProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const done = window.localStorage.getItem(TOUR_KEY)
    if (!done || force) {
      setOpen(true)
    }
  }, [force])

  const close = useCallback(
    (reason: 'completed' | 'skipped') => {
      try {
        window.localStorage.setItem(TOUR_KEY, '1')
      } catch {
        // ignore — quota exceeded
      }
      trackFunnel(
        reason === 'completed' ? 'onboarding_tour_completed' : 'onboarding_tour_skipped',
        { step: index + 1, total: steps.length },
      )
      setOpen(false)
    },
    [index, steps.length],
  )

  // Track step changes
  useEffect(() => {
    if (open) {
      trackFunnel('onboarding_tour_step', { step: index + 1, total: steps.length })
    }
  }, [index, open, steps.length])

  // Recalculate position when step or window changes
  useEffect(() => {
    if (!open) return
    const step = steps[index]
    if (!step) return

    function updateRect() {
      const el = document.querySelector(step!.target)
      setRect(el ? el.getBoundingClientRect() : null)
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [index, open, steps])

  // Keyboard
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close('skipped')
      else if (e.key === 'ArrowRight') {
        if (index < steps.length - 1) setIndex((i) => i + 1)
        else close('completed')
      } else if (e.key === 'ArrowLeft' && index > 0) {
        setIndex((i) => i - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, steps.length, close])

  if (!open) return null
  const step = steps[index]
  if (!step) return null

  const top = rect ? rect.bottom + 12 : 100
  const left = rect ? Math.max(16, Math.min(window.innerWidth - 360 - 16, rect.left)) : 16

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px]" aria-hidden="true" />
      {/* Highlight ring */}
      {rect && (
        <div
          className="pointer-events-none fixed z-[61] rounded-md ring-4 ring-blue-500/70 transition-all"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      )}
      {/* Tooltip card */}
      <section
        role="dialog"
        aria-labelledby="tour-title"
        className="fixed z-[62] w-[340px] max-w-[calc(100vw-32px)] rounded-lg border border-iron-200 bg-white p-4 shadow-xl"
        style={{ top, left }}
      >
        <header className="flex items-center justify-between">
          <span className="text-xs font-medium text-iron-500">
            Krok {index + 1} z {steps.length}
          </span>
          <button
            type="button"
            onClick={() => close('skipped')}
            className="text-xs text-iron-500 underline hover:text-iron-700"
          >
            Pomiń
          </button>
        </header>
        <h3 id="tour-title" className="mt-2 text-base font-semibold text-iron-900">
          {step.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-iron-700">{step.body}</p>
        <footer className="mt-4 flex justify-between gap-2">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="rounded-md border border-iron-300 px-3 py-1.5 text-sm font-medium text-iron-700 disabled:opacity-50"
          >
            ← Wstecz
          </button>
          <button
            type="button"
            onClick={() => {
              if (index < steps.length - 1) setIndex(index + 1)
              else close('completed')
            }}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {index < steps.length - 1 ? 'Dalej →' : 'Zakończ'}
          </button>
        </footer>
      </section>
    </>
  )
}
