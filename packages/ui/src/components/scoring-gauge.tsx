'use client'

import * as React from 'react'

import { cn } from '../lib/cn'

/**
 * <ScoringGauge> — animowany SVG donut pokazujący wynik scoringu szans (0-100%).
 *
 * Kolory:
 *  - 0–29%   → signal-500 (czerwony, "bardzo niskie szanse")
 *  - 30–49%  → amber-500  (pomarańczowy, "niskie szanse")
 *  - 50–69%  → precision-blue-500 (niebieski, "umiarkowane")
 *  - 70–100% → volt-500   (zielony, "wysokie szanse")
 *
 * Animacja: stroke-dashoffset 0% → target%, duration 800ms, ease-out.
 * Tabular-nums dla cyfr.
 */

interface ScoringGaugeProps {
  /** Wartość 0–1 (np. 0.76) lub 0–100 (np. 76). Auto-detect. */
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

export function ScoringGauge({
  value,
  size = 200,
  strokeWidth = 14,
  label,
  className,
}: ScoringGaugeProps) {
  const pct = Math.max(0, Math.min(100, value <= 1 ? Math.round(value * 100) : Math.round(value)))

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const [animatedPct, setAnimatedPct] = React.useState(0)
  React.useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(pct), 50)
    return () => clearTimeout(timer)
  }, [pct])

  const offset = circumference - (animatedPct / 100) * circumference

  const colorClass =
    pct < 30
      ? 'text-signal-500'
      : pct < 50
        ? 'text-amber-500'
        : pct < 70
          ? 'text-precision-blue-500'
          : 'text-volt-500'

  const labelText =
    label ??
    (pct < 30
      ? 'Bardzo niskie szanse'
      : pct < 50
        ? 'Niskie szanse'
        : pct < 70
          ? 'Umiarkowane szanse'
          : 'Wysokie szanse')

  return (
    <div className={cn('relative inline-flex flex-col items-center gap-3', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-iron-100 dark:stroke-iron-800"
          />
          {/* Value */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(colorClass, 'transition-[stroke-dashoffset] duration-[800ms] ease-out')}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'font-display font-extrabold tabular-nums tracking-[-0.04em]',
              colorClass,
            )}
            style={{ fontSize: size * 0.28 }}
          >
            {animatedPct}
            <span className="text-iron-400" style={{ fontSize: size * 0.14 }}>
              %
            </span>
          </span>
        </div>
      </div>
      <p
        className={cn(
          'text-center font-mono text-[11px] font-semibold uppercase tracking-[0.16em]',
          colorClass,
        )}
        role="status"
        aria-live="polite"
      >
        {labelText}
      </p>
    </div>
  )
}
