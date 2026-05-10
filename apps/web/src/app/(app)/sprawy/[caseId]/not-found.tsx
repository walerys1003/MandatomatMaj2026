import Link from 'next/link'

import { Button } from '@mandatomat/ui'

/**
 * 404 dla /sprawy/[caseId] — wywoływane przez `notFound()` gdy:
 *  - brak rekordu dla danego caseId (RLS odfiltrował, bo to nie sprawa usera),
 *  - nieprawidłowy UUID,
 *  - sprawa została usunięta.
 */
export default function CaseNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-iron-100 text-3xl text-iron-700 dark:bg-iron-800 dark:text-iron-200">
        🔍
      </div>
      <div className="space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-wider text-iron-600 dark:text-iron-400">
          404 — sprawa nieznaleziona
        </p>
        <h1 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-iron-950 dark:text-white sm:text-3xl">
          Nie znaleźliśmy tej sprawy
        </h1>
        <p className="mx-auto max-w-md text-sm text-iron-600 dark:text-iron-300">
          Sprawa mogła zostać usunięta lub link jest nieprawidłowy. Sprawdź listę swoich spraw albo
          utwórz nową.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button asChild variant="primary">
          <Link href="/sprawy">Moje sprawy</Link>
        </Button>
        <Button asChild variant="secondary-soft">
          <Link href="/sprawy/nowa">Nowa sprawa</Link>
        </Button>
      </div>
    </div>
  )
}
