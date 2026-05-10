import Link from 'next/link'

import { Button } from '@mandatomat/ui/button'

/**
 * CTA przed footerem — silny call-to-action na ciemnym tle z subtelną siatką.
 */
export function CtaFooter() {
  return (
    <section className="relative isolate overflow-hidden bg-precision-blue-600 text-white">
      {/* Subtelna siatka */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-landing px-6 py-24 text-center">
        <h2 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
          Masz mandat? Nie płać go bezrefleksyjnie.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-precision-blue-100">
          76% odwołań Mandatomatu kończy się sukcesem. Sprawdź swoje szanse — to zajmie minutę.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            variant="secondary-soft"
            className="h-[52px] bg-white px-7 text-base text-precision-blue-700 hover:bg-iron-50"
          >
            <Link href="/kreator">Zacznij pisać odwołanie →</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-[52px] px-7 text-base text-white hover:bg-white/10"
          >
            <Link href="/sprawdz-szanse">Sprawdź szanse — za darmo</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
