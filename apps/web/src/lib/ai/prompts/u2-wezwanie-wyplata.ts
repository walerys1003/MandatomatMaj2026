/**
 * Prompt U2 — wezwanie do wypłaty odszkodowania.
 *
 * Scenariusz: zakład ubezpieczeń przekroczył ustawowy termin 30 dni (art. 14 ust. 1
 * ustawy o ubezpieczeniach obowiązkowych) lub 30 dni z ustawy o działalności
 * ubezpieczeniowej; brak decyzji lub odmowa bez podstawy prawnej.
 *
 * Procedura: wezwanie przedsądowe (warunek konieczny pozwu) → mediacja RF/UFG → sąd.
 */

export const U2_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w prawie ubezpieczeniowym.
Sporządzasz wezwania przedsądowe do zapłaty odszkodowania kierowane do zakładów ubezpieczeń.

ZASADY:
1. JĘZYK: formalny, urzędowy polski; ton stanowczy ale rzeczowy. Pismo musi spełniać funkcję
   wezwania do dobrowolnego spełnienia świadczenia (warunek formalny pozwu — art. 187 § 1 pkt 3 KPC).
2. STRUKTURA: nagłówek "WEZWANIE DO ZAPŁATY", dane stron, oznaczenie sprawy
   (numer szkody/polisy), żądanie, uzasadnienie, termin zapłaty (zwykle 7 dni),
   numer rachunku, ostrzeżenie o skierowaniu sprawy do sądu, podpis.
3. PODSTAWY PRAWNE — TERMINY WYPŁATY:
   - art. 14 ust. 1 ustawy o ubezpieczeniach obowiązkowych — 30 dni od zgłoszenia (OC)
   - art. 14 ust. 2 — 14 dni od wyjaśnienia okoliczności (gdy 30 dni niemożliwe),
     ale BEZWZGLĘDNIE max 90 dni (chyba że postępowanie karne/cywilne)
   - art. 817 § 1 KC — 30 dni od zawiadomienia (umowy AC, NNW, majątkowe)
   - art. 817 § 2 KC — 14 dni od wyjaśnienia, max 90 dni
4. ODSETKI ZA OPÓŹNIENIE:
   - art. 481 § 1 KC — od dnia wymagalności (31. dnia od zgłoszenia)
   - odsetki ustawowe za opóźnienie (obecnie 11,25% w skali roku — sprawdzić aktualne)
   - art. 14 ust. 3 ustawy o ub. obowiązkowych — odsetki nawet gdy wina poszkodowanego nie jest jeszcze ustalona
5. ARGUMENTACJA:
   a) FAKTY — data zdarzenia, data zgłoszenia, brak decyzji/zaniżenie kwoty
   b) STWIERDZENIE OPÓŹNIENIA — wskazanie ile dni minęło ponad ustawowy termin
   c) WYSOKOŚĆ ROSZCZENIA — kwota główna + odsetki + koszty (np. opinia rzeczoznawcy art. 442^1 KC)
   d) ZASADA RESTYTUCJI — art. 363 KC, koszty przywrócenia do stanu poprzedniego
   e) ORZECZNICTWO — uchwała SN III CZP 32/03 (utrata wartości handlowej), uchwała SN III CZP 80/11
      (koszt części oryginalnych nawet gdy pojazd starszy niż 5 lat)
6. ŻĄDANIE:
   - kwota główna w PLN (precyzyjnie)
   - odsetki ustawowe za opóźnienie liczone od konkretnej daty
   - termin 7 dni od doręczenia wezwania
   - rachunek bankowy do wpłaty
   - zastrzeżenie skierowania sprawy na drogę sądową w razie braku zapłaty
7. OSTRZEŻENIA przy scoring_szans:
   - <0.5: brak dokumentów potwierdzających szkodę / kwota sporna na poziomie kosztorysu
   - 0.5-0.7: oczywiste opóźnienie, ale brak rzeczoznawcy niezależnego
   - >0.7: opóźnienie >60 dni, dokumentacja kompletna, kosztorys niezależny
8. ZAŁĄCZNIKI standardowe: kopia zgłoszenia szkody, polisa, kosztorys ubezpieczyciela,
   kosztorys/opinia niezależnego rzeczoznawcy, faktury za naprawę, dokumenty pojazdu,
   pełnomocnictwo (jeśli dotyczy).

OUTPUT: STRICT JSON, bez komentarzy, bez markdown poza polami tekstowymi.`;

export interface U2Input {
  ubezpieczyciel: string;
  adres_ubezpieczyciela: string;
  numer_szkody: string;
  numer_polisy?: string;
  rodzaj_ubezpieczenia: 'OC' | 'AC' | 'NNW' | 'majatkowe' | 'inne';
  data_zdarzenia: string;
  data_zgloszenia: string;
  data_dzisiejsza: string;
  kwota_zadana_pln: number;
  kwota_wyplacona_pln?: number;
  numer_rachunku: string;
  termin_zaplaty_dni: number;
  okolicznosci_szkody: string;
  uzasadnienie_kwoty: string;
  poszkodowany_imie: string;
  poszkodowany_nazwisko: string;
  poszkodowany_adres: string;
  poszkodowany_pesel?: string;
  zalaczniki?: string[];
}

export function buildU2UserPrompt(data: U2Input): string {
  const dataZgl = new Date(data.data_zgloszenia);
  const dataDzis = new Date(data.data_dzisiejsza);
  const dniOdZgloszenia = Math.floor((dataDzis.getTime() - dataZgl.getTime()) / (1000 * 60 * 60 * 24));
  const dniOpoznienia = Math.max(0, dniOdZgloszenia - 30);
  const kwotaSporna = data.kwota_zadana_pln - (data.kwota_wyplacona_pln ?? 0);

  return `Sporządź wezwanie do zapłaty odszkodowania dla:

UBEZPIECZYCIEL: ${data.ubezpieczyciel}
ADRES: ${data.adres_ubezpieczyciela}
NUMER SZKODY: ${data.numer_szkody}
${data.numer_polisy ? `NUMER POLISY: ${data.numer_polisy}` : ''}
RODZAJ UBEZPIECZENIA: ${data.rodzaj_ubezpieczenia}

POSZKODOWANY: ${data.poszkodowany_imie} ${data.poszkodowany_nazwisko}
ADRES: ${data.poszkodowany_adres}
${data.poszkodowany_pesel ? `PESEL: ${data.poszkodowany_pesel}` : ''}

CHRONOLOGIA:
- Data zdarzenia: ${data.data_zdarzenia}
- Data zgłoszenia szkody: ${data.data_zgloszenia}
- Data dzisiejsza: ${data.data_dzisiejsza}
- Dni od zgłoszenia: ${dniOdZgloszenia}
- Dni opóźnienia ponad ustawowy termin 30 dni: ${dniOpoznienia}

KWOTY:
- Żądana kwota główna: ${data.kwota_zadana_pln.toFixed(2)} PLN
${data.kwota_wyplacona_pln !== undefined ? `- Kwota dotychczas wypłacona: ${data.kwota_wyplacona_pln.toFixed(2)} PLN` : '- Brak jakiejkolwiek wypłaty'}
- Kwota sporna (do dopłaty): ${kwotaSporna.toFixed(2)} PLN

OKOLICZNOŚCI: ${data.okolicznosci_szkody}

UZASADNIENIE WYSOKOŚCI: ${data.uzasadnienie_kwoty}

ŻĄDANIE: zapłata ${kwotaSporna.toFixed(2)} PLN + odsetki ustawowe za opóźnienie od ${dniOpoznienia > 0 ? 'dnia wymagalności (31. dnia od zgłoszenia)' : 'dnia wymagalności'} w terminie ${data.termin_zaplaty_dni} dni od doręczenia wezwania.

NUMER RACHUNKU: ${data.numer_rachunku}

${data.zalaczniki && data.zalaczniki.length > 0 ? `ZAŁĄCZNIKI:\n${data.zalaczniki.map((z, i) => `${i + 1}. ${z}`).join('\n')}` : ''}

Zwróć JSON w formacie:
{
  "tytul": "WEZWANIE DO ZAPŁATY w sprawie szkody nr ${data.numer_szkody}",
  "do_organu": "${data.ubezpieczyciel}, ${data.adres_ubezpieczyciela}",
  "podstawy_prawne": ["art. 14 ust. 1 ustawy o ubezpieczeniach obowiązkowych", "art. 817 § 1 KC", "art. 481 § 1 KC", ...],
  "argumentacja": ["Punkt 1: opóźnienie...", "Punkt 2: zaniżenie...", ...],
  "wnioski": ["Wnoszę o zapłatę kwoty ${kwotaSporna.toFixed(2)} PLN...", "Wnoszę o zapłatę odsetek ustawowych za opóźnienie...", "Wyznaczam termin ${data.termin_zaplaty_dni} dni..."],
  "scoring_szans": 0.0-1.0,
  "ostrzezenia": ["..."]
}`;
}
