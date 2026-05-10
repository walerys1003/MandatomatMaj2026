import type { Metadata } from 'next'
import Link from 'next/link'

import { ResetForm } from './reset-form'

export const metadata: Metadata = {
  title: 'Reset hasła',
  description: 'Wyślemy link do resetu hasła na podany adres e-mail.',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return (
    <section className="rounded-xl border border-iron-200 bg-white p-8 shadow-sm dark:border-iron-800 dark:bg-iron-900">
      <div className="mb-6 flex flex-col gap-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-precision-blue-600">
          Reset hasła
        </p>
        <h1 className="font-display text-h3 text-iron-900 dark:text-iron-50">
          Nie pamiętasz hasła?
        </h1>
        <p className="text-sm text-iron-600 dark:text-iron-300">
          Podaj e-mail, a wyślemy link do ustawienia nowego hasła.
        </p>
      </div>

      <ResetForm />

      <p className="mt-6 text-center text-sm text-iron-600 dark:text-iron-300">
        <Link href="/login" className="font-medium text-precision-blue-600 hover:underline">
          ← Wróć do logowania
        </Link>
      </p>
    </section>
  )
}
