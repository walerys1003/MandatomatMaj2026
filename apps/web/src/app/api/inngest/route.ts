/**
 * Inngest webhook endpoint — odbiera eventy + cron triggers.
 *
 * Lokalnie: `npx inngest-cli dev` → automatycznie pinguje http://localhost:3000/api/inngest
 * Produkcja: zarejestruj URL w Inngest Cloud (https://app.inngest.com)
 */

import { serve } from 'inngest/next'

import { inngest } from '@/lib/inngest/client'
import { inngestFunctions } from '@/lib/inngest/functions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
  // Signing key z env (production) — dev mode podpisuje przez Inngest Dev Server
  ...(process.env.INNGEST_SIGNING_KEY
    ? { signingKey: process.env.INNGEST_SIGNING_KEY }
    : {}),
})
