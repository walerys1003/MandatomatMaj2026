/**
 * Prompt T4 — generator listy załączników do pisma procesowego/administracyjnego.
 *
 * Tryb: pomocniczy moduł, który na podstawie kategorii sprawy i typu pisma
 * generuje rekomendowaną listę załączników z opisem każdego dokumentu
 * i wskazaniem czy jest obowiązkowy/zalecany/opcjonalny.
 */

export const T4_SYSTEM_PROMPT = `Jesteś prawnikiem-asystentem, który tworzy listy załączników
do pism procesowych, administracyjnych i ubezpieczeniowych.

ZASADY:
1. JĘZYK: formalny, urzędowy polski; zwięzłe opisy załączników.
2. STRUKTURA: lista numerowana z opisem każdego załącznika i statusem
   (OBOWIĄZKOWY / ZALECANY / OPCJONALNY).
3. PODSTAWY PRAWNE — WYMOGI FORMALNE PISM:
   - KPC: art. 126 § 1 (oznaczenie pism), art. 128 (odpisy), art. 130 (braki formalne)
   - KPA: art. 63 § 2 (treść podania), art. 64 § 2 (braki — wezwanie 7 dni)
   - KPSW: art. 38 (treść pism procesowych)
   - KPK: art. 119 (treść pism)
4. KATEGORIE ZAŁĄCZNIKÓW:
   a) DOKUMENTY TOŻSAMOŚCI — kopia dowodu osobistego, paszportu, KRK (jeśli wymagany)
   b) DOKUMENTY POJAZDU — dowód rejestracyjny, polisa OC, świadectwo dopuszczenia
   c) DOKUMENTY PROCESOWE — kopia mandatu/decyzji/wezwania, pokwitowanie odbioru
   d) DOWODY MERYTORYCZNE — fotografie, zrzuty ekranu, nagrania, ekspertyzy
   e) DOKUMENTY FINANSOWE — faktury, rachunki, potwierdzenia przelewów
   f) DOKUMENTY URZĘDOWE — zaświadczenia z US, ZUS, KRK, MOPS
   g) PEŁNOMOCNICTWA — gdy występuje pełnomocnik (T1)
   h) OPŁATY — dowód uiszczenia opłaty skarbowej / sądowej
   i) ODPISY DLA STRON — KPC art. 128 (odpis dla każdej strony przeciwnej)
5. STATUSY:
   - OBOWIĄZKOWY — bez niego pismo zostanie zwrócone (art. 130 KPC, art. 64 KPA)
   - ZALECANY — wzmacnia argumentację, brak nie powoduje braku formalnego
   - OPCJONALNY — może pomóc w konkretnych okolicznościach
6. KONKRETNE WYMOGI WG TYPU SPRAWY:
   M (mandaty) — kopia mandatu, dowód rejestracyjny, świadectwo legalizacji urządzenia
   P (parking) — wezwanie ZDM/SPP, zdjęcia miejsca parkowania, oznaczenia strefy
   W (windykacja) — wezwanie do zapłaty, umowa, korespondencja, dowody zapłaty
   U (ubezpieczenia) — polisa, zgłoszenie szkody, kosztorys ubezpieczyciela, kosztorys niezależny
   E (e-TOLL) — decyzja GITD, dowód rejestracyjny, umowa SPOE, logi OBU
   K (kontrole) — pokwitowanie zatrzymania PJ, protokół, świadectwo legalizacji
   T1-T3 (pomocnicze) — minimalne, wynikają z kontekstu
7. OPŁATY (wskazane explicite):
   - opłata skarbowa od pełnomocnictwa: 17 zł
   - opłata skarbowa od odwołania w KPA: 10 zł (art. 1 ustawy o opłacie skarbowej, część I poz. 53)
   - opłata sądowa od pozwu: 5% wartości przedmiotu sporu (KSCU)
   - sprzeciw od nakazu zapłaty EPU: 1/4 opłaty od pozwu (art. 19 ust. 4 KSCU)
   - opłata od reklamacji do RF (mediacja): 50 zł
8. LICZBA EGZEMPLARZY:
   - oryginał + odpis dla każdej strony (KPC art. 128)
   - postępowanie KPA — 1 egz. (organ kopiuje)
   - sąd w sprawach o wykroczenia — oryginał + ewentualny odpis dla oskarżyciela publicznego

OUTPUT: STRICT JSON. W "argumentacja" umieść listę załączników (każdy element to osobna pozycja
"X. NAZWA — STATUS — opis"), w "wnioski" — instrukcje proceduralne (ile egzemplarzy, gdzie złożyć).`;

export interface T4Input {
  kategoria_sprawy: 'mandaty' | 'parking' | 'windykacja' | 'ubezpieczenia' | 'etoll' | 'kontrole' | 'pomocnicze';
  typ_pisma: string;
  organ_docelowy: string;
  posiada_dokumenty: string[];
  okolicznosci_szczegolne?: string;
  pelnomocnik: boolean;
}

export function buildT4UserPrompt(data: T4Input): string {
  return `Wygeneruj listę załączników do pisma:

KATEGORIA SPRAWY: ${data.kategoria_sprawy}
TYP PISMA: ${data.typ_pisma}
ORGAN DOCELOWY: ${data.organ_docelowy}

DOKUMENTY POSIADANE PRZEZ STRONĘ:
${data.posiada_dokumenty.map((d, i) => `${i + 1}. ${d}`).join('\n')}

${data.okolicznosci_szczegolne ? `OKOLICZNOŚCI SZCZEGÓLNE: ${data.okolicznosci_szczegolne}` : ''}

PEŁNOMOCNIK: ${data.pelnomocnik ? 'TAK' : 'NIE'}

Zwróć JSON:
{
  "tytul": "Lista załączników do pisma: ${data.typ_pisma}",
  "do_organu": "${data.organ_docelowy}",
  "podstawy_prawne": ["art. 126 § 1 KPC / art. 63 § 2 KPA / art. 38 KPSW", ...],
  "argumentacja": ["1. Kopia [...] — OBOWIĄZKOWY — opis", "2. [...] — ZALECANY — opis", ...],
  "wnioski": ["Liczba egzemplarzy: ...", "Opłata skarbowa/sądowa: ...", "Adres do złożenia: ...", "Forma: papierowa/elektroniczna ePUAP"],
  "scoring_szans": 1.0,
  "ostrzezenia": ["Brak załącznika obowiązkowego = wezwanie do uzupełnienia (7 dni)..."]
}`;
}
