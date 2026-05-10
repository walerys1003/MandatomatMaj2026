import Link from 'next/link'
import type { Metadata } from 'next'

import { Button } from '@mandatomat/ui/button'

export const metadata: Metadata = {
  title: 'O nas',
  description:
    'Mandatomat to LegalTech zbudowany przez ludzi, którzy mają dość bezsensownych mandatów. Misja, wartości, zespół.',
}

const VALUES = [
  {
    h: 'Uczciwość ponad konwersję',
    p: 'Pokazujemy realny scoring szans — jeśli Twoja sprawa ma 30%, mówimy 30%, nie obiecujemy 80%. Bo zaufanie zbudujemy raz.',
  },
  {
    h: 'Prawo dostępne dla każdego',
    p: 'Pomoc prawnika w sprawie mandatu kosztuje 300–800 zł. My obniżamy próg do 99 zł — bez utraty jakości argumentacji.',
  },
  {
    h: 'Technologia służy człowiekowi',
    p: 'AI nie zastępuje prawnika w trudnych sprawach. Zastępuje za to godziny żmudnego przeszukiwania ustaw przy prostych odwołaniach.',
  },
  {
    h: 'Dane są Twoje',
    p: 'Eksport, usunięcie, przenośność — RODO to dla nas standard, nie checkbox. Możesz w każdej chwili zabrać swoje dane.',
  },
] as const

export default function ONasPage() {
  return (
    <article className="border-b border-iron-100 bg-white py-20 dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto max-w-prose px-6">
        <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
          O NAS
        </p>
        <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] text-iron-950 sm:text-6xl dark:text-white">
          Zbudowaliśmy Mandatomat, bo mieliśmy dość niesprawiedliwych mandatów.
        </h1>

        <div className="mt-12 space-y-6 text-lg leading-relaxed text-iron-700 dark:text-iron-300">
          <p>
            Każdego roku w Polsce wystawia się ponad <strong>15 milionów mandatów</strong>. Spora
            część z nich to błędy formalne, niedopełnione obowiązki organu, źle ustawione
            fotoradary, zasłonięte znaki, lub sytuacje, w których kierowca w ogóle nie
            miał możliwości zorientować się, że łamie przepis.
          </p>
          <p>
            Walka z mandatem przez prawnika kosztuje średnio 400 zł. To więcej niż sam mandat. W
            efekcie — większość ludzi po prostu płaci, mimo że odwołanie miałoby duże szanse
            powodzenia.
          </p>
          <p>
            Zbudowaliśmy Mandatomat, żeby zmienić tę asymetrię. Korzystając z najnowszych modeli AI
            (Claude od Anthropic) i ponad 100 podstaw prawnych, generujemy odwołania w 3 minuty —
            za 99 zł. Bo każdy zasługuje na sprawiedliwy proces.
          </p>
        </div>

        <h2 className="mt-16 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white">
          Nasze wartości
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {VALUES.map((v) => (
            <section
              key={v.h}
              className="rounded-xl border border-iron-100 bg-iron-50/50 p-6 dark:border-iron-800 dark:bg-iron-900"
            >
              <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
                {v.h}
              </h3>
              <p className="mt-3 leading-relaxed text-iron-700 dark:text-iron-300">{v.p}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-16 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white">
          Kim jesteśmy?
        </h2>
        <p className="mt-6 leading-relaxed text-iron-700 dark:text-iron-300">
          Mandatomat tworzy zespół 5 osób — adwokat, dwóch programistów, projektantka UX i
          specjalistka od growthu. Pracujemy zdalnie z Warszawy, Krakowa i Wrocławia. Nasze pisma
          weryfikuje współpracujący z nami radca prawny — każdy szablon przechodzi peer review.
        </p>

        <div className="mt-12 rounded-xl border border-precision-blue-200 bg-precision-blue-50 p-8 dark:border-precision-blue-800 dark:bg-precision-blue-950/30">
          <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
            Pracujesz w LegalTech? Pisz.
          </h3>
          <p className="mt-2 text-iron-700 dark:text-iron-300">
            Szukamy adwokatów, deweloperów i osób z doświadczeniem w projektach RegTech.
          </p>
          <Button asChild size="md" variant="primary" className="mt-5">
            <Link href="mailto:hello@mandatomat.pl">hello@mandatomat.pl →</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
