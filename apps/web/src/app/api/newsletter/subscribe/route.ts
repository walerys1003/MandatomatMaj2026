import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/notifications/email'
import { createAdminClient } from '@/lib/supabase/admin'
import { escapeHtml } from '@/lib/notifications/templates'

/**
 * POST /api/newsletter/subscribe (T6-CMS-032)
 *
 * Double opt-in:
 *  1. User wpisuje email → record insert ze statusem `confirmed_at = NULL`
 *  2. Resend email z linkiem `?token=...&email=...`
 *  3. Klik w link → `/api/newsletter/confirm` ustawia `confirmed_at`
 *
 * RODO: zapisujemy IP + UA do `audit_log` na 7 dni (proof of consent).
 * Rate limit: 3/min per IP (anti-spam).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  email: z.string().email('Nieprawidłowy email').max(254),
  source: z.enum(['footer', 'blog', 'admin', 'landing']).optional(),
})

function generateToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0'
  const ua = req.headers.get('user-agent') ?? null

  const rl = await rateLimit(`newsletter:${ip}`, 'default')
  const headers = rateLimitHeaders(rl)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Zbyt wiele żądań. Spróbuj za chwilę.' },
      { status: 429, headers },
    )
  }

  let body: z.infer<typeof schema>
  try {
    const json = await req.json()
    body = schema.parse(json)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? 'Walidacja' },
        { status: 400, headers },
      )
    }
    return NextResponse.json({ error: 'Nieprawidłowe body' }, { status: 400, headers })
  }

  const admin = createAdminClient()
  const token = generateToken()

  // Upsert by email — jeśli już istnieje, refresh token (re-send confirmation)
  const { data: existing } = await admin
    .from('newsletter_subscribers')
    .select('id, confirmed_at, unsubscribed_at')
    .eq('email', body.email)
    .maybeSingle()

  if (existing) {
    const row = existing as {
      id: string
      confirmed_at: string | null
      unsubscribed_at: string | null
    }
    if (row.confirmed_at && !row.unsubscribed_at) {
      // Już potwierdzony — zwracamy 200 (idempotent UX), bez ujawniania
      return NextResponse.json({ ok: true, alreadySubscribed: true }, { status: 200, headers })
    }
    // Refresh token
    const { error: updErr } = await admin
      .from('newsletter_subscribers')
      .update({
        confirmation_token: token,
        unsubscribed_at: null,
        ip_address: ip,
        user_agent: ua,
        source: body.source ?? 'unknown',
      })
      .eq('id', row.id)
    if (updErr) {
      return NextResponse.json(
        { error: 'Błąd zapisu. Spróbuj ponownie.' },
        { status: 500, headers },
      )
    }
  } else {
    const { error: insErr } = await admin.from('newsletter_subscribers').insert({
      email: body.email,
      confirmation_token: token,
      source: body.source ?? 'unknown',
      ip_address: ip,
      user_agent: ua,
    })
    if (insErr) {
      return NextResponse.json(
        { error: 'Błąd zapisu. Spróbuj ponownie.' },
        { status: 500, headers },
      )
    }
  }

  // Send confirmation email
  const origin = req.nextUrl.origin || 'https://mandatomat.pl'
  const confirmUrl = `${origin}/api/newsletter/confirm?token=${token}&email=${encodeURIComponent(body.email)}`

  try {
    await sendEmail({
      to: body.email,
      subject: 'Potwierdź subskrypcję newslettera Mandatomat',
      html: `<!DOCTYPE html><html lang="pl"><body style="font-family:-apple-system,sans-serif;color:#111827;background:#f9fafb;padding:32px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;">
<tr><td style="padding:32px;">
<h1 style="margin:0 0 16px;font-size:22px;">Potwierdź subskrypcję</h1>
<p style="line-height:1.6;margin:0 0 24px;">Cześć! Ktoś (mam nadzieję, że Ty) zapisał ten adres email do newslettera Mandatomat.</p>
<p style="line-height:1.6;margin:0 0 24px;">Kliknij poniżej aby potwierdzić zapis i otrzymać pierwsze wydanie w sobotę:</p>
<p style="margin:24px 0;"><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Potwierdzam subskrypcję</a></p>
<p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">Jeśli to nie Ty — zignoruj ten email. Bez kliknięcia nic się nie wydarzy.</p>
</td></tr></table></body></html>`,
      tags: [
        { name: 'category', value: 'newsletter' },
        { name: 'type', value: 'double_opt_in' },
      ],
      idempotencyKey: `newsletter:confirm:${body.email}:${token.slice(0, 12)}`,
    })
  } catch {
    // Email send fail — nie blokujemy UX, user może spróbować jeszcze raz
  }

  return NextResponse.json({ ok: true, requiresConfirmation: true }, { status: 200, headers })
}
