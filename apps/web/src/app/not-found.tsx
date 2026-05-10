import Link from 'next/link'

import { Button } from '@mandatomat/ui'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-prose flex-col items-start justify-center gap-6 px-6">
      <p className="font-mono text-sm text-iron-500">404</p>
      <h1 className="font-display text-h2 text-iron-900 dark:text-iron-50">
        Strony nie znaleziono.
      </h1>
      <p className="text-iron-600 dark:text-iron-300">
        Adres mógł zostać zmieniony lub nigdy nie istniał. Wróć na stronę główną
        albo zacznij nowe odwołanie.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="primary">
          <Link href="/">Strona główna</Link>
        </Button>
        <Button asChild variant="secondary-soft">
          <Link href="/kreator">Zacznij odwołanie</Link>
        </Button>
      </div>
    </main>
  )
}
