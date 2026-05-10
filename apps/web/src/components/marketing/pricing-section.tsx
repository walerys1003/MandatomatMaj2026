import Link from 'next/link'

import { Badge } from '@mandatomat/ui/badge'
import { Button } from '@mandatomat/ui/button'

/**
 * Cennik (D05) — 3 plany na ciemnym tle iron-950.
 *  - 99 zł jednorazowo
 *  - 249 zł pakiet 3 pism (highlighted, badge "OSZCZĘDZASZ 25%")
 *  - 349 zł / mc PRO+ (firmy)
 * + B2B teaser pod kartami.
 */

const PLANS = [
  {
    id: 'jednorazowo',
    name: 'Jedno pismo',
    price: '99',
    unit: 'zł',
    period: 'jednorazowo',
    desc: 'Idealne na pojedynczy mandat.',
    features: [
      'Wygenerowane pismo (PDF)',
      'AI scoring szans powodzenia',
      'Podstawy prawne i argumentacja',
      'Pomoc krok-po-kroku',
      'Wsparcie e-mail (48h)',
    ],
    cta: 'Wybieram',
    href: '/kreator?plan=single',
    highlight: false,
  },
  {
    id: 'pakiet',
    name: 'Pakiet 3 pism',
    price: '249',
    unit: 'zł',
    period: 'jednorazowo',
    desc: 'Najczęściej wybierany — oszczędzasz 48 zł.',
    features: [
      'Do 3 pism w 12 miesięcy',
      'Wszystko z planu jednorazowego',
      'Priorytetowe wsparcie (24h)',
      'Tracker terminów',
      'Historia spraw w panelu',
    ],
    cta: 'Wybieram pakiet',
    href: '/kreator?plan=pack3',
    highlight: true,
    badge: 'OSZCZĘDZASZ 25%',
  },
  {
    id: 'pro',
    name: 'PRO+',
    price: '349',
    unit: 'zł',
    period: '/ miesiąc',
    desc: 'Dla flot, firm transportowych i kancelarii.',
    features: [
      'Nielimitowana liczba pism',
      'Konta zespołowe (do 5 osób)',
      'API + integracja z CRM',
      'Faktura VAT, NIP firmy',
      'Wsparcie telefoniczne 8–18',
    ],
    cta: 'Skontaktuj się',
    href: '/dla-firm',
    highlight: false,
  },
] as const

export function PricingSection() {
  return (
    <section id="cennik" className="bg-iron-950 text-white">
      <div className="mx-auto max-w-landing px-6 py-24">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-400">
            CENNIK
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-5xl">
            Płacisz tylko gdy potrzebujesz.
          </h2>
          <p className="mt-4 text-lg text-iron-300">
            Bez abonamentu, bez ukrytych opłat. Wystawiamy fakturę VAT.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-150 ${
                plan.highlight
                  ? 'bg-white text-iron-950 ring-2 ring-precision-blue-500'
                  : 'bg-iron-900 text-white ring-1 ring-iron-800 hover:ring-iron-700'
              }`}
            >
              {'badge' in plan && plan.badge ? (
                <div className="absolute -top-3 left-8">
                  <Badge variant="success" mono className="bg-volt-500 text-iron-950">
                    {plan.badge}
                  </Badge>
                </div>
              ) : null}

              <div>
                <h3 className="font-display text-xl font-bold tracking-[-0.02em]">{plan.name}</h3>
                <p
                  className={`mt-1 text-sm ${plan.highlight ? 'text-iron-600' : 'text-iron-400'}`}
                >
                  {plan.desc}
                </p>
              </div>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-extrabold tabular-nums tracking-[-0.04em]">
                  {plan.price}
                </span>
                <span className="font-mono text-sm font-semibold">{plan.unit}</span>
                <span
                  className={`ml-1 text-sm ${plan.highlight ? 'text-iron-500' : 'text-iron-400'}`}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                        plan.highlight ? 'bg-precision-blue-100 text-precision-blue-600' : 'bg-iron-800 text-precision-blue-400'
                      }`}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  variant={plan.highlight ? 'primary' : 'secondary-soft'}
                  className="w-full"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* B2B teaser */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-xl border border-iron-800 bg-iron-900/50 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-400">
              MANDATOMAT B2B
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              Flota powyżej 20 pojazdów? Kancelaria? Zadzwoń, dopasujemy ofertę.
            </p>
          </div>
          <Button asChild variant="outline" size="md" className="border-iron-700 text-white hover:bg-iron-800">
            <Link href="/dla-firm">Oferta dla firm →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
