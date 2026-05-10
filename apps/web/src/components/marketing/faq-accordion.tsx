import { Accordion } from '@mandatomat/ui/accordion'

/**
 * FAQ — accordion (details/summary based).
 * 8 najczęstszych pytań — używane też w JSON-LD FAQPage (SEO).
 */

export const FAQ_ITEMS = [
  {
    q: 'Czy Mandatomat to kancelaria prawna?',
    a: 'Nie. Mandatomat to platforma technologiczna — generujemy gotowe szablony pism wraz z podstawami prawnymi i argumentacją. W skomplikowanych sprawach zawsze rekomendujemy konsultację z adwokatem lub radcą prawnym.',
  },
  {
    q: 'Jak duże są szanse, że odwołanie zadziała?',
    a: 'Statystycznie 76% odwołań wygenerowanych przez Mandatomat kończy się uchyleniem mandatu lub umorzeniem. Skuteczność zależy od typu sprawy — najwyższa przy fotoradarach (do 89%), najniższa przy mandatach kredytowanych przez patrol (ok. 45%). Każda sprawa otrzymuje indywidualny scoring szans.',
  },
  {
    q: 'Ile to kosztuje?',
    a: 'Pojedyncze pismo: 99 zł. Pakiet 3 pism: 249 zł (oszczędność 25%). Plan PRO+ dla firm: 349 zł/mc. Bez abonamentu, bez ukrytych opłat. Zawsze wystawiamy fakturę VAT.',
  },
  {
    q: 'Czy moje dane są bezpieczne?',
    a: 'Tak. Hostujemy dane w UE (Frankfurt), szyfrujemy PESEL i wrażliwe dane (pgcrypto), działamy zgodnie z RODO. Możesz w każdej chwili wyeksportować lub usunąć swoje dane (art. 17 i 20 RODO).',
  },
  {
    q: 'Jak długo to trwa?',
    a: 'Średnio 3 minuty na wygenerowanie pisma. Wgrywasz zdjęcie mandatu, AI odczytuje dane, odpowiadasz na 5 pytań, pobierasz PDF. Wydruk i wysyłka listem poleconym po Twojej stronie.',
  },
  {
    q: 'Co jeśli mandat już opłaciłem/am?',
    a: 'Jeśli zapłaciłeś mandat kredytowany w terminie 7 dni — przyjąłeś go i nie można go już odwołać. W innych przypadkach (mandat zaoczny, fotoradar) opłacenie nie zamyka drogi do odwołania, ale komplikuje odzyskanie pieniędzy. Sprawdź swoją sprawę w darmowym checkerze.',
  },
  {
    q: 'Czy mogę używać Mandatomatu jako firma transportowa?',
    a: 'Tak — plan PRO+ jest dedykowany flotom (powyżej 20 pojazdów), kancelariom i firmom transportowym. Oferujemy konta zespołowe, integrację API, faktury VAT na NIP firmy oraz wsparcie telefoniczne. Skontaktuj się, dopasujemy ofertę.',
  },
  {
    q: 'Co jeśli odwołanie zostanie odrzucone?',
    a: 'Otrzymasz drugą próbę za darmo (w planach pakiet i PRO+) lub pomożemy przygotować zażalenie do sądu. W rzadkich przypadkach (wyrok prawomocny) rekomendujemy konsultację z prawnikiem — możemy pomóc znaleźć kancelarię w naszej sieci partnerskiej.',
  },
] as const

export function FaqAccordion() {
  return (
    <section id="faq" className="border-b border-iron-100 bg-iron-50/50 dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto max-w-prose px-6 py-24">
        <div className="mb-12">
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
            FAQ
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.03em] text-iron-950 sm:text-5xl dark:text-white">
            Najczęstsze pytania.
          </h2>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item) => (
            <Accordion key={item.q} title={item.q}>
              <p className="leading-relaxed text-iron-600 dark:text-iron-300">{item.a}</p>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  )
}
