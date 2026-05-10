/**
 * Golden evals — Pomocnicze/Techniczne (T1-T4), 4 prompty × 3 scenariusze = 12 evals.
 *
 * T1 — Pełnomocnictwo (procesowe / administracyjne / podatkowe / ubezpieczeniowe)
 * T2 — Wniosek RODO o dostęp do danych (art. 15 RODO)
 * T3 — Wniosek RODO o usunięcie danych (art. 17 RODO — prawo do bycia zapomnianym)
 * T4 — Generator listy załączników do pisma
 */

import type { GoldenEval } from './index'

export const TECHNICZNE_EVALS: GoldenEval[] = [
  // ==========================================================================
  // T1 — Pełnomocnictwo
  // ==========================================================================
  {
    id: 'T1-A1',
    description: 'Pełnomocnictwo procesowe ogólne dla adwokata w sprawie cywilnej',
    input: {
      caseType: 'T1_techn_pelnomocnictwo',
      data: {
        rodzaj: 'procesowe_ogolne' as never,
        oznaczenie_sprawy: 'sprawa cywilna o zapłatę przeciwko Kruk S.A., sygn. I C 234/26',
        organ_postepowania: 'Sąd Rejonowy dla Warszawy-Mokotowa, I Wydział Cywilny',
        zakres_uprawnien:
          'pełna reprezentacja w I i II instancji, składanie środków zaskarżenia, zawieranie ugód, odbiór zasądzonych kwot',
        substytucja_dozwolona: true,
        mocodawca_imie: 'Adam',
        mocodawca_nazwisko: 'Kowalski',
        mocodawca_pesel: '850515*****',
        mocodawca_adres: 'ul. Testowa 90, 00-090 Warszawa',
        pelnomocnik_imie: 'Mariusz',
        pelnomocnik_nazwisko: 'Adwokat',
        pelnomocnik_pesel: '750812*****',
        pelnomocnik_adres: 'ul. Kancelaryjna 5, 00-001 Warszawa',
        pelnomocnik_zawod: 'adwokat' as never,
        pelnomocnik_nr_wpisu: 'WAW/Adw/1234',
        data: '2026-05-10',
        miejsce: 'Warszawa',
      } as never,
    },
    expectedScoring: { min: 0.9, max: 1.0 },
    mustContainPodstawy: ['KPC', 'art. 86', 'art. 91'],
    mustContainArgumenty: ['umocowani'],
    mustNotContain: ['scoring_szans 0'],
  },
  {
    id: 'T1-A2',
    description: 'Pełnomocnictwo administracyjne (KPA) — odwołanie do SKO',
    input: {
      caseType: 'T1_techn_pelnomocnictwo',
      data: {
        rodzaj: 'administracyjne' as never,
        oznaczenie_sprawy: 'odwołanie od decyzji Prezydenta Miasta Krakowa nr UM/2026/RW/4567',
        organ_postepowania: 'Samorządowe Kolegium Odwoławcze w Krakowie',
        zakres_uprawnien:
          'reprezentacja w postępowaniu odwoławczym, składanie pism, odbiór decyzji, składanie skargi do WSA',
        substytucja_dozwolona: false,
        mocodawca_imie: 'Beata',
        mocodawca_nazwisko: 'Nowak',
        mocodawca_pesel: '900710*****',
        mocodawca_adres: 'ul. Testowa 91, 30-091 Kraków',
        pelnomocnik_imie: 'Tomasz',
        pelnomocnik_nazwisko: 'Radca',
        pelnomocnik_adres: 'ul. Prawnicza 12, 30-002 Kraków',
        pelnomocnik_zawod: 'radca_prawny' as never,
        pelnomocnik_nr_wpisu: 'KR/Rp/5678',
        data: '2026-05-10',
        miejsce: 'Kraków',
      } as never,
    },
    expectedScoring: { min: 0.9, max: 1.0 },
    mustContainPodstawy: ['KPA', 'art. 32', 'art. 33'],
    mustContainArgumenty: ['umocowani'],
    mustContainDoOrganu: ['Samorządowe Kolegium'],
  },
  {
    id: 'T1-A3',
    description: 'Pełnomocnictwo ubezpieczeniowe (KC art. 95) dla osoby fizycznej (nie-prawnik)',
    input: {
      caseType: 'T1_techn_pelnomocnictwo',
      data: {
        rodzaj: 'ubezpieczeniowe' as never,
        oznaczenie_sprawy: 'szkoda nr PZU-2026-A12345 (likwidacja szkody OC)',
        organ_postepowania: 'PZU SA - Departament Likwidacji Szkód',
        zakres_uprawnien:
          'reprezentacja w postępowaniu likwidacyjnym, składanie reklamacji, odbiór decyzji, odbiór odszkodowania',
        substytucja_dozwolona: false,
        mocodawca_imie: 'Cezary',
        mocodawca_nazwisko: 'Wiśniewski',
        mocodawca_pesel: '780325*****',
        mocodawca_adres: 'ul. Testowa 92, 00-092 Warszawa',
        pelnomocnik_imie: 'Daria',
        pelnomocnik_nazwisko: 'Wiśniewska',
        pelnomocnik_pesel: '850410*****',
        pelnomocnik_adres: 'ul. Testowa 92, 00-092 Warszawa',
        data: '2026-05-10',
        miejsce: 'Warszawa',
      } as never,
    },
    expectedScoring: { min: 0.85, max: 1.0 },
    mustContainPodstawy: ['KC', 'art. 95'],
    mustContainArgumenty: ['umocowani'],
    mustContainDoOrganu: ['PZU'],
  },

  // ==========================================================================
  // T2 — Wniosek RODO o dostęp do danych (art. 15)
  // ==========================================================================
  {
    id: 'T2-A1',
    description: 'Wniosek o dostęp do danych w banku — kontekst kredytowy',
    input: {
      caseType: 'T2_techn_rodo_dostep',
      data: {
        administrator_nazwa: 'PKO BP S.A.',
        administrator_adres: 'ul. Puławska 15, 02-515 Warszawa',
        administrator_email_iod: 'iod@pkobp.pl',
        zakres_zadania:
          'wszystkie dane osobowe przetwarzane w związku z umową kredytową nr KR-2024-998877 z dnia 15.03.2024, w tym scoring kredytowy, dane przekazane do BIK, historia zapytań',
        kontekst_relacji: 'umowa kredytu hipotecznego z 15.03.2024',
        forma_odpowiedzi: 'email' as never,
        email_kontaktowy: 'eryk.kowalski@example.com',
        data_dzisiejsza: '2026-05-10',
        imie: 'Eryk',
        nazwisko: 'Kowalski',
        adres: 'ul. Testowa 93, 00-093 Warszawa',
        pesel: '880210*****',
      } as never,
    },
    expectedScoring: { min: 0.85, max: 1.0 },
    mustContainPodstawy: ['art. 15', 'RODO'],
    mustContainArgumenty: ['dane'],
    mustContainDoOrganu: ['PKO'],
  },
  {
    id: 'T2-A2',
    description: 'Wniosek o nagrania CCTV z konkretnej daty i godziny',
    input: {
      caseType: 'T2_techn_rodo_dostep',
      data: {
        administrator_nazwa: 'Galeria Mokotów Sp. z o.o.',
        administrator_adres: 'ul. Wołoska 12, 02-675 Warszawa',
        administrator_email_iod: 'rodo@galeriamokotow.pl',
        zakres_zadania:
          'kopia nagrania CCTV z parkingu podziemnego poziom -2, sektor C, z dnia 12.04.2026 w godz. 14:00-15:30 (mój wizerunek + numer rejestracyjny WA12345)',
        kontekst_relacji: 'incydent kradzieży 12.04.2026; zgłoszenie na policję sygn. RSD-887/26',
        forma_odpowiedzi: 'pocztowa' as never,
        data_dzisiejsza: '2026-05-10',
        imie: 'Filip',
        nazwisko: 'Mazur',
        adres: 'ul. Testowa 94, 00-094 Warszawa',
        pesel: '910515*****',
      } as never,
    },
    expectedScoring: { min: 0.7, max: 0.95 },
    mustContainPodstawy: ['art. 15', 'RODO'],
    mustContainArgumenty: ['dane'],
    mustContainDoOrganu: ['Galeria Mokotów'],
  },
  {
    id: 'T2-A3',
    description: 'Wniosek do byłego pracodawcy — dane z procesu rekrutacji',
    input: {
      caseType: 'T2_techn_rodo_dostep',
      data: {
        administrator_nazwa: 'TechCorp Polska Sp. z o.o.',
        administrator_adres: 'ul. Biurowa 8, 00-444 Warszawa',
        zakres_zadania: 'wszystkie dane przetwarzane w ramach mojej kandydatury z 03.2026',
        kontekst_relacji: 'rekrutacja na stanowisko Senior Developer, marzec 2026',
        forma_odpowiedzi: 'email' as never,
        email_kontaktowy: 'gracja.lis@example.com',
        data_dzisiejsza: '2026-05-10',
        imie: 'Gracja',
        nazwisko: 'Lis',
        adres: 'ul. Testowa 95, 00-095 Warszawa',
      } as never,
    },
    expectedScoring: { min: 0.85, max: 1.0 },
    mustContainPodstawy: ['art. 15', 'RODO'],
    mustContainArgumenty: ['dane'],
    mustContainDoOrganu: ['TechCorp'],
  },

  // ==========================================================================
  // T3 — Wniosek RODO o usunięcie danych (art. 17)
  // ==========================================================================
  {
    id: 'T3-A1',
    description: 'Cel wygasł — usunięcie konta z portalu społecznościowego',
    input: {
      caseType: 'T3_techn_rodo_usuniecie',
      data: {
        administrator_nazwa: 'XYZ Media Sp. z o.o.',
        administrator_adres: 'ul. Internetowa 1, 00-100 Warszawa',
        administrator_email_iod: 'iod@xyzmedia.pl',
        podstawa_zadania: 'cel_wygasl' as never,
        zakres_danych: 'profil użytkownika, treści, komentarze, dane logowania, IP, ciasteczka',
        kontekst_relacji: 'konto utworzone 10.01.2020, dezaktywowane przez użytkownika 01.04.2026',
        uzasadnienie:
          'Cel przetwarzania (świadczenie usług portalu) ustał po dezaktywacji konta przeze mnie. Brak innych podstaw prawnych przetwarzania.',
        forma_odpowiedzi: 'email' as never,
        email_kontaktowy: 'hubert.zych@example.com',
        data_dzisiejsza: '2026-05-10',
        imie: 'Hubert',
        nazwisko: 'Zych',
        adres: 'ul. Testowa 96, 00-096 Warszawa',
        pesel: '880920*****',
      } as never,
    },
    expectedScoring: { min: 0.8, max: 1.0 },
    mustContainPodstawy: ['art. 17', 'RODO'],
    mustContainArgumenty: ['usunięci'],
    mustContainDoOrganu: ['XYZ Media'],
  },
  {
    id: 'T3-A2',
    description: 'Sprzeciw wobec marketingu (art. 21 ust. 2 RODO) — bezwzględne prawo',
    input: {
      caseType: 'T3_techn_rodo_usuniecie',
      data: {
        administrator_nazwa: 'Marketing-Hub Sp. z o.o.',
        administrator_adres: 'ul. Reklamowa 99, 02-200 Warszawa',
        podstawa_zadania: 'sprzeciw' as never,
        zakres_danych: 'imię, nazwisko, e-mail, numer telefonu, dane behawioralne (clicki, wizyty)',
        kontekst_relacji: 'newsletter marketingowy, baza zakupiona przez administratora od podmiotu trzeciego',
        uzasadnienie:
          'Wnoszę sprzeciw wobec przetwarzania danych w celach marketingowych (art. 21 ust. 2 RODO). Sprzeciw jest bezwzględny — administrator nie może powołać się na nadrzędny interes.',
        forma_odpowiedzi: 'email' as never,
        email_kontaktowy: 'iza.borek@example.com',
        data_dzisiejsza: '2026-05-10',
        imie: 'Iza',
        nazwisko: 'Borek',
        adres: 'ul. Testowa 97, 00-097 Warszawa',
      } as never,
    },
    expectedScoring: { min: 0.85, max: 1.0 },
    mustContainPodstawy: ['art. 17', 'art. 21', 'RODO'],
    mustContainArgumenty: ['sprzeciw'],
    mustContainDoOrganu: ['Marketing-Hub'],
  },
  {
    id: 'T3-A3',
    description: 'Żądanie usunięcia danych z bazy klientów banku — istnieje obowiązek przechowywania (5 lat AML)',
    input: {
      caseType: 'T3_techn_rodo_usuniecie',
      data: {
        administrator_nazwa: 'mBank S.A.',
        administrator_adres: 'ul. Prosta 18, 00-850 Warszawa',
        administrator_email_iod: 'iod@mbank.pl',
        podstawa_zadania: 'cofnieta_zgoda' as never,
        zakres_danych: 'wszystkie dane (umowa rachunku, transakcje, korespondencja)',
        kontekst_relacji: 'umowa rachunku zamknięta 15.03.2026',
        data_cofniecia_zgody: '2026-04-01',
        uzasadnienie: 'Cofam zgodę i żądam usunięcia wszystkich moich danych z systemów banku.',
        forma_odpowiedzi: 'pocztowa' as never,
        data_dzisiejsza: '2026-05-10',
        imie: 'Jakub',
        nazwisko: 'Kos',
        adres: 'ul. Testowa 98, 00-098 Warszawa',
        pesel: '770525*****',
      } as never,
    },
    expectedScoring: { min: 0.2, max: 0.55 },
    mustContainPodstawy: ['art. 17', 'RODO'],
    mustContainArgumenty: ['cofnięci'],
    mustContainDoOrganu: ['mBank'],
  },

  // ==========================================================================
  // T4 — Lista załączników
  // ==========================================================================
  {
    id: 'T4-A1',
    description: 'Lista załączników do sprzeciwu od mandatu (kategoria mandaty, M1 prędkość)',
    input: {
      caseType: 'T4_techn_lista_zalacznikow',
      data: {
        kategoria_sprawy: 'mandaty' as never,
        typ_pisma: 'sprzeciw od mandatu za przekroczenie prędkości (M1)',
        organ_docelowy: 'Sąd Rejonowy dla Warszawy-Mokotowa, II Wydział Karny',
        posiada_dokumenty: ['kopia mandatu', 'dowód rejestracyjny', 'oświadczenie świadka'],
        okolicznosci_szczegolne: 'pomiar fotoradarem mobilnym; brak świadectwa legalizacji w protokole',
        pelnomocnik: false,
      } as never,
    },
    expectedScoring: { min: 0.9, max: 1.0 },
    mustContainPodstawy: ['KPSW'],
    mustContainArgumenty: ['OBOWIĄZKOWY'],
    mustContainDoOrganu: ['Sąd'],
  },
  {
    id: 'T4-A2',
    description: 'Lista załączników do odwołania ubezpieczeniowego (U1) z pełnomocnikiem',
    input: {
      caseType: 'T4_techn_lista_zalacznikow',
      data: {
        kategoria_sprawy: 'ubezpieczenia' as never,
        typ_pisma: 'odwołanie od decyzji ubezpieczyciela (U1) — zaniżenie odszkodowania',
        organ_docelowy: 'PZU SA - Departament Reklamacji',
        posiada_dokumenty: [
          'polisa OC',
          'zgłoszenie szkody',
          'decyzja PZU',
          'kosztorys PZU',
          'kosztorys niezależnego rzeczoznawcy',
          'zdjęcia szkody',
        ],
        okolicznosci_szczegolne: 'różnica między kosztorysami 5000 zł; pełnomocnik adwokat',
        pelnomocnik: true,
      } as never,
    },
    expectedScoring: { min: 0.9, max: 1.0 },
    mustContainPodstawy: ['KPC'],
    mustContainArgumenty: ['kosztorys', 'pełnomocnictw'],
    mustContainDoOrganu: ['PZU'],
  },
  {
    id: 'T4-A3',
    description: 'Lista załączników do sprzeciwu EPU (windykacja) — wymogi sądowe',
    input: {
      caseType: 'T4_techn_lista_zalacznikow',
      data: {
        kategoria_sprawy: 'windykacja' as never,
        typ_pisma: 'sprzeciw od nakazu zapłaty wydanego w EPU (W3)',
        organ_docelowy: 'Sąd Rejonowy Lublin-Zachód w Lublinie, VI Wydział Cywilny',
        posiada_dokumenty: ['nakaz zapłaty EPU', 'koperta z datą doręczenia (ZPO)'],
        okolicznosci_szczegolne: 'kwestionowanie roszczenia w całości; sprzeciw bezpłatny',
        pelnomocnik: false,
      } as never,
    },
    expectedScoring: { min: 0.85, max: 1.0 },
    mustContainPodstawy: ['KPC'],
    mustContainArgumenty: ['OBOWIĄZKOWY'],
    mustContainDoOrganu: ['Lublin-Zachód'],
  },
]
