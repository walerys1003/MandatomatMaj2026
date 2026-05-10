import Link from 'next/link'
import type { Metadata } from 'next'

import { MetricsGrid, type MetricItem } from '@mandatomat/ui'

import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin · Dashboard',
}

/**
 * /admin/dashboard — KPI MVP.
 *
 * KPI: MRR, nowi użytkownicy (today/week/month), sprawy dziś, conversion.
 * Wykorzystuje admin client (service_role bypass RLS).
 */
export default async function AdminDashboardPage() {
  const admin = createAdminClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)

  const [usersTodayRes, usersWeekRes, usersMonthRes, casesTodayRes, paymentsRes, casesPaidRes] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString()),
    admin.from('cases').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    admin
      .from('payments')
      .select('amount, status')
      .eq('status', 'succeeded')
      .gte('created_at', monthAgo.toISOString()),
    admin
      .from('cases')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gte('created_at', monthAgo.toISOString()),
  ])

  const usersToday = usersTodayRes.count ?? 0
  const usersWeek = usersWeekRes.count ?? 0
  const usersMonth = usersMonthRes.count ?? 0
  const casesToday = casesTodayRes.count ?? 0
  const casesPaidMonth = casesPaidRes.count ?? 0

  const payments = (paymentsRes.data ?? []) as { amount: number; status: string }[]
  const mrrGrosze = payments.reduce((sum, p) => sum + p.amount, 0)
  const mrrPln = mrrGrosze / 100
  const aov = payments.length > 0 ? mrrGrosze / payments.length : 0

  // conversion = cases_paid / cases_created (last 30 days)
  const { count: casesCreatedMonth } = await admin
    .from('cases')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', monthAgo.toISOString())
  const conversion = (casesCreatedMonth ?? 0) > 0 ? Math.round((casesPaidMonth / (casesCreatedMonth ?? 1)) * 100) : 0

  const metrics: MetricItem[] = [
    { label: 'MRR (30 dni)', value: `${mrrPln.toFixed(0)} zł`, variant: 'hero', icon: '💰', trend: `${payments.length} płatności` },
    { label: 'Nowi użytkownicy (30d)', value: usersMonth, variant: 'success', icon: '👥', trend: `${usersWeek} w tym tygodniu, ${usersToday} dziś` },
    { label: 'Sprawy dziś', value: casesToday, variant: 'neutral', icon: '📋' },
    { label: 'Conversion (30d)', value: `${conversion}%`, variant: conversion >= 30 ? 'success' : 'warning', icon: '📈', trend: `${casesPaidMonth}/${casesCreatedMonth ?? 0}` },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-iron-900 dark:text-iron-50">Admin · Dashboard</h1>
        <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
          Ostatnia aktualizacja: {new Date().toLocaleString('pl-PL')}
        </p>
      </header>

      <MetricsGrid items={metrics} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
          <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">Średnia wartość zamówienia</h2>
          <p className="mt-2 text-3xl font-bold tabular-nums text-brand-700 dark:text-brand-300">
            {(aov / 100).toFixed(2).replace('.', ',')} zł
          </p>
          <p className="mt-1 text-xs text-iron-500 dark:text-iron-400">AOV — average order value (30 dni)</p>
        </div>

        <div className="rounded-lg border border-iron-200 bg-white p-6 dark:border-iron-700 dark:bg-iron-900">
          <h2 className="text-base font-semibold text-iron-900 dark:text-iron-50">Skróty</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/admin/uzytkownicy" className="rounded-md border border-iron-200 bg-iron-50 px-3 py-2 text-sm hover:bg-iron-100 dark:border-iron-700 dark:bg-iron-800 dark:hover:bg-iron-700">👥 Użytkownicy</Link>
            <Link href="/admin/sprawy" className="rounded-md border border-iron-200 bg-iron-50 px-3 py-2 text-sm hover:bg-iron-100 dark:border-iron-700 dark:bg-iron-800 dark:hover:bg-iron-700">📋 Sprawy</Link>
            <Link href="/admin/platnosci" className="rounded-md border border-iron-200 bg-iron-50 px-3 py-2 text-sm hover:bg-iron-100 dark:border-iron-700 dark:bg-iron-800 dark:hover:bg-iron-700">💳 Płatności</Link>
            <Link href="/admin/prompty" className="rounded-md border border-iron-200 bg-iron-50 px-3 py-2 text-sm hover:bg-iron-100 dark:border-iron-700 dark:bg-iron-800 dark:hover:bg-iron-700">🤖 Prompty</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
