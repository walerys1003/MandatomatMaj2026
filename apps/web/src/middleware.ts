import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Middleware — refresh sesji Supabase + protected paths + admin guard.
 *
 * Source: T08_backend_middleware_claude + plan T2-BE-002.
 *
 * Ścieżki:
 *   PROTECTED_PATHS — wymagają zalogowania → redirect do /login z `?next=`
 *   ADMIN_PATHS     — wymagają roli admin (kontrola w server component)
 *   AUTH_PATHS      — jeśli zalogowany → redirect do /panel
 */

const PROTECTED_PATHS = ['/panel', '/sprawy', '/profil', '/ustawienia', '/kreator']
const AUTH_PATHS = ['/login', '/rejestracja']
const PUBLIC_API_PREFIXES = ['/api/health']

function pathMatches(path: string, prefixes: ReadonlyArray<string>): boolean {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  let response = NextResponse.next({ request: { headers: request.headers } })

  // Skip public API
  if (pathMatches(pathname, PUBLIC_API_PREFIXES)) return response

  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
  if (!url || !anonKey) return response

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get: (name) => request.cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value, ...options })
      },
      remove: (name: string, options: CookieOptions) => {
        request.cookies.set({ name, value: '', ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected paths bez sesji → redirect
  if (!user && pathMatches(pathname, PROTECTED_PATHS)) {
    const next = encodeURIComponent(pathname + search)
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url))
  }

  // Auth paths z sesją → redirect na panel
  if (user && pathMatches(pathname, AUTH_PATHS)) {
    return NextResponse.redirect(new URL('/panel', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
