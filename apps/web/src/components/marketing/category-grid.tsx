import Link from 'next/link'

/**
 * Kategorie pism (D04) — 9 kart 3-kolumnowa siatka.
 * Każda karta: ikona (emoji/SVG fallback), tytuł, krótki opis, link "Zacznij →".
 * Hover: -1px translate, border precision-blue-200.
 */

const CATEGORIES = [
  {
    slug: 'mandaty-karne',
    icon: '🚓',
    title: 'Mandaty karne',
    desc: 'Drogowe, wykroczenia, art. 97 KW. Od fotoradaru po patrol policji.',
    count: '7 typów pism',
  },
  {
    slug: 'fotoradary',
    icon: '📸',
    title: 'Fotoradary',
    desc: 'CANARD, ITD, miejskie. Sprzeciw, wniosek o umorzenie, zwrot punktów.',
    count: '4 typy pism',
  },
  {
    slug: 'parking',
    icon: '🅿️',
    title: 'Parking',
    desc: 'Strefa płatnego parkowania, blokady, opłata dodatkowa, holowanie.',
    count: '4 typy pism',
  },
  {
    slug: 'komunikacja',
    icon: '🚌',
    title: 'ZTM / MPK',
    desc: 'Mandat za jazdę bez biletu. Reklamacja, odwołanie, umorzenie.',
    count: '3 typy pism',
  },
  {
    slug: 'itd',
    icon: '🚛',
    title: 'ITD',
    desc: 'Inspekcja Transportu Drogowego. Tachograf, masa, czas pracy.',
    count: '5 typów pism',
  },
  {
    slug: 'etoll',
    icon: '🛣️',
    title: 'e-TOLL',
    desc: 'Brak rejestracji, awaria, błędne naliczenie opłaty drogowej.',
    count: '3 typy pism',
  },
  {
    slug: 'ubezpieczenia',
    icon: '🛡️',
    title: 'Ubezpieczenia OC/AC',
    desc: 'Odszkodowanie, regres, odwołanie od decyzji ubezpieczyciela.',
    count: '3 typy pism',
  },
  {
    slug: 'punkty-karne',
    icon: '⚠️',
    title: 'Punkty karne',
    desc: 'Wniosek o szkolenie, weryfikacja stanu, sprzeciw od decyzji.',
    count: '4 typy pism',
  },
  {
    slug: 'windykacja',
    icon: '💼',
    title: 'Windykacja',
    desc: 'Sprzeciw od nakazu zapłaty, przedawnienie, ugoda. Cross-sell.',
    count: '4 typy pism',
    highlight: true,
  },
] as const

export function CategoryGrid() {
  return (
    <section id="kategorie" className="border-b border-iron-100 bg-white dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto max-w-landing px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
              KATEGORIE PISM
            </p>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.03em] text-iron-950 sm:text-5xl dark:text-white">
              34 typy pism. 7 kategorii. Jedna platforma.
            </h2>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategoria/${cat.slug}`}
              className={`group relative rounded-xl border bg-white p-6 transition-all duration-150 hover:-translate-y-px hover:shadow-md dark:bg-iron-900 ${
                cat.highlight
                  ? 'border-precision-blue-200 ring-1 ring-precision-blue-100 dark:border-precision-blue-700 dark:ring-precision-blue-900'
                  : 'border-iron-100 hover:border-precision-blue-200 dark:border-iron-800 dark:hover:border-precision-blue-700'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl" aria-hidden>
                  {cat.icon}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-iron-500">
                  {cat.count}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
                {cat.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-iron-600 dark:text-iron-400">
                {cat.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-precision-blue-600 transition-transform group-hover:translate-x-0.5 dark:text-precision-blue-400">
                Zacznij <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
