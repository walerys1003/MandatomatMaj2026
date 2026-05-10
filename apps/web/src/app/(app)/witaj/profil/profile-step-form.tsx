'use client'

import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'

import { Alert, Button, Checkbox, Input, Label } from '@mandatomat/ui'

import { saveOnboardingProfileAction, type OnboardingState } from '../_actions'

const initial: OnboardingState = { ok: false }

interface Props {
  defaultFullName: string
  defaultPhone: string
  defaultNewsletter: boolean
  defaultMarketing: boolean
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Zapisywanie…' : 'Dalej →'}
    </Button>
  )
}

export function ProfileStepForm({
  defaultFullName,
  defaultPhone,
  defaultNewsletter,
  defaultMarketing,
}: Props) {
  const [state, formAction] = useFormState(saveOnboardingProfileAction, initial)

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.error ? (
        <Alert variant="danger" title="Nie udało się zapisać">
          {state.error}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name">Imię i nazwisko</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          defaultValue={defaultFullName}
          placeholder="Jan Kowalski"
          invalid={Boolean(state.fields?.['full_name'])}
        />
        {state.fields?.['full_name'] ? (
          <p className="text-xs text-signal-600">{state.fields['full_name']}</p>
        ) : (
          <p className="text-xs text-iron-500">Trafi do nagłówka generowanych pism.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefon (opcjonalnie)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={defaultPhone}
          placeholder="+48 600 000 000"
          invalid={Boolean(state.fields?.['phone'])}
        />
        {state.fields?.['phone'] ? (
          <p className="text-xs text-signal-600">{state.fields['phone']}</p>
        ) : (
          <p className="text-xs text-iron-500">
            Tylko do przypomnień SMS o terminach. Nie dzwonimy, nie spamujemy.
          </p>
        )}
      </div>

      <div className="space-y-3 border-t border-iron-100 pt-5 dark:border-iron-800">
        <p className="font-mono text-[10px] uppercase tracking-wider text-iron-500">
          Zgody (opcjonalne)
        </p>
        <Checkbox
          name="newsletter_consent"
          defaultChecked={defaultNewsletter}
          label="Newsletter — porady prawne i nowe typy pism (1× w miesiącu)"
        />
        <Checkbox
          name="marketing_consent"
          defaultChecked={defaultMarketing}
          label="Oferty promocyjne i kody zniżkowe (max. 2× w miesiącu)"
        />
      </div>

      <footer className="flex flex-col-reverse items-stretch gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/witaj"
          className="text-sm text-iron-500 underline-offset-4 hover:text-iron-700 hover:underline"
        >
          ← Wstecz
        </Link>
        <SubmitButton />
      </footer>
    </form>
  )
}
