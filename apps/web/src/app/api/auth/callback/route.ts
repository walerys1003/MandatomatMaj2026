import { NextResponse, type NextRequest } from 'next/server'

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
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const url = new URL('/login', origin)
    url.searchParams.set('error', 'Nie udało się potwierdzić sesji. Spróbuj ponownie.')
    return NextResponse.redirect(url)
  }

  return NextResponse.redirect(new URL(next, origin))
}
