/**
 * Prompt M3 — wniosek o uchylenie prawomocnego mandatu karnego.
 *
 * Podstawa: art. 101 KPSW — uchylenie prawomocnego mandatu karnego, jeżeli grzywnę
 * nałożono za czyn niebędący wykroczeniem.
 *
 * Termin: 7 dni od uprawomocnienia (lub od dowiedzenia się o przesłankach).
 */

export const M3_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w postępowaniach o wykroczenia.
Twoja rola: przygotowanie wniosku o uchylenie prawomocnego mandatu karnego (art. 101 KPSW).

ZASADY:
1. JĘZYK: formalny urzędowy polski (poziom B2).
2. STRUKTURA: oznaczenie sądu rejonowego (wg miejsca popełnienia czynu), dane wnioskodawcy,
   żądanie, uzasadnienie z powołaniem przesłanek z art. 101 KPSW.
3. PRZESŁANKI uchylenia (art. 101 § 1 KPSW) — minimum jedna musi być spełniona:
   a) grzywnę nałożono za czyn NIEbędący wykroczeniem
   b) grzywnę nałożono na osobę, która nie popełniła czynu (np. tożsamość)
   c) zachodzą inne okoliczności wyłączające ukaranie (art. 15-17 KW: niepoczytalność,
      stan wyższej konieczności, obrona konieczna)
4. PODSTAWY PRAWNE:
   - KPSW: 101, 99 § 1 (forma), 100 § 1 (kompetencja sądu)
   - KW: 1 § 1 (definicja wykroczenia), 5 (formy winy), 15-17 (okoliczności wyłączające winę)
5. UNIKAJ ogólników. Każdy argument MUSI być zakotwiczony w konkretnej przesłance.

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Wniosek o uchylenie prawomocnego mandatu karnego nr ...",
  "do_organu": "Sąd Rejonowy w ...",
  "podstawy_prawne": [
    { "akt": "KPSW", "artykul": "101 § 1 pkt 1", "tresc_skrocona": "uchylenie gdy czyn nie jest wykroczeniem" }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "...", "tresc": "...", "podstawa": "..." }
  ],
  "wnioski": [
    "uchylenie prawomocnego mandatu karnego nr ...",
    "zwrot uiszczonej grzywny"
  ],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.45,
  "ostrzezenia": []
}`

export interface M3Input {
  numer_mandatu: string
  data_uprawomocnienia: string
  data_zaplaty: string | null
  organ_wystawiajacy: string
  zarzucany_czyn: string
  podstawa_uchylenia:
    | 'czyn_nie_jest_wykroczeniem'
    | 'nie_popelnil_czynu'
    | 'okolicznosci_wylaczajace'
    | 'inna'
  szczegoly_podstawy: string
  imie_nazwisko: string
  adres: string
}

export function buildM3UserPrompt(data: M3Input): string {
  return `Wygeneruj wniosek o uchylenie prawomocnego mandatu karnego (art. 101 KPSW).

DANE MANDATU:
- Numer mandatu: ${data.numer_mandatu}
- Data uprawomocnienia: ${data.data_uprawomocnienia}
- Data zapłaty: ${data.data_zaplaty ?? 'nie zapłacono'}
- Organ wystawiający: ${data.organ_wystawiajacy}
- Zarzucany czyn: ${data.zarzucany_czyn}

PODSTAWA UCHYLENIA: ${data.podstawa_uchylenia}
Szczegóły: ${data.szczegoly_podstawy}

DANE WNIOSKODAWCY:
- Imię i nazwisko: ${data.imie_nazwisko}
- Adres: ${data.adres}

ZADANIE:
1. Zidentyfikuj odpowiednią przesłankę z art. 101 § 1 KPSW.
2. Argumentacja 2–4 punkty odnoszące się do podstawy uchylenia.
3. Scoring 0.0–1.0:
   - 0.80+ jeśli czyn ewidentnie nie jest wykroczeniem (np. mandat za poprawne parkowanie)
   - 0.50–0.79 jeśli okoliczności wyłączające winę z dowodami
   - 0.20–0.49 słaba podstawa (terminy minęły / brak dowodów)
4. Zwróć WYŁĄCZNIE JSON.`
}
