import { serverEnv } from '@/lib/env'

/**
 * Wrapper na Stripe API.
 *
 * Cele:
 *  - jeden punkt wywołania → łatwo dodać retries, telemetrię, alternative providers
 *  - typed response
 *  - obsługa błędów z czytelnymi komunikatami PL
 *  - Edge-compatible (fetch zamiast SDK Node-only)
 *
 * Stripe API używa application/x-www-form-urlencoded dla POST (legacy quirk).
 */

const STRIPE_API_URL = 'https://api.stripe.com/v1'
const STRIPE_API_VERSION = '2024-09-30.acacia'

export class StripeError extends Error {
  public readonly status?: number
  public readonly stripeCode?: string
  public override readonly cause?: unknown

  constructor(message: string, status?: number, stripeCode?: string, cause?: unknown) {
    super(message)
    this.name = 'StripeError'
    if (status !== undefined) this.status = status
    if (stripeCode !== undefined) this.stripeCode = stripeCode
    if (cause !== undefined) this.cause = cause
  }
}

/** Stripe form-encoder — obsługa nested objects (metadata[key]=value, line_items[0][price]=...). */
function formEncode(obj: Record<string, unknown>, prefix = ''): string[] {
  const pairs: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    const formKey = prefix ? `${prefix}[${key}]` : key
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === 'object' && v !== null) {
          pairs.push(...formEncode(v as Record<string, unknown>, `${formKey}[${i}]`))
        } else {
          pairs.push(`${encodeURIComponent(`${formKey}[${i}]`)}=${encodeURIComponent(String(v))}`)
        }
      })
    } else if (typeof value === 'object') {
      pairs.push(...formEncode(value as Record<string, unknown>, formKey))
    } else {
      pairs.push(`${encodeURIComponent(formKey)}=${encodeURIComponent(String(value))}`)
    }
  }
  return pairs
}

interface StripeRequestOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: Record<string, unknown>
  idempotencyKey?: string
}

async function stripeRequest<T>(path: string, opts: StripeRequestOptions = {}): Promise<T> {
  const apiKey = serverEnv.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new StripeError('Stripe nie jest skonfigurowany (brak STRIPE_SECRET_KEY).', 500, 'config_missing')
  }

  const url = `${STRIPE_API_URL}${path}`
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Stripe-Version': STRIPE_API_VERSION,
  }

  let body: string | undefined
  if (opts.body && opts.method !== 'GET') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    body = formEncode(opts.body).join('&')
  }
  if (opts.idempotencyKey) {
    headers['Idempotency-Key'] = opts.idempotencyKey
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: opts.method ?? 'POST',
      headers,
      body,
    })
  } catch (err) {
    throw new StripeError('Nie udało się połączyć ze Stripe.', undefined, 'network_error', err)
  }

  if (!res.ok) {
    let errBody: { error?: { message?: string; code?: string; type?: string } } = {}
    try {
      errBody = (await res.json()) as typeof errBody
    } catch {
      // ignore
    }
    const msg = errBody.error?.message ?? `Stripe HTTP ${res.status}`
    throw new StripeError(msg, res.status, errBody.error?.code, errBody)
  }

  return (await res.json()) as T
}

// ============================================================
// Typy domenowe
// ============================================================

export interface StripeCheckoutSession {
  id: string
  url: string | null
  status: 'open' | 'complete' | 'expired'
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  payment_intent: string | null
  customer_email: string | null
  amount_total: number | null
  currency: string | null
  metadata: Record<string, string>
}

export interface StripePaymentIntent {
  id: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded'
  amount: number
  amount_received: number
  currency: string
  metadata: Record<string, string>
  latest_charge: string | null
}

export interface StripeRefund {
  id: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  amount: number
  payment_intent: string
  reason: string | null
}

// ============================================================
// API
// ============================================================

export interface CreateCheckoutSessionInput {
  caseId: string
  userId: string
  productCode: string
  productName: string
  /** Cena w groszach (np. 1900 = 19,00 PLN). */
  amount: number
  /** E-mail klienta — prefill w Stripe Checkout. */
  customerEmail?: string
  /** URL po sukcesie (z {CHECKOUT_SESSION_ID} placeholderem). */
  successUrl: string
  /** URL po anulowaniu. */
  cancelUrl: string
  /** Opcjonalnie: kod promo (już zwalidowany!). */
  promoCode?: string
  discountPercent?: number
  /** Dodatkowe metadane (zostaną zapisane w session.metadata). */
  metadata?: Record<string, string>
}

/**
 * Tworzy Stripe Checkout Session w trybie one-time payment.
 * Cena obliczana po stronie serwera (nie ufamy klientowi).
 */
export async function createCheckoutSession(input: CreateCheckoutSessionInput): Promise<StripeCheckoutSession> {
  const finalAmount =
    input.discountPercent && input.discountPercent > 0
      ? Math.round(input.amount * (1 - input.discountPercent / 100))
      : input.amount

  if (finalAmount < 100) {
    throw new StripeError('Minimalna kwota płatności to 1,00 PLN.', 400, 'amount_too_low')
  }

  const metadata: Record<string, string> = {
    case_id: input.caseId,
    user_id: input.userId,
    product_code: input.productCode,
    original_amount: String(input.amount),
    ...(input.promoCode ? { promo_code: input.promoCode } : {}),
    ...(input.discountPercent ? { discount_percent: String(input.discountPercent) } : {}),
    ...(input.metadata ?? {}),
  }

  const body: Record<string, unknown> = {
    mode: 'payment',
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    payment_method_types: ['card', 'blik', 'p24'],
    locale: 'pl',
    line_items: [
      {
        price_data: {
          currency: 'pln',
          unit_amount: finalAmount,
          product_data: {
            name: input.productName,
            metadata: { product_code: input.productCode },
          },
        },
        quantity: 1,
      },
    ],
    metadata,
    payment_intent_data: {
      metadata,
    },
  }

  if (input.customerEmail) {
    body['customer_email'] = input.customerEmail
  }

  return stripeRequest<StripeCheckoutSession>('/checkout/sessions', {
    method: 'POST',
    body,
    idempotencyKey: `checkout:${input.caseId}:${input.productCode}`,
  })
}

/** Pobiera szczegóły sesji checkout (np. w success page). */
export async function retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>(`/checkout/sessions/${sessionId}`, {
    method: 'GET',
  })
}

/** Pobiera szczegóły PaymentIntent. */
export async function retrievePaymentIntent(intentId: string): Promise<StripePaymentIntent> {
  return stripeRequest<StripePaymentIntent>(`/payment_intents/${intentId}`, {
    method: 'GET',
  })
}

/** Refund (pełny lub częściowy). amount w groszach; brak = pełny zwrot. */
export async function refund(paymentIntentId: string, amount?: number, reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'): Promise<StripeRefund> {
  const body: Record<string, unknown> = {
    payment_intent: paymentIntentId,
  }
  if (amount !== undefined) body['amount'] = amount
  if (reason) body['reason'] = reason

  return stripeRequest<StripeRefund>('/refunds', {
    method: 'POST',
    body,
    idempotencyKey: `refund:${paymentIntentId}:${amount ?? 'full'}`,
  })
}

// ============================================================
// Webhook signature verification
// ============================================================

/**
 * Weryfikuje podpis webhooka Stripe (HMAC SHA-256).
 *
 * Stripe-Signature header format: `t=TIMESTAMP,v1=SIG[,v1=SIG2,...]`
 * Signed payload: `${timestamp}.${rawBody}`
 *
 * @param rawBody — raw request body string (PRZED parsowaniem JSON!)
 * @param signature — wartość headera Stripe-Signature
 * @param toleranceSec — max. wiek timestampu (default 300s = 5 min)
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  toleranceSec = 300,
): Promise<{ valid: boolean; reason?: string; timestamp?: number }> {
  const secret = serverEnv.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return { valid: false, reason: 'STRIPE_WEBHOOK_SECRET not configured' }
  }

  // Parse "t=...,v1=..." format
  const parts = signature.split(',').reduce<Record<string, string[]>>((acc, p) => {
    const [k, v] = p.split('=', 2)
    if (!k || !v) return acc
    if (!acc[k]) acc[k] = []
    acc[k]!.push(v)
    return acc
  }, {})

  const timestampStr = parts['t']?.[0]
  const signatures = parts['v1'] ?? []
  if (!timestampStr || signatures.length === 0) {
    return { valid: false, reason: 'Malformed Stripe-Signature header' }
  }

  const timestamp = parseInt(timestampStr, 10)
  if (Number.isNaN(timestamp)) {
    return { valid: false, reason: 'Invalid timestamp' }
  }

  const ageSec = Math.floor(Date.now() / 1000) - timestamp
  if (ageSec > toleranceSec) {
    return { valid: false, reason: `Timestamp too old (${ageSec}s > ${toleranceSec}s)`, timestamp }
  }

  // Compute HMAC SHA-256
  const signedPayload = `${timestamp}.${rawBody}`
  const expectedSig = await hmacSha256Hex(secret, signedPayload)

  // Constant-time comparison (any v1 signature must match)
  const match = signatures.some((s) => constantTimeEqual(s, expectedSig))
  if (!match) {
    return { valid: false, reason: 'Signature mismatch', timestamp }
  }

  return { valid: true, timestamp }
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ============================================================
// Cennik (single source of truth)
// ============================================================

/**
 * Cennik produktów — w groszach.
 * Ceny zgodne z chunkiem T10 + landing pricing section.
 */
export const PRICING: Record<string, { name: string; amount: number; description: string }> = {
  // Pojedyncze pisma (one-time)
  M1_mandat_predkosc: { name: 'Sprzeciw od mandatu — prędkość', amount: 1900, description: 'Sprzeciw od mandatu za przekroczenie prędkości' },
  M2_mandat_parking: { name: 'Sprzeciw od mandatu — parking', amount: 1900, description: 'Sprzeciw od mandatu parkingowego' },
  M3_mandat_inne: { name: 'Sprzeciw od mandatu — inne', amount: 1900, description: 'Sprzeciw od mandatu (inne wykroczenia)' },
  P1_parking_strefa: { name: 'Odwołanie ZTM — strefa płatnego parkowania', amount: 1900, description: 'Odwołanie od opłaty SPP' },
  W1_wezwanie_predkosc: { name: 'Odpowiedź na wezwanie — prędkość', amount: 1900, description: 'Odpowiedź na wezwanie do wskazania kierowcy' },
  U1_windykacja: { name: 'Sprzeciw od windykacji', amount: 1900, description: 'Sprzeciw od nakazu zapłaty / wezwania windykacyjnego' },
  E1_etoll: { name: 'Reklamacja e-TOLL', amount: 1900, description: 'Reklamacja kary e-TOLL' },
  K1_komornik: { name: 'Pismo do komornika', amount: 1900, description: 'Wniosek o ograniczenie egzekucji / sprzeciw' },
  T1_techniczny: { name: 'Reklamacja przegląd techniczny', amount: 1900, description: 'Reklamacja decyzji o badaniu technicznym' },

  // Pakiety (multi-pay)
  PACK_5: { name: 'Pakiet 5 pism', amount: 7900, description: '5 dowolnych pism (oszczędzasz 16 zł)' },
  PACK_10: { name: 'Pakiet 10 pism', amount: 14900, description: '10 dowolnych pism (oszczędzasz 41 zł)' },

  // Subskrypcje (subscription)
  SUB_KIEROWCA: { name: 'Subskrypcja Kierowca', amount: 2900, description: 'Miesięczna subskrypcja — 3 pisma/mies + priorytet' },
  SUB_PRO: { name: 'Subskrypcja PRO', amount: 5900, description: 'Miesięczna subskrypcja — bez limitu pism' },
}

export function getProduct(code: string): { name: string; amount: number; description: string } | null {
  return PRICING[code] ?? null
}
