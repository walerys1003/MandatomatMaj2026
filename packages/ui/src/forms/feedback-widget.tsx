'use client'

import * as React from 'react'

import { Alert } from '../components/alert'
import { Button } from '../components/button'
import { Spinner } from '../components/spinner'
import { Textarea } from '../components/textarea'
import { cn } from '../lib/cn'

/**
 * <FeedbackWidget> — widget "Oceń pismo" (Faza 9 z roadmapy T20).
 *
 * UX:
 *  - 5 gwiazdek (klik / hover / keyboard nav)
 *  - Outcome radio: Sukces / Częściowy / Brak skutku / Czekam / Nie wiem
 *  - Komentarz textarea (opcjonalnie, max 2000 znaków)
 *  - Submit: POST /api/feedback (lub wstrzyknięta funkcja `onSubmit`)
 *  - Success: pokazuje "Dziękujemy za feedback!" zamiast formularza
 *  - Re-edycja: jeśli `initial` istnieje, prefillujemy pola
 *
 * A11y:
 *  - radiogroup dla gwiazdek z aria-label, klawiatura (←/→ zmienia wartość)
 *  - aria-invalid na pustym formularzu po klik submit
 *  - focus visible na każdym elemencie
 */

export type FeedbackOutcome = 'success' | 'partial' | 'failure' | 'pending' | 'unknown'

export interface FeedbackInitial {
  rating?: number | null
  outcome?: FeedbackOutcome | null
  comment?: string | null
}

export interface FeedbackPayload {
  rating?: number
  outcome?: FeedbackOutcome
  comment?: string
}

export interface FeedbackWidgetProps {
  /** ID sprawy — wymagane dla domyślnego POST /api/feedback. */
  caseId: string
  /** Pre-filled values (jeśli user już ocenił sprawę). */
  initial?: FeedbackInitial
  /** Custom submit (np. dla testów). Default: POST /api/feedback. */
  onSubmit?: (payload: FeedbackPayload) => Promise<void>
  /** Callback po sukcesie (np. revalidate(), toast). */
  onSuccess?: (payload: FeedbackPayload) => void
  className?: string
}

const OUTCOME_OPTIONS: ReadonlyArray<{
  value: FeedbackOutcome
  label: string
  description: string
}> = [
  {
    value: 'success',
    label: 'Sprawa wygrana',
    description: 'Mandat uchylony, dług umorzony, etc.',
  },
  {
    value: 'partial',
    label: 'Częściowy sukces',
    description: 'Np. obniżenie kwoty, mniejsza kara',
  },
  { value: 'failure', label: 'Bez skutku', description: 'Pismo odrzucone, sprawa przegrana' },
  { value: 'pending', label: 'Czekam na odpowiedź', description: 'Sprawa w toku' },
  { value: 'unknown', label: 'Nie wiem', description: 'Nie sprawdzałem / brak odpowiedzi' },
]

const RATING_LABELS: Record<number, string> = {
  1: 'Zdecydowanie odradzam',
  2: 'Słabe',
  3: 'OK',
  4: 'Dobre',
  5: 'Świetne — polecam',
}

export function FeedbackWidget({
  caseId,
  initial,
  onSubmit,
  onSuccess,
  className,
}: FeedbackWidgetProps) {
  const [rating, setRating] = React.useState<number | null>(initial?.rating ?? null)
  const [hoverRating, setHoverRating] = React.useState<number | null>(null)
  const [outcome, setOutcome] = React.useState<FeedbackOutcome | null>(initial?.outcome ?? null)
  const [comment, setComment] = React.useState(initial?.comment ?? '')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  const displayRating = hoverRating ?? rating ?? 0

  function handleStarKeydown(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(5, idx + 2) // idx is 0-based
      setRating(next)
      const btn = (e.currentTarget.parentElement?.children[next - 1] ??
        null) as HTMLButtonElement | null
      btn?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      const prev = Math.max(1, idx)
      setRating(prev)
      const btn = (e.currentTarget.parentElement?.children[prev - 1] ??
        null) as HTMLButtonElement | null
      btn?.focus()
    }
  }

  async function defaultSubmit(payload: FeedbackPayload): Promise<void> {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId, ...payload }),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? `Błąd ${res.status}`)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedComment = comment.trim()

    if (rating == null && outcome == null && trimmedComment.length === 0) {
      setError('Podaj przynajmniej ocenę gwiazdkową, status sprawy lub komentarz.')
      return
    }

    const payload: FeedbackPayload = {}
    if (rating != null) payload.rating = rating
    if (outcome != null) payload.outcome = outcome
    if (trimmedComment.length > 0) payload.comment = trimmedComment

    setSubmitting(true)
    try {
      const submitFn = onSubmit ?? defaultSubmit
      await submitFn(payload)
      setDone(true)
      onSuccess?.(payload)
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Nieznany błąd')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div
        className={cn(
          'border-volt-200 dark:border-volt-900 dark:bg-volt-950/40 rounded-xl border bg-volt-50 p-6 text-center',
          className,
        )}
      >
        <p className="text-3xl" aria-hidden="true">
          🙏
        </p>
        <p className="mt-2 font-display text-lg font-bold text-iron-950 dark:text-white">
          Dziękujemy za feedback!
        </p>
        <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
          Twoja opinia pomaga nam ulepszać Mandatomat. Możesz wrócić tu i zaktualizować status, gdy
          poznasz wynik sprawy.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-xs text-precision-blue-600 underline-offset-4 hover:underline"
        >
          Edytuj odpowiedź
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'space-y-6 rounded-xl border border-iron-200 bg-white p-6 dark:border-iron-800 dark:bg-iron-900',
        className,
      )}
      aria-labelledby="feedback-heading"
    >
      <header className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          Twoja opinia
        </p>
        <h3
          id="feedback-heading"
          className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white"
        >
          Jak oceniasz wygenerowane pismo?
        </h3>
        <p className="text-sm text-iron-600 dark:text-iron-400">
          Daj nam znać — dzięki temu trenujemy AI lepiej i pomagamy następnym użytkownikom. Możesz
          wrócić, gdy poznasz wynik sprawy.
        </p>
      </header>

      {error ? (
        <Alert variant="danger" title="Nie udało się zapisać">
          {error}
        </Alert>
      ) : null}

      {/* Rating gwiazdki */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-iron-500">Ocena</p>
        <div
          role="radiogroup"
          aria-label="Ocena pisma w skali 1-5 gwiazdek"
          className="flex items-center gap-1"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = displayRating >= n
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} ${n === 1 ? 'gwiazdka' : 'gwiazdki'} — ${RATING_LABELS[n]}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(null)}
                onFocus={() => setHoverRating(n)}
                onBlur={() => setHoverRating(null)}
                onKeyDown={(e) => handleStarKeydown(e, n - 1)}
                className={cn(
                  'rounded p-1 text-3xl leading-none transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-600/40',
                  active ? 'text-volt-500' : 'text-iron-300 hover:text-volt-300',
                )}
              >
                <span aria-hidden="true">{active ? '★' : '☆'}</span>
              </button>
            )
          })}
          <span className="ml-3 font-mono text-xs text-iron-500" aria-live="polite">
            {displayRating > 0 ? RATING_LABELS[displayRating] : 'Wybierz ocenę'}
          </span>
        </div>
      </div>

      {/* Outcome */}
      <fieldset className="space-y-2">
        <legend className="font-mono text-[10px] uppercase tracking-wider text-iron-500">
          Status sprawy (opcjonalnie)
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {OUTCOME_OPTIONS.map((opt) => {
            const checked = outcome === opt.value
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-150',
                  checked
                    ? 'border-precision-blue-500 bg-precision-blue-50 dark:border-precision-blue-700 dark:bg-precision-blue-950/40'
                    : 'border-iron-200 hover:border-iron-300 dark:border-iron-800 dark:hover:border-iron-700',
                )}
              >
                <input
                  type="radio"
                  name="outcome"
                  value={opt.value}
                  checked={checked}
                  onChange={() => setOutcome(opt.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-precision-blue-600"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-iron-900 dark:text-iron-100">
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-xs text-iron-500 dark:text-iron-400">
                    {opt.description}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* Komentarz */}
      <div className="space-y-2">
        <label
          htmlFor="feedback-comment"
          className="font-mono text-[10px] uppercase tracking-wider text-iron-500"
        >
          Komentarz (opcjonalnie)
        </label>
        <Textarea
          id="feedback-comment"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Co się sprawdziło? Co można było zrobić lepiej? Czy organ przyjął argumentację?"
          maxLength={2000}
          rows={4}
        />
        <p className="text-right font-mono text-[10px] text-iron-400">{comment.length} / 2000</p>
      </div>

      <footer className="flex items-center justify-end gap-3 border-t border-iron-100 pt-4 dark:border-iron-800">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Zapisywanie…
            </>
          ) : (
            'Wyślij feedback'
          )}
        </Button>
      </footer>
    </form>
  )
}
