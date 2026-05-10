import { redirect } from 'next/navigation'

import { Logo } from '@mandatomat/ui'

import { createClient } from '@/lib/supabase/server'

/**
 * Layout dla onboardingu — czysty wizard, bez Sidebar/Topbar.
 *
 * UWAGA: ten plik nadpisuje layout (app)/layout.tsx (nested layout).
 * Chroni route przez sprawdzenie auth (defense in depth obok middleware).
 *
 * Jeśli user już ukończył onboarding, redirect do /panel — żeby nie pokazywać
 * onboardingu po raz drugi.
 */
export default async function WitajLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/witaj')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.onboarding_completed === true) {
    redirect('/panel')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-iron-50/30 dark:bg-iron-950">
      <header className="border-b border-iron-200 bg-white/80 backdrop-blur-md dark:border-iron-800 dark:bg-iron-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo />
          <p className="font-mono text-[11px] uppercase tracking-wider text-iron-500">Onboarding</p>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-10 sm:py-16">
        <div className="mx-auto w-full max-w-2xl">{children}</div>
      </main>

      <footer className="border-t border-iron-200 py-6 text-center text-xs text-iron-500 dark:border-iron-800">
        © {new Date().getFullYear()} Mandatomat ·{' '}
        <a href="/regulamin" className="underline hover:text-iron-700">
          Regulamin
        </a>{' '}
        ·{' '}
        <a href="/polityka-prywatnosci" className="underline hover:text-iron-700">
          Prywatność
        </a>
      </footer>
    </div>
  )
}
