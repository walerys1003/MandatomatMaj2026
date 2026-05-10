import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/billing/invoices
 *
 * Lista faktur użytkownika — z `payments.invoice_url` + `invoice_id`.
 * Nie woła Fakturowni bezpośrednio (faktury są tworzone w webhooku),
 * tylko zwraca to, co już jest w bazie.
 *
 * Query params:
 *  - limit (default 50, max 100)
 *  - offset (default 0)
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

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 100)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0)

  const { data, error, count } = await supabase
    .from('payments')
    .select(
      'id, case_id, amount, currency, status, payment_type, product_name, product_code, invoice_id, invoice_url, promo_code, discount_percent, created_at',
      { count: 'exact' },
    )
    .eq('user_id', user.id)
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Nie udało się załadować faktur.' }, { status: 500 })
  }

  return NextResponse.json({
    items: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  })
}
