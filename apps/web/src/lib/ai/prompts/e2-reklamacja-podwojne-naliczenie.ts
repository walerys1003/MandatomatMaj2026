/**
 * Prompt E2 — reklamacja podwójnego naliczenia opłaty e-TOLL.
 *
 * Scenariusz: użytkownik został obciążony dwukrotnie za ten sam odcinek drogi
 * (np. równoczesna rejestracja w SPOE i ZSL, błąd systemu, duplikat transakcji).
 *
 * Tryb: reklamacja do operatora systemu e-TOLL (KAS — Krajowa Administracja Skarbowa,
 * a operacyjnie do Centrum Wsparcia Klienta e-TOLL); jeśli odmowa → wniosek do KAS,
 * następnie skarga administracyjna.
 */

export const E2_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w prawie transportowym
i podatkowym. Sporządzasz reklamacje dotyczące błędnych rozliczeń w systemie e-TOLL.

ZASADY:
1. JĘZYK: formalny, precyzyjny; oparty na konkretnych transakcjach (nr, data, godzina,
   odcinek drogi, kwota).
2. STRUKTURA: oznaczenie reklamującego, oznaczenie operatora (Szef KAS, Centrum Wsparcia
   e-TOLL), oznaczenie konta SPOE, opis nieprawidłowości, żądanie zwrotu, dowody, podpis.
3. PODSTAWY PRAWNE:
   - Ustawa o drogach publicznych — art. 13ha ust. 1 (obowiązek opłaty), art. 13hb
   - Ustawa o systemie poboru opłaty elektronicznej (Dz.U. 2021 poz. 1495)
   - Ordynacja podatkowa: art. 72 § 1 (nadpłata), art. 73 (powstanie nadpłaty),
     art. 75 § 1 (wniosek o stwierdzenie nadpłaty), art. 77 § 1 (zwrot 30 dni)
   - KC: art. 405 (bezpodstawne wzbogacenie), art. 410 (świadczenie nienależne)
4. ARGUMENTACJA — typowe scenariusze:
   a) PODWÓJNA REJESTRACJA — pojazd zgłoszony w SPOE i równolegle w ZSL operatora
      (np. po przerejestrowaniu — stary kontrakt nie został zamknięty)
   b) DUPLIKAT TRANSAKCJI — ten sam odcinek + ten sam timestamp (z błędem systemu)
   c) BŁĄD ANPR — bramka odczytała tablicę dwukrotnie w ciągu sekund
   d) NAKŁADAJĄCE SIĘ ODCINKI — pojazd objęty stawką w jednym, ale błędnie
      zaliczony do drugiego cennika
   e) NIEUWZGLĘDNIONE ZWOLNIENIA — pojazdy ratownicze, służb mundurowych,
      historyczne (rocznik >40 lat z rejestracją zabytkową) — art. 13e ustawy
5. ŻĄDANIE:
   - zwrot nadpłaconej kwoty (precyzyjnie wyliczonej)
   - odsetki za zwłokę (art. 78 § 1 Ordynacji — od dnia powstania nadpłaty)
   - korekta historii transakcji w panelu klienta SPOE
6. SCORING:
   - <0.5: brak logów / niejednoznaczne dowody (np. tylko zrzut ekranu)
   - 0.5-0.7: dowody pośrednie (raport miesięczny + paragon)
   - >0.7: dwie identyczne transakcje z tego samego timestampu / oficjalne potwierdzenie
     awarii systemu z komunikatu KAS
7. OSTRZEŻENIA:
   - termin reklamacji: zwykle 12 miesięcy od daty transakcji (ograniczenie operacyjne)
   - przedawnienie nadpłaty: 5 lat od końca roku (Ordynacja podatkowa art. 80)
   - reklamacja NIE zwalnia z obowiązku uiszczenia bieżących opłat
8. ZAŁĄCZNIKI: zestawienie spornych transakcji (CSV/PDF z panelu), historia salda,
   logi OBU (jeśli dostępne), faktury, dowód rejestracyjny, ew. zaświadczenie
   o pojeździe historycznym/zwolnionym.

OUTPUT: STRICT JSON.`;

export interface E2Input {
  numer_konta_spoe: string;
  numer_rejestracyjny: string;
  marka_model: string;
  data_zdarzenia: string;
  data_dzisiejsza: string;
  rodzaj_bledu: 'podwojna_rejestracja' | 'duplikat_transakcji' | 'blad_anpr' | 'nakladajace_odcinki' | 'brak_zwolnienia' | 'inny';
  numery_transakcji: string[];
  kwota_nadplaty_pln: number;
  okolicznosci: string;
  imie: string;
  nazwisko: string;
  adres: string;
  email?: string;
  telefon?: string;
  nip?: string;
  numer_rachunku: string;
  zalaczniki?: string[];
}

export function buildE2UserPrompt(data: E2Input): string {
  return `Sporządź reklamację dotyczącą błędnego rozliczenia e-TOLL:

KONTO SPOE: ${data.numer_konta_spoe}
POJAZD: ${data.marka_model}, nr rej. ${data.numer_rejestracyjny}
DATA ZDARZENIA: ${data.data_zdarzenia}
DATA DZISIEJSZA: ${data.data_dzisiejsza}

RODZAJ BŁĘDU: ${data.rodzaj_bledu}

NUMERY SPORNYCH TRANSAKCJI:
${data.numery_transakcji.map((t, i) => `${i + 1}. ${t}`).join('\n')}

KWOTA NADPŁATY (do zwrotu): ${data.kwota_nadplaty_pln.toFixed(2)} PLN

OKOLICZNOŚCI: ${data.okolicznosci}

REKLAMUJĄCY: ${data.imie} ${data.nazwisko}
ADRES: ${data.adres}
${data.nip ? `NIP: ${data.nip}` : ''}
${data.email ? `E-MAIL: ${data.email}` : ''}
${data.telefon ? `TEL.: ${data.telefon}` : ''}

NUMER RACHUNKU DO ZWROTU: ${data.numer_rachunku}

${data.zalaczniki && data.zalaczniki.length > 0 ? `ZAŁĄCZNIKI:\n${data.zalaczniki.map((z, i) => `${i + 1}. ${z}`).join('\n')}` : ''}

Zwróć JSON:
{
  "tytul": "Reklamacja dotycząca błędnego rozliczenia e-TOLL — konto ${data.numer_konta_spoe}",
  "do_organu": "Szef Krajowej Administracji Skarbowej (Centrum Wsparcia Klienta e-TOLL)",
  "podstawy_prawne": ["art. 72 § 1 Ordynacji podatkowej", "art. 75 § 1 Ordynacji podatkowej", "art. 405 KC", "art. 13ha ustawy o drogach publicznych", ...],
  "argumentacja": ["..."],
  "wnioski": ["Wnoszę o stwierdzenie nadpłaty w kwocie ${data.kwota_nadplaty_pln.toFixed(2)} PLN", "Wnoszę o zwrot nadpłaty na rachunek...", "Wnoszę o korektę historii transakcji...", ...],
  "scoring_szans": 0.0-1.0,
  "ostrzezenia": ["..."]
}`;
}
