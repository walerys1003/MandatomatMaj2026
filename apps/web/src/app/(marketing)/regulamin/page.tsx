import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regulamin',
  description: 'Regulamin świadczenia usług drogą elektroniczną przez Mandatomat.pl',
}

const SECTIONS = [
  {
    h: '§ 1. Postanowienia ogólne',
    p: [
      'Niniejszy Regulamin określa zasady świadczenia usług drogą elektroniczną przez serwis Mandatomat.pl (dalej: „Serwis").',
      'Operatorem Serwisu jest Mandatomat sp. z o.o. z siedzibą w Warszawie, KRS: [TBD], NIP: [TBD], REGON: [TBD] (dalej: „Operator").',
      'Kontakt z Operatorem: kontakt@mandatomat.pl.',
    ],
  },
  {
    h: '§ 2. Definicje',
    p: [
      'Użytkownik — osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, korzystająca z Serwisu.',
      'Konsument — osoba fizyczna w rozumieniu art. 22¹ Kodeksu Cywilnego.',
      'Usługa — generowanie projektów pism procesowych (odwołań, sprzeciwów, wniosków) na podstawie danych podanych przez Użytkownika i materiałów źródłowych.',
      'Pismo — wygenerowany przez Serwis dokument w formacie PDF, stanowiący projekt pisma procesowego do wykorzystania przez Użytkownika.',
    ],
  },
  {
    h: '§ 3. Zakres usług',
    p: [
      'Serwis nie świadczy pomocy prawnej w rozumieniu ustawy o adwokaturze ani ustawy o radcach prawnych. Mandatomat nie jest kancelarią prawną.',
      'Wygenerowane Pisma stanowią projekty dokumentów. Użytkownik jest wyłącznym autorem pisma w sensie procesowym i to on podpisuje pismo własnoręcznie.',
      'W skomplikowanych stanach faktycznych lub prawnych Użytkownik powinien skonsultować pismo z adwokatem lub radcą prawnym.',
    ],
  },
  {
    h: '§ 4. Rejestracja i konto',
    p: [
      'Rejestracja jest bezpłatna i wymaga podania adresu e-mail oraz ustanowienia hasła.',
      'Użytkownik jest zobowiązany do podania prawdziwych danych. W szczególności PESEL, dane organu, kwoty mandatu — błędne dane skutkują nieskutecznością odwołania.',
      'Użytkownik odpowiada za bezpieczeństwo swojego hasła. Operator nie ma dostępu do haseł Użytkowników (haszowanie bcrypt).',
    ],
  },
  {
    h: '§ 5. Płatności',
    p: [
      'Cennik: pojedyncze pismo — 99 zł, pakiet 3 pism — 249 zł, plan PRO+ — 349 zł / miesiąc.',
      'Płatności obsługuje Stripe Payments Europe Ltd. Operator nie przechowuje danych kart płatniczych.',
      'Faktura VAT wystawiana automatycznie po zaksięgowaniu płatności i wysyłana e-mailem.',
    ],
  },
  {
    h: '§ 6. Prawo odstąpienia od umowy (Konsument)',
    p: [
      'Konsument ma prawo odstąpić od umowy w terminie 14 dni bez podania przyczyny — poza przypadkami określonymi w art. 38 ustawy o prawach konsumenta.',
      'Wygenerowanie i pobranie Pisma stanowi rozpoczęcie świadczenia usługi za wyraźną zgodą Konsumenta. Zgodnie z art. 38 pkt 1 i 13 ustawy o prawach konsumenta, prawo odstąpienia nie przysługuje po pobraniu Pisma.',
      'Przed pobraniem Pisma Konsument może odstąpić od umowy bez podania przyczyny — wystarczy mail na adres kontakt@mandatomat.pl.',
    ],
  },
  {
    h: '§ 7. Reklamacje',
    p: [
      'Reklamacje należy składać na adres kontakt@mandatomat.pl, podając numer sprawy i opis problemu.',
      'Operator rozpatruje reklamacje w terminie do 14 dni od otrzymania.',
      'W przypadku braku odpowiedzi w terminie 14 dni reklamacja uważana jest za uznaną.',
    ],
  },
  {
    h: '§ 8. Wykorzystanie sztucznej inteligencji (AI)',
    p: [
      'Pisma generowane są z wykorzystaniem dużych modeli językowych (LLM) — w szczególności Anthropic Claude. Operator stosuje custom prompt prawny i bibliotekę walidacji (golden evals) zapewniającą zgodność z polskim prawem.',
      'Każde wygenerowane pismo jest projektem, który Użytkownik powinien zweryfikować przed użyciem. Operator nie gwarantuje, że pismo jest wolne od błędów merytorycznych — modele AI mogą halucynować podstawy prawne (rzadko, ale zdarza się).',
      'Dane wpisane przez Użytkownika do formularza są przekazywane do Anthropic (USA, Standard Contractual Clauses RODO). Operator nie wykorzystuje danych Użytkownika do trenowania modeli AI (umowa DPA).',
      'Użytkownik może w każdej chwili zażądać usunięcia danych z bazy Operatora (art. 17 RODO). Dane przekazane do Anthropic są przechowywane maksymalnie 30 dni (zgodnie z polityką Anthropic Zero Data Retention).',
    ],
  },
  {
    h: '§ 9. Odpowiedzialność',
    p: [
      'Operator nie ponosi odpowiedzialności za skutki procesowe wykorzystania Pisma, w szczególności za odrzucenie odwołania przez organ.',
      'Operator dokłada najwyższej staranności przy aktualizacji bazy podstaw prawnych, jednak nie gwarantuje ich pełnej zgodności z najnowszymi zmianami prawa.',
      'Modele AI mogą generować błędne lub przestarzałe odniesienia prawne — Użytkownik MUSI zweryfikować każde powołanie podstaw prawnych przed wniesieniem pisma.',
      'Łączna odpowiedzialność Operatora ograniczona jest do wysokości zapłaconej za daną usługę.',
    ],
  },
  {
    h: '§ 10. Bezpieczeństwo i dane osobowe',
    p: [
      'Operator stosuje środki bezpieczeństwa zgodne z art. 32 RODO: szyfrowanie TLS 1.3, hashowanie haseł (bcrypt), Row Level Security w bazie, Content Security Policy, rate-limiting.',
      'Audyt bezpieczeństwa: dokument Security Checklist (docs/security/SECURITY_CHECKLIST.md) — RLS, CSP, HSTS, Permissions-Policy.',
      'Zgłaszanie podatności: security@mandatomat.pl. Reagujemy w ciągu 48 godzin (responsible disclosure).',
    ],
  },
  {
    h: '§ 11. Postanowienia końcowe',
    p: [
      'Regulamin obowiązuje od dnia: 10 maja 2026 r.',
      'Operator zastrzega prawo zmiany Regulaminu z zachowaniem 14-dniowego okresu wypowiedzenia.',
      'W sprawach nieuregulowanych Regulaminem stosuje się przepisy prawa polskiego, w szczególności KC, ustawy o świadczeniu usług drogą elektroniczną oraz ustawy o prawach konsumenta.',
      'Sądem właściwym dla rozstrzygania sporów jest sąd właściwy dla siedziby Operatora — chyba że bezwzględnie obowiązujące przepisy stanowią inaczej (Konsumenci).',
    ],
  },
] as const

export default function RegulaminPage() {
  return (
    <article className="border-b border-iron-100 bg-white py-20 dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto max-w-prose px-6">
        <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
          DOKUMENT PRAWNY
        </p>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-iron-950 sm:text-5xl dark:text-white">
          Regulamin
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
