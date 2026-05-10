import { serverEnv } from '@/lib/env'

/**
 * Wrapper na Fakturownia API.
 *
 * Cele:
 *  - auto-faktura po `payment_succeeded` (webhook Stripe)
 *  - jeden punkt wywołania → łatwo dodać retries / fallback do innego dostawcy
 *  - Edge-compatible (fetch zamiast SDK)
 *
 * Docs: https://app.fakturownia.pl/api
 */

export class FakturowniaError extends Error {
  public readonly status?: number
  public override readonly cause?: unknown

  constructor(message: string, status?: number, cause?: unknown) {
    super(message)
    this.name = 'FakturowniaError'
    if (status !== undefined) this.status = status
    if (cause !== undefined) this.cause = cause
  }
}

interface FakturowniaConfig {
  apiKey: string
  domain: string
}

function getConfig(): FakturowniaConfig {
  const apiKey = serverEnv.FAKTUROWNIA_API_KEY
  const domain = serverEnv.FAKTUROWNIA_DOMAIN
  if (!apiKey || !domain) {
    throw new FakturowniaError('Fakturownia nie skonfigurowana (brak API_KEY/DOMAIN).', 500)
  }
  return { apiKey, domain }
}

interface FakturowniaPosition {
  name: string
  tax: number // % VAT (23 dla Polski)
  total_price_gross: number // w PLN (nie w groszach!)
  quantity?: number
}

export interface CreateInvoiceInput {
  /** Numer obcy/własny — np. paymentId. */
  externalNumber: string
  /** Dane kupującego. */
  buyerName: string
  buyerEmail: string
  buyerTaxNo?: string // NIP
  buyerAddress?: string
  buyerCity?: string
  buyerPostCode?: string
  /** Pozycje faktury (max 1 dla pisma). */
  positions: FakturowniaPosition[]
  /** Rodzaj: invoice (standardowa) | receipt (paragon). */
  kind?: 'invoice' | 'receipt'
  /** Status: paid (od razu opłacona). */
  paid?: boolean
  /** Walidacja: PLN. */
  currency?: string
  /** Notatki. */
  description?: string
}

export interface FakturowniaInvoice {
  id: number
  number: string
  kind: string
  paid: number // w PLN
  price_net: number
  price_gross: number
  currency: string
  view_url: string
  invoice_url?: string
  buyer_name: string
  issue_date: string
  sell_date: string
  payment_date: string | null
  status: string
}

/**
 * Tworzy fakturę w Fakturowni.
 * Używana w handler `payment_succeeded` (Stripe webhook).
 */
export async function createInvoice(input: CreateInvoiceInput): Promise<FakturowniaInvoice> {
  const config = getConfig()
  const url = `https://${config.domain}/invoices.json`

  const today = new Date().toISOString().slice(0, 10)

  const payload = {
    api_token: config.apiKey,
    invoice: {
      kind: input.kind ?? 'receipt', // paragon dla B2C, invoice dla B2B z NIP
      number: null,
      sell_date: today,
      issue_date: today,
      payment_to: today,
      seller_name: 'Mandatomat sp. z o.o.',
      buyer_name: input.buyerName,
      buyer_email: input.buyerEmail,
      buyer_tax_no: input.buyerTaxNo ?? null,
      buyer_post_code: input.buyerPostCode ?? null,
      buyer_city: input.buyerCity ?? null,
      buyer_street: input.buyerAddress ?? null,
      currency: input.currency ?? 'PLN',
      lang: 'pl',
      paid: input.paid ? input.positions.reduce((sum, p) => sum + p.total_price_gross, 0) : 0,
      status: input.paid ? 'paid' : 'issued',
      description: input.description ?? '',
      external_id: input.externalNumber,
      positions: input.positions.map((p) => ({
        name: p.name,
        tax: p.tax,
        total_price_gross: p.total_price_gross,
        quantity: p.quantity ?? 1,
      })),
    },
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    throw new FakturowniaError('Nie udało się połączyć z Fakturownią.', undefined, err)
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new FakturowniaError(
      `Fakturownia HTTP ${res.status}: ${errBody.slice(0, 200)}`,
      res.status,
    )
  }

  return (await res.json()) as FakturowniaInvoice
}

/**
 * Pobiera signed URL do PDF faktury.
 * Fakturownia daje stałe URL — opakowujemy dla spójności z innymi storage providers.
 */
export async function getInvoicePdfUrl(invoiceId: number): Promise<string> {
  const config = getConfig()
  return `https://${config.domain}/invoices/${invoiceId}.pdf?api_token=${encodeURIComponent(config.apiKey)}`
}

/** Lista faktur — w panelu /faktury. */
export async function listInvoices(period?: { from?: string; to?: string }): Promise<FakturowniaInvoice[]> {
  const config = getConfig()
  const params = new URLSearchParams({ api_token: config.apiKey })
  if (period?.from) params.set('period', 'more')
  if (period?.from) params.set('date_from', period.from)
  if (period?.to) params.set('date_to', period.to)

  const url = `https://${config.domain}/invoices.json?${params.toString()}`

  let res: Response
  try {
    res = await fetch(url, { method: 'GET' })
  } catch (err) {
    throw new FakturowniaError('Nie udało się połączyć z Fakturownią.', undefined, err)
  }
  if (!res.ok) {
    throw new FakturowniaError(`Fakturownia HTTP ${res.status}`, res.status)
  }
  return (await res.json()) as FakturowniaInvoice[]
}
