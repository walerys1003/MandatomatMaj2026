import { NextResponse, type NextRequest } from 'next/server'

import { sendEmail } from '@/lib/notifications/email'
import { tplWelcome } from '@/lib/notifications/templates'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth callback endpoint dla Supabase magic link / email verification.
 *
 * Flow:
 * 1. User klika link w mailu → Supabase wysyła go tutaj z `?code=...&next=/panel`
 * 2. Wymieniamy code na session (cookie)
 * 3. Redirect do `next` (default: `/panel`)
 *
 * Używane przez:
 *   - signupAction (emailRedirectTo: `${origin}/api/auth/callback?next=/panel`)
 *   - resetPasswordAction (redirectTo: `${origin}/api/auth/callback?next=/reset-hasla/confirm`)
 *   - magic link login (jeśli włączymy)
 *
 * Edge runtime — szybki, bez cold-start.
 */

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

function safeNext(next: string | null): string {
  // Tylko ścieżki względne (zapobiega open redirect)
  if (!next) return '/panel'
  if (!next.startsWith('/')) return '/panel'
  if (next.startsWith('//')) return '/panel'
  return next
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Supabase zwrócił błąd (np. expired link)
  if (errorParam) {
    const url = new URL('/login', origin)
    url.searchParams.set(
      'error',
      errorDescription ?? 'Link wygasł lub jest nieprawidłowy. Spróbuj ponownie.',
    )
    return NextResponse.redirect(url)
  }

  if (!code) {
    const url = new URL('/login', origin)
    url.searchParams.set('error', 'Brak kodu autoryzacji.')
    return NextResponse.redirect(url)
  }

  const supabase = createClient()
  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const url = new URL('/login', origin)
    url.searchParams.set('error', 'Nie udało się potwierdzić sesji. Spróbuj ponownie.')
    return NextResponse.redirect(url)
  }

  // T4-NOTIF-037: welcome email — best-effort, jednorazowy (per user)
  // Sprawdzamy events czy wysłano już 'user_welcomed' — jeśli nie, wyślij + log.
  const user = sessionData?.user
  if (user?.email) {
    void (async () => {
      try {
        const admin = createAdminClient()
        const { data: existing } = await admin
          .from('events')
          .select('id')
          .eq('user_id', user.id)
          .eq('event_type', 'user_welcomed')
          .limit(1)
          .maybeSingle()
        if (existing) return

        const { data: profile } = await admin
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()

        const tpl = tplWelcome({
          recipientName: (profile as { full_name: string | null } | null)?.full_name ?? null,
          recipientEmail: user.email!,
        })
        await sendEmail({
          to: user.email!,
          subject: tpl.subject,
          html: tpl.html,
          tags: [{ name: 'type', value: 'welcome' }],
        })

        await admin.from('events').insert({
          user_id: user.id,
          case_id: null,
          event_type: 'user_welcomed',
          data: { sent_at: new Date().toISOString() },
        })
      } catch (err) {
        console.warn('[welcome-email] non-fatal:', err)
      }
    })()
  }

  return NextResponse.redirect(new URL(next, origin))
}
