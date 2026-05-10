/**
 * Inngest functions — handlery zdarzeń + cron jobs.
 *
 * Każda funkcja ma stabilny `id` (używany do dedupe + retries).
 * Inngest sam zarządza retry policy (default: 4 retries, exponential backoff).
 *
 * UWAGA: typy `createFunction` w Inngest 3.x są bardzo zaawansowane (deep
 * generic inference z middleware ctx extensions). Dla skeleton-a używamy
 * luźnego typowania `ctx: any` — pełne typowanie zostanie dodane po
 * pierwszych realnych callsite-ach (gdy ustabilizujemy schema).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { renderTemplate, sendEmail } from '@/lib/notifications'
import { captureError } from '@/lib/monitoring/sentry'

import { inngest } from './client'

/**
 * 1. Welcome email — po rejestracji.
 */
export const sendWelcomeEmail = inngest.createFunction(
  {
    id: 'send-welcome-email',
    name: 'Wyślij welcome email',
    triggers: [{ event: 'mandatomat/user.registered' }],
  },
  async ({ event, step }: any) => {
    const { email, name } = event.data as { email: string; name?: string | null }
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
          extra: { email },
        })
        throw err // Inngest zrobi retry
      }
    })
    return { sent: true }
  },
)

/**
 * 2. Payment success — po webhook Stripe checkout.session.completed.
 *    Wysyła mail "Płatność zaakceptowana" + triggeruje invoice.create.
 */
export const onPaymentSucceeded = inngest.createFunction(
  {
    id: 'on-payment-succeeded',
    name: 'Obsługa udanej płatności',
    triggers: [{ event: 'mandatomat/payment.succeeded' }],
  },
  async ({ event, step }: any) => {
    const { userId, caseId, paymentId, amountPln } = event.data as {
      userId: string
      caseId: string
      paymentId: string
      amountPln: number
    }

    // Krok 1: pobierz dane usera + sprawy (placeholder — TODO realne pobranie via service role)
    const userData: { email: string; name: string | null; caseTitle: string } =
      await step.run('fetch-user-and-case', async () => ({
        email: 'placeholder@mandatomat.pl',
        name: null,
        caseTitle: 'Sprawa',
      }))

    // Krok 2: wyślij mail
    await step.run('send-payment-success-email', async () => {
      const { subject, html } = renderTemplate({
        name: 'payment-success',
        data: {
          recipientName: userData.name,
          caseTitle: userData.caseTitle,
          caseId,
          amountPln,
        },
      })
      await sendEmail({
        to: userData.email,
        subject,
        html,
        tags: [
          { name: 'kind', value: 'payment-success' },
          { name: 'case_id', value: caseId },
        ],
      })
    })

    // Krok 3: zleć wystawienie faktury (Fakturownia) — fan-out
    await step.sendEvent('trigger-invoice', {
      name: 'mandatomat/invoice.create',
      data: {
        userId,
        paymentId,
        caseId,
        amountPln,
        buyerEmail: userData.email,
        buyerName: userData.name,
        kind: 'faktura' as const,
      },
    })

    return { ok: true }
  },
)

/**
 * 3. Document ready — po wygenerowaniu pisma przez AI.
 */
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

    const userData: { email: string; name: string | null; caseTitle: string } =
      await step.run('fetch-user', async () => ({
        email: 'x@y.pl',
        name: null,
        caseTitle: 'Sprawa',
      }))

    await step.run('send', async () => {
      const { subject, html } = renderTemplate({
        name: 'document-ready',
        data: {
          recipientName: userData.name,
          caseTitle: userData.caseTitle,
          caseId,
          documentType,
          pageCount: pageCount ?? null,
          generatedAt: new Date(),
        },
      })
      await sendEmail({
        to: userData.email,
        subject,
        html,
        tags: [{ name: 'kind', value: 'document-ready' }],
      })
    })

    return { userId, caseId }
  },
)

/**
 * 4. Cron: deadline scanner — codziennie 08:00 Europe/Warsaw.
 *    Skanuje deadlines i emituje przypomnienia D-5, D-3, D-1, D-0.
 */
export const dailyDeadlineScan = inngest.createFunction(
  {
    id: 'daily-deadline-scan',
    name: 'Codzienne skanowanie terminów',
    triggers: [{ cron: 'TZ=Europe/Warsaw 0 8 * * *' }],
  },
  async ({ step }: any) => {
    // TODO: pełny scan przez service role client.
    await step.run('scan', async () => ({ scanned: 0, sent: 0 }))
    return { ok: true }
  },
)

/**
 * 5. Cron: cleanup orphan uploads — co tydzień (niedziela 03:00).
 */
export const weeklyUploadsCleanup = inngest.createFunction(
  {
    id: 'weekly-uploads-cleanup',
    name: 'Cotygodniowe czyszczenie uploadów',
    triggers: [{ cron: 'TZ=Europe/Warsaw 0 3 * * 0' }],
  },
  async ({ step }: any) => {
    await step.run('cleanup', async () => ({ removed: 0 }))
    return { ok: true }
  },
)

/**
 * 6. Invoice creation — po payment.succeeded.
 */
export const createInvoice = inngest.createFunction(
  {
    id: 'create-invoice',
    name: 'Wystaw fakturę / paragon',
    triggers: [{ event: 'mandatomat/invoice.create' }],
  },
  async ({ event, step }: any) => {
    const { paymentId, amountPln, buyerEmail, buyerName, kind } = event.data as {
      paymentId: string
      amountPln: number
      buyerEmail: string
      buyerName?: string | null
      kind: 'faktura' | 'paragon'
    }

    const invoice: { number: string; pdfUrl: string } = await step.run(
      'fakturownia-create',
      async () => ({
        number: `FV/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${paymentId.slice(0, 6)}`,
        pdfUrl: `https://fakturownia.example/inv/${paymentId}.pdf`,
      }),
    )

    await step.run('persist-invoice', async () => ({ ok: true }))

    await step.run('send-invoice-email', async () => {
      const { subject, html } = renderTemplate({
        name: 'invoice',
        data: {
          recipientName: buyerName ?? null,
          invoiceNumber: invoice.number,
          invoiceDate: new Date(),
          amountPln,
          invoiceUrl: invoice.pdfUrl,
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
      })
    })

    return { invoiceNumber: invoice.number }
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
