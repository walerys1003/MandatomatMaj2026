import { cn } from '../../lib/cn'

/**
 * <SuccessRateWidget> — donut + breakdown + sparkline 12 tyg.
 *
 * Chunk D06+D08:
 *  - donut chart 120px (SVG inline, brak chart.js)
 *  - breakdown: 3 wartości (uwzględnione / odrzucone / w toku)
 *  - sparkline trend 12 tygodni — opcjonalny array<number>
 */

export interface SuccessRateData {
  /** % skuteczności (0-100). */
  successRate: number
  /** Łączna liczba spraw (do podświetlenia w środku donut). */
  totalCases: number
  /** Breakdown. */
  breakdown: {
    accepted: number
    rejected: number
    pending: number
  }
  /** Sparkline data — % per week, max 12 wartości. */
  trend?: number[]
}

export interface SuccessRateWidgetProps {
  data: SuccessRateData
  className?: string
}

function Donut({ rate, total }: { rate: number; total: number }) {
  const radius = 50
  const stroke = 12
  const circ = 2 * Math.PI * radius
  const offset = circ - (rate / 100) * circ
  const color = rate >= 70 ? '#10b981' : rate >= 40 ? '#f59e0b' : '#ef4444' // emerald/amber/signal

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="flex-none">
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-iron-100 dark:text-iron-800"
      />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
      />
      <text
        x="70"
        y="65"
        textAnchor="middle"
        className="fill-iron-900 text-2xl font-bold dark:fill-iron-50"
      >
        {Math.round(rate)}%
      </text>
      <text
        x="70"
        y="85"
        textAnchor="middle"
        className="fill-iron-500 text-xs dark:fill-iron-400"
      >
        {total === 1 ? '1 sprawa' : total < 5 ? `${total} sprawy` : `${total} spraw`}
      </text>
    </svg>
  )
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null
  const w = 200
  const h = 40
  const max = Math.max(...data, 100)
  const min = 0
  const stepX = data.length > 1 ? w / (data.length - 1) : w
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = h - ((v - min) / (max - min)) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-brand-500">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.length > 0 ? (
        <circle
          cx={(data.length - 1) * stepX}
          cy={h - ((data[data.length - 1]! - min) / (max - min)) * h}
          r="3"
          fill="currentColor"
        />
      ) : null}
    </svg>
  )
}

export function SuccessRateWidget({ data, className }: SuccessRateWidgetProps) {
  const { successRate, totalCases, breakdown, trend } = data

  return (
    <div
      className={cn(
        'rounded-lg border border-iron-200 bg-white p-6 shadow-sm dark:border-iron-700 dark:bg-iron-900',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-iron-900 dark:text-iron-50">
            Skuteczność
          </h3>
          <p className="mt-0.5 text-xs text-iron-500 dark:text-iron-400">
            % spraw uwzględnionych przez organ
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Donut rate={successRate} total={totalCases} />

        <div className="flex-1 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-iron-700 dark:text-iron-300">Uwzględnione</span>
            </span>
            <span className="font-medium tabular-nums text-iron-900 dark:text-iron-100">
              {breakdown.accepted}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-iron-700 dark:text-iron-300">W toku</span>
            </span>
            <span className="font-medium tabular-nums text-iron-900 dark:text-iron-100">
              {breakdown.pending}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-signal-500" />
              <span className="text-iron-700 dark:text-iron-300">Odrzucone</span>
            </span>
            <span className="font-medium tabular-nums text-iron-900 dark:text-iron-100">
              {breakdown.rejected}
            </span>
          </div>
        </div>
      </div>

      {trend && trend.length > 0 ? (
        <div className="mt-4 border-t border-iron-100 pt-4 dark:border-iron-800">
          <p className="mb-2 text-xs text-iron-500 dark:text-iron-400">
            Trend ostatnich {trend.length} tygodni
          </p>
          <Sparkline data={trend} />
        </div>
      ) : null}
    </div>
  )
}
