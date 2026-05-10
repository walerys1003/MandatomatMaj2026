/**
 * Golden evals — e-TOLL (E1-E3), 3 prompty × 3 scenariusze = 9 evals.
 *
 * E1 — Odwołanie od decyzji GITD o nałożeniu kary (KPA, 14 dni)
 * E2 — Reklamacja podwójnego naliczenia opłaty e-TOLL (Ordynacja podatkowa, KAS)
 * E3 — Wniosek o anulowanie/odstąpienie/raty (3 tryby: art. 105/189f/189k KPA)
 */

import type { GoldenEval } from './index'

export const ETOLL_EVALS: GoldenEval[] = [
  // ==========================================================================
  // E1 — Odwołanie od decyzji GITD
  // ==========================================================================
  {
    id: 'E1-A1',
    description: 'Awaria OBU udokumentowana, zgłoszenie reklamacji u operatora — wysokie szanse',
    input: {
      caseType: 'E1_etoll_odwolanie_kara',
      data: {
        numer_decyzji: 'GITD/2026/EU/12345',
        data_decyzji: '2026-04-01',
        data_doreczenia: '2026-04-08',
        data_dzisiejsza: '2026-04-15',
        kwota_kary_pln: 3500,
        data_zdarzenia: '2026-03-15',
        miejsce_zdarzenia: 'A2 km 187',
        numer_rejestracyjny: 'WX12345',
        marka_model: 'MAN TGX 18.480',
        dmc_kg: 18000,
        podstawa_zarzutu: 'awaria_obu' as never,
        okolicznosci:
          'OBU OBU-VIA-2024 nie nadawało sygnału w dniu 15.03.2026 z powodu awarii baterii. Reklamacja zgłoszona u operatora ViaToll dnia 16.03.2026 (sygn. RT-2026-99887). Pojazd zarejestrowany w SPOE od 2024 r.',
        operator_spoe: 'ViaToll Sp. z o.o.',
        numer_obu: 'OBU-VIA-2024-887766',
        imie: 'Jakub',
        nazwisko: 'Trzaska',
        adres: 'ul. Testowa 50, 00-050 Warszawa',
        nip: '5252525252',
        zalaczniki: ['decyzja GITD', 'logi OBU', 'reklamacja u operatora', 'umowa z ViaToll'],
      } as never,
    },
    expectedScoring: { min: 0.7, max: 0.95 },
    mustContainPodstawy: ['art. 127', 'KPA', 'art. 13hb'],
    mustContainArgumenty: ['OBU', 'awari'],
    mustContainDoOrganu: ['Inspektor'],
  },
  {
    id: 'E1-A2',
    description: 'Pojazd <3,5t bez homologacji towarowej, błędna kwalifikacja — wysokie szanse',
    input: {
      caseType: 'E1_etoll_odwolanie_kara',
      data: {
        numer_decyzji: 'GITD/2026/EU/55443',
        data_decyzji: '2026-03-20',
        data_doreczenia: '2026-03-26',
        data_dzisiejsza: '2026-04-02',
        kwota_kary_pln: 1500,
        data_zdarzenia: '2026-02-28',
        miejsce_zdarzenia: 'A4 km 230',
        numer_rejestracyjny: 'KR98765',
        marka_model: 'Mercedes Vito 116 CDI',
        dmc_kg: 3200,
        podstawa_zarzutu: 'brak_rejestracji' as never,
        okolicznosci:
          'Pojazd osobowy do przewozu osób, DMC 3200 kg, brak homologacji towarowej. Nie podlega obowiązkowi e-TOLL zgodnie z art. 13ha ust. 1 ustawy o drogach publicznych (DMC ≤ 3,5 t).',
        imie: 'Liliana',
        nazwisko: 'Wojtas',
        adres: 'ul. Testowa 51, 30-051 Kraków',
        zalaczniki: ['decyzja GITD', 'dowód rejestracyjny', 'wyciąg z homologacji'],
      } as never,
    },
    expectedScoring: { min: 0.75, max: 1.0 },
    mustContainPodstawy: ['art. 127', 'KPA'],
    mustContainArgumenty: ['DMC'],
    mustContainDoOrganu: ['Inspektor'],
  },
  {
    id: 'E1-A3',
    description: 'Faktyczny brak rejestracji w SPOE, brak okoliczności łagodzących — niskie szanse',
    input: {
      caseType: 'E1_etoll_odwolanie_kara',
      data: {
        numer_decyzji: 'GITD/2026/EU/77889',
        data_decyzji: '2026-04-05',
        data_doreczenia: '2026-04-10',
        data_dzisiejsza: '2026-04-15',
        kwota_kary_pln: 7500,
        data_zdarzenia: '2026-03-25',
        miejsce_zdarzenia: 'A1 km 95',
        numer_rejestracyjny: 'GD55555',
        marka_model: 'Volvo FH16',
        dmc_kg: 26000,
        podstawa_zarzutu: 'brak_rejestracji' as never,
        okolicznosci:
          'Nie wiedziałem, że muszę zarejestrować pojazd. Firma kupiła ciężarówkę 2 miesiące temu i nie dopełniliśmy formalności.',
        imie: 'Mariusz',
        nazwisko: 'Niedbalski',
        adres: 'ul. Testowa 52, 80-052 Gdańsk',
        nip: '5832525252',
        zalaczniki: ['decyzja GITD', 'dowód rejestracyjny'],
      } as never,
    },
    expectedScoring: { min: 0.05, max: 0.4 },
    mustContainPodstawy: ['art. 127', 'KPA'],
    mustContainArgumenty: [],
    mustContainDoOrganu: ['Inspektor'],
  },

  // ==========================================================================
  // E2 — Reklamacja podwójnego naliczenia
  // ==========================================================================
  {
    id: 'E2-A1',
    description: 'Duplikat transakcji w tym samym timestamp — bardzo wysokie szanse',
    input: {
      caseType: 'E2_etoll_reklamacja_podwojne',
      data: {
        numer_konta_spoe: 'SPOE-2024-AB123456',
        numer_rejestracyjny: 'WX99887',
        marka_model: 'DAF XF 480',
        data_zdarzenia: '2026-03-10',
        data_dzisiejsza: '2026-04-05',
        rodzaj_bledu: 'duplikat_transakcji' as never,
        numery_transakcji: ['TRX-2026-03-10-887700', 'TRX-2026-03-10-887701'],
        kwota_nadplaty_pln: 124.5,
        okolicznosci:
          'Dwie identyczne transakcje 10.03.2026 o godz. 14:23:15 i 14:23:18 — bramka A2 km 187 w obu kierunkach to niemożliwe (pojazd jechał tylko w jedną stronę).',
        imie: 'Norbert',
        nazwisko: 'Kowalski',
        adres: 'ul. Testowa 53, 00-053 Warszawa',
        email: 'norbert.k@example.com',
        telefon: '+48 600 123 789',
        nip: '5252111222',
        numer_rachunku: '12 1020 1234 5678 9012 3456 7890',
        zalaczniki: ['CSV transakcji z panelu SPOE', 'historia salda', 'logi OBU'],
      } as never,
    },
    expectedScoring: { min: 0.8, max: 1.0 },
    mustContainPodstawy: ['art. 72', 'Ordynacja'],
    mustContainArgumenty: ['nadpłat'],
    mustContainDoOrganu: ['KAS'],
  },
  {
    id: 'E2-A2',
    description: 'Podwójna rejestracja po przerejestrowaniu, oficjalne potwierdzenie KAS — wysokie szanse',
    input: {
      caseType: 'E2_etoll_reklamacja_podwojne',
      data: {
        numer_konta_spoe: 'SPOE-2024-CD556677',
        numer_rejestracyjny: 'KR44321',
        marka_model: 'Scania R450',
        data_zdarzenia: '2026-02-20',
        data_dzisiejsza: '2026-03-25',
        rodzaj_bledu: 'podwojna_rejestracja' as never,
        numery_transakcji: ['TRX-2026-02-20-001', 'TRX-2026-02-20-002'],
        kwota_nadplaty_pln: 532.8,
        okolicznosci:
          'Po sprzedaży pojazdu stary kontrakt SPOE ViaToll nie został zamknięty — przez 2 tygodnie pojazd był rozliczany równolegle w starym i nowym SPOE nabywcy.',
        imie: 'Olga',
        nazwisko: 'Rudnicka',
        adres: 'ul. Testowa 54, 30-054 Kraków',
        nip: '6772222333',
        numer_rachunku: '98 1140 2017 0000 4002 1234 5678',
        zalaczniki: ['umowa kupna-sprzedaży pojazdu', 'wypowiedzenie umowy SPOE', 'CSV transakcji z dwóch kont'],
      } as never,
    },
    expectedScoring: { min: 0.7, max: 0.95 },
    mustContainPodstawy: ['art. 72', 'Ordynacja'],
    mustContainArgumenty: ['rejestracj'],
    mustContainDoOrganu: ['KAS'],
  },
  {
    id: 'E2-A3',
    description: 'Tylko zrzut ekranu, brak twardych logów — średnie szanse',
    input: {
      caseType: 'E2_etoll_reklamacja_podwojne',
      data: {
        numer_konta_spoe: 'SPOE-2025-EF889900',
        numer_rejestracyjny: 'PO12321',
        marka_model: 'Renault T520',
        data_zdarzenia: '2026-03-01',
        data_dzisiejsza: '2026-04-10',
        rodzaj_bledu: 'inny' as never,
        numery_transakcji: ['TRX-2026-03-01-555'],
        kwota_nadplaty_pln: 45,
        okolicznosci: 'Wydaje mi się, że transakcja jest błędna — niewłaściwa stawka. Mam tylko screen.',
        imie: 'Patryk',
        nazwisko: 'Sieradzki',
        adres: 'ul. Testowa 55, 60-055 Poznań',
        numer_rachunku: '50 1090 1014 0000 0712 1234 5678',
        zalaczniki: ['screenshot panelu'],
      } as never,
    },
    expectedScoring: { min: 0.25, max: 0.55 },
    mustContainPodstawy: ['art. 72'],
    mustContainArgumenty: [],
    mustContainDoOrganu: ['KAS'],
  },

  // ==========================================================================
  // E3 — Wniosek o anulowanie/odstąpienie/raty
  // ==========================================================================
  {
    id: 'E3-A1',
    description: 'Tryb umorzenie (art. 105 KPA) — pojazd nie podlegał e-TOLL, bezprzedmiotowość',
    input: {
      caseType: 'E3_etoll_anulowanie',
      data: {
        tryb: 'umorzenie' as never,
        numer_decyzji: 'GITD/2026/EU/00123',
        data_decyzji: '2026-03-15',
        kwota_kary_pln: 2000,
        liczba_rat: undefined,
        kwota_raty_pln: undefined,
        uzasadnienie:
          'Postępowanie jest bezprzedmiotowe — pojazd o DMC 3200 kg nie podlega obowiązkowi e-TOLL (art. 13ha ust. 1).',
        okolicznosci_lagodzace: ['DMC poniżej progu 3,5 t', 'brak homologacji towarowej', 'pojazd zarejestrowany jako osobowy'],
        pierwsze_naruszenie: true,
        sytuacja_majatkowa: undefined,
        imie: 'Roman',
        nazwisko: 'Stachura',
        adres: 'ul. Testowa 56, 00-056 Warszawa',
        zalaczniki: ['decyzja GITD', 'dowód rejestracyjny', 'wyciąg z homologacji'],
      } as never,
    },
    expectedScoring: { min: 0.75, max: 1.0 },
    mustContainPodstawy: ['art. 105', 'KPA'],
    mustContainArgumenty: ['umorzeni'],
    mustContainDoOrganu: ['Inspektor'],
  },
  {
    id: 'E3-A2',
    description: 'Tryb odstąpienie (art. 189f KPA) — pierwsze, drobne, niezwłoczne usunięcie',
    input: {
      caseType: 'E3_etoll_anulowanie',
      data: {
        tryb: 'odstapienie' as never,
        numer_decyzji: 'GITD/2026/EU/22334',
        data_decyzji: '2026-04-10',
        kwota_kary_pln: 500,
        uzasadnienie:
          'Pierwsze i jedyne naruszenie. Pojazd zarejestrowano w SPOE tego samego dnia po stwierdzeniu uchybienia. Krótki dystans (12 km) pokonany bez opłaty.',
        okolicznosci_lagodzace: [
          'pierwsze naruszenie w historii działalności firmy',
          'niezwłoczne zarejestrowanie w SPOE 25.03.2026 (tego samego dnia)',
          'minimalny dystans 12 km',
          'mikroprzedsiębiorca',
        ],
        pierwsze_naruszenie: true,
        sytuacja_majatkowa: 'Mikroprzedsiębiorca, jednoosobowa działalność, dochód miesięczny ok. 8000 zł netto.',
        imie: 'Sabina',
        nazwisko: 'Marczewska',
        adres: 'ul. Testowa 57, 00-057 Warszawa',
        nip: '7771112233',
        zalaczniki: ['decyzja GITD', 'potwierdzenie rejestracji w SPOE z 25.03.2026', 'zaświadczenie o niekaralności', 'wpis do CEIDG'],
      } as never,
    },
    expectedScoring: { min: 0.6, max: 0.85 },
    mustContainPodstawy: ['art. 189f', 'KPA'],
    mustContainArgumenty: ['pierwsze', 'znikom'],
    mustContainDoOrganu: ['Inspektor'],
  },
  {
    id: 'E3-A3',
    description: 'Tryb raty (art. 189k KPA) — kara wysoka, trudna sytuacja majątkowa',
    input: {
      caseType: 'E3_etoll_anulowanie',
      data: {
        tryb: 'raty' as never,
        numer_decyzji: 'GITD/2026/EU/55667',
        data_decyzji: '2026-04-01',
        kwota_kary_pln: 7500,
        liczba_rat: 10,
        kwota_raty_pln: 750,
        uzasadnienie:
          'Trudna sytuacja majątkowa — utrata głównego klienta firmy transportowej, zobowiązania alimentacyjne, dwoje dzieci. Płatność jednorazowa zagrażałaby utrzymaniu działalności.',
        okolicznosci_lagodzace: [
          'utrata głównego kontraktu (rozwiązanie umowy 02/2026)',
          'zobowiązania alimentacyjne na 2 dzieci',
          'spłata leasingu 4 ciężarówek',
        ],
        pierwsze_naruszenie: false,
        sytuacja_majatkowa:
          'Dochód miesięczny netto 12 000 zł, zobowiązania: alimenty 2400 zł, leasing 8500 zł, ZUS 1800 zł. Pozostała kwota niewystarczająca na jednorazową płatność 7500 zł.',
        imie: 'Tomasz',
        nazwisko: 'Urbański',
        adres: 'ul. Testowa 58, 00-058 Warszawa',
        nip: '5251234567',
        zalaczniki: ['decyzja GITD', 'PIT-36 za rok ubiegły', 'wyrok alimentacyjny', 'rozwiązanie umowy z kontrahentem', 'harmonogram leasingu'],
      } as never,
    },
    expectedScoring: { min: 0.55, max: 0.85 },
    mustContainPodstawy: ['art. 189k', 'KPA'],
    mustContainArgumenty: ['raty'],
    mustContainDoOrganu: ['Inspektor'],
  },
]
