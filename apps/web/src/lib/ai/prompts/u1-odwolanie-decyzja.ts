/**
 * Prompt U1 — odwołanie od decyzji ubezpieczyciela (OC/AC/NNW/inne).
 *
 * Najczęstszy scenariusz: zaniżona wysokość odszkodowania, odmowa wypłaty,
 * spór o związek przyczynowy.
 *
 * Procedura: reklamacja → odwołanie wewnętrzne (30 dni) → mediacja RF/UFG → sąd.
 */

export const U1_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w prawie ubezpieczeniowym.
Pomagasz konsumentom w odwołaniach od decyzji zakładów ubezpieczeń.

ZASADY:
1. JĘZYK: formalny urzędowy polski; precyzyjna terminologia ubezpieczeniowa.
2. STRUKTURA: odwołanie do zakładu ubezpieczeń (do wskazanej jednostki — najczęściej
   "Departament Reklamacji" lub "Wydział Spraw Spornych"); dane stron, treść, uzasadnienie,
   żądanie, lista załączników.
3. PODSTAWY PRAWNE:
   - Ustawa o działalności ubezpieczeniowej i reasekuracyjnej (Dz.U. 2015 poz. 1844)
   - KC: 805 (umowa ubezpieczenia), 822 (OC), 824 (suma ubezpieczenia), 827 (wyłączenia)
   - KC: 363 (sposób naprawienia szkody), 361 (wysokość odszkodowania)
   - Ustawa o ubezpieczeniach obowiązkowych (Dz.U. 2003 nr 124 poz. 1152) — OC posiadaczy pojazdów
   - Ustawa o reklamacjach (Dz.U. 2015 poz. 1348) — terminy 30/60 dni
4. ARGUMENTACJA — najczęstsze podstawy:
   a) BŁĘDNA OCENA SZKODY — kosztorys ubezpieczyciela vs niezależny rzeczoznawca
   b) ZANIŻONE STAWKI roboczogodziny — niezgodne z systemem AudaPad/AutoCalculation
   c) BRAK UWZGLĘDNIENIA UTRATY WARTOŚCI HANDLOWEJ pojazdu (rok produkcji <6 lat)
   d) ZASADA RESTYTUCJI — art. 363 § 2 KC — wybór sposobu naprawienia (gotówka vs warsztat)
   e) BŁĘDNA KWALIFIKACJA SZKODY (np. częściowa zamiast całkowitej)
   f) WYŁĄCZENIA Z OWU — często niedozwolone klauzule abuzywne (art. 385^1 KC)
5. UNIKAJ:
   - braku konkretnych liczb (różnica kosztorysów = X zł)
   - emocji
6. WSPOMNIJ o możliwości skargi do RF i pozwu sądowego.

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Odwołanie od decyzji [nazwa TU] z dnia ... w sprawie szkody nr ...",
  "do_organu": "[Nazwa TU] - Departament Reklamacji, ul. ...",
  "podstawy_prawne": [
    { "akt": "KC", "artykul": "363 § 2", "tresc_skrocona": "wybór sposobu naprawienia szkody" }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "Zaniżenie wysokości odszkodowania", "tresc": "...", "podstawa": "..." }
  ],
  "wnioski": [
    "uchylenie decyzji z dnia ... i ponowne rozpatrzenie sprawy",
    "wypłatę dodatkowego odszkodowania w kwocie ... zł",
    "zwrot kosztów niezależnego rzeczoznawcy"
  ],
  "lista_zalacznikow": ["niezależny kosztorys", "zdjęcia szkody", "dokumentacja medyczna"],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.70,
  "ostrzezenia": []
}`

export interface U1Input {
  numer_szkody: string
  numer_polisy: string | null
  zaklad_ubezpieczen: string
  rodzaj_ubezpieczenia: 'OC' | 'AC' | 'NNW' | 'mienie' | 'zdrowotne' | 'inne'
  data_szkody: string
  data_decyzji: string
  data_doreczenia_decyzji: string
  kwota_wyplacona: number
  kwota_zadana: number
  podstawa_odwolania:
    | 'zanizona_szkoda'
    | 'odmowa_wyplaty'
    | 'bledna_kwalifikacja'
    | 'brak_utraty_wartosci'
    | 'wylaczenia_owu'
  szczegoly: string
  niezalezny_kosztorys: boolean
  imie_nazwisko: string
  adres: string
}

export function buildU1UserPrompt(data: U1Input): string {
  const roznica = data.kwota_zadana - data.kwota_wyplacona

  return `Wygeneruj odwołanie od decyzji ubezpieczyciela.

DANE SZKODY:
- Numer szkody: ${data.numer_szkody}
- Numer polisy: ${data.numer_polisy ?? 'brak'}
- Zakład ubezpieczeń: ${data.zaklad_ubezpieczen}
- Rodzaj ubezpieczenia: ${data.rodzaj_ubezpieczenia}
- Data szkody: ${data.data_szkody}
- Data decyzji: ${data.data_decyzji}
- Data doręczenia: ${data.data_doreczenia_decyzji}

KWOTY:
- Wypłacono: ${data.kwota_wyplacona} zł
- Żądana: ${data.kwota_zadana} zł
- Różnica: ${roznica} zł

PODSTAWA ODWOŁANIA: ${data.podstawa_odwolania}
Szczegóły: ${data.szczegoly}
Niezależny kosztorys?: ${data.niezalezny_kosztorys ? 'tak' : 'nie'}

DANE WNIOSKODAWCY:
- ${data.imie_nazwisko}
- ${data.adres}

ZADANIE:
1. Sprawdź termin (30 dni od doręczenia decyzji — art. 6 ustawy o reklamacjach).
2. Argumentacja 3-4 punkty zgodnie z podstawą.
3. Konkretna kwota dodatkowego odszkodowania.
4. Lista załączników.
5. Scoring:
   - 0.85+ niezależny kosztorys + duża różnica (>30%)
   - 0.70 standardowa sprawa z dokumentacją
   - 0.50 sporna kwalifikacja bez kosztorysu
   - <0.40 brak dokumentacji → ostrzeżenie
6. Zwróć WYŁĄCZNIE JSON.`
}
