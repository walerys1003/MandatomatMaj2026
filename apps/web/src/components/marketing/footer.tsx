import Link from 'next/link'

import { Logo } from '@mandatomat/ui/logo'

/**
 * Marketing footer — iron-950 dark, 4 kolumny linków + bottom bar.
 * Kolumny: Produkt / Kategorie / Pomoc / Firma
 */

const COLUMNS = [
  {
    title: 'Produkt',
    links: [
      { href: '/jak-to-dziala', label: 'Jak to działa' },
      { href: '/#cennik', label: 'Cennik' },
      { href: '/#kategorie', label: 'Kategorie pism' },
      { href: '/#faq', label: 'Najczęstsze pytania' },
    ],
  },
  {
    title: 'Kategorie',
    links: [
      { href: '/kategoria/mandaty-karne', label: 'Mandaty karne' },
      { href: '/kategoria/fotoradary', label: 'Fotoradary' },
      { href: '/kategoria/parking', label: 'Parking' },
      { href: '/kategoria/etoll', label: 'e-TOLL' },
      { href: '/kategoria/ubezpieczenia', label: 'Ubezpieczenia' },
    ],
  },
  {
    title: 'Pomoc',
    links: [
      { href: '/kontakt', label: 'Kontakt' },
      { href: '/regulamin', label: 'Regulamin' },
      { href: '/polityka-prywatnosci', label: 'Polityka prywatności' },
      { href: '/rodo', label: 'RODO' },
    ],
  },
  {
    title: 'Firma',
    links: [
      { href: '/o-nas', label: 'O nas' },
      { href: '/blog', label: 'Blog' },
      { href: '/dla-firm', label: 'Dla firm (B2B)' },
      { href: '/partnerzy', label: 'Partnerzy' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="border-t border-iron-800 bg-iron-950 text-iron-300">
      <div className="mx-auto max-w-landing px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="full" invert />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-iron-400">
              Generuj profesjonalne odwołania od mandatów w 5 minut. Bez prawnika.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-iron-500">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-iron-300 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-iron-800 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-iron-500">
            © {new Date().getFullYear()} Mandatomat.pl — Wszystkie prawa zastrzeżone.
          </p>
          <p className="text-xs text-iron-500">
            Mandatomat nie jest kancelarią prawną. Generujemy szablony pism. W skomplikowanych
            sprawach skonsultuj się z prawnikiem.
          </p>
        </div>
      </div>
    </footer>
  )
}
