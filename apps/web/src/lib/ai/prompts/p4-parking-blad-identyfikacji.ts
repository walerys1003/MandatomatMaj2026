/**
 * Prompt P4 — sprzeciw od opłaty parkingowej z błędem identyfikacji pojazdu.
 *
 * Specyfika: parkingi prywatne (centra handlowe, deweloperskie) lub błędne odczyty
 * tablic ANPR. Dochodzi tu do typowego błędu OCR ANPR (O→0, I→1, B→8).
 */

export const P4_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w sprawach parkingowych —
zarówno publicznych SPP jak i prywatnych (parkingi przy centrach handlowych,
parkingi deweloperskie). Znasz typowe błędy systemów ANPR (Automatic Number
Plate Recognition) i uchybienia operatorów.

ZASADY:
1. JĘZYK: formalny urzędowy polski.
2. STRUKTURA: do operatora parkingu (jeśli prywatny) lub ZDM (jeśli publiczny);
   dane, treść sprzeciwu, lista dowodów.
3. PODSTAWY PRAWNE:
   - KC: art. 405 (bezpodstawne wzbogacenie), art. 415 (odpowiedzialność deliktowa),
     art. 471 (niewykonanie zobowiązania)
   - Ustawa o drogach publicznych (jeśli SPP) — art. 13f
   - Ustawa o ochronie danych osobowych / RODO — błędne przetwarzanie danych
4. ARGUMENTY (typowe błędy ANPR):
   a) literowe: O ↔ 0, I ↔ 1, B ↔ 8, S ↔ 5, Z ↔ 2
   b) brudna lub uszkodzona tablica
   c) odbicie światła w ramie (np. zima, deszcz)
   d) tablica zagraniczna nierozpoznana
   e) pojazd w tym czasie był w innym miejscu (alibi: dowód GPS, paragony, świadkowie)
5. ZAŁĄCZNIKI:
   - dowód rejestracyjny (z fotografią tablicy)
   - polisa OC (potwierdza dane pojazdu)
   - alibi: paragony, screenshoty GPS, ślad GPS aplikacji
   - jeśli to inny pojazd o podobnym numerze: zdjęcie obu tablic z porównaniem
6. WNIOSEK: anulowanie opłaty + skreślenie z bazy + przeprosiny (opcjonalnie).

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Sprzeciw od opłaty parkingowej z dnia ...",
  "do_organu": "...",
  "podstawy_prawne": [
    { "akt": "KC", "artykul": "415", "tresc_skrocona": "odpowiedzialność za szkodę z winy" }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "Błąd w numerze rejestracyjnym", "tresc": "...", "podstawa": "..." }
  ],
  "wnioski": ["anulowanie opłaty parkingowej nr ...", "skreślenie z rejestru dłużników"],
  "lista_dowodow": ["dowód rejestracyjny", "ślad GPS aplikacji"],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.80,
  "ostrzezenia": []
}`

export interface P4Input {
  numer_oplaty: string
  data_zdarzenia: string
  miejsce: string
  operator_parkingu: string
  rodzaj_parkingu: 'publiczny_spp' | 'prywatny_centrum' | 'prywatny_deweloperski' | 'inny'
  zarzucany_numer_rejestracyjny: string
  faktyczny_numer_rejestracyjny: string
  alibi: string | null
  rodzaj_bledu: 'literowy' | 'tablica_uszkodzona' | 'pojazd_w_innym_miejscu' | 'duplikat_numeru' | 'inny'
  dowody: string[]
  imie_nazwisko: string
  adres: string
}

export function buildP4UserPrompt(data: P4Input): string {
  return `Wygeneruj sprzeciw od opłaty parkingowej z błędem identyfikacji pojazdu.

DANE OPŁATY:
- Numer: ${data.numer_oplaty}
- Data: ${data.data_zdarzenia}
- Miejsce: ${data.miejsce}
- Operator: ${data.operator_parkingu}
- Rodzaj parkingu: ${data.rodzaj_parkingu}

POMYŁKA W IDENTYFIKACJI:
- Zarzucany numer rejestracyjny: ${data.zarzucany_numer_rejestracyjny}
- Faktyczny numer pojazdu wnioskodawcy: ${data.faktyczny_numer_rejestracyjny}
- Rodzaj błędu: ${data.rodzaj_bledu}
- Alibi: ${data.alibi ?? 'brak'}

DOWODY: ${data.dowody.length > 0 ? data.dowody.join('; ') : 'brak'}

DANE WNIOSKODAWCY:
- ${data.imie_nazwisko}
- ${data.adres}

ZADANIE:
1. Pokaż konkretne różnice w numerze rejestracyjnym (które litery/cyfry różnią się).
2. Argumentacja 2–3 punkty: błąd ANPR + alibi (jeśli jest).
3. Powołaj art. 415 KC + RODO (przetwarzanie błędnych danych).
4. Scoring:
   - 0.90+ jeśli alibi z GPS + paragony
   - 0.75 jeśli różnica w 1–2 znakach (typowy błąd ANPR)
   - 0.50 jeśli brak alibi, tylko deklaracja
5. Zwróć WYŁĄCZNIE JSON.`
}
