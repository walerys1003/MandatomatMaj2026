'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'

import { Alert, Button, Checkbox, Input, Label } from '@mandatomat/ui'

import { signupAction, type AuthState } from '../_actions'

const initial: AuthState = { ok: false }

const REFERRAL_CODE_RE = /^MND-[A-F0-9]{8}$/i

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Tworzenie konta…' : 'Załóż konto'}
    </Button>
  )
}

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, initial)
  const searchParams = useSearchParams()
  const [referralCode, setReferralCode] = useState<string>('')

  useEffect(() => {
    const ref = searchParams?.get('ref') ?? ''
    if (ref && REFERRAL_CODE_RE.test(ref.trim())) {
      const normalized = ref.trim().toUpperCase()
      setReferralCode(normalized)
      // Persist na wypadek, gdyby user kliknął email-confirm i wrócił na inny URL.
      // /witaj odczyta to ciasteczko i zawoła /api/referral/redeem.
      try {
        document.cookie = `mnd_ref=${encodeURIComponent(normalized)};path=/;max-age=2592000;samesite=lax`
      } catch {
        // ignore — cookies disabled
      }
    }
  }, [searchParams])

  if (state.ok) {
    return (
      <Alert variant="success" title="Sprawdź skrzynkę">
        Wysłaliśmy link aktywacyjny na podany adres. Kliknij go, aby dokończyć rejestrację.
        <br />
        <span className="text-xs text-iron-500">
          Link wygasa po 1 godzinie. Nic nie przyszło? Sprawdź folder spam lub{' '}
          <Link href="/reset-hasla" className="underline">
            wyślij ponownie
          </Link>
          .
        </span>
      </Alert>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <Alert variant="danger" title="Rejestracja nieudana">
          {state.error}
        </Alert>
      ) : null}

      {referralCode ? (
        <Alert variant="success" title="Zaproszenie aktywne">
          Kod polecenia <strong className="font-mono">{referralCode}</strong> został wykryty. Po
          pierwszym zakupie otrzymasz <strong>20% zniżki</strong>.
        </Alert>
      ) : null}

      <input type="hidden" name="referralCode" value={referralCode} />

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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          invalid={Boolean(state.fields?.['password'])}
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="text-xs text-iron-500">
          Min. 8 znaków. Zalecamy frazę z liczbą i znakiem specjalnym.
        </p>
        {state.fields?.['password'] ? (
          <p className="text-xs text-signal-600">{state.fields['password']}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <label className="flex items-start gap-3 text-sm text-iron-700 dark:text-iron-200">
          <Checkbox
            name="acceptTerms"
            required
            invalid={Boolean(state.fields?.['acceptTerms'])}
            className="mt-0.5"
          />
          <span>
            Akceptuję{' '}
            <Link href="/regulamin" className="text-precision-blue-600 underline" target="_blank">
              Regulamin
            </Link>{' '}
            oraz{' '}
            <Link
              href="/polityka-prywatnosci"
              className="text-precision-blue-600 underline"
              target="_blank"
            >
              Politykę Prywatności
            </Link>
            . <span className="text-iron-500">(wymagane)</span>
          </span>
        </label>
        {state.fields?.['acceptTerms'] ? (
          <p className="text-xs text-signal-600">{state.fields['acceptTerms']}</p>
        ) : null}

        <label className="flex items-start gap-3 text-sm text-iron-700 dark:text-iron-200">
          <Checkbox name="newsletter" className="mt-0.5" />
          <span>
            Chcę otrzymywać porady prawne i informacje o nowych funkcjach.{' '}
            <span className="text-iron-500">
              (opcjonalne, można wypisać się w dowolnym momencie)
            </span>
          </span>
        </label>
      </div>

      <SubmitButton />
    </form>
  )
}
