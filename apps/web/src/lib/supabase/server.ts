import { cookies } from 'next/headers'

import { createServerClient, type CookieOptions } from '@supabase/ssr'

import type { Database } from '@mandatomat/db-types'

/**
 * Supabase client for Server Components / Server Actions / Route Handlers.
 *
 * Anon key + user session from cookies. RLS policies enforce per-user access.
 * NEVER use SERVICE_ROLE here — use `createAdminClient()` (TBD) only in
 * trusted backend pathways (cron, webhooks, admin actions).
 */
export function createClient() {
  const cookieStore = cookies()
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!url || !anonKey) {
    throw new Error(
      'Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // `set` may throw inside Server Components — middleware refreshes session instead.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // Same as above — handled by middleware.
        }
      },
    },
  })
}
