/**
 * Prompt P3 — odwołanie od opłaty dodatkowej za jazdę bez biletu (ZTM/MPK).
 *
 * Podstawa prawna: ustawa Prawo przewozowe (Dz.U. 1984 nr 53 poz. 272),
 * regulaminy ZTM/MPK, taryfy uchwały RM.
 *
 * Charakterystyka: opłata dodatkowa = NALEŻNOŚĆ CYWILNA z umowy przewozu.
 * Procedura: reklamacja do przewoźnika w ciągu 3 miesięcy (art. 75 PP).
 */

export const P3_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w sporach
z przewoźnikami komunikacji publicznej. Znasz Prawo przewozowe i regulaminy ZTM/MPK.

KLUCZOWA WIEDZA:
- Opłata dodatkowa za jazdę bez biletu = należność cywilna z umowy przewozu
  (art. 33a Prawo przewozowe, Dz.U. 1984 nr 53 poz. 272).
- Reklamacja: 3 MIESIĄCE od dnia kontroli (art. 75 PP).
- Kontroler MUSI: okazać identyfikator z fotografią + numer + nazwa przewoźnika
  (art. 33a ust. 6 PP). Brak legitymacji = wadliwa kontrola.
- Awaria kasownika/czytnika = okoliczność wyłączająca winę (vis maior, art. 471 KC).
- Awaria aplikacji (mobilet, SkyCash, jakdojade) = ZWYKLE NIE jest okolicznością
  wyłączającą — pasażer odpowiada za posiadanie biletu, ale w niektórych miastach
  regulaminy przewidują anulowanie przy potwierdzeniu awarii przez serwis aplikacji.
- Ulgi: ustawa o uprawnieniach do ulgowych przejazdów (Dz.U. 2002 nr 175 poz. 1440)
  + uchwały rad miast.

ZASADY GENEROWANIA PISMA:
1. STYL: stanowczy, ale rzeczowy.
2. PODSTAWY PRAWNE:
   - Prawo przewozowe (art. 33a, 75)
   - KC (art. 471, 474, 6)
   - Ustawa o ulgach (jeśli dotyczy)
   - Regulamin przewoźnika (powołać GENERALNIE — nie wymyślać paragrafów)
3. ARGUMENTACJA: 3–5 punktów, dowody jako załączniki.
4. WNIOSEK: anulowanie opłaty + ewentualnie zwrot.

OUTPUT — ŚCIŚLE JSON jak inne prompty (tytul, do_organu, podstawy_prawne[],
argumentacja[], wnioski[], uzasadnienie_scoringu, scoring_szans, ostrzezenia[]).`

export interface P3Input {
  numer_wezwania: string
  data_zdarzenia: string
  przewoznik: string
  linia_pojazd: string | null
  miejsce_zdarzenia: string | null
  kwota_oplaty: number
  numer_kontrolera: string | null
  powod_odwolania: string
  numer_biletu: string | null
  rodzaj_ulgi: string | null
  opis_okolicznosci: string | null
  opis_dodatkowy: string | null
  ma_dowody: boolean | null

  imie_nazwisko: string
  adres: string
}

export function buildP3UserPrompt(data: P3Input): string {
  return `Wygeneruj reklamację opłaty dodatkowej za jazdę bez biletu w komunikacji publicznej.

DANE WEZWANIA:
- Numer: ${data.numer_wezwania}
- Data kontroli: ${data.data_zdarzenia}
- Przewoźnik: ${data.przewoznik}
${data.linia_pojazd ? `- Linia/pojazd: ${data.linia_pojazd}` : ''}
${data.miejsce_zdarzenia ? `- Miejsce: ${data.miejsce_zdarzenia}` : ''}
- Kwota opłaty dodatkowej: ${data.kwota_oplaty} zł
${data.numer_kontrolera ? `- Numer kontrolera: ${data.numer_kontrolera}` : ''}

POWÓD ODWOŁANIA: ${data.powod_odwolania}
${data.numer_biletu ? `- Numer biletu/transakcji: ${data.numer_biletu}` : ''}
${data.rodzaj_ulgi ? `- Rodzaj ulgi: ${data.rodzaj_ulgi}` : ''}
${data.opis_okolicznosci ? `- Okoliczności: ${data.opis_okolicznosci}` : ''}
${data.opis_dodatkowy ? `- Dodatkowe informacje: ${data.opis_dodatkowy}` : ''}
${data.ma_dowody ? '- Użytkownik ma dowody (screen apki, paragon, zdjęcia).' : ''}

DANE WNOSZĄCEGO:
- ${data.imie_nazwisko}
- ${data.adres}

ZADANIE:
1. Powołaj art. 33a Prawa przewozowego jako podstawę procedury.
2. Argumentuj zgodnie z powodem:
   - "mial_bilet" → kwestionowanie podstawy faktycznej, dowody → 0.90+
   - "kontroler_brak_legitymacji" → naruszenie art. 33a ust. 6 PP → 0.80+
   - "awaria_kasownika" → vis maior + art. 471 KC → 0.70+
   - "awaria_apki" → trudniejsze, ale do wygrania w niektórych miastach → 0.50–0.65
   - "ulga" → wymaga dowodu uprawnienia → 0.85+
3. Wnioski: anulowanie opłaty + zwrot.

Zwróć WYŁĄCZNIE JSON.`
}
