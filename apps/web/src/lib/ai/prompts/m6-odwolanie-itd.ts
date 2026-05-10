/**
 * Prompt M6 — odwołanie od kary nałożonej przez ITD (Inspekcja Transportu Drogowego).
 *
 * ITD nakłada kary administracyjne na przewoźników (głównie czas pracy kierowcy,
 * przeciążenia, tachograf). Procedura: KPA + ustawa o transporcie drogowym.
 */

export const M6_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w sprawach transportu drogowego
i postępowaniach przed Inspekcją Transportu Drogowego (ITD).

ZASADY:
1. JĘZYK: formalny urzędowy polski; znajomość terminologii transportowej (czas pracy,
   tachograf, AETR, manipulacja).
2. STRUKTURA: zgodna z art. 127 KPA — oznaczenie organu II instancji (Główny Inspektor
   Transportu Drogowego), dane strony, żądanie uchylenia decyzji, uzasadnienie.
3. PODSTAWY PRAWNE:
   - Ustawa o transporcie drogowym (Dz.U. 2001 nr 125 poz. 1371) — art. 92, 92a, 92b
   - Rozporządzenie WE 561/2006 (czas pracy kierowców)
   - Rozporządzenie WE 165/2014 (tachografy)
   - Umowa AETR
   - KPA: 7, 8, 11, 77, 80, 127-129, 138
4. ARGUMENTACJA:
   a) brak winy przewoźnika (art. 92b — wyłączenie odpowiedzialności)
   b) siła wyższa / nadzwyczajne okoliczności (art. 12 rozp. 561/2006)
   c) wadliwość pomiaru (świadectwo wzorcowania wagi / tachografu)
   d) przedawnienie (art. 92a ust. 6 — 2 lata od dnia popełnienia)
5. WNIOSEK: uchylenie decyzji w całości / w części + zwrot kary.

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Odwołanie od decyzji ITD nr ...",
  "do_organu": "Główny Inspektor Transportu Drogowego",
  "podstawy_prawne": [
    { "akt": "Ustawa o transporcie drogowym", "artykul": "92b", "tresc_skrocona": "..." }
  ],
  "argumentacja": [...],
  "wnioski": ["uchylenie decyzji w całości", "umorzenie postępowania"],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.55,
  "ostrzezenia": []
}`

export interface M6Input {
  numer_decyzji: string
  data_decyzji: string
  data_doreczenia: string
  organ_pierwszej_instancji: string
  rodzaj_naruszenia: string
  kwota_kary: number
  okolicznosci_naruszenia: string
  podstawa_obrony:
    | 'brak_winy_przewoznika'
    | 'sila_wyzsza'
    | 'wadliwy_pomiar'
    | 'przedawnienie'
    | 'inna'
  szczegoly_obrony: string
  nazwa_firmy: string
  nip: string
  adres: string
}

export function buildM6UserPrompt(data: M6Input): string {
  return `Wygeneruj odwołanie od decyzji ITD.

DANE DECYZJI:
- Numer: ${data.numer_decyzji}
- Data wydania: ${data.data_decyzji}
- Data doręczenia: ${data.data_doreczenia}
- Organ I instancji: ${data.organ_pierwszej_instancji}
- Rodzaj naruszenia: ${data.rodzaj_naruszenia}
- Kwota kary: ${data.kwota_kary} zł

OKOLICZNOŚCI: ${data.okolicznosci_naruszenia}

PODSTAWA OBRONY: ${data.podstawa_obrony}
Szczegóły: ${data.szczegoly_obrony}

DANE PRZEWOŹNIKA:
- ${data.nazwa_firmy}
- NIP: ${data.nip}
- ${data.adres}

ZADANIE:
1. Sprawdź termin (14 dni od doręczenia — art. 129 § 2 KPA).
2. Zidentyfikuj 2–4 podstawy odwołania zgodnie z podstawą obrony.
3. Scoring 0.0–1.0:
   - 0.80+ jeśli przedawnienie ewidentne lub brak winy z dokumentacją
   - 0.50–0.79 standardowa sprawa
   - <0.40 słabe podstawy
4. Zwróć WYŁĄCZNIE JSON.`
}
