'use client'

import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@mandatomat/db-types'

/**
 * Supabase client for Client Components.
 *
 * Uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (inlined at build time).
 * Session is read from / written to browser cookies, kept in sync by middleware.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  )
}
