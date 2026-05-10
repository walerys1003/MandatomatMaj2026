import type { Metadata } from 'next'

import { ConfirmResetForm } from './confirm-form'

export const metadata: Metadata = {
  title: 'Ustaw nowe hasło',
  robots: { index: false, follow: false },
}

export default function ConfirmResetPage() {
  return (
    <section className="rounded-xl border border-iron-200 bg-white p-8 shadow-sm dark:border-iron-800 dark:bg-iron-900">
      <div className="mb-6 flex flex-col gap-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-precision-blue-600">
          Reset hasła · krok 2
        </p>
        <h1 className="font-display text-h3 text-iron-900 dark:text-iron-50">Ustaw nowe hasło.</h1>
        <p className="text-sm text-iron-600 dark:text-iron-300">
          Hasło musi mieć minimum 8 znaków.
        </p>
      </div>

      <ConfirmResetForm />
    </section>
  )
}
