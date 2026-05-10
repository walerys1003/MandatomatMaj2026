/**
 * Prompt U3 — skarga do Rzecznika Finansowego (sektor ubezpieczeniowy).
 *
 * Tryb: po wyczerpaniu reklamacji u ubezpieczyciela (30 dni bez odpowiedzi
 * lub odpowiedź negatywna) → wniosek do RF o postępowanie interwencyjne lub
 * o pozasądowe rozwiązanie sporu (mediacja).
 */

export const U3_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w prawie ubezpieczeniowym
i ochronie konsumenta. Sporządzasz skargi/wnioski do Rzecznika Finansowego w sprawach
sporów z zakładami ubezpieczeń.

ZASADY:
1. JĘZYK: formalny, urzędowy polski; klarowna chronologia faktów.
2. STRUKTURA: nagłówek (RF, ul. Nowogrodzka 47A, 00-695 Warszawa),
   dane skarżącego, oznaczenie ubezpieczyciela, opis sprawy, żądanie,
   załączniki, podpis.
3. PODSTAWY PRAWNE:
   - Ustawa z 5.08.2015 r. o rozpatrywaniu reklamacji przez podmioty rynku finansowego
     i o Rzeczniku Finansowym (Dz.U. 2015 poz. 1348)
   - art. 17 — wniosek o interwencję (postępowanie wyjaśniające)
   - art. 35 — wniosek o pozasądowe postępowanie w sprawie rozwiązywania sporów
   - art. 36 — koszty postępowania (50 zł)
   - Ustawa o ubezpieczeniach obowiązkowych — art. 14
   - KC — art. 805, 822, 363, 481
4. WARUNKI FORMALNE:
   - skarżący wyczerpał drogę reklamacji (kopie reklamacji + odpowiedzi/brak odpowiedzi)
   - kwota sporu ≤ 5 mln zł (dla mediacji)
   - skarżący jest klientem (konsumentem) podmiotu rynku finansowego
5. ARGUMENTACJA — najczęstsze podstawy:
   a) NIEZGODNE Z PRAWEM ZANIŻENIE odszkodowania (cz. zamienne, stawki rbg)
   b) BEZZASADNA ODMOWA wypłaty (błędne powołanie się na OWU)
   c) PRZEKROCZENIE TERMINÓW art. 14 ustawy / art. 817 KC
   d) BRAK ODPOWIEDZI na reklamację (30 dni → milczące uznanie art. 8 ustawy o reklamacjach)
   e) KLAUZULE ABUZYWNE w OWU (art. 385^1 KC) — np. wyłączenia "rażącego niedbalstwa"
   f) NIEZGODNOŚĆ Z ORZECZNICTWEM SN (uchwała III CZP 32/03 — utrata wartości handlowej,
      uchwała III CZP 80/11 — części oryginalne, uchwała III CZP 91/05 — najem zastępczy)
6. ŻĄDANIE — DWA TRYBY:
   a) INTERWENCJA (art. 17): RF kieruje pismo do ubezpieczyciela z żądaniem zajęcia stanowiska;
      bezpłatne; bez mocy wiążącej, ale często skuteczne (>60% ugód)
   b) POZASĄDOWE POSTĘPOWANIE (art. 35): mediacja prowadzona przez RF; opłata 50 zł;
      kończy się protokołem (ugoda lub jej brak); przerwanie biegu przedawnienia
7. SCORING:
   - <0.5: spór o ocenę faktów (np. wina poszkodowanego); brak twardych dowodów
   - 0.5-0.7: zaniżenie kwotowe + brak rzeczoznawcy; argumentacja prawna ok
   - >0.7: oczywiste przekroczenie terminów / sprzeczność z orzecznictwem SN
8. OSTRZEŻENIA:
   - milczące uznanie reklamacji wymaga DOWODU doręczenia (potwierdzenie odbioru)
   - postępowanie przed RF NIE wstrzymuje terminu przedawnienia roszczenia (3 lata art. 819 KC)
9. ZAŁĄCZNIKI: kopia polisy, kopia zgłoszenia szkody, korespondencja z ubezpieczycielem,
   reklamacja + odpowiedź (lub dowód braku odpowiedzi), kosztorys/opinia rzeczoznawcy,
   pełnomocnictwo (jeśli dotyczy), dowód uiszczenia 50 zł (przy art. 35).

OUTPUT: STRICT JSON.`;

export interface U3Input {
  tryb: 'interwencja' | 'mediacja';
  ubezpieczyciel: string;
  numer_szkody: string;
  numer_polisy?: string;
  rodzaj_ubezpieczenia: 'OC' | 'AC' | 'NNW' | 'majatkowe' | 'inne';
  data_zdarzenia: string;
  data_zgloszenia: string;
  data_reklamacji: string;
  data_odpowiedzi_ubezpieczyciela?: string;
  tresc_decyzji?: string;
  kwota_sporna_pln: number;
  uzasadnienie_skargi: string;
  skarzacy_imie: string;
  skarzacy_nazwisko: string;
  skarzacy_adres: string;
  skarzacy_pesel?: string;
  skarzacy_email?: string;
  skarzacy_telefon?: string;
  zalaczniki?: string[];
}

export function buildU3UserPrompt(data: U3Input): string {
  const trybLabel = data.tryb === 'interwencja'
    ? 'WNIOSEK O PODJĘCIE INTERWENCJI (art. 17 ustawy o RF)'
    : 'WNIOSEK O POZASĄDOWE ROZWIĄZANIE SPORU (art. 35 ustawy o RF)';

  return `Sporządź skargę/wniosek do Rzecznika Finansowego dla:

TRYB: ${trybLabel}

UBEZPIECZYCIEL: ${data.ubezpieczyciel}
NUMER SZKODY: ${data.numer_szkody}
${data.numer_polisy ? `NUMER POLISY: ${data.numer_polisy}` : ''}
RODZAJ UBEZPIECZENIA: ${data.rodzaj_ubezpieczenia}

SKARŻĄCY: ${data.skarzacy_imie} ${data.skarzacy_nazwisko}
ADRES: ${data.skarzacy_adres}
${data.skarzacy_pesel ? `PESEL: ${data.skarzacy_pesel}` : ''}
${data.skarzacy_email ? `E-MAIL: ${data.skarzacy_email}` : ''}
${data.skarzacy_telefon ? `TEL.: ${data.skarzacy_telefon}` : ''}

CHRONOLOGIA:
- Data zdarzenia: ${data.data_zdarzenia}
- Data zgłoszenia szkody: ${data.data_zgloszenia}
- Data złożenia reklamacji: ${data.data_reklamacji}
- Data odpowiedzi ubezpieczyciela: ${data.data_odpowiedzi_ubezpieczyciela ?? 'BRAK ODPOWIEDZI (>30 dni — milczące uznanie)'}

KWOTA SPORNA: ${data.kwota_sporna_pln.toFixed(2)} PLN

${data.tresc_decyzji ? `TREŚĆ DECYZJI UBEZPIECZYCIELA: ${data.tresc_decyzji}` : ''}

UZASADNIENIE SKARGI: ${data.uzasadnienie_skargi}

${data.zalaczniki && data.zalaczniki.length > 0 ? `ZAŁĄCZNIKI:\n${data.zalaczniki.map((z, i) => `${i + 1}. ${z}`).join('\n')}` : ''}

Zwróć JSON:
{
  "tytul": "${trybLabel} dot. szkody ${data.numer_szkody}",
  "do_organu": "Rzecznik Finansowy, ul. Nowogrodzka 47A, 00-695 Warszawa",
  "podstawy_prawne": ["art. ${data.tryb === 'interwencja' ? '17' : '35'} ustawy o RF", "art. 14 ustawy o ubezpieczeniach obowiązkowych", ...],
  "argumentacja": ["..."],
  "wnioski": ["Wnoszę o ${data.tryb === 'interwencja' ? 'podjęcie interwencji wobec' : 'wszczęcie pozasądowego postępowania w sprawie rozwiązania sporu z'} ${data.ubezpieczyciel}...", ...],
  "scoring_szans": 0.0-1.0,
  "ostrzezenia": ["..."]
}`;
}
