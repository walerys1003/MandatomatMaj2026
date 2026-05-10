import type { Metadata } from 'next'
import Link from 'next/link'

import { Button, Stepper } from '@mandatomat/ui'

import { ReferralRedeemer } from './referral-redeemer'

export const metadata: Metadata = {
  title: 'Witaj w Mandatomat',
  description: 'Onboarding — zacznij pisać pisma prawne w 5 minut.',
  robots: { index: false, follow: false },
}

const STEPS = [
  { id: '1', label: 'Powitanie' },
  { id: '2', label: 'Profil' },
  { id: '3', label: 'Pierwsza sprawa' },
]

/**
 * Krok 1/3 — powitanie + 3 punkty wartości.
 *
 * Cel: szybko pokazać userowi co dostaje, żeby nie odbił się po rejestracji.
 * CTA: "Dalej" → /witaj/profil.
 * Skip: link "pomiń onboarding" → /panel (oznacza onboarding_completed=true).
 */
export default function WitajPage() {
  return (
    <div className="space-y-10">
      <ReferralRedeemer />
      <Stepper steps={STEPS} currentIndex={0} />

      <header className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
          Krok 1 z 3
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-iron-950 dark:text-white sm:text-5xl">
          Witaj w Mandatomat 👋
        </h1>
        <p className="text-base text-iron-600 dark:text-iron-300">
          Pomożemy Ci napisać profesjonalne pismo prawne w 5 minut. Bez znajomości prawa. Bez wizyt
          u prawnika za 500 zł/h.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Feature
          icon="⚡"
          title="5 minut zamiast 5 godzin"
          body="Wypełniasz prosty formularz, AI pisze pismo — z podstawami prawnymi i argumentacją."
        />
        <Feature
          icon="⚖️"
          title="30 typów spraw"
          body="Mandaty, parking, windykacja, ubezpieczenia, e-toll, kontrole drogowe i pisma techniczne."
        />
        <Feature
          icon="📅"
          title="Pilnujemy terminów"
          body="Automatyczne przypomnienia o deadline'ach (7-dniowe, 14-dniowe odwołania, etc.)."
        />
      </section>

      <section className="rounded-xl border border-precision-blue-200 bg-precision-blue-50/50 p-5 dark:border-precision-blue-900 dark:bg-precision-blue-950/30">
        <p className="font-mono text-[10px] uppercase tracking-wider text-precision-blue-700 dark:text-precision-blue-300">
          Co dalej?
        </p>
        <p className="mt-2 text-sm text-iron-700 dark:text-iron-200">
          Zaraz uzupełnisz <strong>imię i numer telefonu</strong> (potrzebne do generowania pism w
          Twoim imieniu) i będziesz mógł utworzyć pierwszą sprawę.
        </p>
      </section>

      <footer className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/panel"
          className="text-sm text-iron-500 underline-offset-4 hover:text-iron-700 hover:underline"
        >
          Pomiń onboarding
        </Link>
        <Link href="/witaj/profil" className="sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">
            Dalej — uzupełnij profil →
          </Button>
        </Link>
      </footer>
    </div>
  )
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-iron-200 bg-white p-5 dark:border-iron-800 dark:bg-iron-900">
      <div className="mb-3 text-2xl" aria-hidden="true">
        {icon}
      </div>
      <h2 className="font-display text-base font-bold tracking-[-0.01em] text-iron-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">{body}</p>
    </div>
  )
}
