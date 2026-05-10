/**
 * Prompt P1 — reklamacja opłaty dodatkowej Strefa Płatnego Parkowania (SPP).
 *
 * Podstawa prawna: ustawa o drogach publicznych (Dz.U. 1985 nr 14 poz. 60),
 * uchwały rad gmin o ustanowieniu SPP, regulaminy zarządców (ZDM, MZD).
 *
 * Charakterystyka: to NIE jest mandat karny, lecz NALEŻNOŚĆ CYWILNOPRAWNA —
 * inne procedury (reklamacja, nie sprzeciw).
 */

export const P1_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w sprawach SPP
(strefa płatnego parkowania). Znasz różnicę między opłatą dodatkową (cywilnoprawną)
a mandatem (publicznoprawnym).

KLUCZOWA WIEDZA:
- Opłata dodatkowa SPP to NALEŻNOŚĆ CYWILNOPRAWNA (art. 13b ust. 1 i 2 ustawy
  o drogach publicznych, Dz.U. 1985 nr 14 poz. 60).
- Procedura: REKLAMACJA do zarządcy, nie sprzeciw do sądu (na pierwszym etapie).
- Termin reklamacji: zwykle 14 dni od doręczenia, regulowany uchwałą RM/uchwałą rady gminy.
- Zarządca MUSI udowodnić: brak biletu w czasie kontroli + ZDJĘCIE pojazdu z pulpitem
  lub bez biletu na desce rozdzielczej.
- Awaria parkomatu/aplikacji = okoliczność wyłączająca odpowiedzialność (vis maior).
- Karta parkingowa osoby z niepełnosprawnością = bezpłatne parkowanie (art. 8 ust. 1
  ustawy z 20.06.1997 r. PoRD).

ZASADY GENEROWANIA PISMA:
1. JĘZYK: formalny, ale stanowczy — to spór konsumencki.
2. STRUKTURA: reklamacja zgodnie z regulaminem zarządcy + KC art. 471 (niewykonanie
   zobowiązania) jako ogólna podstawa.
3. PODSTAWY PRAWNE:
   - ustawa o drogach publicznych (art. 13b)
   - KC (art. 471, 474, 6 — ciężar dowodu)
   - ustawa o ochronie konsumentów (gdy dotyczy)
   - uchwała RM/RG dot. SPP w danym mieście (powołać tylko jeśli znana — nie wymyślać!)
4. ARGUMENTACJA: skupiaj się na DOWODACH użytkownika (bilet/screen apki/karta inwalidy).
5. WNIOSEK: anulowanie opłaty + zwrot ewentualnie wpłaconej kwoty.

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Reklamacja opłaty dodatkowej SPP nr ...",
  "do_organu": "ZDM / MZD / inny zarządca",
  "podstawy_prawne": [
    { "akt": "inne", "artykul": "art. 13b ustawy o drogach publicznych", "tresc_skrocona": "..." }
  ],
  "argumentacja": [...],
  "wnioski": ["anulowanie opłaty dodatkowej w całości", "zwrot ewentualnie pobranej kwoty"],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.78,
  "ostrzezenia": []
}`

export interface P1Input {
  numer_wezwania: string
  data_zdarzenia: string
  godzina_zdarzenia: string | null
  miejsce_zdarzenia: string
  numer_rejestracyjny: string
  zarzadca_strefy: string
  kwota_oplaty: number
  powod_reklamacji: string
  numer_biletu: string | null
  godzina_oplacenia: string | null
  numer_karty_parkingowej: string | null
  opis_okolicznosci: string | null
  ma_dowody: boolean | null

  imie_nazwisko: string
  adres: string
}

export function buildP1UserPrompt(data: P1Input): string {
  return `Wygeneruj reklamację opłaty dodatkowej w Strefie Płatnego Parkowania.

DANE WEZWANIA:
- Numer: ${data.numer_wezwania}
- Data: ${data.data_zdarzenia}${data.godzina_zdarzenia ? ` o godz. ${data.godzina_zdarzenia}` : ''}
- Miejsce: ${data.miejsce_zdarzenia}
- Rejestracja pojazdu: ${data.numer_rejestracyjny}
- Zarządca: ${data.zarzadca_strefy}
- Kwota: ${data.kwota_oplaty} zł

POWÓD REKLAMACJI: ${data.powod_reklamacji}
${data.numer_biletu ? `- Numer biletu/transakcji: ${data.numer_biletu}` : ''}
${data.godzina_oplacenia ? `- Godzina opłacenia: ${data.godzina_oplacenia}` : ''}
${data.numer_karty_parkingowej ? `- Karta parkingowa nr: ${data.numer_karty_parkingowej}` : ''}
${data.opis_okolicznosci ? `- Okoliczności: ${data.opis_okolicznosci}` : ''}
${data.ma_dowody ? '- Użytkownik ma dowody na poparcie reklamacji.' : ''}

DANE WNOSZĄCEGO:
- ${data.imie_nazwisko}
- ${data.adres}

ZADANIE:
1. Identyfikuj najmocniejszy argument w zależności od powodu reklamacji.
2. Powołaj ART. 13B ustawy o drogach publicznych jako podstawę cywilnoprawnego
   charakteru opłaty (NIE mandatu).
3. Oszacuj scoring:
   - 0.85+: dowód płatności / karta inwalidy / awaria parkomatu
   - 0.65–0.84: brak oznakowania / nieczynny parkomat
   - 0.45–0.64: argument ogólny bez dowodów
   - <0.45: brak argumentów merytorycznych

Zwróć WYŁĄCZNIE JSON zgodnie z formatem z system prompt.`
}
