'use client'

import { useEffect, useRef } from 'react'

/**
 * Client-only komponent który po hydratacji odczytuje cookie `mnd_ref`
 * (ustawione przez signup-form po wykryciu `?ref=` w URL rejestracji)
 * i woła `POST /api/referral/redeem` aby przypisać `profiles.referred_by`.
 *
 * Idempotentne: po sukcesie kasuje cookie. Endpoint sam się broni przed
 * podwójną atrybucją (zwraca {updated:false} jeśli `referred_by` już ustawiony).
 *
 * Renderuje `null` — efekt jest niewidoczny dla usera (zniżka pojawi się
 * dopiero przy checkoucie, gdzie jest komunikat "Zniżka 20% za polecenie").
 */
export function ReferralRedeemer(): null {
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const cookies = typeof document !== 'undefined' ? document.cookie : ''
    const match = cookies.match(/(?:^|;\s*)mnd_ref=([^;]+)/)
    if (!match || !match[1]) return

    const code = decodeURIComponent(match[1])
    if (!/^MND-[A-F0-9]{8}$/i.test(code)) {
      // Niepoprawny format — wyczyść i nie wysyłaj.
      document.cookie = 'mnd_ref=;path=/;max-age=0;samesite=lax'
      return
    }

    void fetch('/api/referral/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(() => {
        // Zawsze kasujemy — niezależnie od wyniku (idempotencja).
        document.cookie = 'mnd_ref=;path=/;max-age=0;samesite=lax'
      })
      .catch(() => {
        // Best-effort — przy następnej wizycie /witaj spróbuje ponownie.
      })
  }, [])

  return null
}
