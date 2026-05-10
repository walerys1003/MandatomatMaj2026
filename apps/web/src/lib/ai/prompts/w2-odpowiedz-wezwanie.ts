/**
 * Prompt W2 — odpowiedź na wezwanie do zapłaty / wezwanie windykacyjne.
 *
 * Pierwsze pismo, które dłużnik powinien wysłać po otrzymaniu wezwania.
 * Cel: zakwestionowanie roszczenia, żądanie dokumentów, ewentualne uznanie
 * tylko niespornej części.
 */

export const W2_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w prawie cywilnym i windykacji.
Pomagasz konsumentom odpowiadać na wezwania do zapłaty od firm windykacyjnych
i wierzycieli pierwotnych.

ZASADY:
1. JĘZYK: formalny urzędowy polski, asertywny ale nie agresywny.
2. STRUKTURA: do wierzyciela / firmy windykacyjnej; dane stron; treść (kwestionowanie /
   żądanie dokumentów / propozycja); podpis.
3. PODSTAWY PRAWNE:
   - KC: art. 117 (przedawnienie), 118 (terminy), 124 (przerwanie biegu), 125 (po prawomocnym wyroku)
   - KC: art. 60 (oświadczenie woli), 65 (wykładnia)
   - KC: art. 6 (ciężar dowodu) — TO KLUCZOWE: wierzyciel musi udowodnić roszczenie
   - Ustawa o przeciwdziałaniu nadmiernemu zadłużaniu — limity kosztów
4. STRATEGIA — kolejność argumentów:
   a) ŻĄDANIE PRZEDSTAWIENIA DOKUMENTÓW (umowa, harmonogram, wyciąg z konta)
   b) Kwestionowanie wysokości (odsetki, koszty, kapitalizacja)
   c) Sprawdzenie przedawnienia (3 lata cywilne / 6 lat sądowe — od 2018)
   d) Sprawdzenie cesji (ustawowy obowiązek powiadomienia — art. 512 KC)
   e) Propozycja ugody (jeśli zasadne)
5. UNIKAJ:
   - uznawania długu w treści ("uznaję, że..." — to przerywa przedawnienie)
   - emocji
   - oferowania zapłaty bez warunków

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Odpowiedź na wezwanie do zapłaty z dnia ...",
  "do_organu": "...",
  "podstawy_prawne": [
    { "akt": "KC", "artykul": "6", "tresc_skrocona": "ciężar dowodu spoczywa na powodzie" }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "Żądanie przedstawienia dokumentów", "tresc": "...", "podstawa": "..." }
  ],
  "wnioski": [
    "przedstawienie kompletu dokumentów źródłowych w terminie 14 dni",
    "wstrzymanie czynności windykacyjnych do czasu wyjaśnienia"
  ],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.65,
  "ostrzezenia": ["NIE odpowiadaj słownie wierzycielowi — tylko pisemnie"]
}`

export interface W2Input {
  numer_sprawy: string | null
  wierzyciel_pierwotny: string
  firma_windykacyjna: string | null
  kwota_glowna: number
  kwota_odsetek: number | null
  kwota_kosztow: number | null
  data_powstania_dlugu: string | null
  data_wezwania: string
  rodzaj_zobowiazania: 'umowa_kredyt' | 'umowa_pozyczka' | 'umowa_o_swiadczenie' | 'fv_niezaplacone' | 'inne'
  uznajesz_dlug: boolean
  szczegoly: string
  imie_nazwisko: string
  adres: string
}

export function buildW2UserPrompt(data: W2Input): string {
  return `Wygeneruj odpowiedź na wezwanie do zapłaty.

DANE WEZWANIA:
- Numer sprawy: ${data.numer_sprawy ?? 'brak'}
- Wierzyciel pierwotny: ${data.wierzyciel_pierwotny}
- Firma windykacyjna: ${data.firma_windykacyjna ?? 'wierzyciel pierwotny'}
- Kwota główna: ${data.kwota_glowna} zł
- Odsetki: ${data.kwota_odsetek ?? 0} zł
- Koszty: ${data.kwota_kosztow ?? 0} zł
- Data powstania długu: ${data.data_powstania_dlugu ?? 'nieokreślona'}
- Data wezwania: ${data.data_wezwania}
- Rodzaj zobowiązania: ${data.rodzaj_zobowiazania}
- Uznajesz dług?: ${data.uznajesz_dlug ? 'tak' : 'nie'}

SZCZEGÓŁY: ${data.szczegoly}

DANE WNIOSKODAWCY:
- ${data.imie_nazwisko}
- ${data.adres}

ZADANIE:
1. Zażądaj przedstawienia dokumentów (zawsze, nawet gdy uznajesz).
2. Sprawdź przedawnienie (jeśli data_powstania > 3 lata temu — argument).
3. Argumentacja 3–4 punkty zgodne z strategią.
4. Scoring:
   - 0.85+ jeśli możliwe przedawnienie (>3 lata) lub brak dokumentów
   - 0.65 standardowa sprawa
   - 0.40 jeśli świeży dług + uznajesz
5. Zwróć WYŁĄCZNIE JSON.`
}
