/**
 * Inngest client — typed event bus dla background jobs.
 *
 * Cele:
 *  - asynchroniczne wysyłanie maili (welcome, payment-success, deadline-Dx)
 *  - generowanie faktur (Fakturownia) po Stripe webhook
 *  - cleanup orphan uploads / starych eval_runs
 *  - cron: deadline scanner (codzienny scan terminów → wysyłka D-5/D-3/D-1/D-0)
 *
 * Nazwa app musi być stabilna — używana przez Inngest Cloud do dedupe.
 */

import { Inngest } from 'inngest'

/**
 * Schemat zdarzeń — typed events. Każde zdarzenie musi spełniać EventPayload-like
 * shape: `{ name: string; data: ...; ts?: number; user?: ... }`.
 */
export type MandatomatEvents = {
  'mandatomat/user.registered': {
    name: 'mandatomat/user.registered'
    data: {
      userId: string
      email: string
      name?: string | null
    }
  }
  'mandatomat/payment.succeeded': {
    name: 'mandatomat/payment.succeeded'
    data: {
      userId: string
      caseId: string
      paymentId: string
      amountPln: number
      stripeSessionId: string
    }
  }
  'mandatomat/document.generated': {
    name: 'mandatomat/document.generated'
    data: {
      userId: string
      caseId: string
      documentType: string
      pageCount?: number
    }
  }
  'mandatomat/deadline.scan': {
    name: 'mandatomat/deadline.scan'
    /** Cron — uruchamiany codziennie o 08:00 Europe/Warsaw */
    data: Record<string, never>
  }
  'mandatomat/uploads.cleanup': {
    name: 'mandatomat/uploads.cleanup'
    /** Cron — uruchamiany co tydzień, czyści orphan uploads (>30d, status=failed) */
    data: Record<string, never>
  }
  'mandatomat/invoice.create': {
    name: 'mandatomat/invoice.create'
    data: {
      userId: string
      paymentId: string
      caseId: string
      amountPln: number
      buyerEmail: string
      buyerName?: string | null
      buyerNip?: string | null
      kind: 'faktura' | 'paragon'
    }
  }
}

export const inngest = new Inngest({
  id: 'mandatomat',
  // Event key z env (production); dev mode (Inngest Dev Server) działa bez klucza
  ...(process.env.INNGEST_EVENT_KEY
    ? { eventKey: process.env.INNGEST_EVENT_KEY }
    : {}),
})
