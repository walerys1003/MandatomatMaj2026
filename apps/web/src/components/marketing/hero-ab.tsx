import Link from 'next/link'
import { cookies } from 'next/headers'

import { Button } from '@mandatomat/ui/button'

import { Hero } from './hero'
import { HeroBackground } from './hero-background'
import { assignVariantSync } from '@/lib/experiments/ab'

/**
 * Hero — A/B variant wrapper (T6-ONB-001).
 *
 * Server Component — wybiera wariant na podstawie cookie `mnd-bucket`.
 * Cookie ustawiane przez middleware (random 0-99) jeśli nie istnieje.
 *
 * Wariant `control` = oryginalny <Hero /> (Odwołaj mandat w 3 minuty).
 * Wariant `variant-a` = "Sprawdź szanse za darmo" — CTA bezpośredni do free scoringu.
 */
export function HeroAB() {
  const bucketCookie = cookies().get('mnd-bucket')?.value
  const bucket = bucketCookie ? parseInt(bucketCookie, 10) : 0
  const variant = assignVariantSync('landing-hero-2026-05', Number.isFinite(bucket) ? bucket : 0)

  if (variant === 'variant-a') {
    return <HeroVariantA />
  }

  return <Hero />
}

/**
 * Variant A — free scoring first.
 * Telemetria: data-variant="variant-a" w sekcji + Plausible automaticznie
 * pochwyci przez `data-variant` (jeśli skonfigurowane jako custom prop).
 */
function HeroVariantA() {
  return (
    <section
      data-variant="variant-a"
      data-experiment="landing-hero-2026-05"
      className="relative isolate overflow-hidden border-b border-iron-100 bg-white dark:border-iron-900 dark:bg-iron-950"
    >
      <HeroBackground />
      <div className="relative mx-auto max-w-landing px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-precision-blue-500 align-middle" />
            MANDATOMAT.PL
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-iron-950 dark:text-white sm:text-6xl lg:text-7xl">
            Sprawdź szanse
            <br />
            <span className="text-precision-blue-600 dark:text-precision-blue-400">za darmo.</span>
          </h1>
          <p className="mt-6 max-w-[460px] text-lg leading-relaxed text-iron-600 dark:text-iron-300">
            Sztuczna inteligencja w 30 sekund analizuje Twoją sprawę i mówi czy warto się odwoływać.
            Bez logowania. Bez ryzyka. Bez wychodzenia z domu.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="primary" className="h-[52px] px-7 text-base">
              <Link href="/sprawdz-szanse">
                Sprawdź szanse — za darmo
                <span aria-hidden className="ml-2">
                  →
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary-soft" className="h-[52px] px-7 text-base">
              <Link href="/jak-to-dziala">Jak to działa?</Link>
            </Button>
          </div>
          <dl className="mt-14 grid grid-cols-3 gap-8 border-t border-iron-100 pt-8 dark:border-iron-800">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-iron-500">
                Bez logowania
              </dt>
              <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-iron-950 dark:text-white">
                30s
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
