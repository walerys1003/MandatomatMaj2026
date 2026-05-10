/**
 * Prompt M7 — wniosek o odroczenie zapłaty mandatu lub rozłożenie na raty.
 *
 * Podstawa: art. 67a § 1 pkt 1 i 2 Ordynacji Podatkowej (Dz.U. 1997 nr 137 poz. 926)
 * stosowanej odpowiednio do mandatów; w trybie KPA — art. 67a OP w zw. z art. 100 KPSW.
 *
 * Przesłanki: ważny interes podatnika (kierowcy) lub interes publiczny.
 */

export const M7_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w pomocy w trudnej sytuacji finansowej
osobom, którym wystawiono mandat karny lub karę administracyjną.

ROLA: przygotowanie wniosku o odroczenie terminu zapłaty / rozłożenie na raty.

ZASADY:
1. JĘZYK: formalny ale empatyczny; podkreślaj okoliczności obiektywne (utrata pracy,
   choroba, sytuacja rodzinna), nie błaganie.
2. STRUKTURA: oznaczenie organu (Naczelnik US lub organ wystawiający mandat — zależnie),
   dane wnioskodawcy, żądanie KONKRETNE (np. "rozłożenie na 6 rat po X zł" lub
   "odroczenie do dnia ..."), uzasadnienie.
3. PODSTAWY PRAWNE:
   - Ordynacja Podatkowa: art. 67a § 1 pkt 1 (odroczenie) i pkt 2 (raty); art. 67b (przesłanki)
   - KPA: art. 7 (zasada uwzględnienia słusznego interesu), 8 (proporcjonalność)
4. PRZESŁANKI (przynajmniej jedna z):
   a) ważny interes podatnika — udokumentowana sytuacja finansowa, choroba, utrata pracy
   b) interes publiczny — utrata podstawowego źródła utrzymania → utrata zdolności do
      bieżących zobowiązań (alimenty, kredyty hipoteczne)
5. ZAŁĄCZNIKI (lista do dołączenia):
   - zaświadczenie z urzędu pracy / oświadczenie o stanie majątkowym
   - dokumenty medyczne (jeśli)
   - zaświadczenie z PIT-37 lub oświadczenie o dochodach
   - zaświadczenia z OPS (jeśli)
6. UNIKAJ patetyzmu, przesady, gróźb prawnych.

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Wniosek o rozłożenie zapłaty mandatu nr ... na raty",
  "do_organu": "...",
  "podstawy_prawne": [
    { "akt": "Ordynacja Podatkowa", "artykul": "67a § 1 pkt 2", "tresc_skrocona": "..." }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "Sytuacja finansowa", "tresc": "...", "podstawa": "art. 67b § 1 pkt 1 OP" }
  ],
  "wnioski": [
    "rozłożenie kwoty ... zł na ... rat po ... zł, płatnych do ... dnia każdego miesiąca",
    "odstąpienie od naliczania odsetek za zwłokę (art. 67a § 2 OP)"
  ],
  "lista_zalacznikow": ["zaświadczenie z urzędu pracy", "..."],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.65,
  "ostrzezenia": []
}`

export interface M7Input {
  numer_mandatu: string
  organ_wystawiajacy: string
  kwota_mandatu: number
  termin_zaplaty: string
  rodzaj_wniosku: 'odroczenie' | 'raty'
  liczba_rat: number | null
  proponowana_data_odroczenia: string | null
  sytuacja_finansowa: string
  posiadane_dochody_miesieczne: number | null
  liczba_osob_na_utrzymaniu: number | null
  dodatkowe_okolicznosci: string | null
  imie_nazwisko: string
  adres: string
}

export function buildM7UserPrompt(data: M7Input): string {
  return `Wygeneruj wniosek o ${data.rodzaj_wniosku === 'raty' ? 'rozłożenie na raty' : 'odroczenie zapłaty'} mandatu.

DANE MANDATU:
- Numer: ${data.numer_mandatu}
- Organ: ${data.organ_wystawiajacy}
- Kwota: ${data.kwota_mandatu} zł
- Termin zapłaty: ${data.termin_zaplaty}

ŻĄDANIE:
- Rodzaj: ${data.rodzaj_wniosku}
${data.rodzaj_wniosku === 'raty' ? `- Liczba rat: ${data.liczba_rat ?? 'nieokreślona'}` : `- Proponowana data: ${data.proponowana_data_odroczenia ?? 'nieokreślona'}`}

SYTUACJA WNIOSKODAWCY:
- Dochody miesięczne: ${data.posiadane_dochody_miesieczne ? `${data.posiadane_dochody_miesieczne} zł` : 'nie podano'}
- Osoby na utrzymaniu: ${data.liczba_osob_na_utrzymaniu ?? 'nie podano'}
- Opis sytuacji: ${data.sytuacja_finansowa}
- Dodatkowe okoliczności: ${data.dodatkowe_okolicznosci ?? 'brak'}

DANE WNIOSKODAWCY:
- ${data.imie_nazwisko}
- ${data.adres}

ZADANIE:
1. Powołaj art. 67a § 1 pkt ${data.rodzaj_wniosku === 'raty' ? '2' : '1'} OP.
2. Argumentacja 2–3 punkty: sytuacja finansowa + interes publiczny (jeśli ma osoby na utrzymaniu).
3. Lista załączników (3–5).
4. Scoring:
   - 0.75+ jeśli niski dochód + osoby na utrzymaniu + dokumenty
   - 0.50–0.74 standardowa sprawa
   - <0.40 brak udokumentowania → ostrzeżenie
5. Zwróć WYŁĄCZNIE JSON.`
}
