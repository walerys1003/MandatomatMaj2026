import Link from 'next/link'

import { Button } from '@mandatomat/ui'

export default function AdminUserNotFound() {
  return (
    <div className="space-y-4">
      <header className="border-l-4 border-iron-400 pl-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-iron-600">
          404 — admin/uzytkownicy
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.02em] text-iron-950 dark:text-white">
          Użytkownik nie istnieje
        </h1>
        <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
          Brak profilu o podanym ID. Mógł zostać usunięty (RODO).
        </p>
      </header>
      <Button asChild variant="primary">
        <Link href="/admin/uzytkownicy">← Wróć do listy użytkowników</Link>
      </Button>
    </div>
  )
}
