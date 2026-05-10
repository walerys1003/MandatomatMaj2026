import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

/**
 * (admin)/layout.tsx — admin panel shell.
 *
 * Gating:
 *  - server-side check `profiles.role === 'admin'`
 *  - non-admin → redirect /panel
 *
 * Layout: sidebar 240px + main area.
 */

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/uzytkownicy', label: 'Użytkownicy', icon: '👥' },
  { href: '/admin/sprawy', label: 'Sprawy', icon: '📋' },
  { href: '/admin/platnosci', label: 'Płatności', icon: '💳' },
  { href: '/admin/szablony', label: 'Szablony', icon: '🧩' },
  { href: '/admin/prompty', label: 'Prompty', icon: '🤖' },
] as const

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile as { role?: string | null } | null)?.role
  if (role !== 'admin') {
    redirect('/panel')
  }

  return (
    <div className="flex min-h-dvh bg-iron-50/30 dark:bg-iron-950">
      <aside className="sticky top-0 hidden h-dvh w-60 flex-shrink-0 flex-col border-r border-iron-100 bg-white px-4 py-6 dark:border-iron-800 dark:bg-iron-950 lg:flex">
        <Link href="/admin/dashboard" className="mb-1 px-3 text-sm font-bold text-iron-900 dark:text-iron-50">
          🛠 Admin · Mandatomat
        </Link>
        <p className="mb-6 px-3 text-xs text-iron-500 dark:text-iron-400">
          {(profile as { full_name?: string; email?: string } | null)?.full_name ?? user.email}
        </p>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-iron-700 hover:bg-iron-100 hover:text-iron-950 dark:text-iron-300 dark:hover:bg-iron-800 dark:hover:text-white"
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-iron-100 pt-4 text-xs dark:border-iron-800">
          <Link href="/panel" className="text-brand-600 hover:underline dark:text-brand-400">
            ← Wróć do panelu B2C
          </Link>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
