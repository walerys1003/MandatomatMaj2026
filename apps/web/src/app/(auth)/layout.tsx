import Link from 'next/link'

import { Logo } from '@mandatomat/ui'

/**
 * (auth) layout — minimal centered layout dla /login, /rejestracja, /reset-hasla.
 *
 * Bez nawigacji, bez footera — czysty fokus na formularzu.
 * Logo w lewym górnym rogu wraca do landing page.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-iron-50 dark:bg-iron-950">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-600/30">
          <Logo className="text-2xl" />
        </Link>
        <nav className="flex items-center gap-3 text-sm text-iron-600 dark:text-iron-300">
          <Link href="/kontakt" className="hover:text-iron-900 dark:hover:text-iron-50">
            Pomoc
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="px-6 py-6 text-center text-xs text-iron-500">
        © {new Date().getFullYear()} Mandatomat.pl · Bezpieczne logowanie · RODO
      </footer>
    </div>
  )
}
