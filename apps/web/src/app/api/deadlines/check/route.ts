import { NextResponse, type NextRequest } from 'next/server'

import { serverEnv } from '@/lib/env'
import { sendEmail } from '@/lib/notifications/email'
import {
  tplDeadlineD0,
  tplDeadlineD1,
  tplDeadlineD3,
  tplDeadlineD5,
} from '@/lib/notifications/templates'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/deadlines/check
 *
 * CRON endpoint — Vercel Cron co godzinę.
 * Bearer auth: header `Authorization: Bearer <CRON_SECRET>`.
 *
 * Pipeline:
 *  1. Załaduj wszystkie deadlines.status='active' WHERE deadline_date - today IN (5,3,1,0)
 *  2. Dla każdego dispatch tpl D-5/D-3/D-1/D-0 (zależnie od dni)
 *  3. Insert reminders_log + UPDATE deadlines.status = 'reminded_d{n}'
 *  4. Po D-0 → status='expired' (jeśli nie completed)
 *
 * Idempotency: nie wysyłamy ponownie, jeśli reminders_log już ma wpis dla danego (deadline_id, days_before).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface DeadlineRow {
  id: string
  user_id: string
  case_id: string
  title: string
  deadline_date: string
  status: string
  remind_days: number[] | null
  legal_basis: string | null
}

interface ProfileRow {
  email: string | null
  full_name: string | null
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Auth
  const authHeader = req.headers.get('authorization') ?? ''
  const expected = serverEnv.CRON_SECRET
  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString().slice(0, 10)

  // Compute target dates: today + 5, +3, +1, +0
  const targets = [5, 3, 1, 0].map((d) => {
    const dt = new Date(today)
    dt.setDate(dt.getDate() + d)
    return { days: d, iso: dt.toISOString().slice(0, 10) }
  })

  let totalChecked = 0
  let totalSent = 0
  const failures: Array<{ deadlineId: string; error: string }> = []

  for (const target of targets) {
    const { data: rows, error } = await admin
      .from('deadlines')
      .select('id, user_id, case_id, title, deadline_date, status, remind_days, legal_basis')
      .eq('status', 'active')
      .eq('deadline_date', target.iso)
      .limit(500)

    if (error) {
      failures.push({ deadlineId: '*', error: error.message })
      continue
    }

    const deadlines = (rows ?? []) as DeadlineRow[]
    totalChecked += deadlines.length

    for (const d of deadlines) {
      // Sprawdź czy days_before w remind_days
      const remindDays = d.remind_days ?? [5, 3, 1, 0]
      if (!remindDays.includes(target.days)) continue

      // Sprawdź idempotency — czy już wysłano dla (deadline_id, days_before)
      const { data: existing } = await admin
        .from('reminders_log')
        .select('id')
        .eq('deadline_id', d.id)
        .eq('days_before', target.days)
        .eq('channel', 'email')
        .limit(1)
        .maybeSingle()
      if (existing) continue

      // Pobierz profil (email) — nie używamy joinów dla prostoty
      const { data: profile } = await admin
        .from('profiles')
        .select('email, full_name')
        .eq('id', d.user_id)
        .maybeSingle()
      const p = profile as ProfileRow | null
      if (!p?.email) {
        failures.push({ deadlineId: d.id, error: 'Brak email użytkownika' })
        continue
      }

      // Wybierz template
      const tplData = {
        recipientName: p.full_name,
        caseTitle: d.title,
        caseId: d.case_id,
        deadlineDate: new Date(d.deadline_date),
        legalBasis: d.legal_basis,
      }

      let tpl: { subject: string; html: string }
      if (target.days === 5) tpl = tplDeadlineD5(tplData)
      else if (target.days === 3) tpl = tplDeadlineD3(tplData)
      else if (target.days === 1) tpl = tplDeadlineD1(tplData)
      else tpl = tplDeadlineD0(tplData)

      // Wyślij
      try {
        await sendEmail({
          to: p.email,
          subject: tpl.subject,
          html: tpl.html,
          tags: [
            { name: 'type', value: 'deadline_reminder' },
            { name: 'days_before', value: String(target.days) },
          ],
        })

        // Insert log
        await admin.from('reminders_log').insert({
          deadline_id: d.id,
          user_id: d.user_id,
          channel: 'email',
          days_before: target.days,
          status: 'sent',
        })

        // Update deadline status
        const newStatus =
          target.days === 5 ? 'reminded_d5'
            : target.days === 3 ? 'reminded_d3'
              : target.days === 1 ? 'reminded_d1'
                : 'reminded_d0'
        await admin.from('deadlines').update({ status: newStatus }).eq('id', d.id)

        // Telemetry
        await admin.from('events').insert({
          user_id: d.user_id,
          case_id: d.case_id,
          event_type: 'deadline_reminded',
          data: { deadline_id: d.id, days_before: target.days, channel: 'email' },
        })

        totalSent++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        failures.push({ deadlineId: d.id, error: msg })
        await admin.from('reminders_log').insert({
          deadline_id: d.id,
          user_id: d.user_id,
          channel: 'email',
          days_before: target.days,
          status: 'failed',
          error: msg,
        })
      }
    }
  }

  // Mark expired — deadline_date < today AND status != completed
  await admin
    .from('deadlines')
    .update({ status: 'expired' })
    .lt('deadline_date', todayIso)
    .in('status', ['active', 'reminded_d5', 'reminded_d3', 'reminded_d1', 'reminded_d0'])

  return NextResponse.json({
    ok: true,
    totalChecked,
    totalSent,
    failuresCount: failures.length,
    failures: failures.slice(0, 20),
    timestamp: new Date().toISOString(),
  })
}
