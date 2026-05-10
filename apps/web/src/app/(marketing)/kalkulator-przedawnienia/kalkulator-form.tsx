'use client'

import Link from 'next/link'
import { useState } from 'react'

import {
  calcPrzedawnienie,
  formatDate,
  getSupportedReasons,
  PrzedawnienieError,
  type PrzedawnienieReason,
  type PrzedawnienieResult,
} from '@/lib/legal/przedawnienie'

const REASONS = getSupportedReasons()

type FormState = {
  startDate: string
  reason: PrzedawnienieReason
  przerwanyOd: string
  zawieszenieDays: string
}

const initial: FormState = {
  startDate: '',
  reason: 'WYKROCZENIE_CZYN',
  przerwanyOd: '',
  zawieszenieDays: '',
}

export function KalkulatorForm() {
  const [form, setForm] = useState<FormState>(initial)
  const [result, setResult] = useState<PrzedawnienieResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    try {
      const startDate = new Date(form.startDate)
      const przerwanyOd = form.przerwanyOd ? new Date(form.przerwanyOd) : undefined
      const zawieszenieDays = form.zawieszenieDays
        ? Number.parseInt(form.zawieszenieDays, 10)
        : 0

      if (Number.isNaN(zawieszenieDays) || zawieszenieDays < 0) {
        throw new PrzedawnienieError('Liczba dni zawieszenia musi być nieujemna')
      }

      const r = calcPrzedawnienie({
        startDate,
        reason: form.reason,
        przerwanyOd,
        zawieszenieDays,
      })
      setResult(r)
    } catch (err) {
      setError(
        err instanceof PrzedawnienieError
          ? err.message
          : 'Nieprawidłowe dane wejściowe',
      )
    }
  }

  function handleReset() {
    setForm(initial)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-iron-200 bg-white p-6 shadow-sm dark:border-iron-800 dark:bg-iron-900"
      >
        <div>
          <label
            htmlFor="reason"
            className="mb-1.5 block text-sm font-medium text-iron-900 dark:text-iron-100"
          >
            Rodzaj sprawy / podstawa prawna
          </label>
          <select
            id="reason"
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value as PrzedawnienieReason })
            }
            className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-iron-900 focus:border-precision-blue-500 focus:outline-none focus:ring-1 focus:ring-precision-blue-500 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-100"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.lata} {r.lata === 1 ? 'rok' : r.lata < 5 ? 'lata' : 'lat'} —{' '}
                {r.podstawaPrawna}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-iron-500 dark:text-iron-500">
            {REASONS.find((r) => r.value === form.reason)?.label}
          </p>
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="mb-1.5 block text-sm font-medium text-iron-900 dark:text-iron-100"
          >
            Data zdarzenia / wymagalności *
          </label>
          <input
            id="startDate"
            type="date"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-iron-900 focus:border-precision-blue-500 focus:outline-none focus:ring-1 focus:ring-precision-blue-500 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-100"
          />
          <p className="mt-1.5 text-xs text-iron-500 dark:text-iron-500">
            Dzień popełnienia czynu, doręczenia decyzji lub wymagalności roszczenia.
          </p>
        </div>

        <details className="rounded-md border border-iron-200 p-3 dark:border-iron-800">
          <summary className="cursor-pointer text-sm font-medium text-iron-900 dark:text-iron-100">
            Zaawansowane: przerwanie / zawieszenie biegu
          </summary>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="przerwanyOd"
                className="mb-1.5 block text-sm font-medium text-iron-900 dark:text-iron-100"
              >
                Przerwanie biegu (art. 123 KC)
              </label>
              <input
                id="przerwanyOd"
                type="date"
                value={form.przerwanyOd}
                onChange={(e) =>
                  setForm({ ...form, przerwanyOd: e.target.value })
                }
                className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-iron-900 focus:border-precision-blue-500 focus:outline-none focus:ring-1 focus:ring-precision-blue-500 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-100"
              />
              <p className="mt-1.5 text-xs text-iron-500 dark:text-iron-500">
                Data uznania długu, wniesienia pozwu, mediacji — bieg liczony od nowa.
              </p>
            </div>

            <div>
              <label
                htmlFor="zawieszenieDays"
                className="mb-1.5 block text-sm font-medium text-iron-900 dark:text-iron-100"
              >
                Dni zawieszenia biegu (art. 121 KC)
              </label>
              <input
                id="zawieszenieDays"
                type="number"
                min="0"
                max="3650"
                value={form.zawieszenieDays}
                onChange={(e) =>
                  setForm({ ...form, zawieszenieDays: e.target.value })
                }
                placeholder="0"
                className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-iron-900 focus:border-precision-blue-500 focus:outline-none focus:ring-1 focus:ring-precision-blue-500 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-100"
              />
              <p className="mt-1.5 text-xs text-iron-500 dark:text-iron-500">
                Liczba dni siły wyższej / zawieszenia z mocy prawa.
              </p>
            </div>
          </div>
        </details>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md bg-precision-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-precision-blue-700 focus:outline-none focus:ring-2 focus:ring-precision-blue-500 focus:ring-offset-2"
          >
            Oblicz datę przedawnienia
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-iron-300 bg-white px-4 py-2.5 text-sm font-medium text-iron-700 hover:bg-iron-50 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-300 dark:hover:bg-iron-700"
          >
            Wyczyść
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          >
            {error}
          </div>
        )}
      </form>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border-2 p-6 ${
            result.isExpired
              ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
              : 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
          }`}
        >
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider">
            WYNIK
          </p>
          <h2 className="font-display text-2xl font-bold text-iron-950 dark:text-white">
            {result.isExpired
              ? 'Roszczenie jest już PRZEDAWNIONE ✓'
              : `Przedawnienie nastąpi ${formatDate(result.expiresAt)}`}
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-iron-600 dark:text-iron-400">Data przedawnienia</dt>
              <dd className="font-semibold text-iron-900 dark:text-iron-100">
                {formatDate(result.expiresAt)}
              </dd>
            </div>
            <div>
              <dt className="text-iron-600 dark:text-iron-400">
                {result.isExpired ? 'Przedawnione od' : 'Pozostało dni'}
              </dt>
              <dd className="font-semibold text-iron-900 dark:text-iron-100">
                {result.isExpired
                  ? `${Math.abs(result.daysRemaining)} dni`
                  : `${result.daysRemaining} dni`}
              </dd>
            </div>
            <div>
              <dt className="text-iron-600 dark:text-iron-400">Okres</dt>
              <dd className="font-semibold text-iron-900 dark:text-iron-100">
                {result.okresLat}{' '}
                {result.okresLat === 1
                  ? 'rok'
                  : result.okresLat < 5
                    ? 'lata'
                    : 'lat'}
              </dd>
            </div>
            <div>
              <dt className="text-iron-600 dark:text-iron-400">Podstawa prawna</dt>
              <dd className="font-semibold text-iron-900 dark:text-iron-100">
                {result.podstawaPrawna}
              </dd>
            </div>
          </dl>

          {result.uwagi.length > 0 && (
            <div className="mt-4 rounded-md bg-white/50 p-3 text-xs text-iron-700 dark:bg-iron-900/40 dark:text-iron-300">
              <p className="mb-1 font-semibold">Uwagi:</p>
              <ul className="list-disc space-y-1 pl-5">
                {result.uwagi.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {result.isExpired ? (
              <Link
                href="/sprawy/nowa"
                className="inline-flex flex-1 items-center justify-center rounded-md bg-precision-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-precision-blue-700"
              >
                Wygeneruj pismo z zarzutem przedawnienia (99 zł)
              </Link>
            ) : (
              <Link
                href="/sprawdz-szanse"
                className="inline-flex flex-1 items-center justify-center rounded-md bg-precision-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-precision-blue-700"
              >
                Sprawdź szanse skuteczności odwołania
              </Link>
            )}
            <Link
              href="/jak-to-dziala"
              className="inline-flex flex-1 items-center justify-center rounded-md border border-iron-300 bg-white px-4 py-2.5 text-sm font-medium text-iron-700 hover:bg-iron-50 dark:border-iron-700 dark:bg-iron-800 dark:text-iron-300"
            >
              Jak to działa?
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
