import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@mandatomat/db-types'

/**
 * Server-only Supabase client z service_role key.
 *
 * !!! NIGDY nie eksportuj tego do Client Components.
 * Używaj wyłącznie w:
 *  - Route Handlers (`app/api/.../route.ts`)
 *  - Server Actions
 *  - Cron jobs / webhooks (Stripe, Inngest)
 *  - Admin actions chronionych middleware
 *
 * RLS jest omijany — sprawdzaj uprawnienia ręcznie przed każdym query.
 */
export function createAdminClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

  if (!url || !serviceKey) {
    throw new Error(
      'Admin Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: { 'x-client-info': 'mandatomat-admin' },
    },
  })
}
