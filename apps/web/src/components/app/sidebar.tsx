'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Logo } from '@mandatomat/ui/logo'
import { cn } from '@mandatomat/ui/cn'

/**
 * Sidebar dla zalogowanych — sticky lewy panel 240px.
 * Sekcje: Główne / Konto. Aktywny link: blue-600 lewy bordur + bg blue-50.
 */

const NAV_MAIN = [
  { href: '/panel', label: 'Pulpit', icon: '🏠' },
  { href: '/sprawy', label: 'Moje sprawy', icon: '📋' },
  { href: '/kreator', label: 'Nowe pismo', icon: '✏️' },
  { href: '/terminy', label: 'Terminy', icon: '📅' },
  { href: '/dokumenty', label: 'Dokumenty', icon: '📁' },
] as const

const NAV_ACCOUNT = [
  { href: '/profil', label: 'Profil', icon: '👤' },
  { href: '/ustawienia', label: 'Ustawienia', icon: '⚙️' },
  { href: '/platnosci', label: 'Płatności', icon: '💳' },
] as const

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/panel' && pathname?.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
        isActive
          ? 'bg-precision-blue-50 text-precision-blue-700 dark:bg-precision-blue-950 dark:text-precision-blue-300'
          : 'text-iron-700 hover:bg-iron-100 hover:text-iron-950 dark:text-iron-300 dark:hover:bg-iron-800 dark:hover:text-white',
      )}
    >
      <span aria-hidden className="text-base">
        {icon}
      </span>
      {label}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 flex-shrink-0 flex-col border-r border-iron-100 bg-white px-4 py-6 dark:border-iron-800 dark:bg-iron-950 lg:flex">
      <Link href="/panel" className="mb-8 px-3">
        <Logo variant="full" />
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Główna nawigacja panelu">
        <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-wider text-iron-500">
          Główne
        </p>
        {NAV_MAIN.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        <p className="mb-2 mt-6 px-3 font-mono text-[10px] uppercase tracking-wider text-iron-500">
          Konto
        </p>
        {NAV_ACCOUNT.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="mt-6 rounded-lg border border-iron-100 bg-iron-50 p-3 text-xs dark:border-iron-800 dark:bg-iron-900">
        <p className="font-mono text-[10px] uppercase tracking-wider text-iron-500">Plan</p>
        <p className="mt-1 font-semibold text-iron-950 dark:text-white">Free</p>
        <Link
          href="/cennik"
          className="mt-2 inline-block text-precision-blue-600 hover:underline dark:text-precision-blue-400"
        >
          Upgrade →
        </Link>
      </div>
    </aside>
  )
}
