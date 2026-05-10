import Link from 'next/link'

import { Button } from '@mandatomat/ui'

export default function AdminCaseNotFound() {
  return (
    <div className="space-y-4">
      <header className="border-l-4 border-iron-400 pl-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-iron-600">
          404 — admin/sprawy
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.02em] text-iron-950 dark:text-white">
          Sprawa nie istnieje
        </h1>
        <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
          Brak rekordu o podanym ID. Mogła zostać usunięta lub ID jest nieprawidłowe.
        </p>
      </header>
      <Button asChild variant="primary">
        <Link href="/admin/sprawy">← Wróć do listy spraw</Link>
      </Button>
    </div>
  )
}
