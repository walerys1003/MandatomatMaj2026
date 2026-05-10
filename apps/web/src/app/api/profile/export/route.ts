import { NextResponse, type NextRequest } from 'next/server'

import { getIp } from '@/lib/get-ip'
import { rateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/profile/export
 *
 * RODO art. 20 — prawo do przenoszenia danych.
 * Zwraca cały zestaw danych użytkownika w formacie JSON (download).
 *
 * Limity: 10 req/min/IP (auth bucket — to operacja kosztowna i wrażliwa).
 *
 * Zakres:
 *  - profil
 *  - sprawy + dokumenty (metadane, bez plików — pliki są w R2/Storage)
 *  - terminy
 *  - płatności (bez wrażliwych danych Stripe)
 *  - zdarzenia (events) ostatnie 90 dni
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getIp(req)
  const r = await rateLimit(ip, 'auth')
  if (!r.ok) {
    return NextResponse.json({ error: 'Za dużo prób. Spróbuj za chwilę.' }, { status: 429 })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const userId = user.id

  // Wszystkie zapytania równolegle — RLS zapewnia izolację
  const [profile, cases, documents, deadlines, payments, events] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('cases').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('id, case_id, type, status, version, created_at, updated_at')
      .eq('user_id', userId),
    supabase.from('deadlines').select('*').eq('user_id', userId),
    supabase
      .from('payments')
      .select('id, case_id, amount, currency, status, type, created_at')
      .eq('user_id', userId),
    supabase
      .from('events')
      .select('id, type, payload, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }),
  ])

  const exportPayload = {
    meta: {
      exported_at: new Date().toISOString(),
      user_id: userId,
      email: user.email,
      format: 'mandatomat-rodo-export-v1',
      note: 'Zgodnie z art. 20 RODO — eksport danych osobowych. Pliki PDF są dostępne osobno przez Storage.',
    },
    profile: profile.data ?? null,
    cases: cases.data ?? [],
    documents: documents.data ?? [],
    deadlines: deadlines.data ?? [],
    payments: payments.data ?? [],
    events: events.data ?? [],
  }

  const filename = `mandatomat-export-${userId}-${new Date().toISOString().slice(0, 10)}.json`

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
