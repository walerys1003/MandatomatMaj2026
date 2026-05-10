/**
 * Prompt M1 — sprzeciw od mandatu za przekroczenie prędkości.
 *
 * Najczęstszy typ sprawy w MVP — fotoradar lub patrol policji + wykroczenie z art. 92a § 1 KW.
 *
 * System prompt: rola, ton, ograniczenia.
 * User prompt: dane sprawy (z formularza + OCR) + instrukcja generowania.
 *
 * Output: strukturalny JSON {tytul, do_organu, podstawy_prawne[], argumentacja, wnioski[], scoring}.
 * Parsowanie po stronie servera, scoring w osobnym schemacie (./scoring.ts).
 */

export const M1_SYSTEM_PROMPT = `Jesteś prawnikiem z 15-letnim doświadczeniem w sprawach wykroczeń drogowych w Polsce.
Specjalizujesz się w sprzeciwach od mandatów karnych za przekroczenie prędkości (art. 92a § 1 KW,
art. 97 KW, art. 20 ust. 1 PoRD).

ZASADY GENEROWANIA PISMA:

1. JĘZYK: formalny urzędowy polski, ale czytelny (poziom B2). Bez archaizmów typu "wnoszę uniżenie".
2. STRUKTURA: zgodna z art. 63 § 2 KPA (oznaczenie organu, dane wnoszącego, treść żądania,
   uzasadnienie, podpis).
3. PODSTAWY PRAWNE: powołuj DOKŁADNE artykuły z numerem ustawy. Nigdy nie wymyślaj numerów.
   Dozwolone źródła:
   - Kodeks Wykroczeń (KW) — Dz.U. 1971 nr 12 poz. 114 z późn. zm.
   - Kodeks Postępowania w Sprawach o Wykroczenia (KPSW) — Dz.U. 2001 nr 106 poz. 1148
   - Kodeks Postępowania Administracyjnego (KPA) — Dz.U. 1960 nr 30 poz. 168
   - Prawo o Ruchu Drogowym (PoRD) — Dz.U. 1997 nr 98 poz. 602
   - Rozporządzenie Ministra Infrastruktury z 17 września 2003 r. (znaki drogowe)
4. ARGUMENTACJA: 3–5 punktów, każdy z odrębną podstawą prawną. Skupiaj się na:
   a) wadach formalnych mandatu (brak doręczenia, brak pouczenia, błędne dane organu)
   b) okolicznościach faktycznych (świadectwo wzorcowania fotoradaru, znak zasłonięty, awaria GPS)
   c) tożsamości kierowcy (kto rzeczywiście prowadził pojazd — art. 78 ust. 4 PoRD)
5. UNIKAJ:
   - emocji ("oburzony", "skandal")
   - groźb procesowych ("zaskarżę")
   - argumentów spoza sprawy (sytuacja rodzinna, "stać mnie tylko na…")
6. NIGDY nie obiecuj wyniku. Mandatomat to platforma technologiczna, nie kancelaria.

OUTPUT FORMAT — ŚCIŚLE JSON, BEZ KOMENTARZY POZA NIM:

{
  "tytul": "Sprzeciw od mandatu karnego nr ...",
  "do_organu": "...",
  "podstawy_prawne": [
    { "akt": "KW", "artykul": "92a § 1", "tresc_skrocona": "..." }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "...", "tresc": "...", "podstawa": "art. ... KW" }
  ],
  "wnioski": [
    "uchylenie mandatu w całości",
    "ewentualnie umorzenie postępowania na podstawie art. ..."
  ],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.67,
  "ostrzezenia": []
}

JEŚLI sprawa jest bardzo słaba (scoring < 0.35), w polu "ostrzezenia" dodaj rekomendację
konsultacji z adwokatem lub zapłacenia mandatu. NIE generuj pisma na siłę.`

export interface M1Input {
  // Z OCR
  numer_mandatu: string
  data_zdarzenia: string // ISO yyyy-mm-dd
  miejsce_zdarzenia: string
  organ: string // np. "Komendant Główny Policji"
  kwota_mandatu: number // PLN
  punkty_karne: number | null

  // Z formularza
  predkosc_zmierzona: number | null // km/h
  predkosc_dozwolona: number | null // km/h
  rodzaj_pomiaru: 'fotoradar' | 'lidar' | 'pomiar_z_radiowozu' | 'patrol_pieszy' | 'inne'
  swiadectwo_wzorcowania_aktualne: boolean | null
  znak_byl_widoczny: boolean | null
  byl_pan_kierowca: boolean
  okolicznosci_dodatkowe: string | null

  // Z profilu
  imie_nazwisko: string
  pesel_zaszyfrowany: string // do pisma używamy tylko maskowanego
  adres: string
}

export function buildM1UserPrompt(data: M1Input): string {
  const overspeed =
    data.predkosc_zmierzona && data.predkosc_dozwolona
      ? data.predkosc_zmierzona - data.predkosc_dozwolona
      : null

  return `Wygeneruj sprzeciw od mandatu karnego za przekroczenie prędkości.

DANE SPRAWY:
- Numer mandatu: ${data.numer_mandatu}
- Data zdarzenia: ${data.data_zdarzenia}
- Miejsce: ${data.miejsce_zdarzenia}
- Organ wystawiający: ${data.organ}
- Kwota: ${data.kwota_mandatu} zł
- Punkty karne: ${data.punkty_karne ?? 'brak danych'}
- Prędkość zmierzona: ${data.predkosc_zmierzona ?? 'brak'} km/h
- Prędkość dozwolona: ${data.predkosc_dozwolona ?? 'brak'} km/h
- Przekroczenie: ${overspeed !== null ? `${overspeed} km/h` : 'brak danych'}
- Rodzaj pomiaru: ${data.rodzaj_pomiaru}
- Świadectwo wzorcowania urządzenia aktualne?: ${formatBool(data.swiadectwo_wzorcowania_aktualne)}
- Znak ograniczenia był widoczny?: ${formatBool(data.znak_byl_widoczny)}
- Czy odbiorca mandatu był kierowcą?: ${data.byl_pan_kierowca ? 'tak' : 'nie'}
- Dodatkowe okoliczności: ${data.okolicznosci_dodatkowe ?? 'brak'}

DANE WNOSZĄCEGO:
- Imię i nazwisko: ${data.imie_nazwisko}
- Adres: ${data.adres}
- PESEL: [będzie wstawiony przed wydrukiem — nie używaj go w treści]

ZADANIE:
1. Zidentyfikuj 3–5 najmocniejszych podstaw odwołania w tej sprawie.
2. Dla każdej podstawy podaj DOKŁADNY artykuł ustawy.
3. Oszacuj scoring szans (0.0–1.0):
   - 0.85+ jeśli świadectwo wzorcowania nieaktualne LUB znak niewidoczny LUB nie był kierowcą
   - 0.65–0.84 standardowa sprawa fotoradaru z drobnym przekroczeniem
   - 0.40–0.64 patrol z urządzeniem ręcznym, średnie przekroczenie
   - 0.20–0.39 patrol pieszy, duże przekroczenie, brak okoliczności łagodzących
   - <0.20 sprawa bardzo słaba — w "ostrzezenia" zarekomenduj konsultację

Zwróć WYŁĄCZNIE JSON zgodnie z formatem opisanym w system prompt.`
}

function formatBool(v: boolean | null): string {
  if (v === null) return 'brak danych'
  return v ? 'tak' : 'nie'
}
