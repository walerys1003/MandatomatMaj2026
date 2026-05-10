import { NextResponse, type NextRequest } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/newsletter/confirm?token=...&email=...
 *
 * Krok 2 double opt-in (T6-CMS-032). Po klik w email:
 *  - znajduje row po `email` AND `confirmation_token`
 *  - ustawia `confirmed_at = NOW()` i nullifies token
 *  - redirect → /newsletter/potwierdzony
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get('token')?.trim()
  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  const origin = req.nextUrl.origin || 'https://mandatomat.pl'

  if (!token || !email || token.length < 16) {
    return NextResponse.redirect(`${origin}/newsletter/blad?reason=invalid`, 302)
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('newsletter_subscribers')
    .select('id, confirmed_at')
    .eq('email', email)
    .eq('confirmation_token', token)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.redirect(`${origin}/newsletter/blad?reason=not_found`, 302)
  }
  const row = data as { id: string; confirmed_at: string | null }

  if (!row.confirmed_at) {
    await admin
      .from('newsletter_subscribers')
      .update({
        confirmed_at: new Date().toISOString(),
        confirmation_token: null,
      })
      .eq('id', row.id)
  }

  return NextResponse.redirect(`${origin}/newsletter/potwierdzony`, 302)
}
