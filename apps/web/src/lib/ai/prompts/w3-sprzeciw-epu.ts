/**
 * Prompt W3 — sprzeciw od nakazu zapłaty w EPU (Elektronicznym Postępowaniu Upominawczym).
 *
 * Sąd Rejonowy Lublin-Zachód. Termin: 14 dni od doręczenia.
 * Skutek skutecznego sprzeciwu: nakaz traci moc, sprawa przekazywana do sądu właściwego.
 */

export const W3_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w EPU (Elektroniczne Postępowanie
Upominawcze) prowadzonym przez Sąd Rejonowy Lublin-Zachód w Lublinie.

ZASADY:
1. JĘZYK: formalny urzędowy polski, profesjonalny.
2. STRUKTURA: zgodna z art. 503 § 1 KPC — sygnatura, dane stron, treść sprzeciwu,
   podpis. UWAGA: sprzeciw NIE wymaga uzasadnienia, ale rekomenduje się je dodać.
3. PODSTAWY PRAWNE:
   - KPC: art. 503 § 1 (sprzeciw od nakazu w EPU), 504 (skutek sprzeciwu),
     505^28 - 505^39 (przepisy szczególne dla EPU)
   - KC: art. 117-125 (przedawnienie)
   - KC: art. 6 (ciężar dowodu)
4. KLUCZOWE — sprzeciw od nakazu w EPU:
   a) NIE wymaga uzasadnienia (art. 503 § 1 KPC)
   b) NIE wymaga opłaty
   c) Termin: 14 dni od doręczenia
   d) Skutek: nakaz upada, sprawa wraca do sądu właściwego rzeczowo i miejscowo
5. STRATEGIA: zaznaczyć kwestionowanie roszczenia w CAŁOŚCI, krótko wskazać 2–3 argumenty
   merytoryczne (przedawnienie, brak dowodów, błędna wysokość) — to ułatwi późniejszą obronę.
6. UNIKAJ przyznawania długu, oferowania zapłaty.

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Sprzeciw od nakazu zapłaty wydanego w EPU sygn. ...",
  "do_organu": "Sąd Rejonowy Lublin-Zachód w Lublinie, VI Wydział Cywilny",
  "podstawy_prawne": [
    { "akt": "KPC", "artykul": "503 § 1", "tresc_skrocona": "sprzeciw od nakazu" }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "Kwestionowanie roszczenia w całości", "tresc": "...", "podstawa": "art. 6 KC" }
  ],
  "wnioski": [
    "uchylenie nakazu zapłaty wydanego w EPU sygn. ...",
    "oddalenie powództwa w całości (po przekazaniu sprawy do sądu właściwego)"
  ],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.85,
  "ostrzezenia": [
    "Sprzeciw musisz wnieść w 14 dni od doręczenia — sprawdź datę na ZPO!",
    "Po sprzeciwie sprawa trafi do sądu właściwego — przygotuj się na rozprawę."
  ]
}`

export interface W3Input {
  sygnatura_epu: string
  data_doreczenia_nakazu: string
  powod: string
  kwota_dochodzona: number
  data_powstania_dlugu: string | null
  rodzaj_zobowiazania: string
  podstawy_kwestionowania: Array<'przedawnienie' | 'brak_dokumentow' | 'bledna_wysokosc' | 'cesja_bez_powiadomienia' | 'spelnienie_zobowiazania' | 'inna'>
  szczegoly: string
  imie_nazwisko: string
  adres: string
}

export function buildW3UserPrompt(data: W3Input): string {
  const days = Math.floor(
    (Date.now() - new Date(data.data_doreczenia_nakazu).getTime()) / (1000 * 60 * 60 * 24),
  )

  return `Wygeneruj sprzeciw od nakazu zapłaty wydanego w EPU.

DANE NAKAZU:
- Sygnatura EPU: ${data.sygnatura_epu}
- Data doręczenia: ${data.data_doreczenia_nakazu} (${days} dni temu, termin 14 dni!)
- Powód: ${data.powod}
- Kwota dochodzona: ${data.kwota_dochodzona} zł
- Data powstania długu: ${data.data_powstania_dlugu ?? 'nieokreślona'}
- Rodzaj zobowiązania: ${data.rodzaj_zobowiazania}

PODSTAWY KWESTIONOWANIA: ${data.podstawy_kwestionowania.join(', ')}
SZCZEGÓŁY: ${data.szczegoly}

DANE POZWANEGO:
- ${data.imie_nazwisko}
- ${data.adres}

ZADANIE:
1. Sprzeciw NIE wymaga uzasadnienia, ale dodaj 2-3 punkty argumentacji.
2. Powołaj art. 503 § 1 KPC.
3. Wyraźnie zaznacz kwestionowanie roszczenia w całości.
4. Scoring 0.85+ (sprzeciw w terminie zawsze obala nakaz EPU).
5. Ostrzeżenia: termin 14 dni + przygotowanie na rozprawę.
6. Zwróć WYŁĄCZNIE JSON.`
}
