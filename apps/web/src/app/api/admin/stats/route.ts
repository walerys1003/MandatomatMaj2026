import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/stats — agregaty KPI dla panelu admina.
 *
 * Wymaga: rola 'admin' (sprawdzana przez profile.role).
 *
 * Query:
 *  - range: '7d' | '14d' | '30d' | '90d' (default: 30d)
 *  - group: 'day' | 'week' (default: day)
 *
 * Response:
 *  {
 *    range: { from, to, days },
 *    daily: [{ date, new_users, cases_created, cases_paid, revenue_total }],
 *    totals: { new_users, cases_created, cases_paid, revenue_total, scorings, ocr },
 *    by_category: { mandaty: 12, parking: 5, ... },
 *    by_product: { M1: 8, P1: 3, ... },
 *    conversion_rate, aov
 *  }
 *
 * Strategia:
 *  - jeśli daily_stats ma wpisy w zadanym oknie → używamy ich
 *  - fallback: agregujemy on-the-fly z profiles/cases/payments (real-time)
 */

const ALLOWED_RANGES = new Set(['7d', '14d', '30d', '90d'])

type DailyStatsRow = {
  date: string
  new_users: number | null
  active_users: number | null
  cases_created: number | null
  cases_paid: number | null
  cases_by_category: Record<string, number> | null
  cases_by_type: Record<string, number> | null
  revenue_total: number | null
  revenue_by_product: Record<string, number> | null
  average_order_value: number | null
  scorings_completed: number | null
  scoring_to_purchase_rate: number | null
  ocr_processed: number | null
  ocr_success_rate: number | null
  ai_tokens_total: number | null
  ai_cost_total: number | null
}

type CaseRow = {
  category: string | null
  case_type: string | null
  payment_status: string | null
  amount_paid: number | null
  created_at: string
}

type PaymentRow = {
  amount: number
  status: string
  product_code: string | null
  type: string | null
  created_at: string
}

function parseRange(rangeStr: string): number {
  switch (rangeStr) {
    case '7d':
      return 7
    case '14d':
      return 14
    case '90d':
      return 90
    case '30d':
    default:
      return 30
  }
}

function ymd(d: Date): string {
  return d.toISOString().substring(0, 10)
}

function mergeRecord<T extends number>(
  acc: Record<string, T>,
  patch: Record<string, number> | null,
): Record<string, T> {
  if (!patch) return acc
  for (const [k, v] of Object.entries(patch)) {
    acc[k] = ((acc[k] ?? 0) + v) as T
  }
  return acc
}

export async function GET(req: NextRequest) {
  // Auth + admin role check
  const supabase = createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const role = (profile as { role?: string | null } | null)?.role
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const url = new URL(req.url)
  const rangeStr = url.searchParams.get('range') ?? '30d'
  if (!ALLOWED_RANGES.has(rangeStr)) {
    return NextResponse.json({ error: 'Invalid range — allowed: 7d, 14d, 30d, 90d' }, { status: 400 })
  }
  const days = parseRange(rangeStr)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const fromDate = new Date(today)
  fromDate.setDate(fromDate.getDate() - days + 1)
  const fromIso = fromDate.toISOString()
  const toIso = new Date().toISOString()

  const admin = createAdminClient()

  // 1) Spróbuj pobrać daily_stats
  const { data: dsRaw } = await admin
    .from('daily_stats')
    .select(
      'date, new_users, active_users, cases_created, cases_paid, cases_by_category, cases_by_type, revenue_total, revenue_by_product, average_order_value, scorings_completed, scoring_to_purchase_rate, ocr_processed, ocr_success_rate, ai_tokens_total, ai_cost_total',
    )
    .gte('date', ymd(fromDate))
    .lte('date', ymd(today))
    .order('date', { ascending: true })

  const dailyStats = (dsRaw as unknown as DailyStatsRow[] | null) ?? []
  const hasDailyStats = dailyStats.length > 0

  // 2) Buduj mapę wynikową — preferuj daily_stats, uzupełniaj on-the-fly z source tables
  // Rozkład per dzień
  const dayMap = new Map<
    string,
    {
      date: string
      new_users: number
      cases_created: number
      cases_paid: number
      revenue_total: number
    }
  >()

  // Inicjalizuj okno
  for (let i = 0; i < days; i += 1) {
    const d = new Date(fromDate)
    d.setDate(d.getDate() + i)
    const key = ymd(d)
    dayMap.set(key, { date: key, new_users: 0, cases_created: 0, cases_paid: 0, revenue_total: 0 })
  }

  let totals = {
    new_users: 0,
    cases_created: 0,
    cases_paid: 0,
    revenue_total: 0,
    scorings: 0,
    ocr_processed: 0,
    ai_tokens_total: 0,
  }

  const byCategory: Record<string, number> = {}
  const byProduct: Record<string, number> = {}

  if (hasDailyStats) {
    for (const r of dailyStats) {
      const key = r.date
      const slot = dayMap.get(key)
      if (slot) {
        slot.new_users = r.new_users ?? 0
        slot.cases_created = r.cases_created ?? 0
        slot.cases_paid = r.cases_paid ?? 0
        slot.revenue_total = r.revenue_total ?? 0
      }
      totals.new_users += r.new_users ?? 0
      totals.cases_created += r.cases_created ?? 0
      totals.cases_paid += r.cases_paid ?? 0
      totals.revenue_total += r.revenue_total ?? 0
      totals.scorings += r.scorings_completed ?? 0
      totals.ocr_processed += r.ocr_processed ?? 0
      totals.ai_tokens_total += r.ai_tokens_total ?? 0
      mergeRecord(byCategory, r.cases_by_category)
      mergeRecord(byProduct, r.revenue_by_product)
    }
  } else {
    // 3) Fallback — agreguj on-the-fly
    const [usersRes, casesRes, paymentsRes] = await Promise.all([
      admin.from('profiles').select('id, created_at').gte('created_at', fromIso).lte('created_at', toIso),
      admin
        .from('cases')
        .select('category, case_type, payment_status, amount_paid, created_at')
        .gte('created_at', fromIso)
        .lte('created_at', toIso),
      admin
        .from('payments')
        .select('amount, status, product_code, type, created_at')
        .gte('created_at', fromIso)
        .lte('created_at', toIso),
    ])

    const users = (usersRes.data as unknown as { id: string; created_at: string }[] | null) ?? []
    const cases = (casesRes.data as unknown as CaseRow[] | null) ?? []
    const payments = (paymentsRes.data as unknown as PaymentRow[] | null) ?? []

    for (const u of users) {
      const key = u.created_at.substring(0, 10)
      const slot = dayMap.get(key)
      if (slot) slot.new_users += 1
    }
    totals.new_users = users.length

    for (const c of cases) {
      const key = c.created_at.substring(0, 10)
      const slot = dayMap.get(key)
      if (slot) {
        slot.cases_created += 1
        if (c.payment_status === 'paid') slot.cases_paid += 1
      }
      totals.cases_created += 1
      if (c.payment_status === 'paid') totals.cases_paid += 1
      if (c.category) byCategory[c.category] = (byCategory[c.category] ?? 0) + 1
    }

    for (const p of payments) {
      if (p.status !== 'succeeded') continue
      const key = p.created_at.substring(0, 10)
      const slot = dayMap.get(key)
      if (slot) slot.revenue_total += p.amount
      totals.revenue_total += p.amount
      if (p.product_code) byProduct[p.product_code] = (byProduct[p.product_code] ?? 0) + p.amount
    }
  }

  const daily = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  const conversionRate =
    totals.cases_created > 0 ? Math.round((totals.cases_paid / totals.cases_created) * 10000) / 100 : 0
  const aov = totals.cases_paid > 0 ? Math.round(totals.revenue_total / totals.cases_paid) : 0

  return NextResponse.json(
    {
      range: { from: ymd(fromDate), to: ymd(today), days, label: rangeStr },
      source: hasDailyStats ? 'daily_stats' : 'live_aggregation',
      daily,
      totals: {
        new_users: totals.new_users,
        cases_created: totals.cases_created,
        cases_paid: totals.cases_paid,
        revenue_total_grosze: totals.revenue_total,
        revenue_total_pln: Math.round(totals.revenue_total / 100),
        scorings: totals.scorings,
        ocr_processed: totals.ocr_processed,
        ai_tokens_total: totals.ai_tokens_total,
      },
      by_category: byCategory,
      by_product: byProduct,
      conversion_rate: conversionRate,
      average_order_value_grosze: aov,
      average_order_value_pln: aov / 100,
      generated_at: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  )
}
