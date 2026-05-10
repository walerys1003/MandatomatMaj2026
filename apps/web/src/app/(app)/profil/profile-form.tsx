'use client'

import { useState, useTransition } from 'react'

import { Alert } from '@mandatomat/ui/alert'
import { Button } from '@mandatomat/ui/button'
import { Checkbox } from '@mandatomat/ui/checkbox'
import { Input, Label } from '@mandatomat/ui/input'
import { Select } from '@mandatomat/ui/select'

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  marketing_consent: boolean | null
  newsletter_consent: boolean | null
  preferred_locale: string | null
}

interface Props {
  profile: Profile | null
}

/**
 * Formularz profilu — Client Component, wywołuje PATCH /api/profile.
 * useTransition + lokalne state dla error/success message.
 */
export function ProfileForm({ profile }: Props) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!profile) {
    return <p className="text-iron-500">Brak danych profilu.</p>
  }

  function handleSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const body = {
        full_name: formData.get('full_name'),
        phone: formData.get('phone') || '',
        newsletter_consent: formData.get('newsletter_consent') === 'on',
        marketing_consent: formData.get('marketing_consent') === 'on',
        preferred_locale: formData.get('preferred_locale'),
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Błąd zapisu' }))
        setMessage({ type: 'error', text: err.error ?? 'Nie udało się zapisać profilu.' })
        return
      }

      setMessage({ type: 'success', text: 'Profil zaktualizowany.' })
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {message ? (
        <Alert variant={message.type === 'success' ? 'success' : 'danger'}>{message.text}</Alert>
      ) : null}

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" value={profile.email} disabled className="mt-1.5" />
        <p className="mt-1 text-xs text-iron-500">
          E-mail jest stały. Aby zmienić, skontaktuj się z kontakt@mandatomat.pl.
        </p>
      </div>

      <div>
        <Label htmlFor="full_name">Imię i nazwisko</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={profile.full_name ?? ''}
          placeholder="Jan Kowalski"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="phone">Telefon (opcjonalnie)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ''}
          placeholder="+48 600 000 000"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="preferred_locale">Język</Label>
        <Select
          id="preferred_locale"
          name="preferred_locale"
          defaultValue={profile.preferred_locale ?? 'pl'}
          className="mt-1.5"
        >
          <option value="pl">Polski</option>
          <option value="en">English</option>
        </Select>
      </div>

      <div className="space-y-3 border-t border-iron-100 pt-5 dark:border-iron-800">
        <p className="font-mono text-[10px] uppercase tracking-wider text-iron-500">Zgody</p>
        <Checkbox
          name="newsletter_consent"
          label="Newsletter — porady prawne, nowe typy pism (1× w miesiącu)"
          defaultChecked={profile.newsletter_consent ?? false}
        />
        <Checkbox
          name="marketing_consent"
          label="Komunikacja marketingowa partnerska (rzadko, tylko sensowne oferty)"
          defaultChecked={profile.marketing_consent ?? false}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </Button>
      </div>
    </form>
  )
}
