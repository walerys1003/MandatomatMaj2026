import { redirect } from 'next/navigation'

import { Sidebar } from '@/components/app/sidebar'
import { Topbar } from '@/components/app/topbar'
import { createClient } from '@/lib/supabase/server'

/**
 * Layout chronionego panelu — Sidebar + Topbar + main.
 * Middleware już chroni te ścieżki (PROTECTED_PATHS), ale dla pewności
 * sprawdzamy session tu jeszcze raz (defense in depth).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/panel')
  }

  return (
    <div className="flex min-h-dvh bg-iron-50/30 dark:bg-iron-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-dashboard">{children}</div>
        </main>
      </div>
    </div>
  )
}
