import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  description: 'Polityka prywatności Mandatomat.pl — jak przetwarzamy Twoje dane osobowe.',
}

const SECTIONS = [
  {
    h: '1. Administrator danych',
    p: [
      'Administratorem danych osobowych jest Mandatomat sp. z o.o. z siedzibą w Warszawie, KRS: [TBD], NIP: [TBD], REGON: [TBD].',
      'Kontakt z Inspektorem Ochrony Danych: iod@mandatomat.pl.',
    ],
  },
  {
    h: '2. Zakres przetwarzanych danych',
    p: [
      'Dane konta: adres e-mail, hasło (zaszyfrowane), imię i nazwisko, telefon (opcjonalnie).',
      'Dane sprawy: PESEL (szyfrowany pgcrypto), adres zamieszkania, numer mandatu, dane organu, kwoty, daty zdarzeń.',
      'Dane techniczne: adres IP, identyfikator sesji, typ przeglądarki, plików cookies.',
      'Dane płatności: NIE przechowujemy numeru karty — obsługą zajmuje się Stripe Payments Europe Ltd.',
    ],
  },
  {
    h: '3. Cel i podstawa prawna',
    p: [
      'Świadczenie usługi (art. 6 ust. 1 lit. b RODO) — wykonanie umowy: rejestracja, generowanie pism, obsługa konta.',
      'Obowiązki prawne (art. 6 ust. 1 lit. c RODO) — księgowość, faktury VAT, retencja przez 5 lat.',
      'Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO) — zabezpieczenie roszczeń, marketing własny, przeciwdziałanie nadużyciom.',
      'Zgoda (art. 6 ust. 1 lit. a RODO) — newsletter, marketing partnerski. Cofnięcie w dowolnej chwili.',
    ],
  },
  {
    h: '4. Okres przechowywania',
    p: [
      'Dane konta — przez czas trwania umowy + 3 lata (przedawnienie roszczeń).',
      'Dane księgowe (faktury) — 5 lat od końca roku obrotowego.',
      'Dane sprawy — 3 lata od zamknięcia sprawy.',
      'Po usunięciu konta przez Użytkownika (art. 17 RODO) anonimizujemy dane osobowe natychmiast — pozostają tylko dane wymagane prawem (księgowość).',
    ],
  },
  {
    h: '5. Twoje prawa (RODO)',
    p: [
      'Prawo dostępu do danych (art. 15) — w panelu profilu lub mailem na iod@mandatomat.pl.',
      'Prawo do sprostowania (art. 16) — edycja w panelu lub mailem.',
      'Prawo do usunięcia (art. 17) — przycisk „Usuń konto" w ustawieniach.',
      'Prawo do przenoszenia danych (art. 20) — eksport JSON w panelu (RODO Export).',
      'Prawo wniesienia skargi do Prezesa UODO (uodo.gov.pl).',
    ],
  },
  {
    h: '6. Odbiorcy danych',
    p: [
      'Supabase Inc. (hosting + Auth, region: eu-central-1, Frankfurt) — umowa powierzenia.',
      'Anthropic PBC (generowanie tekstów AI) — przetwarza wyłącznie zanonimizowane dane sprawy.',
      'Stripe Payments Europe Ltd. (Dublin) — obsługa płatności.',
      'Resend / SendGrid — wysyłka maili transakcyjnych.',
      'Cloudflare Inc. — CDN i ochrona przed atakami.',
      'Vercel Inc. (region: fra1) — hosting frontu.',
    ],
  },
  {
    h: '7. Transfer poza EOG',
    p: [
      'Niektórzy podwykonawcy (Anthropic, Stripe, Cloudflare, Vercel) mogą przetwarzać dane w USA — na podstawie SCC (Standard Contractual Clauses) i Data Privacy Framework.',
      'Wszystkie nasze bazy danych zlokalizowane są w UE (Frankfurt).',
    ],
  },
  {
    h: '8. Cookies',
    p: [
      'Cookies niezbędne (sesja, CSRF) — bez zgody, na podstawie prawnie uzasadnionego interesu.',
      'Cookies analityczne (Plausible / PostHog) — tylko za zgodą, dane zanonimizowane.',
      'Cookies marketingowe — tylko za zgodą.',
      'Możesz zarządzać preferencjami w banerze cookie lub w ustawieniach przeglądarki.',
    ],
  },
  {
    h: '9. Bezpieczeństwo',
    p: [
      'Szyfrowanie TLS 1.3 dla całej komunikacji.',
      'Szyfrowanie PESEL i wrażliwych danych w bazie (pgcrypto).',
      'Bcrypt dla haseł.',
      'Row-Level Security (RLS) na poziomie bazy — nikt poza Tobą nie widzi Twoich spraw.',
      'Audyty bezpieczeństwa raz na pół roku.',
    ],
  },
] as const

export default function PolitykaPrywatnosciPage() {
  return (
    <article className="border-b border-iron-100 bg-white py-20 dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto max-w-prose px-6">
        <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
          DOKUMENT PRAWNY
        </p>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-iron-950 sm:text-5xl dark:text-white">
          Polityka prywatności
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-iron-500">
          Obowiązuje od 10 maja 2026 r.
        </p>

        <div className="mt-12 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
                {s.h}
              </h2>
              <div className="mt-4 space-y-3 text-iron-700 dark:text-iron-300">
                {s.p.map((para, i) => (
                  <p key={i} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
