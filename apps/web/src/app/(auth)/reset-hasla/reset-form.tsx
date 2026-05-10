'use client'

import { useFormState, useFormStatus } from 'react-dom'

import { Alert, Button, Input, Label } from '@mandatomat/ui'

import { resetPasswordAction, type AuthState } from '../_actions'

const initial: AuthState = { ok: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Wysyłanie…' : 'Wyślij link resetu'}
    </Button>
  )
}

export function ResetForm() {
  const [state, formAction] = useFormState(resetPasswordAction, initial)

  if (state.ok) {
    return (
      <Alert variant="success" title="Sprawdź skrzynkę">
        Jeżeli ten adres jest zarejestrowany w Mandatomacie, wysłaliśmy na niego link do resetu
        hasła. Link wygasa po 1 godzinie.
      </Alert>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <Alert variant="danger" title="Błąd">
          {state.error}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={Boolean(state.fields?.['email'])}
        />
        {state.fields?.['email'] ? (
          <p className="text-xs text-signal-600">{state.fields['email']}</p>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  )
}
