/**
 * Prompt P2 — reklamacja opłaty dodatkowej ZDM (Zarząd Dróg Miejskich).
 *
 * Strefa Płatnego Parkowania (SPP) — opłata dodatkowa za brak biletu.
 * Procedura: reklamacja w 7 dni → odwołanie do prezydenta miasta → SKO.
 */

export const P2_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w sprawach Strefy Płatnego Parkowania (SPP)
i opłat dodatkowych nakładanych przez ZDM lub równoważne jednostki miejskie.

ZASADY:
1. JĘZYK: formalny urzędowy polski, czytelny.
2. STRUKTURA: oznaczenie organu (ZDM / Prezydent Miasta), dane, treść reklamacji,
   uzasadnienie, lista dowodów.
3. PODSTAWY PRAWNE:
   - Ustawa o drogach publicznych (Dz.U. 1985 nr 14 poz. 60) — art. 13b, 13f
   - Uchwała rady miasta o ustaleniu SPP
   - KPA: 7, 8, 11, 77, 80, 127
4. ARGUMENTACJA — najczęstsze podstawy:
   a) bilet wykupiony — błąd techniczny czytnika / aplikacji mobilnej (moBilet, SkyCash)
   b) tablica SPP nieczytelna lub wadliwa
   c) pojazd nie znajdował się w SPP (poza godzinami / weekend / święto)
   d) opłata dodatkowa wystawiona innemu pojazdowi (błąd w numerze rejestracyjnym)
   e) zwolnienie z opłat (mieszkaniec, niepełnosprawny, pojazd elektryczny)
5. WNIOSEK: anulowanie opłaty dodatkowej + zwrot ewentualnych kosztów.
6. UNIKAJ ogólnych skarg na "system SPP" — argumenty MUSZĄ być konkretne.

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Reklamacja opłaty dodatkowej nr ...",
  "do_organu": "Zarząd Dróg Miejskich w ...",
  "podstawy_prawne": [
    { "akt": "Ustawa o drogach publicznych", "artykul": "13f ust. 2", "tresc_skrocona": "..." }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "...", "tresc": "...", "podstawa": "..." }
  ],
  "wnioski": [
    "anulowanie opłaty dodatkowej nr ...",
    "zwrot uiszczonej opłaty (jeśli zapłacono)"
  ],
  "lista_dowodow": ["paragon biletu z aplikacji moBilet", "zdjęcie tablicy SPP"],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.70,
  "ostrzezenia": []
}`

export interface P2Input {
  numer_oplaty: string
  data_zdarzenia: string
  miejsce: string
  miasto: string
  kwota_oplaty: number
  numer_rejestracyjny: string
  bilet_wykupiony: boolean
  sposob_oplaty: 'parkomat' | 'aplikacja_mobilna' | 'sms' | 'brak' | 'inne'
  numer_transakcji: string | null
  podstawa_reklamacji:
    | 'bilet_wykupiony_blad_systemu'
    | 'tablica_nieczytelna'
    | 'poza_strefa'
    | 'blad_numeru_rejestracji'
    | 'zwolnienie_z_oplat'
    | 'inna'
  szczegoly: string
  imie_nazwisko: string
  adres: string
}

export function buildP2UserPrompt(data: P2Input): string {
  return `Wygeneruj reklamację opłaty dodatkowej SPP.

DANE OPŁATY:
- Numer: ${data.numer_oplaty}
- Data: ${data.data_zdarzenia}
- Miejsce: ${data.miejsce}
- Miasto: ${data.miasto}
- Kwota: ${data.kwota_oplaty} zł
- Numer rejestracyjny: ${data.numer_rejestracyjny}

OPŁACENIE PARKINGU:
- Wykupiony?: ${data.bilet_wykupiony ? 'tak' : 'nie'}
- Sposób: ${data.sposob_oplaty}
- Numer transakcji: ${data.numer_transakcji ?? 'brak'}

PODSTAWA REKLAMACJI: ${data.podstawa_reklamacji}
Szczegóły: ${data.szczegoly}

DANE WNIOSKODAWCY:
- ${data.imie_nazwisko}
- ${data.adres}

ZADANIE:
1. Powołaj art. 13f ust. 2 ustawy o drogach publicznych + uchwałę rady miasta.
2. Argumentacja 2–3 punkty zgodne z podstawą reklamacji.
3. Lista dowodów (3–5).
4. Scoring:
   - 0.85+ bilet wykupiony + numer transakcji
   - 0.70 błąd identyfikacji pojazdu
   - 0.50 tablica nieczytelna (subiektywne)
5. Zwróć WYŁĄCZNIE JSON.`
}
