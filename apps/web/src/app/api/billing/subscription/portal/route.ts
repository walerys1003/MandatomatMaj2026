import { NextResponse, type NextRequest } from 'next/server'

import { createBillingPortalSession, StripeError } from '@/lib/payments/stripe'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/billing/subscription/portal
 *
 * Tworzy sesję Stripe Customer Portal — user może samodzielnie:
 *   - zmienić metodę płatności
 *   - pobrać faktury
 *   - anulować subskrypcję (przez UI Stripe — nasze API też działa)
 *
 * Wymaga: profile.stripe_customer_id (user musi mieć już co najmniej raz
 * przejść przez subscription checkout albo manual setup).
 *
 * Response: { url: string } → redirect klient-side
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const rl = await rateLimit(`sub-portal:${user.id}`, 'default')
  const headers = rateLimitHeaders(rl)
  if (!rl.success) {
    return NextResponse.json({ error: 'Zbyt wiele prób.' }, { status: 429, headers })
  }

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileRaw as { stripe_customer_id: string | null } | null
  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'Nie masz jeszcze subskrypcji — najpierw wybierz plan.' },
      { status: 400, headers },
    )
  }

  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  const returnUrl = `${origin}/profil/subskrypcja`

  try {
    const session = await createBillingPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl,
    })
    return NextResponse.json({ url: session.url }, { headers })
  } catch (err) {
    if (err instanceof StripeError) {
      return NextResponse.json({ error: err.message }, { status: err.status ?? 500, headers })
    }
    return NextResponse.json(
      { error: 'Nie udało się otworzyć portalu klienta.' },
      { status: 500, headers },
    )
  }
}
