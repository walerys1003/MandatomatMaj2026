import { cn } from '../../lib/cn'

/**
 * <DocumentTimeline> — horyzontalna timeline 6 punktów.
 *
 * Chunk D08:
 *   Utworzono → Wygenerowano → Opłacono → Pobrano → Wysłano → Odpowiedź
 *
 * Mobile: pionowa, 10px dots.
 *
 * Każdy punkt: ikona + label + (opcjonalnie) data; aktywny = brand-600,
 * ukończone = emerald, przyszłe = iron-300.
 */

export type TimelineState = 'completed' | 'active' | 'pending'

export interface TimelineStep {
  id: string
  label: string
  description?: string
  /** ISO date stringu lub null. */
  date?: string | Date | null
  state: TimelineState
}

export interface DocumentTimelineProps {
  steps: TimelineStep[]
  /** Layout: 'horizontal' (desktop) | 'vertical' (mobile) | 'auto' (responsive). */
  layout?: 'horizontal' | 'vertical' | 'auto'
  className?: string
}

const POLISH_MONTHS_SHORT = [
  'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
  'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
]

function formatShortDate(d: Date): string {
  return `${d.getDate()} ${POLISH_MONTHS_SHORT[d.getMonth()]}`
}

const DOT_CLASSES: Record<TimelineState, string> = {
  completed: 'bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900',
  active: 'bg-brand-600 ring-4 ring-brand-100 dark:ring-brand-900 animate-pulse',
  pending: 'bg-iron-300 dark:bg-iron-700',
}

const LABEL_CLASSES: Record<TimelineState, string> = {
  completed: 'text-iron-900 dark:text-iron-100',
  active: 'text-brand-700 font-semibold dark:text-brand-300',
  pending: 'text-iron-500 dark:text-iron-400',
}

const LINE_CLASSES: Record<TimelineState, string> = {
  completed: 'bg-emerald-500',
  active: 'bg-gradient-to-r from-emerald-500 to-iron-300 dark:to-iron-700',
  pending: 'bg-iron-200 dark:bg-iron-700',
}

/**
 * Default steps dla pisma (6 punktów life cycle).
 */
export function buildDefaultSteps(events: {
  createdAt?: Date | null
  generatedAt?: Date | null
  paidAt?: Date | null
  downloadedAt?: Date | null
  sentAt?: Date | null
  respondedAt?: Date | null
}): TimelineStep[] {
  function state(when: Date | null | undefined, hasNext: boolean): TimelineState {
    if (when) return 'completed'
    if (!hasNext) return 'active'
    return 'pending'
  }
  const steps: TimelineStep[] = []
  steps.push({
    id: 'created',
    label: 'Utworzono',
    state: state(events.createdAt, Boolean(events.generatedAt ?? events.paidAt ?? events.downloadedAt ?? events.sentAt ?? events.respondedAt)),
    ...(events.createdAt ? { date: events.createdAt } : {}),
  })
  steps.push({
    id: 'generated',
    label: 'Wygenerowano',
    state: state(events.generatedAt, Boolean(events.paidAt ?? events.downloadedAt ?? events.sentAt ?? events.respondedAt)),
    ...(events.generatedAt ? { date: events.generatedAt } : {}),
  })
  steps.push({
    id: 'paid',
    label: 'Opłacono',
    state: state(events.paidAt, Boolean(events.downloadedAt ?? events.sentAt ?? events.respondedAt)),
    ...(events.paidAt ? { date: events.paidAt } : {}),
  })
  steps.push({
    id: 'downloaded',
    label: 'Pobrano',
    state: state(events.downloadedAt, Boolean(events.sentAt ?? events.respondedAt)),
    ...(events.downloadedAt ? { date: events.downloadedAt } : {}),
  })
  steps.push({
    id: 'sent',
    label: 'Wysłano',
    state: state(events.sentAt, Boolean(events.respondedAt)),
    ...(events.sentAt ? { date: events.sentAt } : {}),
  })
  steps.push({
    id: 'responded',
    label: 'Odpowiedź',
    state: events.respondedAt ? 'completed' : 'pending',
    ...(events.respondedAt ? { date: events.respondedAt } : {}),
  })
  return steps
}

export function DocumentTimeline({ steps, layout = 'auto', className }: DocumentTimelineProps) {
  if (steps.length === 0) return null

  const horizontal = (
    <ol className="hidden items-start md:flex">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1
        const dateStr = step.date
          ? formatShortDate(step.date instanceof Date ? step.date : new Date(step.date))
          : null
        return (
          <li key={step.id} className="flex flex-1 items-start gap-0">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className={cn('h-3 w-3 rounded-full', DOT_CLASSES[step.state])}
              />
              <p className={cn('mt-2 text-center text-xs', LABEL_CLASSES[step.state])}>
                {step.label}
              </p>
              {dateStr ? (
                <p className="mt-0.5 text-[10px] text-iron-400 dark:text-iron-500">{dateStr}</p>
              ) : null}
            </div>
            {!isLast ? (
              <div className="mt-1.5 h-0.5 flex-1 self-start" aria-hidden>
                <div className={cn('h-full w-full', LINE_CLASSES[step.state])} />
              </div>
            ) : null}
          </li>
        )
      })}
    </ol>
  )

  const vertical = (
    <ol className={cn('space-y-3', layout === 'auto' ? 'md:hidden' : '')}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1
        const dateStr = step.date
          ? formatShortDate(step.date instanceof Date ? step.date : new Date(step.date))
          : null
        return (
          <li key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className={cn('h-2.5 w-2.5 rounded-full', DOT_CLASSES[step.state])}
              />
              {!isLast ? (
                <div className={cn('mt-1 w-0.5 flex-1', LINE_CLASSES[step.state])} aria-hidden />
              ) : null}
            </div>
            <div className="-mt-0.5 pb-3">
              <p className={cn('text-sm', LABEL_CLASSES[step.state])}>{step.label}</p>
              {dateStr ? (
                <p className="mt-0.5 text-xs text-iron-500 dark:text-iron-400">{dateStr}</p>
              ) : null}
              {step.description ? (
                <p className="mt-1 text-xs text-iron-500 dark:text-iron-400">{step.description}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )

  if (layout === 'horizontal') return <div className={className}>{horizontal}</div>
  if (layout === 'vertical') return <div className={className}>{vertical}</div>
  return (
    <div className={className}>
      {horizontal}
      {vertical}
    </div>
  )
}
