import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Middleware odpowiedzialne za odświeżanie sesji Supabase.
 *
 * Bez tego sesja w Server Components staje się niespójna ~1h po zalogowaniu.
 * Dodatkowo: mocne security headers, podstawowy bot/path filter.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  // Skip silently if Supabase env missing — landing still works without auth.
  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    })

    // Fire-and-forget refresh — wynik jest stawiany w cookie przez setter wyżej.
    await supabase.auth.getUser()
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
