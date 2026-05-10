import Link from 'next/link'
import type { Metadata } from 'next'

import { Alert } from '@mandatomat/ui/alert'
import { Button } from '@mandatomat/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mandatomat/ui/card'

import { DeleteAccountForm } from './delete-account-form'

export const metadata: Metadata = {
  title: 'Ustawienia',
}

export const dynamic = 'force-dynamic'

export default function UstawieniaPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          KONTO
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 sm:text-4xl dark:text-white">
          Ustawienia
        </h1>
        <p className="mt-1 text-iron-600 dark:text-iron-300">
          Bezpieczeństwo, prywatność i kontrola nad Twoimi danymi.
        </p>
      </header>

      {/* Hasło */}
      <Card>
        <CardHeader>
          <CardTitle>Hasło</CardTitle>
          <CardDescription>Zmiana hasła odbywa się przez link resetujący na e-mail.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="md" variant="secondary-soft">
            <Link href="/reset-hasla">Zmień hasło →</Link>
          </Button>
        </CardContent>
      </Card>

      {/* RODO export */}
      <Card>
        <CardHeader>
          <CardTitle>Eksport danych (RODO art. 20)</CardTitle>
          <CardDescription>
            Pobierz wszystkie swoje dane w formacie JSON — sprawy, dokumenty, terminy, profil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="md" variant="secondary-soft">
            <a href="/api/profile/export" download>
              Pobierz dane (JSON) ↓
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Usunięcie konta */}
      <Card id="usun-konto" className="border-signal-200 dark:border-signal-900">
        <CardHeader>
          <CardTitle className="text-signal-700 dark:text-signal-400">
            Usunięcie konta (RODO art. 17)
          </CardTitle>
          <CardDescription>
            Twoje konto i dane osobowe zostaną zanonimizowane natychmiast. Faktury VAT zachowamy 5
            lat zgodnie z obowiązkiem prawnym.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="warning" className="mb-4">
            Ta operacja jest nieodwracalna. Po usunięciu konta nie odzyskasz dostępu do swoich
            spraw.
          </Alert>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  )
}
