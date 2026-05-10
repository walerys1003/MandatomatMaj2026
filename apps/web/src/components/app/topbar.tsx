import Link from 'next/link'

import { Button } from '@mandatomat/ui/button'

import { logoutAction } from '@/app/(auth)/_actions'
import { createClient } from '@/lib/supabase/server'

/**
 * Topbar panelu — 64px, breadcrumby + user menu (avatar inicjały + logout).
 * Server Component — pobiera profile z Supabase.
 */
export async function Topbar() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name, email, plan').eq('id', user.id).single()
    : { data: null }

  const name = profile?.full_name ?? user?.email ?? ''
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-iron-100 bg-white/80 px-6 backdrop-blur-md dark:border-iron-800 dark:bg-iron-950/80">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-iron-500">PANEL</span>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="ghost">
          <Link href="/" className="text-iron-600 hover:text-iron-950 dark:text-iron-300">
            ← Strona główna
          </Link>
        </Button>

        <div className="flex items-center gap-3 border-l border-iron-100 pl-3 dark:border-iron-800">
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-iron-950 dark:text-white">{name}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-iron-500">
              {profile?.plan ?? 'free'}
            </p>
          </div>
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full bg-precision-blue-100 font-display text-sm font-bold text-precision-blue-700 dark:bg-precision-blue-900 dark:text-precision-blue-200"
          >
            {initials}
          </span>
          <form action={logoutAction}>
            <Button type="submit" size="sm" variant="ghost">
              Wyloguj
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
