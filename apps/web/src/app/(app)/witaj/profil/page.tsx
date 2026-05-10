import type { Metadata } from 'next'

import { Stepper } from '@mandatomat/ui'

import { createClient } from '@/lib/supabase/server'

import { ProfileStepForm } from './profile-step-form'

export const metadata: Metadata = {
  title: 'Onboarding — uzupełnij profil',
  description: 'Krok 2 z 3 — imię, telefon, zgody marketingowe.',
  robots: { index: false, follow: false },
}

const STEPS = [
  { id: '1', label: 'Powitanie' },
  { id: '2', label: 'Profil' },
  { id: '3', label: 'Pierwsza sprawa' },
]

/**
 * Krok 2/3 — uzupełnienie podstawowych danych profilu.
 *
 * Pobieramy aktualne dane z `profiles` jako defaultValue, żeby user nie musiał
 * wpisywać od zera (jeśli wrócił do tego kroku z step 3).
 */
export default async function WitajProfilPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Layout zapewnia że user istnieje, ale TS nie wie tego — fallback do null
  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name, phone, newsletter_consent, marketing_consent')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  return (
    <div className="space-y-10">
      <Stepper steps={STEPS} currentIndex={1} completedThrough={0} />

      <header className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          Krok 2 z 3
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white sm:text-4xl">
          Uzupełnij swój profil
        </h1>
        <p className="text-base text-iron-600 dark:text-iron-300">
          Imię i nazwisko trafią do generowanych pism (np. „
          <em>Jan Kowalski wnosi o uchylenie mandatu…</em>"). Telefon używamy tylko do przypomnień o
          terminach (SMS, opcjonalnie). Możesz pominąć — uzupełnisz później w Profilu.
        </p>
      </header>

      <ProfileStepForm
        defaultFullName={profile?.full_name ?? ''}
        defaultPhone={profile?.phone ?? ''}
        defaultNewsletter={Boolean(profile?.newsletter_consent)}
        defaultMarketing={Boolean(profile?.marketing_consent)}
      />
    </div>
  )
}
