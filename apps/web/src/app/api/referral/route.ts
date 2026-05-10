import { NextResponse, type NextRequest } from 'next/server'

import { getReferralStats } from '@/lib/payments/referral'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/referral
 *
 * Zwraca dane referral aktualnego usera:
 *   - referralCode (np. "MND-A1B2C3D4")
 *   - signups (ile osób zarejestrowało się z Twoim kodem)
 *   - conversions (ile z nich dokonało płatności)
 *   - shareUrl (gotowy URL do udostępniania)
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const stats = await getReferralStats(user.id)
  if (!stats) {
    return NextResponse.json({ error: 'Brak kodu referral.' }, { status: 404 })
  }

  const origin = req.nextUrl.origin || process.env['NEXT_PUBLIC_APP_URL'] || 'https://mandatomat.pl'
  const shareUrl = `${origin}/rejestracja?ref=${encodeURIComponent(stats.code)}`

  return NextResponse.json({
    referralCode: stats.code,
    signups: stats.signups,
    conversions: stats.conversions,
    shareUrl,
    discountPercent: 20,
  })
}
