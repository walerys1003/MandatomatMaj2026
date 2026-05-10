/**
 * Golden evals — Kontrole drogowe (K1-K4), 4 prompty × 3 scenariusze = 12 evals.
 *
 * K1 — Sprzeciw od zatrzymania prawa jazdy (art. 135 PoRD / art. 102 ust. o kierujących)
 * K2 — Wniosek o cofnięcie decyzji o cofnięciu uprawnień / korekta CEPiK (art. 154-156 KPA)
 * K3 — Wniosek dowodowy o weryfikację urządzenia (radar/alkomat — Prawo o miarach)
 * K4 — Wniosek o korektę punktów karnych w CEPiK (art. 98 ust. o kierujących)
 */

import type { GoldenEval } from './index'

export const KONTROLE_EVALS: GoldenEval[] = [
  // ==========================================================================
  // K1 — Sprzeciw od zatrzymania prawa jazdy
  // ==========================================================================
  {
    id: 'K1-A1',
    description: 'Zatrzymanie za >50 km/h, brak świadectwa legalizacji radaru — wysokie szanse',
    input: {
      caseType: 'K1_kontrola_zatrzymanie_pj',
      data: {
        podstawa_zatrzymania: 'predkosc_50' as never,
        data_zatrzymania: '2026-04-12',
        okres_zatrzymania_msc: 3,
        numer_pokwitowania: 'POL/2026/PJ/55421',
        organ_zatrzymujacy: 'KPP Pruszków',
        organ_wlasciwy: 'Starosta Pruszkowski',
        okolicznosci:
          'Pomiar radarem Iskra-1 w terenie zabudowanym ul. Działkowa, Brwinów. Funkcjonariusz nie okazał świadectwa legalizacji urządzenia.',
        argumenty_sprzeciwu: [
          'Brak świadectwa legalizacji radaru ważnego na dzień pomiaru',
          'Nieprawidłowy kąt pomiaru (efekt cosinusowy)',
          'Brak izolacji pomiaru — w wiązce kilka pojazdów',
        ],
        imie: 'Adam',
        nazwisko: 'Wesołowski',
        adres: 'ul. Testowa 70, 05-070 Pruszków',
        pesel: '850515*****',
        numer_pj: 'PJ-1234567',
        data_zdarzenia: '2026-04-12',
        zalaczniki: ['pokwitowanie zatrzymania', 'protokół kontroli', 'oświadczenie świadka'],
      } as never,
    },
    expectedScoring: { min: 0.6, max: 0.9 },
    mustContainPodstawy: ['art. 135', 'PoRD'],
    mustContainArgumenty: ['legalizacj'],
    mustContainDoOrganu: ['Starosta'],
    mustNotContain: ['art. 178a KK'],
  },
  {
    id: 'K1-A2',
    description: 'Zatrzymanie za 24 punkty karne, ale częściowe punkty już wygasłe (>1 rok) — wysokie szanse',
    input: {
      caseType: 'K1_kontrola_zatrzymanie_pj',
      data: {
        podstawa_zatrzymania: 'pkt_24' as never,
        data_zatrzymania: '2026-04-08',
        okres_zatrzymania_msc: 6,
        numer_pokwitowania: 'POL/2026/PJ/77123',
        organ_zatrzymujacy: 'KWP Kraków',
        organ_wlasciwy: 'Starosta Krakowski',
        okolicznosci:
          'Naliczono 26 punktów karnych. Z tego 8 punktów z mandatu z 03.2024 zapłaconego w 04.2024 — minął rok od uiszczenia. Powinny być usunięte.',
        argumenty_sprzeciwu: [
          'Punkty z marca 2024 powinny być usunięte z urzędu (art. 98 ust. 2 ustawy o kierujących)',
          'Po odjęciu punktów wygasłych pozostaje 18 — poniżej progu 24',
          'Brak proceduralnego pouczenia',
        ],
        imie: 'Bartłomiej',
        nazwisko: 'Kowal',
        adres: 'ul. Testowa 71, 30-071 Kraków',
        pesel: '870720*****',
        numer_pj: 'PJ-7654321',
        data_zdarzenia: '2026-04-05',
        zalaczniki: ['pokwitowanie', 'historia punktów z CEPiK', 'kopia mandatu z 03.2024 z dowodem zapłaty'],
      } as never,
    },
    expectedScoring: { min: 0.7, max: 0.95 },
    mustContainPodstawy: ['art. 102', 'kierujących'],
    mustContainArgumenty: ['punkt'],
    mustContainDoOrganu: ['Starosta'],
  },
  {
    id: 'K1-A3',
    description: 'Zatrzymanie za alkohol 1,5‰ — przestępstwo, niskie szanse',
    input: {
      caseType: 'K1_kontrola_zatrzymanie_pj',
      data: {
        podstawa_zatrzymania: 'alkohol' as never,
        data_zatrzymania: '2026-04-15',
        okres_zatrzymania_msc: 12,
        numer_pokwitowania: 'POL/2026/PJ/99887',
        organ_zatrzymujacy: 'KPP Wrocław',
        organ_wlasciwy: 'Sąd Rejonowy Wrocław-Krzyki',
        okolicznosci: 'Alkomat AT-2 wskazał 1,52‰. Dwa pomiary z odstępem 15 min potwierdziły wynik.',
        argumenty_sprzeciwu: ['Wnoszę o sprawdzenie świadectwa legalizacji alkomatu'],
        imie: 'Cezary',
        nazwisko: 'Wójcicki',
        adres: 'ul. Testowa 72, 50-072 Wrocław',
        pesel: '750825*****',
        numer_pj: 'PJ-3214567',
        data_zdarzenia: '2026-04-15',
        zalaczniki: ['pokwitowanie zatrzymania', 'protokół alkomatu'],
      } as never,
    },
    expectedScoring: { min: 0.0, max: 0.35 },
    mustContainPodstawy: ['art. 135'],
    mustContainArgumenty: [],
    mustContainDoOrganu: ['Sąd'],
  },

  // ==========================================================================
  // K2 — Cofnięcie decyzji / korekta CEPiK
  // ==========================================================================
  {
    id: 'K2-A1',
    description: 'Stwierdzenie nieważności (art. 156 KPA) — uchylone mandaty, błędne naliczenie',
    input: {
      caseType: 'K2_kontrola_cofniecie_cepik',
      data: {
        tryb: 'niewaznosc' as never,
        numer_decyzji: 'STAR/PRSZ/2026/PJ/00112',
        data_decyzji: '2026-03-20',
        data_doreczenia: '2026-03-26',
        rodzaj_bledu: 'uchylony_mandat' as never,
        okolicznosci:
          'Decyzja o cofnięciu uprawnień oparta o 24 punkty karne. Po wydaniu decyzji Sąd Rejonowy uchylił dwa mandaty (12 pkt łącznie) — wyrok z 10.04.2026 sygn. II W 567/26. Po korekcie pozostałe punkty: 12, poniżej progu.',
        argumenty: [
          'Wyrok uchylający mandaty z 10.04.2026',
          'Po korekcie liczba punktów spada do 12 (poniżej 24)',
          'Decyzja wydana na podstawie nieprawidłowej dokumentacji — rażące naruszenie prawa',
        ],
        imie: 'Daniel',
        nazwisko: 'Pawelec',
        adres: 'ul. Testowa 73, 05-073 Pruszków',
        pesel: '880910*****',
        numer_pj: 'PJ-5556677',
        zalaczniki: ['decyzja o cofnięciu', 'wyrok II W 567/26', 'historia punktów z CEPiK'],
      } as never,
    },
    expectedScoring: { min: 0.75, max: 1.0 },
    mustContainPodstawy: ['art. 156', 'KPA'],
    mustContainArgumenty: ['nieważnoś'],
    mustContainDoOrganu: ['Starosta'],
  },
  {
    id: 'K2-A2',
    description: 'Wznowienie postępowania (art. 145 KPA) — nowe dowody nieznane organowi',
    input: {
      caseType: 'K2_kontrola_cofniecie_cepik',
      data: {
        tryb: 'wznowienie' as never,
        numer_decyzji: 'STAR/KRK/2026/PJ/22311',
        data_decyzji: '2025-11-15',
        data_doreczenia: '2025-11-22',
        rodzaj_bledu: 'bledna_tozsamosc' as never,
        okolicznosci:
          'Po wydaniu decyzji uzyskałem dowody, że punkty wpisano osobie o tym samym imieniu i nazwisku, ale innym PESEL. Zaświadczenie z KWP z 15.03.2026 potwierdza pomyłkę.',
        argumenty: [
          'Nowe dowody nieznane organowi (art. 145 § 1 pkt 5 KPA)',
          'Zaświadczenie KWP potwierdzające pomyłkę',
          'Termin 1 mies. od uzyskania zaświadczenia (art. 148 KPA) zachowany',
        ],
        imie: 'Eliza',
        nazwisko: 'Kowalska',
        adres: 'ul. Testowa 74, 30-074 Kraków',
        pesel: '900105*****',
        numer_pj: 'PJ-9988776',
        zalaczniki: ['decyzja', 'zaświadczenie KWP z 15.03.2026', 'kopia dowodu osobistego'],
      } as never,
    },
    expectedScoring: { min: 0.7, max: 0.95 },
    mustContainPodstawy: ['art. 145', 'KPA'],
    mustContainArgumenty: ['wznowieni'],
    mustContainDoOrganu: ['Starosta'],
  },
  {
    id: 'K2-A3',
    description: 'Zmiana decyzji (art. 154 KPA) — słaba podstawa, brak twardych dowodów',
    input: {
      caseType: 'K2_kontrola_cofniecie_cepik',
      data: {
        tryb: 'zmiana' as never,
        numer_decyzji: 'STAR/POZ/2026/PJ/55432',
        data_decyzji: '2026-02-10',
        data_doreczenia: '2026-02-15',
        rodzaj_bledu: 'inny' as never,
        okolicznosci: 'Uważam, że decyzja jest zbyt surowa, ale nie kwestionuję faktów.',
        argumenty: ['Decyzja jest niesprawiedliwa', 'Praca wymaga ode mnie prawa jazdy'],
        imie: 'Filip',
        nazwisko: 'Roman',
        adres: 'ul. Testowa 75, 60-075 Poznań',
        pesel: '850405*****',
        numer_pj: 'PJ-1112223',
        zalaczniki: ['decyzja'],
      } as never,
    },
    expectedScoring: { min: 0.1, max: 0.4 },
    mustContainPodstawy: ['art. 154', 'KPA'],
    mustContainArgumenty: [],
    mustContainDoOrganu: ['Starosta'],
  },

  // ==========================================================================
  // K3 — Weryfikacja urządzenia pomiarowego
  // ==========================================================================
  {
    id: 'K3-A1',
    description: 'Radar Iskra-1, brak świadectwa legalizacji ważnego na dzień pomiaru — wysokie szanse',
    input: {
      caseType: 'K3_kontrola_weryfikacja_urzadzenia',
      data: {
        rodzaj_urzadzenia: 'radar' as never,
        marka_model_urzadzenia: 'Iskra-1',
        data_pomiaru: '2026-03-15',
        miejsce_pomiaru: 'DK7 km 230, Radom',
        numer_sprawy: 'II W 887/26',
        organ: 'Sąd Rejonowy w Radomiu, II Wydział Karny',
        zadane_dokumenty: ['swiadectwo_legalizacji', 'dziennik_kontroli', 'logi', 'opinia_bieglego'] as never,
        uzasadnienie:
          'Z ustnego oświadczenia funkcjonariusza wynika, że ostatnia legalizacja radaru była z 02.2025 — minęło 13 mies. Wymagana jest weryfikacja świadectwa.',
        imie: 'Grzegorz',
        nazwisko: 'Sikora',
        adres: 'ul. Testowa 76, 26-076 Radom',
        pesel: '720815*****',
        zalaczniki: ['notatka urzędowa z kontroli', 'wezwanie sądowe'],
      } as never,
    },
    expectedScoring: { min: 0.7, max: 0.95 },
    mustContainPodstawy: ['Prawo o miarach', 'art. 8'],
    mustContainArgumenty: ['legalizacj'],
    mustContainDoOrganu: ['Sąd'],
  },
  {
    id: 'K3-A2',
    description: 'Alkomat AT-2, jeden pomiar bez powtórki w 15 min, faza wchłaniania',
    input: {
      caseType: 'K3_kontrola_weryfikacja_urzadzenia',
      data: {
        rodzaj_urzadzenia: 'alkomat' as never,
        marka_model_urzadzenia: 'AlcoQuant 6020',
        data_pomiaru: '2026-04-02',
        miejsce_pomiaru: 'KPP Wrocław-Krzyki',
        numer_sprawy: 'II K 234/26',
        organ: 'Prokuratura Rejonowa Wrocław-Krzyki',
        zadane_dokumenty: ['swiadectwo_legalizacji', 'dziennik_kontroli', 'opinia_bieglego'] as never,
        uzasadnienie:
          'W protokole tylko jeden pomiar (0,21 mg/l). Wymagana procedura: dwa pomiary z odstępem 15 min. Spożycie alkoholu zgłoszone na 30 min przed pomiarem — faza wchłaniania, wymagane przeliczenie retrospektywne (opinia toksykologa).',
        imie: 'Hubert',
        nazwisko: 'Czarny',
        adres: 'ul. Testowa 77, 50-077 Wrocław',
        pesel: '780525*****',
        zalaczniki: ['protokół alkomatu', 'oświadczenie obwinionego'],
      } as never,
    },
    expectedScoring: { min: 0.6, max: 0.85 },
    mustContainPodstawy: ['Prawo o miarach', 'KPK'],
    mustContainArgumenty: ['pomiar'],
    mustContainDoOrganu: ['Prokuratura'],
  },
  {
    id: 'K3-A3',
    description: 'Fotoradar stacjonarny, legalizacja ważna, świadectwo dostępne — niskie szanse',
    input: {
      caseType: 'K3_kontrola_weryfikacja_urzadzenia',
      data: {
        rodzaj_urzadzenia: 'fotoradar' as never,
        marka_model_urzadzenia: 'Multanova 6F',
        data_pomiaru: '2026-04-10',
        miejsce_pomiaru: 'A4 km 350, Kraków',
        numer_sprawy: 'II W 998/26',
        organ: 'Sąd Rejonowy dla Krakowa-Krowodrzy',
        zadane_dokumenty: ['swiadectwo_legalizacji'] as never,
        uzasadnienie: 'Chcę zobaczyć świadectwo legalizacji.',
        imie: 'Iwona',
        nazwisko: 'Nowicka',
        adres: 'ul. Testowa 78, 30-078 Kraków',
        pesel: '910101*****',
        zalaczniki: ['wezwanie sądowe'],
      } as never,
    },
    expectedScoring: { min: 0.15, max: 0.45 },
    mustContainPodstawy: ['Prawo o miarach'],
    mustContainArgumenty: [],
    mustContainDoOrganu: ['Sąd'],
  },

  // ==========================================================================
  // K4 — Korekta punktów karnych w CEPiK
  // ==========================================================================
  {
    id: 'K4-A1',
    description: 'Upływ terminu 1 roku od opłacenia mandatu — wysokie szanse',
    input: {
      caseType: 'K4_kontrola_korekta_punktow',
      data: {
        rodzaj_korekty: 'uplyw_terminu' as never,
        pozycje_do_korekty: [
          {
            data_wykroczenia: '2025-01-15',
            opis: 'Przekroczenie prędkości o 30 km/h w terenie zabudowanym (art. 92a KW)',
            liczba_punktow: 9,
            podstawa_korekty: 'Mandat zapłacony 22.01.2025; minął 1 rok (art. 98 ust. 2 ust. o kierujących)',
          },
          {
            data_wykroczenia: '2025-02-10',
            opis: 'Wymijanie się z pojazdem przy przekroczeniu linii (art. 86 KW)',
            liczba_punktow: 4,
            podstawa_korekty: 'Mandat zapłacony 18.02.2025; minął 1 rok',
          },
        ],
        uzasadnienie:
          'Punkty z 01-02/2025 powinny zostać automatycznie usunięte po 1 roku od uiszczenia mandatu. System CEPiK ich nie usunął.',
        imie: 'Jacek',
        nazwisko: 'Borek',
        adres: 'ul. Testowa 79, 00-079 Warszawa',
        pesel: '820315*****',
        numer_pj: 'PJ-2233445',
        zalaczniki: ['historia punktów z CEPiK', 'kopie mandatów z dowodami zapłaty', 'wydruk z mObywatel'],
      } as never,
    },
    expectedScoring: { min: 0.8, max: 1.0 },
    mustContainPodstawy: ['art. 98', 'kierujących'],
    mustContainArgumenty: ['termin'],
    mustContainDoOrganu: ['Komendant'],
  },
  {
    id: 'K4-A2',
    description: 'Uchylony mandat sądem — punkty muszą zostać usunięte',
    input: {
      caseType: 'K4_kontrola_korekta_punktow',
      data: {
        rodzaj_korekty: 'uchylony_mandat' as never,
        pozycje_do_korekty: [
          {
            data_wykroczenia: '2025-09-20',
            opis: 'Niezachowanie należytej ostrożności (art. 86 § 1 KW)',
            liczba_punktow: 6,
            podstawa_korekty: 'Wyrok uniewinniający Sądu Rejonowego z 15.03.2026 sygn. II W 234/26',
          },
        ],
        uzasadnienie:
          'Mandat odmówiony i sprawa skierowana do sądu. Wyrok uniewinniający z 15.03.2026 — punkty muszą być usunięte z CEPiK.',
        imie: 'Karolina',
        nazwisko: 'Wesoła',
        adres: 'ul. Testowa 80, 00-080 Warszawa',
        pesel: '880525*****',
        numer_pj: 'PJ-7788990',
        zalaczniki: ['wyrok II W 234/26', 'historia punktów z CEPiK'],
      } as never,
    },
    expectedScoring: { min: 0.85, max: 1.0 },
    mustContainPodstawy: ['art. 98', 'kierujących'],
    mustContainArgumenty: ['uniewinniaj'],
    mustContainDoOrganu: ['Komendant'],
  },
  {
    id: 'K4-A3',
    description: 'Szkolenie WORD — żądanie obniżenia o 6 pkt (kontrowersyjne po zaostrzeniu 09.2022)',
    input: {
      caseType: 'K4_kontrola_korekta_punktow',
      data: {
        rodzaj_korekty: 'szkolenie_word' as never,
        pozycje_do_korekty: [
          {
            data_wykroczenia: '2025-12-10',
            opis: 'Przekroczenie prędkości o 25 km/h (art. 92a KW)',
            liczba_punktow: 6,
            podstawa_korekty: 'Ukończenie szkolenia w WORD Warszawa 12.04.2026',
          },
        ],
        uzasadnienie:
          'Ukończyłem szkolenie WORD w dniu 12.04.2026, posiadam zaświadczenie. Wnoszę o obniżenie o 6 pkt.',
        imie: 'Lucjan',
        nazwisko: 'Marek',
        adres: 'ul. Testowa 81, 00-081 Warszawa',
        pesel: '790830*****',
        numer_pj: 'PJ-4455667',
        zalaczniki: ['zaświadczenie WORD z 12.04.2026', 'historia punktów'],
      } as never,
    },
    expectedScoring: { min: 0.25, max: 0.6 },
    mustContainPodstawy: ['art. 98', 'kierujących'],
    mustContainArgumenty: ['szkoleni'],
    mustContainDoOrganu: ['Komendant'],
  },
]
