import type { Metadata } from 'next'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mandatomat/ui/card'

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Skontaktuj się z Mandatomat.pl — wsparcie, sprzedaż B2B, RODO, prasa. Odpowiadamy w ciągu 24 godzin roboczych.',
}

const CHANNELS = [
  {
    title: 'Wsparcie użytkowników',
    email: 'kontakt@mandatomat.pl',
    desc: 'Pytania o pisma, zwroty, problemy techniczne. Odpowiadamy w 48h (priorytet 24h dla planów PRO+).',
    icon: '💬',
  },
  {
    title: 'Sprzedaż B2B / Floty',
    email: 'b2b@mandatomat.pl',
    desc: 'Oferta dla firm transportowych, kancelarii, spedycji. Plany niestandardowe od 20 pojazdów.',
    icon: '🏢',
  },
  {
    title: 'Inspektor Ochrony Danych',
    email: 'iod@mandatomat.pl',
    desc: 'Sprawy RODO — eksport, usunięcie, sprostowanie. Odpowiadamy w terminie 30 dni.',
    icon: '🔒',
  },
  {
    title: 'Prasa i partnerstwa',
    email: 'press@mandatomat.pl',
    desc: 'Komunikaty prasowe, wywiady, partnerstwa medialne, eventy branżowe.',
    icon: '📰',
  },
] as const

export default function KontaktPage() {
  return (
    <article className="border-b border-iron-100 bg-white py-20 dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto max-w-prose px-6">
        <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
          KONTAKT
        </p>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-iron-950 sm:text-5xl dark:text-white">
          Jak możemy pomóc?
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-iron-600 dark:text-iron-300">
          Wybierz kanał odpowiadający Twojej sprawie. Każda wiadomość trafia do właściwej osoby —
          żadnych botów, żadnych ślepych skrzynek.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((ch) => (
            <Card key={ch.email} interactive>
              <CardHeader>
                <span className="text-3xl" aria-hidden>
                  {ch.icon}
                </span>
                <CardTitle className="mt-3">{ch.title}</CardTitle>
                <CardDescription>{ch.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={`mailto:${ch.email}`}
                  className="font-mono text-sm font-semibold text-precision-blue-600 hover:underline dark:text-precision-blue-400"
                >
                  {ch.email}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-iron-100 bg-iron-50/50 p-6 dark:border-iron-800 dark:bg-iron-900">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
            Dane rejestrowe
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-iron-500">
                Firma
              </dt>
              <dd className="text-iron-700 dark:text-iron-300">Mandatomat sp. z o.o.</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-iron-500">
                Siedziba
              </dt>
              <dd className="text-iron-700 dark:text-iron-300">Warszawa, Polska</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-iron-500">NIP</dt>
              <dd className="font-mono tabular-nums text-iron-700 dark:text-iron-300">[TBD]</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-iron-500">KRS</dt>
              <dd className="font-mono tabular-nums text-iron-700 dark:text-iron-300">[TBD]</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  )
}
