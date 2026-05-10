import { NextResponse, type NextRequest } from 'next/server'

import {
  retrieveCheckoutSession,
  verifyWebhookSignature,
  type StripeCheckoutSession,
  type StripePaymentIntent,
} from '@/lib/payments/stripe'
import { createInvoice, FakturowniaError } from '@/lib/payments/fakturownia'
import { incrementPromoUsage } from '@/lib/payments/promo'
import { sendEmail } from '@/lib/notifications/email'
import { tplPaymentSuccess } from '@/lib/notifications/templates'
import { createAdminClient } from '@/lib/supabase/admin'
import { inngest } from '@/lib/inngest/client'

/**
 * POST /api/billing/webhook
 *
 * Stripe webhook handler.
 *
 * CRITICAL:
 *  - body MUSI być raw (string), bo używamy go do weryfikacji HMAC
 *  - idempotency: każdy event_id INSERT do `stripe_events` z UNIQUE — duplikat drop
 *  - service_role: webhook nie ma sesji usera, używamy admin client
 *
 * Obsługiwane eventy:
 *  - checkout.session.completed   → status='succeeded' + case='paid' + payment_succeeded event
 *  - checkout.session.expired     → status='failed' + case='preview' (re-payable)
 *  - payment_intent.succeeded     → idempotent UPDATE payments.stripe_payment_intent_id
 *  - payment_intent.payment_failed → status='failed'
 *  - charge.refunded              → status='refunded'
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface StripeEvent {
  id: string
  type: string
  data: {
    object: Record<string, unknown>
  }
  created: number
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  // RAW body — must read as text BEFORE JSON.parse
  const rawBody = await req.text()

  const verification = await verifyWebhookSignature(rawBody, signature)
  if (!verification.valid) {
    console.error('[stripe-webhook] signature verification failed:', verification.reason)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: StripeEvent
  try {
    event = JSON.parse(rawBody) as StripeEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const admin = createAdminClient()

  // T4-PAY-004: Idempotency — drop duplicates
  const { error: insertErr } = await admin.from('stripe_events').insert({
    event_id: event.id,
    event_type: event.type,
    payload: event as unknown,
    processing_status: 'success',
  })

  if (insertErr) {
    // UNIQUE violation = duplicate event, skip
    if (insertErr.code === '23505') {
      console.log(`[stripe-webhook] duplicate event ${event.id} (${event.type}) — skipping`)
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error('[stripe-webhook] failed to log event:', insertErr)
    // Don't fail — kontynuuj, lepiej proczić niż retry
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(admin, event.data.object as unknown as StripeCheckoutSession)
        break

      case 'checkout.session.expired':
        await handleCheckoutExpired(admin, event.data.object as unknown as StripeCheckoutSession)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(
          admin,
          event.data.object as unknown as StripePaymentIntent,
        )
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(admin, event.data.object as unknown as StripePaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(
          admin,
          event.data.object as unknown as { payment_intent: string; amount_refunded: number },
        )
        break

      default:
        console.log(`[stripe-webhook] unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[stripe-webhook] handler error for ${event.type}:`, err)
    // Update stripe_events row → status='failed'
    await admin
      .from('stripe_events')
      .update({
        processing_status: 'failed',
        error_message: err instanceof Error ? err.message : String(err),
      })
      .eq('event_id', event.id)

    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ============================================================
// Handlers
// ============================================================

type AdminClient = ReturnType<typeof createAdminClient>

async function handleCheckoutCompleted(
  admin: AdminClient,
  session: StripeCheckoutSession,
): Promise<void> {
  // Defensive: jeśli payment_status != 'paid' to nie aktywuj
  if (session.payment_status !== 'paid') {
    console.log(`[checkout.completed] session ${session.id} not paid (${session.payment_status})`)
    return
  }

  const caseId = session.metadata?.['case_id']
  const userId = session.metadata?.['user_id']
  const productCode = session.metadata?.['product_code']
  const promoCode = session.metadata?.['promo_code']

  if (!caseId || !userId) {
    console.error('[checkout.completed] missing case_id/user_id in metadata', session.id)
    return
  }

  // Find pending payment row by session id
  const { data: paymentRow } = await admin
    .from('payments')
    .select('id, status')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle()

  const pTyped = paymentRow as { id: string; status: string } | null

  if (pTyped && pTyped.status === 'succeeded') {
    // już opłacone — idempotent
    return
  }

  if (pTyped) {
    await admin
      .from('payments')
      .update({
        status: 'succeeded',
        stripe_payment_intent_id: session.payment_intent,
      })
      .eq('id', pTyped.id)
  } else {
    // Fallback: utwórz nowy payment row (jeśli z jakiegoś powodu nie ma pendingu)
    await admin.from('payments').insert({
      user_id: userId,
      case_id: caseId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? 'pln',
      payment_type: 'one_time',
      status: 'succeeded',
      product_name: productCode ?? 'unknown',
      product_code: productCode ?? 'unknown',
      promo_code: promoCode ?? null,
    })
  }

  // Update case status
  await admin.from('cases').update({ status: 'paid' }).eq('id', caseId)

  // Log event
  await admin.from('events').insert({
    user_id: userId,
    case_id: caseId,
    event_type: 'payment_succeeded',
    data: {
      session_id: session.id,
      payment_intent: session.payment_intent,
      amount: session.amount_total,
      product_code: productCode,
    },
  })

  // Increment promo usage
  if (promoCode) {
    await incrementPromoUsage(promoCode)
  }

  // T4-PAY-009: auto-faktura (Fakturownia) — best-effort, nie blokujemy webhooka
  // T4-NOTIF-038: payment-success email
  await Promise.allSettled([
    sendPaymentSuccessSideEffects(admin, {
      userId,
      caseId,
      productCode: productCode ?? 'unknown',
      amount: session.amount_total ?? 0,
      paymentRowId: pTyped?.id ?? null,
      sessionId: session.id,
    }),
  ])

  // T4-INNGEST-002: fan-out — emit event jako warstwę retry.
  // Inline path powyżej jest "best-effort", a Inngest function ma własne
  // checks (events table + payments.invoice_id), więc duplikatów nie będzie.
  // Jeżeli Resend/Fakturownia padnie inline → Inngest spróbuje ponownie (3x z backoff).
  try {
    await inngest.send({
      name: 'mandatomat/payment.succeeded',
      data: {
        userId,
        caseId,
        paymentId: pTyped?.id ?? session.id,
        amountPln: (session.amount_total ?? 0) / 100,
        stripeSessionId: session.id,
      },
    })
  } catch (err) {
    // Inngest send failure nie powinno blokować webhooka — inline path już zrobił robotę
    console.warn('[stripe-webhook] inngest.send failed (non-fatal):', err)
  }
}

interface PaymentSideEffectsInput {
  userId: string
  caseId: string
  productCode: string
  amount: number
  paymentRowId: string | null
  sessionId: string
}

async function sendPaymentSuccessSideEffects(
  admin: AdminClient,
  input: PaymentSideEffectsInput,
): Promise<void> {
  // Załaduj profile + case dla tytułu i emaila
  const [profileRes, caseRes] = await Promise.all([
    admin
      .from('profiles')
      .select('email, full_name, street_address, city, postal_code, tax_id')
      .eq('id', input.userId)
      .maybeSingle(),
    admin.from('cases').select('title').eq('id', input.caseId).maybeSingle(),
  ])

  const profile = profileRes.data as {
    email: string | null
    full_name: string | null
    street_address: string | null
    city: string | null
    postal_code: string | null
    tax_id: string | null
  } | null
  const caseRow = caseRes.data as { title: string | null } | null

  if (!profile?.email) return

  const caseTitle = caseRow?.title ?? 'Pismo prawne'
  const amountPln = input.amount / 100

  // Auto-faktura
  let invoiceUrl: string | null = null
  try {
    const invoice = await createInvoice({
      externalNumber: input.paymentRowId ?? input.sessionId,
      buyerName: profile.full_name ?? profile.email,
      buyerEmail: profile.email,
      buyerTaxNo: profile.tax_id ?? undefined,
      buyerAddress: profile.street_address ?? undefined,
      buyerCity: profile.city ?? undefined,
      buyerPostCode: profile.postal_code ?? undefined,
      kind: profile.tax_id ? 'invoice' : 'receipt',
      paid: true,
      positions: [
        {
          name: caseTitle,
          tax: 23,
          total_price_gross: amountPln,
          quantity: 1,
        },
      ],
      description: `Mandatomat — ${caseTitle}`,
    })
    if (invoice.view_url) {
      invoiceUrl = invoice.view_url
      // UPDATE payments z invoice_id + invoice_url
      if (input.paymentRowId) {
        await admin
          .from('payments')
          .update({
            invoice_id: String(invoice.id),
            invoice_url: invoice.view_url,
          })
          .eq('id', input.paymentRowId)
      }
    }
  } catch (err) {
    if (err instanceof FakturowniaError) {
      console.warn('[webhook] fakturownia failed (non-fatal):', err.message)
    } else {
      console.warn('[webhook] invoice creation failed:', err)
    }
  }

  // Email payment-success
  try {
    const tpl = tplPaymentSuccess({
      recipientName: profile.full_name,
      caseTitle,
      caseId: input.caseId,
      amountPln,
      pdfUrl: null,
      invoiceUrl,
    })
    await sendEmail({
      to: profile.email,
      subject: tpl.subject,
      html: tpl.html,
      tags: [
        { name: 'type', value: 'payment_success' },
        { name: 'product_code', value: input.productCode },
      ],
    })
  } catch (err) {
    console.warn('[webhook] payment-success email failed:', err)
  }
}

async function handleCheckoutExpired(
  admin: AdminClient,
  session: StripeCheckoutSession,
): Promise<void> {
  const caseId = session.metadata?.['case_id']
  const userId = session.metadata?.['user_id']

  await admin
    .from('payments')
    .update({ status: 'failed' })
    .eq('stripe_checkout_session_id', session.id)

  if (caseId) {
    // Reset status — user może spróbować ponownie
    await admin.from('cases').update({ status: 'preview' }).eq('id', caseId)
  }

  if (userId) {
    await admin.from('events').insert({
      user_id: userId,
      case_id: caseId ?? null,
      event_type: 'payment_failed',
      data: { reason: 'checkout_expired', session_id: session.id },
    })
  }
}

async function handlePaymentIntentSucceeded(
  admin: AdminClient,
  intent: StripePaymentIntent,
): Promise<void> {
  // Idempotent: jeśli już succeeded, nic nie rób
  await admin
    .from('payments')
    .update({ status: 'succeeded' })
    .eq('stripe_payment_intent_id', intent.id)
    .neq('status', 'succeeded')
}

async function handlePaymentIntentFailed(
  admin: AdminClient,
  intent: StripePaymentIntent,
): Promise<void> {
  await admin
    .from('payments')
    .update({ status: 'failed' })
    .eq('stripe_payment_intent_id', intent.id)

  const userId = intent.metadata?.['user_id']
  const caseId = intent.metadata?.['case_id']

  if (userId) {
    await admin.from('events').insert({
      user_id: userId,
      case_id: caseId ?? null,
      event_type: 'payment_failed',
      data: { reason: 'payment_intent_failed', intent_id: intent.id },
    })
  }
}

async function handleChargeRefunded(
  admin: AdminClient,
  charge: { payment_intent: string; amount_refunded: number },
): Promise<void> {
  await admin
    .from('payments')
    .update({ status: 'refunded' })
    .eq('stripe_payment_intent_id', charge.payment_intent)
}

// Helper: re-export for testing
export { retrieveCheckoutSession }
