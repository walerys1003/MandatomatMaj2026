import Link from 'next/link'

import { Button } from '@mandatomat/ui/button'

import { HeroBackground } from './hero-background'

/**
 * Hero (D03):
 *  - Overline "MANDATOMAT.PL" — JetBrains Mono 11px, blue-600
 *  - H1 "Odwołaj mandat w 3 minuty." — Inter Tight 800, -0.04em, max-w pełna
 *  - Paragraph max-w 460px
 *  - Button group: Primary blue-600 52px h + Secondary blue-50 bg "Sprawdź szanse — za darmo"
 *  - Stats line: "3 min" / "76% skuteczność" / "100+ podstaw prawnych"
 *  - Tło: siatka perspektywiczna 60×60 + accent dot
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-iron-100 bg-white dark:border-iron-900 dark:bg-iron-950">
      <HeroBackground />

      <div className="relative mx-auto max-w-landing px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-precision-blue-500 align-middle" />
            MANDATOMAT.PL
          </p>

          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-iron-950 sm:text-6xl lg:text-7xl dark:text-white">
            Odwołaj mandat
            <br />
            <span className="text-precision-blue-600 dark:text-precision-blue-400">w 3 minuty.</span>
          </h1>

          <p className="mt-6 max-w-[460px] text-lg leading-relaxed text-iron-600 dark:text-iron-300">
            Generujemy profesjonalne odwołania od mandatów drogowych, parkingowych, fotoradarów,
            e-TOLL i ZTM/MPK. Bez prawnika. Bez stresu. Bez wychodzenia z domu.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="primary" className="h-[52px] px-7 text-base">
              <Link href="/kreator">
                Zacznij pisać odwołanie
                <span aria-hidden className="ml-2">
                  →
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary-soft" className="h-[52px] px-7 text-base">
              <Link href="/sprawdz-szanse">Sprawdź szanse — za darmo</Link>
            </Button>
          </div>

          {/* Stats line */}
          <dl className="mt-14 grid grid-cols-3 gap-8 border-t border-iron-100 pt-8 dark:border-iron-800">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-iron-500">
                Średni czas
              </dt>
              <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-iron-950 dark:text-white">
                3 min
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-iron-500">
                Skuteczność
              </dt>
              <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-iron-950 dark:text-white">
                76%
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-iron-500">
                Podstawy prawne
              </dt>
              <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-iron-950 dark:text-white">
                100+
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
