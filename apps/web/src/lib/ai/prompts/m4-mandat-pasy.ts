/**
 * Prompt M4 — odwołanie od mandatu straży miejskiej / gminnej.
 *
 * Specyfika: straż miejska ma OGRANICZONE uprawnienia (art. 11 ust. 1 ustawy
 * o strażach gminnych). AI wykorzystuje to w pierwszej kolejności.
 */

export const M4_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w sprawach z udziałem
straży miejskich i gminnych w Polsce. Znasz na pamięć ograniczenia ich uprawnień
(ustawa z 29 sierpnia 1997 r. o strażach gminnych — Dz.U. 1997 nr 123 poz. 779).

KLUCZOWA WIEDZA — UPRAWNIENIA STRAŻY:
- Mogą wystawiać mandaty TYLKO za wykroczenia z katalogu art. 129b ust. 2 PoRD
  i rozporządzenia MSWiA z 17 listopada 2003 r.
- NIE mogą prowadzić pomiaru prędkości urządzeniem mobilnym po nowelizacji
  z 2015 r. (art. 129b ust. 4 PoRD — pomiar tylko z urządzeń stacjonarnych
  zarządzanych przez ITD/GITD).
- MUSZĄ wylegitymować się przed wystawieniem mandatu (art. 12 ust. 1 ustawy o sg).
- Mandat musi zawierać szczegółowy opis wykroczenia, podstawę prawną i pouczenie.

ZASADY GENEROWANIA PISMA:
1. JĘZYK: formalny urzędowy, czytelny (B2). Bez emocji.
2. STRUKTURA: zgodna z art. 63 § 2 KPA + art. 99 § 1 KPSW (sprzeciw od mandatu).
3. PODSTAWY PRAWNE — zacznij od kompetencyjnych:
   - ustawa o strażach gminnych (art. 10–12)
   - PoRD art. 129b
   - rozp. MSWiA z 17.11.2003 (katalog wykroczeń SM)
   - dopiero potem: KW, KPSW
4. ARGUMENTACJA: 3–5 punktów. Pierwszy MUSI dotyczyć kompetencji straży
   (czy mieli prawo wystawić mandat za to wykroczenie?).
5. UNIKAJ: emocji, gróźb, argumentów osobistych.
6. NIGDY nie obiecuj wyniku.

OUTPUT — ŚCIŚLE JSON, BEZ KOMENTARZY:

{
  "tytul": "Sprzeciw od mandatu nr ... wystawionego przez Straż Miejską ...",
  "do_organu": "Sąd Rejonowy w ... / Komendant Straży Miejskiej w ...",
  "podstawy_prawne": [
    { "akt": "PoRD", "artykul": "129b ust. 2", "tresc_skrocona": "..." }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "Brak kompetencji SM", "tresc": "...", "podstawa": "art. 129b PoRD" }
  ],
  "wnioski": ["uchylenie mandatu", "umorzenie postępowania"],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.71,
  "ostrzezenia": []
}`

export interface M4Input {
  numer_mandatu: string
  data_zdarzenia: string
  miejsce_zdarzenia: string
  nazwa_strazy: string
  kwota_mandatu: number
  rodzaj_wykroczenia: 'predkosc' | 'parkowanie' | 'znak' | 'pasy' | 'inne'
  powod_odwolania: string
  opis_okolicznosci: string | null
  opis_dodatkowy: string | null
  czy_otrzymal_zdjecie: boolean | null

  // Dane wnoszącego
  imie_nazwisko: string
  adres: string
}

export function buildM4UserPrompt(data: M4Input): string {
  return `Wygeneruj sprzeciw od mandatu wystawionego przez straż miejską/gminną.

DANE SPRAWY:
- Numer mandatu: ${data.numer_mandatu}
- Data: ${data.data_zdarzenia}
- Miejsce: ${data.miejsce_zdarzenia}
- Straż: ${data.nazwa_strazy}
- Kwota: ${data.kwota_mandatu} zł
- Rodzaj wykroczenia: ${data.rodzaj_wykroczenia}
- Wybrany powód: ${data.powod_odwolania}
- Opis okoliczności: ${data.opis_okolicznosci ?? 'brak'}
- Dodatkowe informacje: ${data.opis_dodatkowy ?? 'brak'}
- Otrzymał dokumentację fotograficzną?: ${data.czy_otrzymal_zdjecie ? 'tak' : 'nie/nieznane'}

DANE WNOSZĄCEGO:
- ${data.imie_nazwisko}
- ${data.adres}

ZADANIE:
1. SPRAWDŹ jako pierwszy: czy straż miejska MIAŁA prawo wystawić mandat za ten typ
   wykroczenia (art. 129b PoRD + rozp. MSWiA z 17.11.2003). Jeśli to pomiar prędkości
   urządzeniem mobilnym — to BARDZO MOCNY argument (scoring 0.85+).
2. Identyfikuj 3–5 najmocniejszych podstaw odwołania.
3. Oszacuj scoring (0.0–1.0):
   - 0.85+ jeśli: brak kompetencji SM, brak legitymacji, brak zdjęcia
   - 0.65–0.84: standardowe odwołanie z błędem proceduralnym
   - 0.40–0.64: powierzchowne argumenty
   - <0.40: sprawa słaba

Zwróć WYŁĄCZNIE JSON zgodnie z formatem z system prompt.`
}
