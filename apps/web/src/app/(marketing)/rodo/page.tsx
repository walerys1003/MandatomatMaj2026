import Link from 'next/link'
import type { Metadata } from 'next'

import { Button } from '@mandatomat/ui/button'

export const metadata: Metadata = {
  title: 'Twoje prawa RODO',
  description:
    'Eksport danych, usunięcie konta, sprostowanie — wszystkie prawa wynikające z RODO i jak z nich skorzystać.',
}

const RIGHTS = [
  {
    art: 'Art. 15',
    title: 'Prawo dostępu do danych',
    desc: 'Możesz w każdej chwili sprawdzić, jakie dane na Twój temat przetwarzamy. W panelu „Profil" zobaczysz wszystkie zapisane informacje.',
    cta: { label: 'Zobacz mój profil', href: '/profil' },
  },
  {
    art: 'Art. 16',
    title: 'Prawo do sprostowania',
    desc: 'Masz prawo poprawić błędne lub niekompletne dane — imię, nazwisko, adres, telefon. Edytujesz je samodzielnie w ustawieniach.',
    cta: { label: 'Edytuj profil', href: '/ustawienia' },
  },
  {
    art: 'Art. 17',
    title: 'Prawo do usunięcia („bycia zapomnianym")',
    desc: 'Możesz w dowolnej chwili usunąć konto. Anonimizujemy dane natychmiast — z wyjątkiem tych, które musimy zachować z mocy prawa (np. faktury VAT — 5 lat).',
    cta: { label: 'Usuń konto', href: '/ustawienia#usun-konto' },
  },
  {
    art: 'Art. 18',
    title: 'Prawo do ograniczenia przetwarzania',
    desc: 'Jeśli kwestionujesz prawidłowość danych lub legalność przetwarzania, możesz zażądać ograniczenia przetwarzania. Napisz na iod@mandatomat.pl.',
    cta: { label: 'Napisz do IOD', href: 'mailto:iod@mandatomat.pl' },
  },
  {
    art: 'Art. 20',
    title: 'Prawo do przenoszenia danych',
    desc: 'Możesz pobrać wszystkie swoje dane w formacie JSON — sprawy, dokumenty, terminy, płatności, profil. Plik możesz przenieść do innego dostawcy.',
    cta: { label: 'Pobierz moje dane (JSON)', href: '/api/profile/export' },
  },
  {
    art: 'Art. 21',
    title: 'Prawo sprzeciwu',
    desc: 'Możesz sprzeciwić się przetwarzaniu Twoich danych dla celów marketingu lub na podstawie prawnie uzasadnionego interesu Administratora.',
    cta: { label: 'Wycofaj zgody', href: '/ustawienia#zgody' },
  },
  {
    art: 'Art. 77',
    title: 'Prawo wniesienia skargi do UODO',
    desc: 'Jeśli uważasz, że przetwarzamy Twoje dane niezgodnie z prawem, masz prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.',
    cta: { label: 'Strona UODO', href: 'https://uodo.gov.pl' },
  },
] as const

export default function RodoPage() {
  return (
    <article className="border-b border-iron-100 bg-white py-20 dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto max-w-prose px-6">
        <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
          RODO / GDPR
        </p>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-iron-950 sm:text-5xl dark:text-white">
          Twoje prawa. Jasno, bez prawniczego żargonu.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-iron-600 dark:text-iron-300">
          Mandatomat przestrzega Rozporządzenia o Ochronie Danych Osobowych (RODO). Poniżej
          wszystkie Twoje prawa i jak z nich skorzystać.
        </p>

        <div className="mt-12 space-y-6">
          {RIGHTS.map((r) => (
            <section
              key={r.art}
              className="rounded-xl border border-iron-100 bg-iron-50/50 p-6 dark:border-iron-800 dark:bg-iron-900"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-600 dark:text-precision-blue-400">
                {r.art} RODO
              </p>
              <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
                {r.title}
              </h2>
              <p className="mt-3 leading-relaxed text-iron-700 dark:text-iron-300">{r.desc}</p>
              <Button asChild size="sm" variant="secondary-soft" className="mt-5">
                <Link href={r.cta.href}>{r.cta.label} →</Link>
              </Button>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-precision-blue-200 bg-precision-blue-50 p-6 dark:border-precision-blue-800 dark:bg-precision-blue-950/30">
          <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
            Inspektor Ochrony Danych
          </h3>
          <p className="mt-2 text-iron-700 dark:text-iron-300">
            W sprawach RODO pisz bezpośrednio do IOD: <strong>iod@mandatomat.pl</strong>.
            Odpowiadamy w ciągu 30 dni (zgodnie z art. 12 ust. 3 RODO).
          </p>
        </div>
      </div>
    </article>
  )
}
