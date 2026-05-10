import type { Metadata } from 'next'
import Link from 'next/link'

import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Logowanie',
  description: 'Zaloguj się do panelu Mandatomat. Zarządzaj swoimi pismami, terminami i płatnościami.',
  robots: { index: false, follow: false },
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  return (
    <section className="rounded-xl border border-iron-200 bg-white p-8 shadow-sm dark:border-iron-800 dark:bg-iron-900">
      <div className="mb-6 flex flex-col gap-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-precision-blue-600">
          Logowanie
        </p>
        <h1 className="font-display text-h3 text-iron-900 dark:text-iron-50">
          Wróć do swoich spraw.
        </h1>
        <p className="text-sm text-iron-600 dark:text-iron-300">
          Brak konta?{' '}
          <Link
            href="/rejestracja"
            className="font-medium text-precision-blue-600 hover:underline"
          >
            Zarejestruj się
          </Link>
          .
        </p>
      </div>

      <LoginForm next={searchParams.next} />
    </section>
  )
}
