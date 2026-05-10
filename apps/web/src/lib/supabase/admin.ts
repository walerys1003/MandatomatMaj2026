import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@mandatomat/db-types'

import { serverEnv } from '@/lib/env'

/**
 * Supabase admin client (service_role).
 *
 * UWAGA: omija RLS — używać TYLKO w trusted backend pathways:
 *  - Stripe webhook (brak sesji usera)
 *  - CRON jobs
 *  - admin actions z dodatkową weryfikacją role='admin'
 *
 * NIGDY nie używać w Server Component lub Server Action triggered by user input.
 */
export function createAdminClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const serviceKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase admin client missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
