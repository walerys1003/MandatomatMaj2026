'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface PaymentClientProps {
  caseId: string
  productCode: string
  productName: string
  /** Cena w groszach. */
  originalAmount: number
  hasActiveSub: boolean
}

interface PromoState {
  status: 'idle' | 'validating' | 'valid' | 'invalid'
  code?: string
  discountPercent?: number
  finalAmount?: number
  reason?: string
}

/**
 * Client component dla strony /platnosc.
 *
 * - Pole na kod promocyjny + walidacja na lost focus / Enter
 * - Przycisk "Zapłać" → POST /api/billing/checkout → redirect do session.url
 * - Sub bypass: pomija Stripe, redirect /pobranie
 */
export function PaymentClient({
  caseId,
  productCode,
  productName: _productName,
  originalAmount,
  hasActiveSub,
}: PaymentClientProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<PromoState>({ status: 'idle' })
  const [error, setError] = useState<string | null>(null)

  const finalAmount =
    promo.status === 'valid' && promo.finalAmount !== undefined ? promo.finalAmount : originalAmount

  async function validatePromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) {
      setPromo({ status: 'idle' })
      return
    }
    setPromo({ status: 'validating' })
    try {
      const res = await fetch('/api/billing/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, productCode }),
      })
      const data = (await res.json()) as PromoState & { valid?: boolean }
      if (data.valid) {
        setPromo({
          status: 'valid',
          code: data.code,
          discountPercent: data.discountPercent,
          finalAmount: data.finalAmount,
        })
      } else {
        setPromo({
          status: 'invalid',
          reason: data.reason ?? 'Kod nieprawidłowy.',
        })
      }
    } catch {
      setPromo({ status: 'invalid', reason: 'Błąd połączenia.' })
    }
  }

  function handleCheckout() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId,
            productCode,
            ...(promo.status === 'valid' && promo.code ? { promoCode: promo.code } : {}),
          }),
        })
        const data = (await res.json()) as {
          url?: string
          bypass?: boolean
          redirectUrl?: string
          error?: string
        }
        if (!res.ok) {
          setError(data.error ?? 'Nie udało się utworzyć płatności.')
          return
        }
        if (data.bypass && data.redirectUrl) {
          router.push(data.redirectUrl)
          return
        }
        if (data.url) {
          window.location.href = data.url
          return
        }
        setError('Nieprawidłowa odpowiedź serwera.')
      } catch {
        setError('Błąd połączenia.')
      }
    })
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Kod promocyjny */}
      {!hasActiveSub ? (
        <div className="rounded-md border border-iron-200 bg-white p-4 dark:border-iron-700 dark:bg-iron-900">
          <label htmlFor="promo" className="block text-sm font-medium text-iron-800 dark:text-iron-200">
            Masz kod promocyjny?
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="promo"
              type="text"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value)
                if (promo.status !== 'idle') setPromo({ status: 'idle' })
              }}
              onBlur={validatePromo}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void validatePromo()
                }
              }}
              placeholder="np. PIERWSZE10"
              maxLength={32}
              className="flex-1 rounded-md border border-iron-300 bg-white px-3 py-2 text-sm uppercase tracking-wider text-iron-900 placeholder:text-iron-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-iron-600 dark:bg-iron-800 dark:text-iron-50"
              disabled={pending}
            />
            <button
              type="button"
              onClick={validatePromo}
              disabled={pending || promo.status === 'validating' || !promoInput.trim()}
              className="rounded-md border border-iron-300 bg-iron-50 px-4 py-2 text-sm font-medium text-iron-800 hover:bg-iron-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-iron-600 dark:bg-iron-800 dark:text-iron-100 dark:hover:bg-iron-700"
            >
              {promo.status === 'validating' ? '…' : 'Sprawdź'}
            </button>
          </div>
          {promo.status === 'valid' ? (
            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
              ✓ Kod <strong>{promo.code}</strong> zastosowany — rabat {promo.discountPercent}%
            </p>
          ) : null}
          {promo.status === 'invalid' ? (
            <p className="mt-2 text-xs text-signal-700 dark:text-signal-400">{promo.reason}</p>
          ) : null}
        </div>
      ) : null}

      {/* Podsumowanie ceny */}
      {promo.status === 'valid' && promo.discountPercent ? (
        <div className="rounded-md border border-iron-200 bg-iron-50 p-4 text-sm dark:border-iron-700 dark:bg-iron-900">
          <div className="flex justify-between text-iron-600 dark:text-iron-400">
            <span>Cena bazowa</span>
            <span className="line-through">{(originalAmount / 100).toFixed(2).replace('.', ',')} zł</span>
          </div>
          <div className="mt-1 flex justify-between text-iron-600 dark:text-iron-400">
            <span>Rabat ({promo.discountPercent}%)</span>
            <span>−{((originalAmount - finalAmount) / 100).toFixed(2).replace('.', ',')} zł</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-iron-200 pt-2 font-bold text-iron-900 dark:border-iron-700 dark:text-iron-50">
            <span>Do zapłaty</span>
            <span>{(finalAmount / 100).toFixed(2).replace('.', ',')} zł</span>
          </div>
        </div>
      ) : null}

      {/* Błąd */}
      {error ? (
        <div role="alert" className="rounded-md border border-signal-300 bg-signal-50 p-3 text-sm text-signal-900 dark:border-signal-800 dark:bg-signal-950 dark:text-signal-100">
          {error}
        </div>
      ) : null}

      {/* CTA */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={pending}
        className="w-full rounded-md bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? 'Przekierowuję…'
          : hasActiveSub
            ? 'Pobierz pismo (subskrypcja)'
            : `Zapłać ${(finalAmount / 100).toFixed(2).replace('.', ',')} zł`}
      </button>

      {!hasActiveSub ? (
        <p className="text-center text-xs text-iron-500 dark:text-iron-400">
          🔒 Bezpieczna płatność Stripe · karta · BLIK · Przelewy24
        </p>
      ) : null}
    </div>
  )
}
