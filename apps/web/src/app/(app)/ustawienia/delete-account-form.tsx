'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Alert } from '@mandatomat/ui/alert'
import { Button } from '@mandatomat/ui/button'
import { Input, Label } from '@mandatomat/ui/input'

/**
 * Formularz usunięcia konta — wymaga wpisania "USUWAM" jako potwierdzenia.
 * Wywołuje POST /api/profile/delete, po sukcesie redirect na /.
 */
export function DeleteAccountForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (confirm !== 'USUWAM') {
      setError('Wpisz USUWAM (wielkimi literami) aby potwierdzić.')
      return
    }

    startTransition(async () => {
      const res = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'USUWAM' }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Nie udało się usunąć konta.' }))
        setError(err.error ?? 'Nie udało się usunąć konta.')
        return
      }

      // Sukces — sesja już wyczyszczona po stronie servera, przekierowanie.
      router.push('/?deleted=1')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div>
        <Label htmlFor="confirm">
          Wpisz <code className="font-mono font-bold text-signal-600">USUWAM</code> aby potwierdzić
        </Label>
        <Input
          id="confirm"
          name="confirm"
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="USUWAM"
          autoComplete="off"
          className="mt-1.5"
        />
      </div>

      <Button
        type="submit"
        variant="danger"
        size="md"
        disabled={pending || confirm !== 'USUWAM'}
      >
        {pending ? 'Usuwanie konta…' : 'Usuń moje konto na zawsze'}
      </Button>
    </form>
  )
}
