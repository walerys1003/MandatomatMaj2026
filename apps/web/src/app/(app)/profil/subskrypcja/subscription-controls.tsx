'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@mandatomat/ui/button'

import type { SubscriptionTier } from '@/lib/payments/subscriptions'

interface Props {
  tier: SubscriptionTier
  status: string | null
  cancelAtPeriodEnd: boolean
  hasStripeCustomer: boolean
  stripeSubscriptionId: string | null
  /** Jeśli komponent ma robić upgrade do konkretnego planu, podaj productCode. */
  upgradeTo?: 'SUB_KIEROWCA' | 'SUB_PRO' | null
  upgradeName?: string
}

export function SubscriptionControls({
  tier,
  status,
  cancelAtPeriodEnd,
  hasStripeCustomer,
  stripeSubscriptionId,
  upgradeTo,
  upgradeName,
}: Props): React.JSX.Element {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isActiveSub =
    tier !== 'free' && (status === 'active' || status === 'trialing' || status === 'past_due')

  async function handleUpgrade(productCode: 'SUB_KIEROWCA' | 'SUB_PRO'): Promise<void> {
    setBusy(`upgrade:${productCode}`)
    setError(null)
    try {
      const res = await fetch('/api/billing/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCode }),
      })
      const json = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) {
        throw new Error(json.error ?? 'Nie udało się utworzyć sesji płatności.')
      }
      if (json.url) {
        window.location.href = json.url
        return
      }
      throw new Error('Brak URL w odpowiedzi.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd płatności.')
      setBusy(null)
    }
  }

  async function handleCancel(): Promise<void> {
    if (
      !confirm(
        'Czy na pewno chcesz anulować subskrypcję? Pozostanie aktywna do końca opłaconego okresu.',
      )
    ) {
      return
    }
    setBusy('cancel')
    setError(null)
    try {
      const res = await fetch('/api/billing/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) {
        throw new Error(json.error ?? 'Nie udało się anulować subskrypcji.')
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd anulowania.')
    } finally {
      setBusy(null)
    }
  }

  async function handleReactivate(): Promise<void> {
    setBusy('reactivate')
    setError(null)
    try {
      const res = await fetch('/api/billing/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) {
        throw new Error(json.error ?? 'Nie udało się wznowić subskrypcji.')
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd wznowienia.')
    } finally {
      setBusy(null)
    }
  }

  async function handlePortal(): Promise<void> {
    setBusy('portal')
    setError(null)
    try {
      const res = await fetch('/api/billing/subscription/portal', {
        method: 'POST',
      })
      const json = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) {
        throw new Error(json.error ?? 'Nie udało się otworzyć portalu klienta.')
      }
      if (json.url) {
        window.location.href = json.url
        return
      }
      throw new Error('Brak URL portalu.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd portalu.')
      setBusy(null)
    }
  }

  // Wariant 1: card upgrade button (renderowany w karcie planu poniżej)
  if (upgradeTo) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={busy !== null}
          onClick={() => void handleUpgrade(upgradeTo)}
          className="w-full"
        >
          {busy === `upgrade:${upgradeTo}`
            ? 'Przekierowywanie...'
            : isActiveSub
              ? `Zmień na ${upgradeName ?? 'plan'}`
              : `Wybierz ${upgradeName ?? 'plan'}`}
        </Button>
        {error && <p className="text-xs text-signal-600">{error}</p>}
      </div>
    )
  }

  // Wariant 2: główne kontrole pod aktualnym planem
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {/* Anuluj subskrypcję */}
        {isActiveSub && !cancelAtPeriodEnd && stripeSubscriptionId && (
          <Button
            type="button"
            variant="secondary-soft"
            size="md"
            disabled={busy !== null}
            onClick={() => void handleCancel()}
          >
            {busy === 'cancel' ? 'Anulowanie...' : 'Anuluj subskrypcję'}
          </Button>
        )}

        {/* Wznów (jeśli zaplanowane anulowanie) */}
        {isActiveSub && cancelAtPeriodEnd && stripeSubscriptionId && (
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={busy !== null}
            onClick={() => void handleReactivate()}
          >
            {busy === 'reactivate' ? 'Wznawianie...' : 'Wznów subskrypcję'}
          </Button>
        )}

        {/* Portal klienta — historia faktur, zmiana karty */}
        {hasStripeCustomer && (
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={busy !== null}
            onClick={() => void handlePortal()}
          >
            {busy === 'portal' ? 'Otwieranie...' : 'Portal klienta (faktury, karta)'}
          </Button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="border-signal-200 dark:border-signal-900 dark:bg-signal-950/40 rounded-md border bg-signal-50 px-3 py-2 text-sm text-signal-700 dark:text-signal-400"
        >
          {error}
        </p>
      )}
    </div>
  )
}
