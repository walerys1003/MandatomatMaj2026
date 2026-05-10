/**
 * SEO — definicje kategorii i long-tail slugów (T5-SEO-016..027).
 *
 * 9 głównych kategorii (/kategoria/<slug>) — pokrywają 29 typów spraw.
 * 17 long-tail (/poradnik/<slug>) — wyspecjalizowane intencje wyszukiwania.
 */

import type { CaseType } from '@mandatomat/db-types'

export interface CategoryDef {
  slug: string
  title: string
  h1: string
  description: string
  metaDescription: string
  keywords: string[]
  caseTypes: readonly CaseType[]
  /** Krótki opis pod H1 (intro) */
  intro: string
  /** Najczęstsze podstawy prawne (do JSON-LD) */
  podstawyPrawne: string[]
  /** FAQ items (Q+A) — render JSON-LD FAQPage */
  faq: Array<{ q: string; a: string }>
}

export const CATEGORIES: readonly CategoryDef[] = [
  {
    slug: 'mandaty-karne',
    title: 'Mandaty karne — sprzeciw, odwołanie, uchylenie | Mandatomat',
    h1: 'Sprzeciw od mandatu karnego — generator AI',
    description:
      'Generator AI sprzeciwu od mandatu karnego. Przekroczenie prędkości, fotoradar, pasy bezpieczeństwa. Podstawy prawne KW, KPSW. 99 zł, gotowe pismo w 60 sekund.',
    metaDescription:
      'Sprzeciw od mandatu karnego z AI: prędkość, fotoradar, pasy. Pismo z podstawami prawnymi (KW, KPSW) w 60 sekund. 99 zł, gwarancja jakości.',
    keywords: [
      'sprzeciw mandat',
      'odwołanie mandat karny',
      'mandat fotoradar',
      'art. 92a KW',
      'KPSW',
    ],
    caseTypes: [
      'M1_mandat_predkosc',
      'M2_mandat_odmowa_przyjecia',
      'M3_mandat_uchylenie',
      'M5_mandat_straz_fotoradar',
    ],
    intro:
      'Otrzymałeś mandat karny i nie zgadzasz się z nim? AI Mandatomat wygeneruje profesjonalny sprzeciw lub odwołanie z powołaniem na konkretne podstawy prawne (art. 92a KW, art. 97 § 2 KPSW) w ciągu 60 sekund.',
    podstawyPrawne: ['art. 92a KW', 'art. 97 § 2 KPSW', 'art. 99 § 1 KPSW', 'art. 101 KPSW'],
    faq: [
      {
        q: 'Ile mam czasu na odmowę przyjęcia mandatu?',
        a: 'Zgodnie z art. 97 § 2 KPSW, sprawca wykroczenia może odmówić przyjęcia mandatu karnego od razu na miejscu. Po podpisaniu mandatu — masz 7 dni na uchylenie się od zarzutu (art. 99 § 1 KPSW), a po uprawomocnieniu — wniosek o uchylenie (art. 101 KPSW).',
      },
      {
        q: 'Kiedy mandat się przedawnia?',
        a: 'Karalność wykroczenia ustaje po 1 roku od popełnienia czynu (art. 45 § 1 KW). Wykonanie orzeczonej kary — po 3 latach od uprawomocnienia (art. 45 § 3 KW). Sprawdź naszym kalkulatorem.',
      },
      {
        q: 'Czy AI rzeczywiście pisze profesjonalnie?',
        a: 'Tak — Claude 3.5 Sonnet z customowym promptem prawnym powołuje konkretne artykuły, orzecznictwo SN i poprawne formuły KPSW. Każde pismo jest walidowane (golden evals).',
      },
    ],
  },
  {
    slug: 'fotoradary',
    title: 'Fotoradar — odwołanie od mandatu z fotoradaru | Mandatomat',
    h1: 'Odwołanie od mandatu z fotoradaru',
    description:
      'Mandat z fotoradaru ITD lub straży miejskiej? Generator AI z argumentami: legalizacja, błąd pomiaru, błędna identyfikacja. 99 zł.',
    metaDescription:
      'Odwołanie od mandatu z fotoradaru ITD/SM. Argumenty: legalizacja urządzenia, tolerancja pomiaru, identyfikacja kierowcy. AI generuje pismo w 60s.',
    keywords: [
      'odwołanie fotoradar',
      'mandat fotoradar ITD',
      'fotoradar straż miejska',
      'legalizacja fotoradaru',
    ],
    caseTypes: ['M5_mandat_straz_fotoradar', 'M6_mandat_itd'],
    intro:
      'Mandat z fotoradaru można skutecznie zakwestionować. Najczęstsze argumenty: brak aktualnej legalizacji urządzenia, niewłaściwa tolerancja pomiaru, błędna identyfikacja pojazdu (ANPR), brak kompetencji organu (SM od 2016).',
    podstawyPrawne: [
      'art. 92a KW',
      'Prawo o miarach',
      'Rozporządzenie MSWiA fotoradary',
      'art. 129a PoRD',
    ],
    faq: [
      {
        q: 'Czy straż miejska może wystawić mandat z fotoradaru mobilnego?',
        a: 'Od 1 stycznia 2016 r. straż miejska/gminna utraciła uprawnienia do obsługi fotoradarów mobilnych (po nowelizacji ustawy o strażach gminnych). Każdy mandat SM/SG z fotoradaru mobilnego po tej dacie jest nieważny — można go uchylić w trybie art. 101 KPSW.',
      },
      {
        q: 'Co to jest legalizacja urządzenia pomiarowego?',
        a: 'Każdy fotoradar musi posiadać aktualne świadectwo legalizacji (Prawo o miarach). Legalizacja jest ważna 13 miesięcy. Brak aktualnej legalizacji = pomiar pozbawiony mocy dowodowej.',
      },
    ],
  },
  {
    slug: 'parking',
    title: 'Opłata parkingowa — reklamacja SPP, ZDM | Mandatomat',
    h1: 'Reklamacja opłaty dodatkowej za parkowanie',
    description:
      'Reklamacja opłaty SPP, ZDM, opłat za parkowanie. AI generuje pismo z argumentami: ANPR błąd identyfikacji, brak oznakowania, przedawnienie 1 rok.',
    metaDescription:
      'Reklamacja opłaty parkingowej SPP/ZDM/ZTM. Argumenty: błąd ANPR, brak oznakowania, przedawnienie. AI 99 zł.',
    keywords: [
      'reklamacja SPP',
      'opłata dodatkowa parking',
      'ZDM odwołanie',
      'ANPR błąd',
    ],
    caseTypes: [
      'P1_parking_spp',
      'P2_parking_zdm',
      'P3_parking_ztm',
      'P4_parking_blad_identyfikacji',
    ],
    intro:
      'Opłata dodatkowa za parkowanie w SPP/ZDM przedawnia się po roku (art. 40d ust. 3 ustawy o drogach publicznych). Najczęstsze podstawy reklamacji: błąd identyfikacji ANPR, niewłaściwe oznakowanie, brak działania parkomatu.',
    podstawyPrawne: [
      'art. 13b ustawy o drogach publicznych',
      'art. 40d ust. 3 ustawy o drogach publicznych',
      'KPA art. 7-8',
    ],
    faq: [
      {
        q: 'Po jakim czasie przedawnia się opłata SPP?',
        a: 'Opłata dodatkowa za parkowanie w SPP przedawnia się po 1 roku od dnia jej naliczenia (art. 40d ust. 3 ustawy o drogach publicznych z 21.03.1985 r.). Po tym terminie zarządca drogi nie może egzekwować należności.',
      },
    ],
  },
  {
    slug: 'komunikacja',
    title: 'Mandat ZTM/MPK — odwołanie od opłaty za jazdę bez biletu',
    h1: 'Odwołanie od opłaty ZTM/MPK',
    description:
      'Otrzymałeś mandat za jazdę bez biletu? AI generuje odwołanie z argumentami: błąd kontrolera, awaria automatu, problem z aplikacją.',
    metaDescription:
      'Odwołanie ZTM/MPK za jazdę bez biletu. Argumenty: awaria automatu, błąd aplikacji, błąd kontrolera. AI 99 zł.',
    keywords: ['odwołanie ZTM', 'mandat MPK', 'jazda bez biletu odwołanie'],
    caseTypes: ['P3_parking_ztm'],
    intro:
      'Opłata dodatkowa ZTM/MPK to roszczenie cywilnoprawne (KC), nie mandat karny. Można ją skutecznie reklamować, jeśli istniała awaria infrastruktury, problem techniczny aplikacji lub błąd po stronie kontrolera.',
    podstawyPrawne: [
      'art. 33a ust. 3 ustawy o transporcie zbiorowym',
      'art. 354 KC',
      'KC art. 471',
    ],
    faq: [
      {
        q: 'Po jakim czasie przedawnia się opłata ZTM?',
        a: 'Opłata ZTM/MPK to roszczenie z tytułu przewozu — przedawnia się po 1 roku zgodnie z art. 778 KC (umowa przewozu).',
      },
    ],
  },
  {
    slug: 'itd',
    title: 'Odwołanie ITD — kara z Inspekcji Transportu Drogowego',
    h1: 'Odwołanie od kary ITD',
    description:
      'Kara z ITD (transport drogowy)? AI generuje odwołanie zgodnie z art. 127 KPA, terminy, argumenty merytoryczne.',
    metaDescription:
      'Odwołanie od kary ITD. Termin 14 dni, art. 127 KPA. AI generuje pismo z argumentacją w 60s.',
    keywords: ['odwołanie ITD', 'kara ITD', 'art. 127 KPA', 'transport drogowy'],
    caseTypes: ['M6_mandat_itd'],
    intro:
      'Decyzja ITD podlega odwołaniu w trybie art. 127 KPA — termin 14 dni od doręczenia. Najczęstsze argumenty: błąd w stanie faktycznym, niewłaściwa kwalifikacja, naruszenie KPA art. 7-9 (zasady postępowania).',
    podstawyPrawne: ['art. 127 KPA', 'art. 128 KPA', 'art. 7-9 KPA', 'ustawa o transporcie drogowym'],
    faq: [
      {
        q: 'Ile mam czasu na odwołanie od decyzji ITD?',
        a: '14 dni od dnia doręczenia decyzji (art. 129 § 2 KPA). Odwołanie wnosi się za pośrednictwem organu I instancji do GITD.',
      },
    ],
  },
  {
    slug: 'etoll',
    title: 'e-TOLL — odwołanie od kary, reklamacja, anulowanie',
    h1: 'Odwołanie od kary e-TOLL',
    description:
      'Kara e-TOLL od GITD? AI generuje odwołanie, reklamację podwójnego naliczenia lub wniosek o umorzenie. Podstawy: ustawa o autostradach, KPA.',
    metaDescription:
      'e-TOLL: odwołanie od kary GITD, reklamacja podwójnego naliczenia, wniosek o umorzenie. AI 99 zł.',
    keywords: ['odwołanie e-TOLL', 'kara e-TOLL', 'GITD e-TOLL', 'reklamacja e-TOLL'],
    caseTypes: [
      'E1_etoll_odwolanie_kara',
      'E2_etoll_reklamacja_podwojne',
      'E3_etoll_anulowanie',
    ],
    intro:
      'Kara administracyjna e-TOLL przedawnia się po 5 latach (art. 13k ustawy o autostradach). Najczęstsze problemy: podwójne naliczenie, awaria OBU/aplikacji, błędna klasyfikacja pojazdu, brak winy użytkownika.',
    podstawyPrawne: [
      'art. 13k ustawy o autostradach płatnych',
      'art. 13l ustawy o autostradach',
      'art. 127 KPA',
    ],
    faq: [
      {
        q: 'Ile mam czasu na odwołanie od kary e-TOLL?',
        a: '14 dni od dnia doręczenia decyzji GITD (art. 129 § 2 KPA). Odwołanie wnosi się za pośrednictwem GITD do Ministra Infrastruktury.',
      },
    ],
  },
  {
    slug: 'ubezpieczenia',
    title: 'Ubezpieczenia — odwołanie od decyzji OC/AC/NNW',
    h1: 'Odwołanie od decyzji ubezpieczyciela',
    description:
      'Ubezpieczyciel zaniżył odszkodowanie lub odmówił wypłaty? AI generuje odwołanie i wezwanie do zapłaty zgodnie z art. 481 KC.',
    metaDescription:
      'Odwołanie od decyzji OC/AC/NNW: zaniżone odszkodowanie, odmowa wypłaty. Wezwanie do zapłaty + skarga RF. AI 99 zł.',
    keywords: [
      'odwołanie ubezpieczenie',
      'OC zaniżone odszkodowanie',
      'wezwanie wypłata OC',
      'Rzecznik Finansowy',
    ],
    caseTypes: [
      'U1_ubezp_odwolanie_decyzja',
      'U2_ubezp_wezwanie_wyplata',
      'U3_ubezp_skarga_rf',
    ],
    intro:
      'Roszczenia z OC przedawniają się po 3 latach od dowiedzenia się o szkodzie (art. 442¹ § 1 KC), a w przypadku przestępstwa — 20 lat. Możesz odwołać się od decyzji ubezpieczyciela, wezwać do wypłaty z odsetkami (art. 481 KC) lub złożyć skargę do Rzecznika Finansowego.',
    podstawyPrawne: [
      'art. 442¹ KC',
      'art. 481 KC',
      'art. 805 KC',
      'ustawa o działalności ubezpieczeniowej',
    ],
    faq: [
      {
        q: 'Po jakim czasie przedawnia się roszczenie z OC?',
        a: '3 lata od dnia, w którym poszkodowany dowiedział się o szkodzie i osobie obowiązanej do jej naprawienia (art. 442¹ § 1 KC). Maksymalnie 10 lat od zdarzenia. Jeśli szkoda wynikła z przestępstwa — 20 lat.',
      },
    ],
  },
  {
    slug: 'punkty-karne',
    title: 'Punkty karne — korekta CEPiK, weryfikacja',
    h1: 'Korekta punktów karnych w CEPiK',
    description:
      'Błędne punkty karne w CEPiK? AI generuje wniosek o korektę, weryfikację urządzenia pomiarowego lub cofnięcie zatrzymania prawa jazdy.',
    metaDescription:
      'Korekta punktów karnych CEPiK, weryfikacja fotoradaru, cofnięcie decyzji o cofnięciu uprawnień. AI 99 zł.',
    keywords: [
      'korekta punktów karnych',
      'CEPiK punkty',
      'cofnięcie prawa jazdy',
      'weryfikacja fotoradar',
    ],
    caseTypes: [
      'K1_kontrola_zatrzymanie_pj',
      'K2_kontrola_cofniecie_cepik',
      'K3_kontrola_weryfikacja_urzadzenia',
      'K4_kontrola_korekta_punktow',
    ],
    intro:
      'Punkty karne wpisywane do CEPiK wygasają po roku od daty wpisu. Możesz wnieść o ich korektę, weryfikację urządzenia pomiarowego (fotoradar/wideorejestrator) lub cofnięcie decyzji o cofnięciu uprawnień.',
    podstawyPrawne: [
      'art. 98 ustawy o kierujących pojazdami',
      'art. 102 ustawy o kierujących',
      'KPA art. 154-155',
    ],
    faq: [
      {
        q: 'Kiedy wygasają punkty karne?',
        a: 'Punkty karne wygasają z mocy prawa po upływie 1 roku od daty wpisu do CEPiK (art. 98 ust. 5 ustawy o kierujących pojazdami z 5.01.2011 r.).',
      },
    ],
  },
  {
    slug: 'windykacja',
    title: 'Windykacja — przedawnienie, sprzeciw EPU, KRD/BIK',
    h1: 'Obrona przed windykacją',
    description:
      'Wezwanie do zapłaty, nakaz EPU, wpis KRD/BIK? AI generuje sprzeciw z zarzutem przedawnienia (3 lata), wniosek o usunięcie wpisu, skargę do RF.',
    metaDescription:
      'Windykacja: zarzut przedawnienia (3/6 lat), sprzeciw EPU Lublin, usunięcie wpisu KRD/BIK, skarga RF. AI 99 zł.',
    keywords: [
      'przedawnienie windykacja',
      'sprzeciw EPU',
      'usunięcie KRD',
      'BIK wpis',
      'art. 118 KC',
    ],
    caseTypes: [
      'W1_windykacja_przedawnienie',
      'W2_windykacja_odpowiedz',
      'W3_windykacja_sprzeciw_epu',
      'W4_windykacja_krd_bik',
      'W5_windykacja_skarga_rf',
    ],
    intro:
      'Roszczenia z działalności gospodarczej (banki, telekom, abonament) przedawniają się po 3 latach (art. 118 KC). Pozostałe — 6 lat. AI generuje pismo z zarzutem przedawnienia, sprzeciw od nakazu EPU (Lublin-Zachód), wniosek o usunięcie wpisu z KRD/BIK/ERIF.',
    podstawyPrawne: [
      'art. 118 KC',
      'art. 123 KC',
      'art. 125 § 1 KC',
      'art. 502 KPC (EPU)',
      'art. 14 ustawy o BIG',
    ],
    faq: [
      {
        q: 'Po jakim czasie przedawnia się dług w banku?',
        a: 'Roszczenia banku z umowy kredytu/pożyczki (działalność gospodarcza) — 3 lata (art. 118 KC). Po prawomocnym wyroku — 6 lat (art. 125 § 1 KC).',
      },
      {
        q: 'Ile mam czasu na sprzeciw od nakazu EPU?',
        a: '14 dni od dnia doręczenia nakazu zapłaty wydanego w elektronicznym postępowaniu upominawczym (art. 502 § 1 KPC). Sprzeciw składa się w sądzie wskazanym w pouczeniu (najczęściej sąd właściwości ogólnej pozwanego).',
      },
    ],
  },
] as const

/**
 * 17 long-tail SEO landing pages — wąskie zapytania o wysokim intent.
 */
export interface LongTailDef {
  slug: string
  title: string
  h1: string
  description: string
  metaDescription: string
  keywords: string[]
  /** Mapowanie do CategoryDef.slug — breadcrumb + cross-link */
  parentCategory: string
  /** Konkretny CaseType wskazywany jako CTA */
  primaryCaseType: CaseType
  intro: string
  /** Krótki guide / kroki postępowania */
  steps: Array<{ title: string; content: string }>
  faq: Array<{ q: string; a: string }>
}

export const LONG_TAIL: readonly LongTailDef[] = [
  {
    slug: 'mandat-przekroczenie-predkosci-50-km-h',
    title: 'Mandat za przekroczenie prędkości o 50 km/h — co robić?',
    h1: 'Mandat za przekroczenie prędkości o 50 km/h w terenie zabudowanym',
    description:
      'Przekroczenie 50 km/h = utrata prawa jazdy na 3 miesiące. Sprawdź jak skutecznie się odwołać.',
    metaDescription:
      'Przekroczenie 50 km/h: zatrzymanie prawa jazdy na 3 miesiące (art. 102 ustawy o kierujących). Argumenty obronne, weryfikacja fotoradaru.',
    keywords: ['przekroczenie 50 km/h', 'zatrzymanie prawa jazdy', 'art. 102 ustawy'],
    parentCategory: 'mandaty-karne',
    primaryCaseType: 'K1_kontrola_zatrzymanie_pj',
    intro:
      'Przekroczenie dozwolonej prędkości o ponad 50 km/h w terenie zabudowanym skutkuje zatrzymaniem prawa jazdy na 3 miesiące (art. 102 ust. 1 pkt 4 ustawy o kierujących pojazdami). Odwołanie ma 14 dni — można skutecznie zakwestionować pomiar.',
    steps: [
      {
        title: 'Krok 1 — Sprawdź legalizację urządzenia',
        content:
          'Każdy fotoradar/wideorejestrator musi mieć aktualne świadectwo legalizacji (Prawo o miarach, ważne 13 miesięcy). Brak — pomiar bezskuteczny.',
      },
      {
        title: 'Krok 2 — Zażądaj nagrania pomiaru',
        content:
          'Zgodnie z KPA art. 73 masz prawo wglądu do akt sprawy. Zażądaj nagrania, świadectwa legalizacji i dziennika urządzenia.',
      },
      {
        title: 'Krok 3 — Wnieś sprzeciw od zatrzymania',
        content:
          'Termin: 14 dni od doręczenia. Tryb: art. 127 KPA. AI Mandatomat wygeneruje pismo w 60s.',
      },
    ],
    faq: [
      {
        q: 'Czy 50 km/h to zawsze 3 miesiące zatrzymania?',
        a: 'Tak, jeśli przekroczenie nastąpiło w obszarze zabudowanym. Poza obszarem zabudowanym — zatrzymanie tylko gdy przekroczenie ≥ 50 km/h prowadzi do innych skutków (art. 102 ustawy o kierujących).',
      },
    ],
  },
  {
    slug: 'mandat-fotoradar-przedawnienie',
    title: 'Mandat z fotoradaru — przedawnienie i jak go uchylić',
    h1: 'Mandat z fotoradaru — przedawnienie po 1 roku',
    description:
      'Mandat z fotoradaru przedawnia się po 1 roku od popełnienia czynu (art. 45 KW). Sprawdź czy Twój już wygasł.',
    metaDescription:
      'Przedawnienie mandatu z fotoradaru: 1 rok (art. 45 § 1 KW). Wniosek o uchylenie po prawomocności (art. 101 KPSW).',
    keywords: ['przedawnienie fotoradar', 'art. 45 KW', 'art. 101 KPSW'],
    parentCategory: 'fotoradary',
    primaryCaseType: 'M3_mandat_uchylenie',
    intro:
      'Karalność wykroczenia drogowego ustaje po 1 roku od popełnienia czynu (art. 45 § 1 KW). Wykonanie prawomocnej kary — 3 lata (art. 45 § 3 KW). Jeśli mandat się przedawnił, możesz wnieść o jego uchylenie.',
    steps: [
      {
        title: 'Krok 1 — Sprawdź datę czynu',
        content:
          'Data czynu = dzień popełnienia wykroczenia (z fotoradaru). Nie data doręczenia mandatu.',
      },
      {
        title: 'Krok 2 — Skorzystaj z kalkulatora',
        content:
          'Nasz kalkulator przedawnienia w 10 sekund powie Ci czy roszczenie wygasło.',
      },
      {
        title: 'Krok 3 — Wniosek o uchylenie',
        content:
          'Jeśli przedawnione — wniosek z art. 101 KPSW do sądu rejonowego. AI wygeneruje gotowe pismo.',
      },
    ],
    faq: [
      {
        q: 'Czy ścigane wykroczenie przedłuża okres przedawnienia?',
        a: 'Tak. Jeżeli w okresie roku wszczęto postępowanie, karalność ustaje po upływie 2 lat od końca okresu (art. 45 § 1 zd. 2 KW).',
      },
    ],
  },
  {
    slug: 'odmowa-przyjecia-mandatu',
    title: 'Odmowa przyjęcia mandatu — kiedy i jak?',
    h1: 'Odmowa przyjęcia mandatu karnego',
    description:
      'Masz prawo odmówić przyjęcia mandatu (art. 97 § 2 KPSW). Sprawa trafi wtedy do sądu — szanse są często wyższe.',
    metaDescription:
      'Odmowa przyjęcia mandatu karnego: art. 97 § 2 KPSW. Konsekwencje, terminy, AI generuje wniosek.',
    keywords: ['odmowa mandatu', 'art. 97 § 2 KPSW', 'sąd grodzki'],
    parentCategory: 'mandaty-karne',
    primaryCaseType: 'M2_mandat_odmowa_przyjecia',
    intro:
      'Zgodnie z art. 97 § 2 KPSW możesz odmówić przyjęcia mandatu — sprawa trafi wtedy do sądu rejonowego. To często skuteczniejsze niż odwołanie po podpisaniu, bo sąd bada sprawę od początku.',
    steps: [
      {
        title: 'Krok 1 — Odmów na miejscu',
        content:
          'Funkcjonariusz sporządzi notatkę. Nie podpisuj mandatu.',
      },
      {
        title: 'Krok 2 — Czekaj na wniosek o ukaranie',
        content:
          'Policja/SM skieruje wniosek o ukaranie do sądu rejonowego. Otrzymasz wezwanie.',
      },
      {
        title: 'Krok 3 — Przygotuj obronę',
        content:
          'AI Mandatomat generuje pismo procesowe z argumentacją merytoryczną.',
      },
    ],
    faq: [
      {
        q: 'Czy odmowa przyjęcia mandatu jest karalna?',
        a: 'Nie. To Twoje prawo (art. 97 § 2 KPSW). Funkcjonariusz nie może wymuszać przyjęcia.',
      },
    ],
  },
  {
    slug: 'mandat-straz-miejska-fotoradar-mobilny',
    title: 'Mandat SM z fotoradaru mobilnego — nieważny od 2016',
    h1: 'Mandat straży miejskiej z fotoradaru mobilnego',
    description:
      'Od 1.01.2016 straż miejska/gminna nie ma uprawnień do fotoradarów mobilnych. Mandat = nieważny.',
    metaDescription:
      'Mandat SM/SG z fotoradaru mobilnego po 1.01.2016 jest nieważny. Wniosek o uchylenie z art. 101 KPSW.',
    keywords: [
      'straż miejska fotoradar',
      'fotoradar mobilny SM',
      'nowelizacja 2016 fotoradary',
    ],
    parentCategory: 'fotoradary',
    primaryCaseType: 'M5_mandat_straz_fotoradar',
    intro:
      'Po nowelizacji ustawy o strażach gminnych (1.01.2016) straż miejska/gminna utraciła uprawnienia do obsługi fotoradarów mobilnych. Każdy mandat SM/SG z mobilnego fotoradaru po tej dacie jest dotknięty wadą braku kompetencji organu.',
    steps: [
      {
        title: 'Krok 1 — Ustal typ urządzenia',
        content:
          'Mobilny (przenośny/w pojeździe) czy stacjonarny (zainstalowany na słupie). SM ma kompetencje TYLKO do stacjonarnych.',
      },
      {
        title: 'Krok 2 — Wniosek o uchylenie',
        content:
          'Tryb: art. 101 KPSW. Argument: brak kompetencji organu (vice § 5 art. 129 PoRD a contrario).',
      },
    ],
    faq: [
      {
        q: 'Skąd mam wiedzieć, że to fotoradar mobilny?',
        a: 'W zawiadomieniu o wykroczeniu wpisany jest typ urządzenia. Mobilny: w samochodzie/ na statywie. Stacjonarny: zamocowany na słupie.',
      },
    ],
  },
  {
    slug: 'oplata-spp-przedawnienie-rok',
    title: 'Opłata dodatkowa SPP — przedawnia się po 1 roku',
    h1: 'Przedawnienie opłaty dodatkowej SPP — 1 rok',
    description:
      'Opłata SPP przedawnia się po 1 roku (art. 40d ust. 3 ustawy o drogach publicznych). Reklamacja gotowa od ręki.',
    metaDescription:
      'Opłata dodatkowa SPP — przedawnienie po 1 roku (art. 40d ust. 3 ustawy o drogach publicznych). Wzór reklamacji AI.',
    keywords: ['SPP przedawnienie', 'art. 40d ustawy o drogach', 'reklamacja SPP'],
    parentCategory: 'parking',
    primaryCaseType: 'P1_parking_spp',
    intro:
      'Opłata dodatkowa za nieuiszczenie opłaty parkingowej w SPP przedawnia się po 1 roku od dnia jej naliczenia (art. 40d ust. 3 ustawy o drogach publicznych z 21.03.1985 r.). Po tym terminie nie podlega egzekucji.',
    steps: [
      {
        title: 'Krok 1 — Ustal datę naliczenia',
        content:
          'Data wystawienia wezwania do zapłaty / data zostawienia kartki za wycieraczką.',
      },
      {
        title: 'Krok 2 — Sprawdź kalkulatorem',
        content:
          'Wpisz datę i wybierz „SPP — 1 rok" — kalkulator pokaże czy się przedawniło.',
      },
      {
        title: 'Krok 3 — Reklamacja z zarzutem przedawnienia',
        content:
          'AI generuje pismo do zarządcy drogi z powołaniem art. 40d ust. 3.',
      },
    ],
    faq: [
      {
        q: 'Czy bieg może być przerwany?',
        a: 'Tak — przez wezwanie do zapłaty z należytym uznaniem długu (art. 123 KC stosowany odpowiednio). Każdorazowo bieg liczy się od nowa.',
      },
    ],
  },
  {
    slug: 'sprzeciw-od-nakazu-zaplaty-epu-lublin',
    title: 'Sprzeciw od nakazu EPU — Lublin-Zachód, 14 dni',
    h1: 'Sprzeciw od nakazu zapłaty w EPU',
    description:
      'Otrzymałeś nakaz zapłaty z Sądu Rejonowego Lublin-Zachód? Masz 14 dni na sprzeciw. AI generuje pismo z zarzutem przedawnienia.',
    metaDescription:
      'Sprzeciw od nakazu EPU (Lublin-Zachód): 14 dni, art. 502 KPC. Zarzut przedawnienia (3/6 lat). AI 99 zł.',
    keywords: [
      'sprzeciw EPU',
      'nakaz zapłaty Lublin-Zachód',
      'art. 502 KPC',
      'e-sąd',
    ],
    parentCategory: 'windykacja',
    primaryCaseType: 'W3_windykacja_sprzeciw_epu',
    intro:
      'Elektroniczne postępowanie upominawcze (EPU) prowadzi Sąd Rejonowy Lublin-Zachód. Termin sprzeciwu — 14 dni od doręczenia nakazu (art. 502 § 1 KPC). Brak sprzeciwu = nakaz prawomocny i tytuł egzekucyjny.',
    steps: [
      {
        title: 'Krok 1 — Sprawdź datę doręczenia',
        content: 'Liczy się dzień rzeczywistego odbioru pisma, nie awizo.',
      },
      {
        title: 'Krok 2 — Zarzut przedawnienia',
        content:
          'Najczęściej skuteczny: roszczenia z działalności (3 lata) lub po wyroku (6 lat).',
      },
      {
        title: 'Krok 3 — Wniesienie sprzeciwu',
        content:
          'Sprzeciw można złożyć papierowo lub przez Portal Informacyjny Sądów. Po sprzeciwie sprawa trafia do sądu właściwości ogólnej pozwanego.',
      },
    ],
    faq: [
      {
        q: 'Co jeśli nie odebrałem nakazu?',
        a: 'Jeśli nakaz nie został skutecznie doręczony (np. zwrot z powodu „adresat nieznany"), termin nie biegnie. Można żądać przywrócenia terminu (art. 168 KPC).',
      },
    ],
  },
  {
    slug: 'usuniecie-wpisu-krd-bik',
    title: 'Usunięcie wpisu z KRD/BIK — wniosek po przedawnieniu',
    h1: 'Wniosek o usunięcie wpisu z KRD, BIK, ERIF',
    description:
      'Negatywny wpis w KRD/BIK po przedawnionym długu? Masz prawo żądać usunięcia (art. 14 ustawy o BIG, RODO art. 17).',
    metaDescription:
      'Usunięcie wpisu KRD/BIK/ERIF: art. 14 ustawy o BIG, art. 17 RODO (prawo do bycia zapomnianym). AI generuje wniosek.',
    keywords: [
      'usunięcie KRD',
      'BIK wpis usunąć',
      'ERIF wpis',
      'art. 14 BIG',
      'RODO art. 17',
    ],
    parentCategory: 'windykacja',
    primaryCaseType: 'W4_windykacja_krd_bik',
    intro:
      'Po przedawnieniu długu możesz żądać usunięcia wpisu z KRD/BIK/ERIF na podstawie art. 14 ustawy o udostępnianiu informacji gospodarczych oraz art. 17 RODO (prawo do bycia zapomnianym). Termin rozpatrzenia: 30 dni.',
    steps: [
      {
        title: 'Krok 1 — Ustal podstawę usunięcia',
        content:
          'Najczęściej: przedawnienie roszczenia, spłata długu, błędne dane.',
      },
      {
        title: 'Krok 2 — Wniosek do biura informacji gospodarczej',
        content:
          'Pismo z art. 14 ustawy o BIG + art. 17 RODO. AI generuje gotowy wzór.',
      },
      {
        title: 'Krok 3 — Skarga do PUODO przy odmowie',
        content:
          'Jeśli BIG odmówi — skarga do Prezesa Urzędu Ochrony Danych Osobowych.',
      },
    ],
    faq: [
      {
        q: 'Ile trwa usunięcie wpisu?',
        a: 'BIG ma 30 dni na odpowiedź. Po pozytywnym rozpatrzeniu — usunięcie niezwłocznie.',
      },
    ],
  },
  {
    slug: 'odwolanie-od-decyzji-oc-zanizenie',
    title: 'Odwołanie od decyzji OC — zaniżone odszkodowanie',
    h1: 'Odwołanie od decyzji OC — zaniżenie kosztów naprawy',
    description:
      'Ubezpieczyciel zaniżył kosztorys? AI generuje odwołanie z odsetkami (art. 481 KC) i wezwanie do zapłaty.',
    metaDescription:
      'Zaniżone OC: odwołanie + wezwanie do zapłaty z odsetkami (art. 481 KC). AI 99 zł.',
    keywords: [
      'zaniżone OC',
      'odwołanie ubezpieczenie',
      'kosztorys OC',
      'art. 481 KC',
    ],
    parentCategory: 'ubezpieczenia',
    primaryCaseType: 'U1_ubezp_odwolanie_decyzja',
    intro:
      'Zaniżenie kosztorysu naprawy to najczęstsza praktyka ubezpieczycieli OC. Możesz odwołać się od decyzji w terminie 30 dni i zażądać dopłaty wraz z odsetkami ustawowymi za opóźnienie (art. 481 KC).',
    steps: [
      {
        title: 'Krok 1 — Zlecenie niezależnego kosztorysu',
        content: 'Rzeczoznawca samochodowy SIMP/PZRiM — koszt 200-500 zł.',
      },
      {
        title: 'Krok 2 — Odwołanie z różnicą + odsetki',
        content:
          'AI generuje pismo z konkretną kwotą dopłaty i wyliczeniem odsetek (art. 481 KC).',
      },
      {
        title: 'Krok 3 — Skarga do RF przy odmowie',
        content:
          'Rzecznik Finansowy bezpłatnie weryfikuje sprawę i przedstawia stanowisko.',
      },
    ],
    faq: [
      {
        q: 'Ile dni ma ubezpieczyciel na odpowiedź?',
        a: '30 dni od dnia otrzymania zawiadomienia o szkodzie (art. 14 ustawy o ubezpieczeniach obowiązkowych). Po tym terminie — odsetki.',
      },
    ],
  },
  {
    slug: 'kara-etoll-podwojne-naliczenie',
    title: 'Podwójne naliczenie e-TOLL — reklamacja',
    h1: 'Reklamacja podwójnego naliczenia e-TOLL',
    description:
      'Naliczono Ci dwukrotnie tę samą opłatę e-TOLL? Reklamacja z powołaniem na regulamin systemu i KC.',
    metaDescription:
      'Podwójne naliczenie e-TOLL: reklamacja w 14 dni, zwrot z odsetkami. AI 99 zł.',
    keywords: [
      'e-TOLL podwójne naliczenie',
      'reklamacja e-TOLL',
      'OBU awaria',
    ],
    parentCategory: 'etoll',
    primaryCaseType: 'E2_etoll_reklamacja_podwojne',
    intro:
      'Podwójne naliczenie opłaty e-TOLL może wynikać z awarii OBU (urządzenia pokładowego), aplikacji ETOLL Pay lub błędu systemu. Reklamację składa się w terminie 14 dni od dnia obciążenia.',
    steps: [
      {
        title: 'Krok 1 — Zbierz dowody',
        content:
          'Wyciąg z konta e-TOLL, rachunki, screen z aplikacji, logi OBU.',
      },
      {
        title: 'Krok 2 — Reklamacja do GITD',
        content:
          'AI generuje pismo z konkretną kwotą do zwrotu i powołaniem na regulamin systemu.',
      },
    ],
    faq: [
      {
        q: 'Ile czasu na reklamację e-TOLL?',
        a: '14 dni od dnia obciążenia. Po tym terminie — droga sądowa cywilna (art. 405 KC — bezpodstawne wzbogacenie).',
      },
    ],
  },
  {
    slug: 'cofniecie-prawa-jazdy-cepik',
    title: 'Cofnięcie decyzji o cofnięciu uprawnień — CEPiK',
    h1: 'Wniosek o cofnięcie decyzji o cofnięciu prawa jazdy',
    description:
      'Decyzja starosty o cofnięciu uprawnień może być wzruszona w trybie art. 154 KPA przy zmianie okoliczności.',
    metaDescription:
      'Cofnięcie decyzji o cofnięciu prawa jazdy: art. 154 KPA, CEPiK, szkolenie. AI 99 zł.',
    keywords: ['cofnięcie prawa jazdy', 'CEPiK uprawnienia', 'art. 154 KPA'],
    parentCategory: 'punkty-karne',
    primaryCaseType: 'K2_kontrola_cofniecie_cepik',
    intro:
      'Decyzja starosty o cofnięciu uprawnień (np. po przekroczeniu 24 punktów karnych) może być wzruszona w trybie art. 154 KPA, jeśli przemawia za tym interes społeczny lub ważny interes strony, a brak po stronie organu.',
    steps: [
      {
        title: 'Krok 1 — Ukończ szkolenie',
        content:
          'Szkolenie + egzamin teoretyczny w WORD — warunek przywrócenia.',
      },
      {
        title: 'Krok 2 — Wniosek z art. 154 KPA',
        content:
          'AI generuje uzasadniony wniosek o uchylenie decyzji.',
      },
    ],
    faq: [
      {
        q: 'Po jakim czasie mogę zdawać egzamin?',
        a: 'Po upływie okresu zatrzymania (3 mies. lub 1 rok zależnie od podstawy) i ukończeniu szkolenia w WORD.',
      },
    ],
  },
  {
    slug: 'pelnomocnictwo-procesowe-wzor',
    title: 'Pełnomocnictwo procesowe — wzór, opłata 17 zł',
    h1: 'Pełnomocnictwo procesowe — generator wzoru',
    description:
      'Generator pełnomocnictwa procesowego do reprezentacji w sądzie/urzędzie. Z opłatą skarbową 17 zł i klauzulami.',
    metaDescription:
      'Pełnomocnictwo procesowe: generator wzoru, opłata skarbowa 17 zł, art. 87 KPC. AI 99 zł.',
    keywords: ['pełnomocnictwo procesowe', 'wzór pełnomocnictwa', 'art. 87 KPC', 'opłata 17 zł'],
    parentCategory: 'mandaty-karne',
    primaryCaseType: 'T1_techn_pelnomocnictwo',
    intro:
      'Pełnomocnictwo procesowe (art. 87 KPC) upoważnia adwokata, radcę prawnego lub osobę bliską do reprezentacji w postępowaniu. Wymaga opłaty skarbowej 17 zł (ust. 1 pkt 1 lit. b załącznika do ustawy o opłacie skarbowej).',
    steps: [
      {
        title: 'Krok 1 — Wybierz zakres',
        content: 'Procesowe ogólne, do konkretnej sprawy, materialne.',
      },
      {
        title: 'Krok 2 — Opłata skarbowa',
        content: '17 zł na konto urzędu miasta/gminy właściwego dla mocodawcy.',
      },
    ],
    faq: [
      {
        q: 'Czy pełnomocnictwo wymaga formy notarialnej?',
        a: 'Nie. Forma pisemna wystarczająca dla większości spraw. Forma notarialna wymagana tylko dla pełnomocnictwa do czynności prawnej, dla której prawo zastrzega tę formę (np. zbycie nieruchomości).',
      },
    ],
  },
  {
    slug: 'rodo-wniosek-o-dostep-art-15',
    title: 'Wniosek RODO o dostęp do danych — art. 15',
    h1: 'Wniosek RODO o dostęp do danych osobowych',
    description:
      'Generator wniosku RODO o dostęp (art. 15 RODO) — administrator ma 30 dni na odpowiedź.',
    metaDescription:
      'Wniosek RODO art. 15 — dostęp do danych osobowych. Termin 30 dni, bezpłatny. AI 99 zł.',
    keywords: ['RODO art. 15', 'wniosek o dostęp', 'GDPR access request'],
    parentCategory: 'windykacja',
    primaryCaseType: 'T2_techn_rodo_dostep',
    intro:
      'Art. 15 RODO daje Ci prawo do uzyskania od administratora pełnej kopii Twoich danych osobowych, źródła ich pozyskania i odbiorców. Termin: 30 dni (art. 12 ust. 3 RODO), bezpłatnie.',
    steps: [
      {
        title: 'Krok 1 — Identyfikacja administratora',
        content:
          'Bank, telekom, windykator, ubezpieczyciel — każdy administrujący Twoimi danymi.',
      },
      {
        title: 'Krok 2 — Wniosek z art. 15',
        content:
          'AI generuje pismo z pełnym katalogiem żądań (cele, kategorie, odbiorcy, okres).',
      },
    ],
    faq: [
      {
        q: 'Co jeśli administrator nie odpowie?',
        a: 'Skarga do Prezesa UODO (art. 77 RODO) + odszkodowanie cywilne (art. 82 RODO).',
      },
    ],
  },
  {
    slug: 'rodo-wniosek-o-usuniecie-art-17',
    title: 'Wniosek RODO o usunięcie danych — art. 17',
    h1: 'Prawo do bycia zapomnianym — art. 17 RODO',
    description:
      'Generator wniosku RODO o usunięcie danych (right to be forgotten) — dla przedawnionych roszczeń, błędnych wpisów.',
    metaDescription:
      'Wniosek RODO art. 17 — usunięcie danych. Prawo do bycia zapomnianym. AI 99 zł.',
    keywords: ['RODO art. 17', 'prawo do bycia zapomnianym', 'usunięcie danych'],
    parentCategory: 'windykacja',
    primaryCaseType: 'T3_techn_rodo_usuniecie',
    intro:
      'Art. 17 RODO („prawo do bycia zapomnianym") umożliwia żądanie usunięcia danych m.in. gdy: cele przetwarzania ustały, brak podstawy prawnej, sprzeciw przeważa, dane przetwarzane niezgodnie z prawem.',
    steps: [
      {
        title: 'Krok 1 — Wybierz przesłankę',
        content: 'Najczęściej: przedawnienie, sprzeciw, ustanie celu.',
      },
      {
        title: 'Krok 2 — Wniosek do administratora',
        content: 'AI generuje pismo z konkretną przesłanką art. 17 ust. 1 RODO.',
      },
    ],
    faq: [
      {
        q: 'Czy administrator może odmówić?',
        a: 'Tak — w przypadkach z art. 17 ust. 3 RODO (np. obowiązek prawny, ustalenie roszczeń). W innych — musi usunąć w 30 dni.',
      },
    ],
  },
  {
    slug: 'odroczenie-mandatu-raty',
    title: 'Mandat — odroczenie terminu, raty (Ord. Pod.)',
    h1: 'Wniosek o odroczenie mandatu lub rozłożenie na raty',
    description:
      'Mandat ITD/skarbowy można rozłożyć na raty lub odroczyć termin (art. 67a Ordynacji podatkowej).',
    metaDescription:
      'Odroczenie mandatu / raty: art. 67a Ordynacji podatkowej. Ważny interes. AI 99 zł.',
    keywords: ['raty mandat', 'odroczenie mandatu', 'art. 67a Ord. pod.'],
    parentCategory: 'mandaty-karne',
    primaryCaseType: 'M7_mandat_odroczenie_raty',
    intro:
      'Mandaty stanowiące zobowiązanie podatkowe (m.in. ITD, niektóre kary administracyjne) podlegają Ordynacji podatkowej. Można wnioskować o odroczenie terminu, rozłożenie na raty lub umorzenie (art. 67a Ord. pod.).',
    steps: [
      {
        title: 'Krok 1 — Udokumentuj ważny interes',
        content:
          'Sytuacja finansowa, zobowiązania, dochody — wymagana ulga.',
      },
      {
        title: 'Krok 2 — Wniosek z art. 67a',
        content:
          'AI generuje wniosek z uzasadnieniem ekonomicznym i propozycją harmonogramu.',
      },
    ],
    faq: [
      {
        q: 'Czy ulga jest naliczana automatycznie?',
        a: 'Nie. Organ ocenia ważny interes podatnika lub interes publiczny — uzasadnij szczegółowo.',
      },
    ],
  },
  {
    slug: 'skarga-do-rzecznika-finansowego',
    title: 'Skarga do Rzecznika Finansowego — bezpłatna pomoc',
    h1: 'Skarga do Rzecznika Finansowego (RF)',
    description:
      'RF bezpłatnie weryfikuje spory z bankami, ubezpieczycielami, windykatorami. Skarga zatrzymuje przedawnienie.',
    metaDescription:
      'Skarga do Rzecznika Finansowego: bezpłatna, postępowanie polubowne. Zatrzymuje bieg przedawnienia. AI 99 zł.',
    keywords: ['Rzecznik Finansowy', 'skarga RF', 'pozasądowe rozstrzyganie'],
    parentCategory: 'ubezpieczenia',
    primaryCaseType: 'U3_ubezp_skarga_rf',
    intro:
      'Rzecznik Finansowy (RF) jest niezależnym organem rozpatrującym spory między klientami a podmiotami rynku finansowego. Skarga jest bezpłatna, a postępowanie zatrzymuje bieg przedawnienia (art. 36 ustawy o RF).',
    steps: [
      {
        title: 'Krok 1 — Wyczerp procedurę reklamacyjną',
        content: 'RF rozpatruje sprawy po odmowie/braku odpowiedzi w terminie.',
      },
      {
        title: 'Krok 2 — Skarga online lub pisemna',
        content: 'AI generuje pismo z opisem sporu i żądaniem.',
      },
    ],
    faq: [
      {
        q: 'Ile trwa postępowanie przed RF?',
        a: 'Typowo 2-4 miesiące. Przez ten czas roszczenie nie ulega przedawnieniu.',
      },
    ],
  },
  {
    slug: 'lista-zalacznikow-do-pisma',
    title: 'Lista załączników — generator profesjonalny',
    h1: 'Generator listy załączników do pisma sądowego/urzędowego',
    description:
      'Profesjonalna lista załączników z numeracją, opisem, zaleceniami formatu (oryginał/kopia).',
    metaDescription:
      'Lista załączników: numeracja, opis, format. Wymagana art. 126 § 1 pkt 5 KPC. AI 99 zł.',
    keywords: ['lista załączników', 'art. 126 KPC', 'wzór załączników'],
    parentCategory: 'mandaty-karne',
    primaryCaseType: 'T4_techn_lista_zalacznikow',
    intro:
      'Każde pismo procesowe powinno wymieniać załączniki (art. 126 § 1 pkt 5 KPC). AI generuje profesjonalną listę z numeracją, opisem i zaleceniami formatu (oryginał/kopia/ePUAP).',
    steps: [
      {
        title: 'Krok 1 — Wymień dokumenty',
        content: 'Decyzja, fotografie, kosztorys, świadectwa, korespondencja.',
      },
      {
        title: 'Krok 2 — Generator',
        content: 'AI dobiera kolejność, opisy i wskazuje co kopia/oryginał.',
      },
    ],
    faq: [
      {
        q: 'Czy załączniki muszą być w formie oryginałów?',
        a: 'Zależnie od pisma — w postępowaniu KPA wystarczą uwierzytelnione kopie (art. 76a KPA). W KPC — oryginały lub odpisy notarialne.',
      },
    ],
  },
  {
    slug: 'reklamacja-zdm-warszawa',
    title: 'Reklamacja opłaty ZDM Warszawa — wzór',
    h1: 'Reklamacja opłaty dodatkowej ZDM Warszawa',
    description:
      'Wezwanie do zapłaty z ZDM Warszawa? Generator reklamacji z argumentami: ANPR, oznakowanie, wadliwy parkomat.',
    metaDescription:
      'Reklamacja ZDM Warszawa: ANPR, oznakowanie, parkomat. Termin 7 dni. AI 99 zł.',
    keywords: ['ZDM Warszawa', 'reklamacja ZDM', 'opłata dodatkowa Warszawa'],
    parentCategory: 'parking',
    primaryCaseType: 'P2_parking_zdm',
    intro:
      'ZDM Warszawa rozpatruje reklamacje opłat dodatkowych w terminie 30 dni od ich otrzymania. Najczęstsze podstawy: błąd ANPR, brak oznakowania, awaria parkomatu, problem z aplikacją mobiParking.',
    steps: [
      {
        title: 'Krok 1 — Wniesienie reklamacji',
        content: 'Termin 7 dni od otrzymania wezwania (regulamin SPP Warszawa).',
      },
      {
        title: 'Krok 2 — Argumenty merytoryczne',
        content: 'AI dobiera argumenty zależnie od typu sprawy.',
      },
    ],
    faq: [
      {
        q: 'Czy mogę zaskarżyć decyzję ZDM?',
        a: 'Tak — droga cywilna do sądu rejonowego (art. 13b ustawy o drogach publicznych a contrario — opłata SPP nie jest decyzją administracyjną).',
      },
    ],
  },
] as const

/**
 * Helper — znajdź definicję kategorii po slugu.
 */
export function findCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

/**
 * Helper — znajdź definicję long-tail po slugu.
 */
export function findLongTail(slug: string): LongTailDef | undefined {
  return LONG_TAIL.find((l) => l.slug === slug)
}

/**
 * Helper — wszystkie slugi kategorii (do generateStaticParams).
 */
export function getAllCategorySlugs(): string[] {
  return CATEGORIES.map((c) => c.slug)
}

export function getAllLongTailSlugs(): string[] {
  return LONG_TAIL.map((l) => l.slug)
}
