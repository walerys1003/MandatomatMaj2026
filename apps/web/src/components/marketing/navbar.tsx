import Link from 'next/link'

import { Button } from '@mandatomat/ui/button'
import { Logo } from '@mandatomat/ui/logo'

import { createClient } from '@/lib/supabase/server'

/**
 * Marketing navbar — sticky top, 72px height.
 * - Logo po lewej
 * - Nav links środek (desktop)
 * - CTA po prawej (Zaloguj / Zacznij za darmo) lub link do panelu jeśli zalogowany
 *
 * Mobile: hamburger → MobileMenu (osobny komponent klient).
 */

const NAV_LINKS = [
  { href: '/jak-to-dziala', label: 'Jak to działa' },
  { href: '/#kategorie', label: 'Kategorie pism' },
  { href: '/#cennik', label: 'Cennik' },
  { href: '/#faq', label: 'FAQ' },
] as const

export async function Navbar() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-iron-100 bg-white/80 backdrop-blur-md dark:border-iron-800 dark:bg-iron-950/80">
      <div className="mx-auto flex h-[72px] max-w-landing items-center justify-between px-6">
        <Link href="/" className="-mx-2 rounded-md px-2 py-1 transition focus-visible:ring-2 focus-visible:ring-precision-blue-500">
          <Logo variant="full" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Główna nawigacja">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                'highlight' in link && link.highlight
                  ? 'text-sm font-semibold text-precision-blue-600 transition-colors hover:text-precision-blue-700 dark:text-precision-blue-400 dark:hover:text-precision-blue-300'
                  : 'text-sm font-medium text-iron-700 transition-colors hover:text-iron-950 dark:text-iron-300 dark:hover:text-white'
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild variant="primary" size="md">
              <Link href="/panel">Mój panel</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="md" className="hidden sm:inline-flex">
                <Link href="/login">Zaloguj</Link>
              </Button>
              <Button asChild variant="primary" size="md">
                <Link href="/rejestracja">Zacznij za darmo</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
