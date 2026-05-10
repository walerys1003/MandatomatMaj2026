'use client'

import { useFormStatus } from 'react-dom'

import { Button } from '@mandatomat/ui'

import { completeOnboardingAction } from '../_actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" variant="secondary-soft" disabled={pending}>
      {pending ? 'Zapisywanie…' : 'Pomiń — zacznij od pulpitu'}
    </Button>
  )
}

/**
 * Przycisk "Pomiń — zacznij od pulpitu".
 *
 * Form-based żeby skorzystać z server action `completeOnboardingAction`
 * (z domyślnym next=panel). Wybór kategorii (Linki w grid) NIE woła tej
 * akcji — onboarding zostaje "completed" przez efekt zapisanej `last_login`
 * lub przy następnej wizycie na /witaj (gdzie redirect zwraca do /panel,
 * jeśli już jest completed). Aby utrzymać czysty model, klik kategorii
 * wywołuje fetch w tle do API completion — patrz osobny komponent.
 */
export function CompleteOnboardingButton() {
  return (
    <form action={completeOnboardingAction}>
      <input type="hidden" name="next" value="panel" />
      <SubmitButton />
    </form>
  )
}
