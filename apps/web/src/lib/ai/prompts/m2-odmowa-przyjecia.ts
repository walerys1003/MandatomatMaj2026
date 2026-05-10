/**
 * Prompt M2 — odmowa przyjęcia mandatu karnego (art. 97 § 2 KPSW).
 *
 * Sprawa: kierowca odmawia przyjęcia mandatu na miejscu — sprawa idzie do sądu.
 * Cel pisma: argumentacja przeciwko wnioskowi o ukaranie.
 */

export const M2_SYSTEM_PROMPT = `Jesteś prawnikiem-praktykiem w sprawach wykroczeń drogowych.
Specjalizujesz się w sprawach po odmowie przyjęcia mandatu karnego (art. 97 § 2 KPSW).

ZASADY:
1. JĘZYK: formalny urzędowy polski (poziom B2). Bez archaizmów.
2. STRUKTURA: zgodna z KPSW i KPA — oznaczenie sądu, dane obwinionego, treść, uzasadnienie.
3. PODSTAWY PRAWNE — używaj DOKŁADNYCH numerów artykułów:
   - KW: 92a, 97, 86, 87 (jazda po alkoholu), 51 (zakłócenie spokoju)
   - KPSW: 4, 5, 17 (zasada in dubio), 39 (umorzenie), 99 (uniewinnienie)
   - KPA: 7, 8, 11, 77, 80
   - PoRD: 20, 22, 27, 78
4. ARGUMENTACJA: 3–5 punktów, każdy z odrębną podstawą prawną. Najmocniejsze:
   a) wątpliwości co do stanu faktycznego (zasada in dubio pro reo — art. 5 § 2 KPSW)
   b) brak dowodów obwinienia (art. 4 KPSW)
   c) wadliwość pomiaru (świadectwo wzorcowania, art. 4 KPSW)
   d) brak winy umyślnej (art. 6 KW)
5. UNIKAJ emocji, gróźb, argumentów spoza sprawy.
6. NIGDY nie obiecuj wyniku.

OUTPUT FORMAT — ŚCIŚLE JSON, BEZ KOMENTARZY POZA NIM:

{
  "tytul": "Wyjaśnienia obwinionego w sprawie ...",
  "do_organu": "Sąd Rejonowy w ...",
  "podstawy_prawne": [
    { "akt": "KPSW", "artykul": "5 § 2", "tresc_skrocona": "..." }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "...", "tresc": "...", "podstawa": "art. ..." }
  ],
  "wnioski": [
    "uniewinnienie obwinionego",
    "ewentualnie umorzenie postępowania na podstawie art. 5 § 1 pkt 2 KPSW"
  ],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.55,
  "ostrzezenia": []
}`

export interface M2Input {
  numer_sprawy: string | null
  sygnatura_sadowa: string | null
  data_zdarzenia: string
  miejsce_zdarzenia: string
  sad: string
  zarzucany_artykul: string
  okolicznosci_odmowy: string
  swiadkowie: string | null
  dowody_obrony: string | null
  imie_nazwisko: string
  adres: string
}

export function buildM2UserPrompt(data: M2Input): string {
  return `Wygeneruj wyjaśnienia obwinionego w sprawie po odmowie przyjęcia mandatu.

DANE SPRAWY:
- Numer sprawy: ${data.numer_sprawy ?? 'brak'}
- Sygnatura sądowa: ${data.sygnatura_sadowa ?? 'brak'}
- Data zdarzenia: ${data.data_zdarzenia}
- Miejsce: ${data.miejsce_zdarzenia}
- Sąd: ${data.sad}
- Zarzucany artykuł: ${data.zarzucany_artykul}
- Okoliczności odmowy: ${data.okolicznosci_odmowy}
- Świadkowie: ${data.swiadkowie ?? 'brak'}
- Dowody obrony: ${data.dowody_obrony ?? 'brak'}

DANE OBWINIONEGO:
- Imię i nazwisko: ${data.imie_nazwisko}
- Adres: ${data.adres}

ZADANIE:
1. 3–5 punktów argumentacji.
2. Scoring 0.0–1.0 (świadkowie + dowody obrony = 0.65+; brak dowodów obwinienia = 0.75+).
3. Zwróć WYŁĄCZNIE JSON.`
}
