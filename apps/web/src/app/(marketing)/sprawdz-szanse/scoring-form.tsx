'use client'

import Link from 'next/link'
import * as React from 'react'

import { Alert, Button, ScoringGauge, Spinner } from '@mandatomat/ui'

interface ScoringResult {
  score: number
  label: 'wysokie' | 'umiarkowane' | 'niskie' | 'bardzo_niskie'
  reasoning: string
  recommendations: string[]
  legal_basis_hints: string[]
  estimated_complexity: 'low' | 'medium' | 'high'
}

const CATEGORIES = [
  { value: 'mandat', label: '🚓 Mandat karny', placeholder: 'np. Mandat za przekroczenie prędkości o 20 km/h z fotoradaru w Warszawie...' },
  { value: 'parking', label: '🅿️ Parking', placeholder: 'np. Wezwanie ZTM za jazdę bez biletu — opłaciłem mobiletem ale awaria appki...' },
  { value: 'windykacja', label: '💼 Windykacja / długi', placeholder: 'np. KRUK wzywa do zapłaty 800 zł za telefon z 2018 r. Nigdy nie uznałem długu...' },
  { value: 'ubezpieczenie', label: '🛡️ Ubezpieczenia', placeholder: 'np. PZU odmawia wypłaty odszkodowania OC...' },
  { value: 'etoll', label: '🛣️ e-TOLL', placeholder: 'np. Kara za brak naliczonej opłaty pomimo działającego urządzenia...' },
  { value: 'kontrola', label: '⚠️ Kontrola drogowa', placeholder: 'np. Zatrzymano mi prawo jazdy za pomiar alkomatem 0.21‰...' },
  { value: 'techniczne', label: '🔧 Pisma techniczne', placeholder: 'np. Brak aktualnego badania technicznego — kara z policji...' },
] as const

export function ScoringForm() {
  const [category, setCategory] = React.useState<string>('mandat')
  const [description, setDescription] = React.useState('')
  const [hasEvidence, setHasEvidence] = React.useState<boolean | null>(null)
  const [eventDate, setEventDate] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<ScoringResult | null>(null)

  const currentCategory = CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[0]!

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (description.trim().length < 20) {
      setError('Opisz sprawę dokładniej — min. 20 znaków.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseType: category,
          description: description.trim(),
          ...(hasEvidence !== null && { hasEvidence }),
          ...(eventDate && { eventDate }),
        }),
      })

      const payload = (await res.json().catch(() => ({}))) as
        | ScoringResult
        | { error: string; retryAfter?: number }

      if (!res.ok) {
        const errMsg =
          'error' in payload ? payload.error : `Błąd ${res.status}`
        throw new Error(errMsg)
      }

      setResult(payload as ScoringResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nieznany błąd')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return <ScoringResultView result={result} onReset={() => setResult(null)} />
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-iron-200 bg-white p-6 dark:border-iron-800 dark:bg-iron-900 sm:p-8"
    >
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-iron-900 dark:text-iron-100">
          Kategoria sprawy
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`rounded-lg border-[1.5px] px-3 py-2.5 text-left text-sm transition-all duration-150 ease-snap ${
                category === c.value
                  ? 'border-precision-blue-500 bg-precision-blue-50 text-precision-blue-900 dark:bg-precision-blue-950 dark:text-precision-blue-100'
                  : 'border-iron-200 bg-white hover:border-iron-300 dark:border-iron-800 dark:bg-iron-900'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-semibold text-iron-900 dark:text-iron-100"
        >
          Opisz swoją sprawę
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={currentCategory.placeholder}
          rows={6}
          maxLength={2500}
          className="w-full rounded-lg border-[1.5px] border-iron-200 bg-white px-4 py-3 text-sm leading-relaxed transition-colors duration-150 focus:border-precision-blue-500 focus:outline-none focus:ring-2 focus:ring-precision-blue-200 dark:border-iron-800 dark:bg-iron-900"
        />
        <p className="mt-1 flex justify-between text-xs text-iron-500">
          <span>Min. 20 znaków. Im więcej szczegółów, tym lepsza ocena.</span>
          <span className="tabular-nums">{description.length} / 2500</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="eventDate"
            className="mb-2 block text-sm font-semibold text-iron-900 dark:text-iron-100"
          >
            Data zdarzenia <span className="font-normal text-iron-500">(opcjonalnie)</span>
          </label>
          <input
            id="eventDate"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-lg border-[1.5px] border-iron-200 bg-white px-4 py-2.5 text-sm focus:border-precision-blue-500 focus:outline-none focus:ring-2 focus:ring-precision-blue-200 dark:border-iron-800 dark:bg-iron-900"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-iron-900 dark:text-iron-100">
            Masz dowody? <span className="font-normal text-iron-500">(opcjonalnie)</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { v: true, label: 'Tak' },
              { v: false, label: 'Nie' },
              { v: null, label: 'Nie wiem' },
            ].map((opt) => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => setHasEvidence(opt.v)}
                className={`rounded-lg border-[1.5px] px-3 py-2.5 text-sm transition-all duration-150 ease-snap ${
                  hasEvidence === opt.v
                    ? 'border-precision-blue-500 bg-precision-blue-50 text-precision-blue-900 dark:bg-precision-blue-950'
                    : 'border-iron-200 bg-white hover:border-iron-300 dark:border-iron-800 dark:bg-iron-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-iron-100 pt-6 dark:border-iron-800">
        <p className="text-xs text-iron-500">
          🔒 Twoje dane nie są zapisywane. Limit: 5 ocen / min.
        </p>
        <Button type="submit" variant="primary" size="md" disabled={loading}>
          {loading ? (
            <>
              <Spinner className="mr-2 h-4 w-4 border-white/30 border-t-white" />
              Analizuję…
            </>
          ) : (
            'Oceń szanse →'
          )}
        </Button>
      </div>
    </form>
  )
}

// ============================================================================
// Wynik
// ============================================================================

const LABEL_PL: Record<ScoringResult['label'], { text: string; emoji: string }> = {
  wysokie: { text: 'Wysokie szanse', emoji: '✅' },
  umiarkowane: { text: 'Umiarkowane szanse', emoji: '🤞' },
  niskie: { text: 'Niskie szanse', emoji: '⚠️' },
  bardzo_niskie: { text: 'Bardzo niskie szanse', emoji: '⛔' },
}

const COMPLEXITY_PL: Record<ScoringResult['estimated_complexity'], string> = {
  low: 'Sprawa prosta — wystarczy generator AI',
  medium: 'Sprawa średnio złożona — generator + ewentualnie konsultacja',
  high: 'Sprawa złożona — zalecana konsultacja z prawnikiem',
}

function ScoringResultView({
  result,
  onReset,
}: {
  result: ScoringResult
  onReset: () => void
}) {
  const labelMeta = LABEL_PL[result.label]
  const isWeak = result.score < 0.3

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-iron-200 bg-white p-6 text-center dark:border-iron-800 dark:bg-iron-900 sm:p-8">
        <div className="mx-auto flex justify-center">
          <ScoringGauge value={result.score} size={220} />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
          {labelMeta.emoji} {labelMeta.text}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-iron-700 dark:text-iron-300">
          {result.reasoning}
        </p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-iron-500">
          {COMPLEXITY_PL[result.estimated_complexity]}
        </p>
      </div>

      {result.legal_basis_hints.length > 0 ? (
        <div className="rounded-xl border border-iron-200 bg-white p-5 dark:border-iron-800 dark:bg-iron-900">
          <h3 className="font-display text-base font-bold tracking-[-0.01em] text-iron-950 dark:text-white">
            Kluczowe podstawy prawne
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {result.legal_basis_hints.map((hint, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-iron-700 dark:text-iron-300"
              >
                <span className="mt-0.5 text-precision-blue-500">⚖️</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.recommendations.length > 0 ? (
        <div className="rounded-xl border border-iron-200 bg-white p-5 dark:border-iron-800 dark:bg-iron-900">
          <h3 className="font-display text-base font-bold tracking-[-0.01em] text-iron-950 dark:text-white">
            Rekomendowane kroki
          </h3>
          <ol className="mt-3 space-y-2 text-sm">
            {result.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-iron-700 dark:text-iron-300"
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-precision-blue-100 font-mono text-[10px] font-bold text-precision-blue-700">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="rounded-xl border-2 border-precision-blue-500 bg-precision-blue-50 p-6 text-center dark:bg-precision-blue-950">
        {isWeak ? (
          <>
            <p className="text-sm text-iron-700 dark:text-iron-200">
              Sprawa wygląda na trudną. Zanim zapłacisz mandat, rozważ konsultację
              z adwokatem.
            </p>
            <Button asChild variant="ghost" size="md" className="mt-4">
              <Link href="/kontakt">Skontaktuj się z nami</Link>
            </Button>
          </>
        ) : (
          <>
            <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
              Wygeneruj profesjonalne pismo w 3 minuty
            </h3>
            <p className="mt-2 text-sm text-iron-700 dark:text-iron-200">
              AI napisze gotowe pismo z podstawami prawnymi za <strong>99 zł</strong>.
              Pełna gwarancja: jeśli organ je odrzuci z winy AI — zwracamy pieniądze.
            </p>
            <Button asChild variant="primary" size="lg" className="mt-5">
              <Link href="/sprawy/nowa">Wygeneruj pismo →</Link>
            </Button>
          </>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-precision-blue-600 hover:underline dark:text-precision-blue-400"
        >
          ← Sprawdź inną sprawę
        </button>
      </div>
    </div>
  )
}
