'use client'

import { useFormState, useFormStatus } from 'react-dom'

import { Alert, Button, Input, Label } from '@mandatomat/ui'

import { confirmResetAction, type AuthState } from '../../_actions'

const initial: AuthState = { ok: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Zmiana hasła…' : 'Ustaw nowe hasło'}
    </Button>
  )
}

export function ConfirmResetForm() {
  const [state, formAction] = useFormState(confirmResetAction, initial)

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <Alert variant="danger" title="Błąd">
          {state.error}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nowe hasło</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          invalid={Boolean(state.fields?.['password'])}
        />
        {state.fields?.['password'] ? (
          <p className="text-xs text-signal-600">{state.fields['password']}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="passwordConfirm">Powtórz nowe hasło</Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          invalid={Boolean(state.fields?.['passwordConfirm'])}
        />
        {state.fields?.['passwordConfirm'] ? (
          <p className="text-xs text-signal-600">{state.fields['passwordConfirm']}</p>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  )
}
