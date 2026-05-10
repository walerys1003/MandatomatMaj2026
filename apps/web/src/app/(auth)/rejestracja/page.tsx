import type { Metadata } from 'next'
import Link from 'next/link'

import { SignupForm } from './signup-form'

export const metadata: Metadata = {
  title: 'Rejestracja',
  description: 'Utwórz konto Mandatomat — pierwsze pismo gotowe w 5 minut.',
  robots: { index: true, follow: true },
}

export default function SignupPage() {
  return (
    <section className="rounded-xl border border-iron-200 bg-white p-8 shadow-sm dark:border-iron-800 dark:bg-iron-900">
      <div className="mb-6 flex flex-col gap-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-precision-blue-600">
          Rejestracja
        </p>
        <h1 className="font-display text-h3 text-iron-900 dark:text-iron-50">
          Załóż konto. Pisma w 5 minut.
        </h1>
        <p className="text-sm text-iron-600 dark:text-iron-300">
          Masz już konto?{' '}
          <Link href="/login" className="font-medium text-precision-blue-600 hover:underline">
            Zaloguj się
          </Link>
          .
        </p>
      </div>

      <SignupForm />
    </section>
  )
}
