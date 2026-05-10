/**
 * Social proof — logotypy mediów + krótkie testimonial.
 * Bez prawdziwych logo (na razie placeholder textowy w Inter Tight).
 * Po MVP: zastąpić SVG-ami z prasą która o nas napisała.
 */

const MEDIA = [
  'Gazeta Wyborcza',
  'Forbes Polska',
  'Bankier.pl',
  'AutoCentrum',
  'Spider\u2019s Web',
  'Money.pl',
] as const

const TESTIMONIALS = [
  {
    quote:
      'Dostałem mandat 500 zł za rzekome przekroczenie prędkości w terenie zabudowanym. W 4 minuty wygenerowałem odwołanie. Tydzień później — umorzenie.',
    author: 'Marcin K.',
    role: 'Warszawa',
    case: 'Fotoradar — umorzenie',
  },
  {
    quote:
      'Strefa płatnego parkowania, 250 zł opłaty dodatkowej. Mandatomat wskazał, że znak był zasłonięty. Skuteczne odwołanie.',
    author: 'Anna W.',
    role: 'Kraków',
    case: 'Parking — uchylenie',
  },
  {
    quote:
      'Jestem właścicielem firmy transportowej. Plan PRO+ to dla mnie ratunek — średnio 3 mandaty miesięcznie, większość udaje się obronić.',
    author: 'Piotr S.',
    role: 'Poznań',
    case: 'B2B — flota 12 aut',
  },
] as const

export function SocialProof() {
  return (
    <section className="border-b border-iron-100 bg-white dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto max-w-landing px-6 py-20">
        {/* Media bar */}
        <div className="mb-16">
          <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-iron-500">
            PISALI O NAS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {MEDIA.map((m) => (
              <span
                key={m}
                className="font-display text-base font-semibold tracking-tight text-iron-500 dark:text-iron-400"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.author}
              className="rounded-xl border border-iron-100 bg-iron-50/50 p-6 dark:border-iron-800 dark:bg-iron-900"
            >
              <blockquote className="text-[15px] leading-relaxed text-iron-700 dark:text-iron-200">
                <span aria-hidden className="mr-1 font-display text-2xl text-precision-blue-500">
                  &ldquo;
                </span>
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between border-t border-iron-100 pt-4 dark:border-iron-800">
                <div>
                  <p className="text-sm font-semibold text-iron-950 dark:text-white">{t.author}</p>
                  <p className="text-xs text-iron-500">{t.role}</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
                  {t.case}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
