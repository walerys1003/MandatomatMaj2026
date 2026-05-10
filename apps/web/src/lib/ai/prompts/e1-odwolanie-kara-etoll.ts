/**
 * Prompt E1 — odwołanie od kary administracyjnej e-TOLL.
 *
 * Tryb: KPA — odwołanie od decyzji Głównego Inspektora Transportu Drogowego (GITD)
 * o nałożeniu kary za nieuiszczenie opłaty elektronicznej / brak rejestracji w SPOE.
 *
 * Termin: 14 dni od doręczenia decyzji (art. 129 § 2 KPA).
 */

export const E1_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w prawie transportowym
i postępowaniu administracyjnym. Sporządzasz odwołania od decyzji GITD o nałożeniu kary
za nieprawidłowości w systemie e-TOLL.

ZASADY:
1. JĘZYK: formalny, urzędowy polski; precyzyjna terminologia administracyjna i transportowa.
2. STRUKTURA: oznaczenie odwołującego, oznaczenie organu (GITD jako organ I instancji,
   odwołanie do Ministra Infrastruktury jako organ II instancji), nr decyzji,
   data doręczenia, zarzuty, wnioski, uzasadnienie, podpis.
3. PODSTAWY PRAWNE:
   - Ustawa o drogach publicznych z 21.03.1985 r. (Dz.U. 2024 poz. 320 t.j.) — art. 13hb–13hd
   - Ustawa o systemie poboru opłaty elektronicznej (Dz.U. 2021 poz. 1495)
   - Rozporządzenie MI z 28.06.2021 — wykaz dróg objętych e-TOLL
   - KPA: art. 127 (odwołanie), art. 128 (forma), art. 129 § 2 (14 dni termin),
     art. 138 § 1 (rozstrzygnięcia organu II instancji), art. 145 § 1 pkt 5 (wznowienie)
4. ARGUMENTACJA — najczęstsze podstawy odwołania:
   a) BŁĄD URZĄDZENIA OBU/ZSL — pojazd zarejestrowany w SPOE, ale OBU nie nadawało sygnału
      (awaria GPS, brak baterii, błąd transmisji) — dowód: log pojazdu, zgłoszenie reklamacji
   b) PRZERWY W ŁĄCZNOŚCI w terenie (góry, tunele) — art. 13hb ust. 5 — dopuszcza zwolnienie
   c) BRAK OBOWIĄZKU UISZCZENIA (pojazd <3,5t / DMC ≤ 3,5 t bez homologacji towarowej)
   d) BŁĘDNE ROZPOZNANIE TABLIC (ANPR) — nie ten pojazd / podmiana znaków
   e) UTRATA WŁADANIA POJAZDEM — kradzież, sprzedaż, wynajem (potwierdzenie umową)
   f) PŁATNOŚĆ ZRZUCONA — saldo prepaid > 0, ale system nie pobrał z powodu błędu rozliczeniowego
   g) PRZEDAWNIENIE — art. 68 § 1 Ordynacji podatkowej w zw. z art. 13ha ust. 1 ustawy
      (5 lat licząc od końca roku kalendarzowego, w którym powstał obowiązek)
   h) BRAK DECYZJI o wymierzeniu kary w terminie — art. 189g KPA (5 lat od popełnienia)
5. KARY (wysokość):
   - art. 13k ustawy o drogach publicznych — 500 zł / każdy stwierdzony przejazd
   - kara łączna ograniczona w jednej kontroli (max 7500 zł / dobę / pojazd)
6. WNIOSKI:
   - uchylenie decyzji w całości i umorzenie postępowania (art. 138 § 1 pkt 2 KPA), LUB
   - uchylenie i przekazanie do ponownego rozpoznania (art. 138 § 2)
   - wstrzymanie wykonania decyzji do czasu rozpoznania odwołania (art. 130 § 2 KPA)
7. SCORING:
   - <0.5: brak dokumentów technicznych (logi OBU); kara za faktyczny brak rejestracji
   - 0.5-0.7: dokumentacja częściowa; argument techniczny prawdopodobny
   - >0.7: udokumentowana awaria/reklamacja u operatora; pojazd nieobjęty obowiązkiem;
     przedawnienie; błąd identyfikacji
8. OSTRZEŻENIA:
   - termin 14 dni jest NIEPRZYWRACALNY bez wniosku z art. 58 KPA (przyczyny niezawinione)
   - odwołanie nie wstrzymuje wykonalności automatycznie — należy wniosek z art. 130 § 2
   - opłata skarbowa: brak (postępowanie wszczęte z urzędu)
9. ZAŁĄCZNIKI: kopia decyzji GITD, dowód rejestracyjny, umowa z operatorem SPOE,
   logi OBU/ZSL, korespondencja reklamacyjna z operatorem, ew. dokumenty zwolnienia
   (umowa kupna-sprzedaży, zaświadczenie o kradzieży), pełnomocnictwo.

OUTPUT: STRICT JSON.`;

export interface E1Input {
  numer_decyzji: string;
  data_decyzji: string;
  data_doreczenia: string;
  data_dzisiejsza: string;
  kwota_kary_pln: number;
  data_zdarzenia: string;
  miejsce_zdarzenia?: string;
  numer_rejestracyjny: string;
  marka_model: string;
  dmc_kg: number;
  podstawa_zarzutu: 'brak_rejestracji' | 'nieuiszczenie_oplaty' | 'awaria_obu' | 'inna';
  okolicznosci: string;
  operator_spoe?: string;
  numer_obu?: string;
  imie: string;
  nazwisko: string;
  adres: string;
  pesel?: string;
  nip?: string;
  zalaczniki?: string[];
}

export function buildE1UserPrompt(data: E1Input): string {
  const dataDor = new Date(data.data_doreczenia);
  const dataDzis = new Date(data.data_dzisiejsza);
  const dniOdDoreczenia = Math.floor((dataDzis.getTime() - dataDor.getTime()) / (1000 * 60 * 60 * 24));
  const terminMinal = dniOdDoreczenia > 14;

  return `Sporządź odwołanie od decyzji GITD w sprawie kary e-TOLL:

DECYZJA: nr ${data.numer_decyzji}, z dnia ${data.data_decyzji}
DATA DORĘCZENIA: ${data.data_doreczenia} (${dniOdDoreczenia} dni temu — termin 14 dni ${terminMinal ? 'MINĄŁ' : 'biegnie'})
KWOTA KARY: ${data.kwota_kary_pln.toFixed(2)} PLN

ZDARZENIE:
- Data: ${data.data_zdarzenia}
${data.miejsce_zdarzenia ? `- Miejsce: ${data.miejsce_zdarzenia}` : ''}
- Pojazd: ${data.marka_model}, nr rej. ${data.numer_rejestracyjny}, DMC ${data.dmc_kg} kg
- Podstawa zarzutu: ${data.podstawa_zarzutu}
${data.operator_spoe ? `- Operator SPOE: ${data.operator_spoe}` : ''}
${data.numer_obu ? `- OBU: ${data.numer_obu}` : ''}

OKOLICZNOŚCI: ${data.okolicznosci}

ODWOŁUJĄCY: ${data.imie} ${data.nazwisko}
ADRES: ${data.adres}
${data.pesel ? `PESEL: ${data.pesel}` : ''}
${data.nip ? `NIP: ${data.nip}` : ''}

${data.zalaczniki && data.zalaczniki.length > 0 ? `ZAŁĄCZNIKI:\n${data.zalaczniki.map((z, i) => `${i + 1}. ${z}`).join('\n')}` : ''}

Zwróć JSON:
{
  "tytul": "Odwołanie od decyzji GITD nr ${data.numer_decyzji}",
  "do_organu": "Minister Infrastruktury (za pośrednictwem Głównego Inspektora Transportu Drogowego)",
  "podstawy_prawne": ["art. 127 KPA", "art. 129 § 2 KPA", "art. 13hb ustawy o drogach publicznych", ...],
  "argumentacja": ["..."],
  "wnioski": ["Wnoszę o uchylenie decyzji w całości...", "Wnoszę o wstrzymanie wykonania...", ...],
  "scoring_szans": 0.0-1.0,
  "ostrzezenia": ${terminMinal ? '["UWAGA: termin 14 dni minął — konieczny wniosek z art. 58 KPA o przywrócenie terminu"]' : '["..."]'}
}`;
}
