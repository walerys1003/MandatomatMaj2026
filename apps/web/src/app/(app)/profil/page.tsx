import type { Metadata } from 'next'
import Link from 'next/link'

import { Badge } from '@mandatomat/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mandatomat/ui/card'

import { createClient } from '@/lib/supabase/server'

import { ProfileForm } from './profile-form'

export const metadata: Metadata = {
  title: 'Profil',
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, email, full_name, phone, marketing_consent, newsletter_consent, preferred_locale, role, plan, created_at',
    )
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          KONTO
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
          Profil
        </h1>
        <p className="mt-1 text-iron-600 dark:text-iron-300">
          Zarządzaj danymi osobowymi i preferencjami konta.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Dane osobowe</CardTitle>
            <CardDescription>
              Te dane trafią na wygenerowane pisma jako Twój podpis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardDescription>Plan</CardDescription>
              <CardTitle className="font-display text-2xl">{profile?.plan ?? 'free'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="neutral" mono>
                {profile?.role ?? 'user'}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Konto utworzono</CardDescription>
              <CardTitle className="font-mono text-base tabular-nums">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('pl-PL')
                  : '—'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Link
            href="/profil/polecenia"
            className="block rounded-xl border border-precision-blue-200 bg-precision-blue-50/50 p-5 transition hover:border-precision-blue-400 hover:bg-precision-blue-100/50 dark:border-precision-blue-900 dark:bg-precision-blue-950/30 dark:hover:bg-precision-blue-900/40"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-700 dark:text-precision-blue-300">
              Polecaj znajomym
            </p>
            <p className="mt-1 font-display text-base font-bold text-iron-950 dark:text-white">
              Zniżka 20% za polecenie 🎁
            </p>
            <p className="mt-1 text-xs text-iron-600 dark:text-iron-300">
              Zobacz swój kod referral i statystyki →
            </p>
          </Link>
        </aside>
      </div>
    </div>
  )
}
