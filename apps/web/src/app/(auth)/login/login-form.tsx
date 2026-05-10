'use client'

import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'

import { Alert, Button, Input, Label } from '@mandatomat/ui'

import { loginAction, type AuthState } from '../_actions'

const initial: AuthState = { ok: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Logowanie…' : 'Zaloguj się'}
    </Button>
  )
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(loginAction, initial)

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next ?? ''} />

      {state.error ? (
        <Alert variant="danger" title="Logowanie nieudane">
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
          aria-describedby={state.fields?.['email'] ? 'email-error' : undefined}
        />
        {state.fields?.['email'] ? (
          <p id="email-error" className="text-xs text-signal-600">
            {state.fields['email']}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Hasło</Label>
          <Link
            href="/reset-hasla"
            className="text-xs font-medium text-precision-blue-600 hover:underline"
          >
            Nie pamiętam hasła
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={Boolean(state.fields?.['password'])}
        />
        {state.fields?.['password'] ? (
          <p className="text-xs text-signal-600">{state.fields['password']}</p>
        ) : null}
      </div>

      <SubmitButton />

      <p className="text-center text-xs text-iron-500">
        Klikając „Zaloguj się" akceptujesz{' '}
        <Link href="/regulamin" className="underline hover:text-iron-700">
          Regulamin
        </Link>{' '}
        i{' '}
        <Link href="/polityka-prywatnosci" className="underline hover:text-iron-700">
          Politykę Prywatności
        </Link>
        .
      </p>
    </form>
  )
}
