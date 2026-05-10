import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { cancelSubscription, reactivateSubscription, StripeError } from '@/lib/payments/stripe'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/billing/subscription/cancel
 *
 * Anuluje (lub reaktywuje) subskrypcję usera.
 *
 * Body:
 *   { action: 'cancel' | 'reactivate', immediate?: boolean }
 *
 * Domyślnie cancel działa "at period end" — user zachowuje dostęp do końca
 * okresu rozliczeniowego. Dla immediate cancel: { immediate: true }.
 *
 * Webhook `customer.subscription.updated` zaktualizuje profiles +
 * subscriptions. Tu tylko optymistycznie ustawiamy
 * `subscription_cancel_at_period_end` w profilach.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  action: z.enum(['cancel', 'reactivate']),
  immediate: z.boolean().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const rl = await rateLimit(`sub-cancel:${user.id}`, 'default')
  const headers = rateLimitHeaders(rl)
  if (!rl.success) {
    return NextResponse.json({ error: 'Zbyt wiele prób.' }, { status: 429, headers })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400, headers })
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400, headers },
    )
  }

  // Pobierz aktywną subskrypcję
  const { data: subRaw } = await supabase
    .from('subscriptions')
    .select('id, stripe_subscription_id, status, cancel_at_period_end')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sub = subRaw as {
    id: string
    stripe_subscription_id: string
    status: string
    cancel_at_period_end: boolean | null
  } | null

  if (!sub) {
    return NextResponse.json({ error: 'Nie masz aktywnej subskrypcji.' }, { status: 404, headers })
  }

  try {
    if (parsed.data.action === 'cancel') {
      const atPeriodEnd = !parsed.data.immediate
      await cancelSubscription(sub.stripe_subscription_id, { atPeriodEnd })

      // Optymistycznie ustaw flag (webhook nadpisze autoritatywnie)
      const admin = createAdminClient()
      if (atPeriodEnd) {
        await admin
          .from('profiles')
          .update({
            subscription_cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      }

      await supabase.from('events').insert({
        user_id: user.id,
        event_type: 'subscription_cancel_requested',
        data: { stripe_sub_id: sub.stripe_subscription_id, immediate: !atPeriodEnd },
      })

      return NextResponse.json(
        {
          ok: true,
          message: atPeriodEnd
            ? 'Subskrypcja zostanie anulowana po zakończeniu bieżącego okresu rozliczeniowego.'
            : 'Subskrypcja anulowana natychmiast.',
        },
        { headers },
      )
    }

    // reactivate
    await reactivateSubscription(sub.stripe_subscription_id)

    const admin = createAdminClient()
    await admin
      .from('profiles')
      .update({
        subscription_cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    await supabase.from('events').insert({
      user_id: user.id,
      event_type: 'subscription_reactivated',
      data: { stripe_sub_id: sub.stripe_subscription_id },
    })

    return NextResponse.json(
      { ok: true, message: 'Subskrypcja została reaktywowana.' },
      { headers },
    )
  } catch (err) {
    if (err instanceof StripeError) {
      return NextResponse.json({ error: err.message }, { status: err.status ?? 500, headers })
    }
    console.error('[sub-cancel] error:', err)
    return NextResponse.json(
      { error: 'Nie udało się przetworzyć żądania.' },
      { status: 500, headers },
    )
  }
}
