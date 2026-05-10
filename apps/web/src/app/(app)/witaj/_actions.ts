'use server'

import { redirect } from 'next/navigation'

import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Server Actions dla onboardingu.
 *
 * Flow:
 *   /witaj                  → step 1 (powitanie + 3 wartości)
 *   /witaj/profil           → step 2 (uzupełnij imię/telefon/zgody)
 *   /witaj/pierwsza-sprawa  → step 3 (CTA → katalog lub skip)
 *
 * Po zakończeniu (lub skip): `profiles.onboarding_completed = true`
 * + emit event `user_onboarding_completed`.
 *
 * Walidacja Zod, RLS chroni każdy zapis (user może edytować tylko swój wiersz).
 */

export interface OnboardingState {
  ok: boolean
  error?: string
  fields?: Record<string, string>
}

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Min. 2 znaki').max(120, 'Max 120 znaków'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{9,15}$/, 'Nieprawidłowy numer telefonu')
    .optional()
    .or(z.literal('')),
  newsletter_consent: z.string().optional(), // 'on' | undefined
  marketing_consent: z.string().optional(),
})

/**
 * Krok 2: zapis profilu (imię/nazwisko, telefon, zgody).
 * Po sukcesie redirect na /witaj/pierwsza-sprawa.
 */
export async function saveOnboardingProfileAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Wymagane logowanie.' }

  const parsed = profileSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    newsletter_consent: formData.get('newsletter_consent'),
    marketing_consent: formData.get('marketing_consent'),
  })

  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fields[issue.path[0] as string] = issue.message
    }
    return { ok: false, error: 'Sprawdź wprowadzone dane.', fields }
  }

  const phone = parsed.data.phone && parsed.data.phone.length > 0 ? parsed.data.phone : null
  const update = {
    full_name: parsed.data.full_name,
    phone,
    newsletter_consent: parsed.data.newsletter_consent === 'on',
    marketing_consent: parsed.data.marketing_consent === 'on',
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('profiles').update(update).eq('id', user.id)

  if (error) {
    return { ok: false, error: 'Nie udało się zapisać profilu. Spróbuj ponownie.' }
  }

  redirect('/witaj/pierwsza-sprawa')
}

/**
 * Krok 3: oznacz onboarding jako zakończony + emit event.
 *
 * `nextPath` — gdzie przekierować po zakończeniu (default: /panel).
 *  - 'panel'   → /panel
 *  - 'sprawy'  → /sprawy/nowa
 */
export async function completeOnboardingAction(formData: FormData): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?next=/witaj')
  }

  const next = formData.get('next')
  const target =
    typeof next === 'string' && (next === 'sprawy' || next === 'panel') ? next : 'panel'

  // Idempotentnie — update z warunkiem onboarding_completed=false (jeśli już true, nic nie robimy)
  await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user!.id)

  // Best-effort event log (RLS policy pozwala userowi insertować event z user_id=auth.uid())
  await supabase
    .from('events')
    .insert({
      user_id: user!.id,
      event_type: 'user_onboarding_completed',
      properties: { completed_at: new Date().toISOString(), next: target },
    })
    .then(
      () => undefined,
      () => undefined, // ignoruj błąd insertu eventu — nie blokuje flow
    )

  redirect(target === 'sprawy' ? '/sprawy/nowa' : '/panel')
}
