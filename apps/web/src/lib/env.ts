import { z } from 'zod'

/**
 * Runtime env validation.
 *
 * Wszystkie zmienne wymagane w runtime są walidowane Zodem przy starcie.
 * Brakujące wartości — twardy crash z czytelnym komunikatem (lepiej niż undefined w produkcji).
 *
 * Klucze publiczne (`NEXT_PUBLIC_*`) są bezpieczne dla klienta. Pozostałe — server-only.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Supabase (server)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),

  // AI
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),

  // Email / SMS
  RESEND_API_KEY: z.string().optional(),
  SMSAPI_TOKEN: z.string().optional(),

  // Invoicing
  FAKTUROWNIA_API_KEY: z.string().optional(),
  FAKTUROWNIA_DOMAIN: z.string().optional(),

  // Rate limit
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Background jobs
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // Observability
  SENTRY_DSN: z.string().url().optional(),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),

  // Cron
  CRON_SECRET: z.string().min(16).optional(),

  // Crypto
  PESEL_ENCRYPTION_KEY: z.string().min(32).optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
})

function readServer() {
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ Invalid server env:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid server environment variables')
  }
  return parsed.data
}

function readClient() {
  // Webpack inlines `process.env.NEXT_PUBLIC_*` at build-time on the client side,
  // so explicit destructuring is required (not a dynamic key lookup).
  const raw = {
    NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'],
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    NEXT_PUBLIC_SENTRY_DSN: process.env['NEXT_PUBLIC_SENTRY_DSN'],
    NEXT_PUBLIC_POSTHOG_KEY: process.env['NEXT_PUBLIC_POSTHOG_KEY'],
  }
  const parsed = clientSchema.safeParse(raw)
  if (!parsed.success) {
    console.error('❌ Invalid client env:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid client environment variables')
  }
  return parsed.data
}

export const serverEnv = typeof window === 'undefined' ? readServer() : (undefined as never)
export const clientEnv = readClient()
