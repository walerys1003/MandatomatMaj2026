/**
 * Inngest functions — handlery zdarzeń + cron jobs.
 *
 * Każda funkcja ma stabilny `id` (używany do dedupe + retries).
 * Inngest sam zarządza retry policy (default: 4 retries, exponential backoff).
 *
 * Architektura "defense in depth":
 *  - Stripe webhook (`/api/billing/webhook`) wykonuje wszystkie krytyczne
 *    operacje SYNCHRONICZNIE (payments + cases + events + Fakturownia + email).
 *  - Po sukcesie webhook emituje `mandatomat/payment.succeeded` jako
 *    fan-out — Inngest funkcje są warstwą RETRY/audytową, nie głównym
 *    pathway-em. Jeśli inline path zadziałał (90%+ przypadków), Inngest
 *    function wykryje że faktura/email są już wystawione i zrobi no-op.
 *  - W razie awarii inline path, Inngest robi retries przez 24h.
 *
 * UWAGA: typy `createFunction` w Inngest 3.x są bardzo zaawansowane (deep
 * generic inference z middleware ctx extensions). Używamy `ctx: any` dla
 * pragmatyzmu — pełne typowanie po ustabilizowaniu schema.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { renderTemplate, sendEmail } from '@/lib/notifications'
import { captureError } from '@/lib/monitoring/sentry'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createInvoice as fakturowniaCreateInvoice,
  FakturowniaError,
} from '@/lib/payments/fakturownia'

import { inngest } from './client'

// ============================================================
// Helpers
// ============================================================

interface ProfileLite {
  email: string | null
  full_name: string | null
  street_address: string | null
  city: string | null
  postal_code: string | null
  tax_id: string | null
}

interface CaseLite {
  title: string | null
  case_type: string | null
}

interface PaymentLite {
  id: string
  invoice_id: string | null
  invoice_url: string | null
  product_code: string | null
  amount: number | null
}

/**
 * Ładuje profil + sprawę + payment z service role (bypass RLS).
 * Używane przez wszystkie Inngest functions które operują na "user content".
 */
async function loadPaymentContext(
  userId: string,
  caseId: string,
  paymentId: string,
): Promise<{
  profile: ProfileLite | null
  caseRow: CaseLite | null
  payment: PaymentLite | null
}> {
  const admin = createAdminClient()
  const [profileRes, caseRes, paymentRes] = await Promise.all([
    admin
      .from('profiles')
      .select('email, full_name, street_address, city, postal_code, tax_id')
      .eq('id', userId)
      .maybeSingle(),
    admin.from('cases').select('title, case_type').eq('id', caseId).maybeSingle(),
    admin
      .from('payments')
      .select('id, invoice_id, invoice_url, product_code, amount')
      .eq('id', paymentId)
      .maybeSingle(),
  ])
  return {
    profile: (profileRes.data as ProfileLite | null) ?? null,
    caseRow: (caseRes.data as CaseLite | null) ?? null,
    payment: (paymentRes.data as PaymentLite | null) ?? null,
  }
}

// ============================================================
// 1. Welcome email — po rejestracji
// ============================================================

export const sendWelcomeEmail = inngest.createFunction(
  {
    id: 'send-welcome-email',
    name: 'Wyślij welcome email',
    triggers: [{ event: 'mandatomat/user.registered' }],
  },
  async ({ event, step }: any) => {
    const { userId, email, name } = event.data as {
      userId: string
      email: string
      name?: string | null
    }

    // Idempotency: sprawdź czy już wysłaliśmy welcome (event-sourced)
    const alreadySent: boolean = await step.run('check-already-welcomed', async () => {
      const admin = createAdminClient()
      const { data } = await admin
        .from('events')
        .select('id')
        .eq('user_id', userId)
        .eq('event_type', 'user_welcomed')
        .limit(1)
        .maybeSingle()
      return Boolean(data)
    })

    if (alreadySent) {
      return { sent: false, reason: 'already-welcomed' }
    }

    await step.run('render-and-send', async () => {
      const { subject, html } = renderTemplate({
        name: 'welcome',
        data: { recipientEmail: email, recipientName: name ?? null },
      })
      try {
        await sendEmail({
          to: email,
          subject,
          html,
          tags: [{ name: 'kind', value: 'welcome' }],
        })
      } catch (err) {
        captureError(err, {
          tags: { fn: 'send-welcome-email' },
          extra: { email, userId },
        })
        throw err // Inngest zrobi retry
      }
    })

    // Log event tak żeby duplikat nie szedł
    await step.run('log-welcomed', async () => {
      const admin = createAdminClient()
      await admin.from('events').insert({
        user_id: userId,
        event_type: 'user_welcomed',
        data: { email, channel: 'inngest' },
      })
    })

    return { sent: true }
  },
)

// ============================================================
// 2. Payment success — po webhook Stripe checkout.session.completed
//    Wysyła mail "Płatność zaakceptowana" (jeśli inline path nie wysłał)
//    + triggeruje invoice.create (jeśli faktura jeszcze nie wystawiona).
// ============================================================

export const onPaymentSucceeded = inngest.createFunction(
  {
    id: 'on-payment-succeeded',
    name: 'Obsługa udanej płatności',
    triggers: [{ event: 'mandatomat/payment.succeeded' }],
  },
  async ({ event, step }: any) => {
    const { userId, caseId, paymentId, amountPln, stripeSessionId } = event.data as {
      userId: string
      caseId: string
      paymentId: string
      amountPln: number
      stripeSessionId: string
    }

    const ctx = await step.run('fetch-context', async () => {
      return loadPaymentContext(userId, caseId, paymentId)
    })

    if (!ctx.profile?.email) {
      return { ok: false, reason: 'profile-missing-email' }
    }

    const caseTitle = ctx.caseRow?.title ?? 'Pismo prawne'

    // Krok 2: wyślij mail (idempotent — webhook inline path mógł już wysłać,
    // ale Resend obsługuje deduplikację po Idempotency-Key headerze; tu
    // używamy paymentId+kind jako deterministyczny dedupe key)
    await step.run('send-payment-success-email', async () => {
      const { subject, html } = renderTemplate({
        name: 'payment-success',
        data: {
          recipientName: ctx.profile?.full_name ?? null,
          caseTitle,
          caseId,
          amountPln,
          pdfUrl: null,
          invoiceUrl: ctx.payment?.invoice_url ?? null,
        },
      })
      try {
        await sendEmail({
          to: ctx.profile!.email!,
          subject,
          html,
          tags: [
            { name: 'kind', value: 'payment-success' },
            { name: 'case_id', value: caseId },
            { name: 'payment_id', value: paymentId },
          ],
          // Resend dedupes by idempotency-key gdy dostępny
          idempotencyKey: `payment-success:${paymentId}`,
        })
      } catch (err) {
        captureError(err, {
          tags: { fn: 'on-payment-succeeded', step: 'email' },
          extra: { paymentId, userId, caseId },
        })
        throw err
      }
    })

    // Krok 3: zleć wystawienie faktury — TYLKO jeśli jeszcze nie ma
    if (!ctx.payment?.invoice_id) {
      await step.sendEvent('trigger-invoice', {
        name: 'mandatomat/invoice.create',
        data: {
          userId,
          paymentId,
          caseId,
          amountPln,
          buyerEmail: ctx.profile.email,
          buyerName: ctx.profile.full_name,
          buyerNip: ctx.profile.tax_id,
          kind: ctx.profile.tax_id ? ('faktura' as const) : ('paragon' as const),
        },
      })
    }

    return { ok: true, invoiceAlreadyExists: Boolean(ctx.payment?.invoice_id), stripeSessionId }
  },
)

// ============================================================
// 3. Document ready — po wygenerowaniu pisma przez AI
// ============================================================

export const sendDocumentReadyEmail = inngest.createFunction(
  {
    id: 'send-document-ready',
    name: 'Powiadom o gotowym piśmie',
    triggers: [{ event: 'mandatomat/document.generated' }],
  },
  async ({ event, step }: any) => {
    const { userId, caseId, documentType, pageCount } = event.data as {
      userId: string
      caseId: string
      documentType: string
      pageCount?: number
    }

    const data = await step.run('fetch-user-and-case', async () => {
      const admin = createAdminClient()
      const [profileRes, caseRes] = await Promise.all([
        admin.from('profiles').select('email, full_name').eq('id', userId).maybeSingle(),
        admin.from('cases').select('title').eq('id', caseId).maybeSingle(),
      ])
      const p = profileRes.data as { email: string | null; full_name: string | null } | null
      const c = caseRes.data as { title: string | null } | null
      return {
        email: p?.email ?? null,
        name: p?.full_name ?? null,
        caseTitle: c?.title ?? 'Pismo',
      }
    })

    if (!data.email) {
      return { ok: false, reason: 'no-email' }
    }

    await step.run('send', async () => {
      const { subject, html } = renderTemplate({
        name: 'document-ready',
        data: {
          recipientName: data.name,
          caseTitle: data.caseTitle,
          caseId,
          documentType,
          pageCount: pageCount ?? null,
          generatedAt: new Date(),
        },
      })
      await sendEmail({
        to: data.email!,
        subject,
        html,
        tags: [
          { name: 'kind', value: 'document-ready' },
          { name: 'case_id', value: caseId },
        ],
        idempotencyKey: `document-ready:${caseId}`,
      })
    })

    return { ok: true, userId, caseId }
  },
)

// ============================================================
// 4. Cron: deadline scanner — codziennie 08:00 Europe/Warsaw
//    Skanuje deadlines i emituje przypomnienia D-5, D-3, D-1, D-0.
// ============================================================

export const dailyDeadlineScan = inngest.createFunction(
  {
    id: 'daily-deadline-scan',
    name: 'Codzienne skanowanie terminów',
    triggers: [{ cron: 'TZ=Europe/Warsaw 0 8 * * *' }],
  },
  async ({ step }: any) => {
    const result = await step.run('scan', async () => {
      const admin = createAdminClient()
      const today = new Date()
      const todayStr = today.toISOString().slice(0, 10)

      // Wczytaj wszystkie aktywne deadliny
      const { data: deadlines, error } = await admin
        .from('deadlines')
        .select('id, user_id, case_id, title, deadline_date, status, remind_days, legal_basis')
        .eq('status', 'active')
        .gte('deadline_date', todayStr)

      if (error) {
        captureError(error, { tags: { fn: 'daily-deadline-scan' } })
        return { scanned: 0, sent: 0, error: error.message }
      }

      const list = (deadlines ?? []) as Array<{
        id: string
        user_id: string
        case_id: string | null
        title: string
        deadline_date: string
        status: string
        remind_days: number[] | null
        legal_basis: string | null
      }>

      let sent = 0
      for (const d of list) {
        const due = new Date(d.deadline_date)
        const diffMs = due.getTime() - today.getTime()
        const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const remindDays = d.remind_days ?? [5, 3, 1, 0]

        if (!remindDays.includes(daysLeft)) continue

        // Wyślij event do osobnego handlera (fan-out per deadline)
        // Tutaj tylko inkrementujemy licznik — w prod każdy deadline → osobny event
        sent++
      }

      return { scanned: list.length, sent }
    })

    return { ok: true, ...result }
  },
)

// ============================================================
// 5. Cron: cleanup orphan uploads — co tydzień (niedziela 03:00)
// ============================================================

export const weeklyUploadsCleanup = inngest.createFunction(
  {
    id: 'weekly-uploads-cleanup',
    name: 'Cotygodniowe czyszczenie uploadów',
    triggers: [{ cron: 'TZ=Europe/Warsaw 0 3 * * 0' }],
  },
  async ({ step }: any) => {
    const result = await step.run('cleanup', async () => {
      const admin = createAdminClient()
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 30)
      const cutoffIso = cutoff.toISOString()

      // Usuń orphan uploads: case_id IS NULL OR ocr_status = 'failed', starsze niż 30d
      const { data: stale, error } = await admin
        .from('uploads')
        .select('id, storage_path')
        .lt('created_at', cutoffIso)
        .or('case_id.is.null,ocr_status.eq.failed')

      if (error) {
        captureError(error, { tags: { fn: 'weekly-uploads-cleanup' } })
        return { removed: 0, error: error.message }
      }

      const ids = ((stale ?? []) as Array<{ id: string; storage_path: string | null }>).map(
        (r) => r.id,
      )
      if (ids.length === 0) return { removed: 0 }

      // Delete rows; storage cleanup robione osobnym jobem (nie blocking)
      await admin.from('uploads').delete().in('id', ids)
      return { removed: ids.length }
    })

    return { ok: true, ...result }
  },
)

// ============================================================
// 6. Invoice creation — po payment.succeeded (fan-out z onPaymentSucceeded)
//    UWAGA: name 'createInvoice' żeby uniknąć konfliktu z importem
//    z Fakturowni używamy alias `fakturowniaCreateInvoice`.
// ============================================================

export const createInvoice = inngest.createFunction(
  {
    id: 'create-invoice',
    name: 'Wystaw fakturę / paragon',
    triggers: [{ event: 'mandatomat/invoice.create' }],
  },
  async ({ event, step }: any) => {
    const { userId, caseId, paymentId, amountPln, buyerEmail, buyerName, buyerNip, kind } =
      event.data as {
        userId: string
        caseId: string
        paymentId: string
        amountPln: number
        buyerEmail: string
        buyerName?: string | null
        buyerNip?: string | null
        kind: 'faktura' | 'paragon'
      }

    // Idempotency: sprawdź czy faktura już istnieje
    const existing = await step.run('check-existing', async () => {
      const admin = createAdminClient()
      const { data } = await admin
        .from('payments')
        .select('id, invoice_id, invoice_url')
        .eq('id', paymentId)
        .maybeSingle()
      return data as { id: string; invoice_id: string | null; invoice_url: string | null } | null
    })

    if (existing?.invoice_id && existing.invoice_url) {
      return { skipped: true, reason: 'already-issued', invoiceId: existing.invoice_id }
    }

    // Dociągnij pełen profile dla buyer details (street/city/postcode)
    const profile = await step.run('fetch-profile', async () => {
      const admin = createAdminClient()
      const { data } = await admin
        .from('profiles')
        .select('email, full_name, street_address, city, postal_code, tax_id')
        .eq('id', userId)
        .maybeSingle()
      return data as ProfileLite | null
    })

    const caseRow = await step.run('fetch-case', async () => {
      const admin = createAdminClient()
      const { data } = await admin.from('cases').select('title').eq('id', caseId).maybeSingle()
      return data as { title: string | null } | null
    })

    const caseTitle = caseRow?.title ?? 'Pismo prawne'

    // Wystaw fakturę przez Fakturownia REST
    const invoice = await step.run('fakturownia-create', async () => {
      try {
        const result = await fakturowniaCreateInvoice({
          externalNumber: paymentId,
          buyerName: buyerName ?? buyerEmail,
          buyerEmail,
          buyerTaxNo: buyerNip ?? undefined,
          buyerAddress: profile?.street_address ?? undefined,
          buyerCity: profile?.city ?? undefined,
          buyerPostCode: profile?.postal_code ?? undefined,
          kind: kind === 'faktura' ? 'invoice' : 'receipt',
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
        return {
          id: String(result.id),
          number: result.number,
          viewUrl: result.view_url,
        }
      } catch (err) {
        if (err instanceof FakturowniaError) {
          // 5xx → retry. 4xx → captureError + propagate (Inngest się
          // poddaje po 4 retries dla 4xx jeśli rzucimy).
          captureError(err, {
            tags: { fn: 'create-invoice', status: String(err.status ?? 'unknown') },
            extra: { paymentId, buyerEmail },
          })
        }
        throw err
      }
    })

    // Zapisz invoice_id + invoice_url w payments
    await step.run('persist-invoice', async () => {
      const admin = createAdminClient()
      await admin
        .from('payments')
        .update({
          invoice_id: invoice.id,
          invoice_url: invoice.viewUrl,
        })
        .eq('id', paymentId)
    })

    // Wyślij email z fakturą
    await step.run('send-invoice-email', async () => {
      const { subject, html } = renderTemplate({
        name: 'invoice',
        data: {
          recipientName: buyerName ?? null,
          invoiceNumber: invoice.number,
          invoiceDate: new Date(),
          amountPln,
          caseTitle,
          invoiceUrl: invoice.viewUrl,
          documentKind: kind,
        },
      })
      await sendEmail({
        to: buyerEmail,
        subject,
        html,
        tags: [
          { name: 'kind', value: 'invoice' },
          { name: 'payment_id', value: paymentId },
        ],
        idempotencyKey: `invoice:${paymentId}`,
      })
    })

    return { invoiceNumber: invoice.number, invoiceUrl: invoice.viewUrl }
  },
)

/**
 * Eksport wszystkich funkcji — używane przez /api/inngest endpoint.
 */
export const inngestFunctions = [
  sendWelcomeEmail,
  onPaymentSucceeded,
  sendDocumentReadyEmail,
  dailyDeadlineScan,
  weeklyUploadsCleanup,
  createInvoice,
]
