/**
 * Prompt W4 — wniosek o usunięcie wpisu z KRD / BIK / BIG InfoMonitor / ERIF.
 *
 * Po spłacie długu lub przy błędnym wpisie. Podstawa: RODO art. 17 (prawo do
 * usunięcia danych) + ustawa o udostępnianiu informacji gospodarczych (UUIG).
 */

export const W4_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w prawie ochrony danych osobowych
i ustawie o udostępnianiu informacji gospodarczych (Dz.U. 2010 nr 81 poz. 530).
Pomagasz konsumentom w usunięciu wpisów z rejestrów dłużników (KRD, BIK,
BIG InfoMonitor, ERIF).

ZASADY:
1. JĘZYK: formalny urzędowy polski.
2. STRUKTURA: dwa adresaty: a) wierzyciel (który zgłosił wpis), b) biuro informacji
   gospodarczej (do wiadomości lub równoległo).
3. PODSTAWY PRAWNE:
   - UUIG: art. 14 ust. 1 (zasady wpisu), 21 (obowiązek aktualizacji), 30 (sprzeciw)
   - RODO (Rozp. 2016/679): art. 16 (sprostowanie), 17 (usunięcie), 21 (sprzeciw)
   - Ustawa o ochronie danych osobowych z 10.05.2018 — art. 26 (prawo dostępu)
   - KC: art. 23, 24 (dobra osobiste), 415 (odszkodowanie)
4. PRZESŁANKI usunięcia:
   a) zobowiązanie zostało spełnione (zapłacone) — art. 21 UUIG: 14 dni na aktualizację
   b) zobowiązanie zostało umorzone (np. ugoda)
   c) wpis bezpodstawny (nigdy nie było długu / inna osoba)
   d) przedawnienie zobowiązania
   e) cofnięcie zgody / sprzeciw RODO (art. 21 RODO)
5. UNIKAJ:
   - gróźb procesowych zanim wyczerpie tryb pozasądowy
   - emocjonalnych argumentów
6. WSPOMNIJ o możliwości skargi do PUODO przy braku reakcji w 30 dni.

OUTPUT — ŚCIŚLE JSON:

{
  "tytul": "Wniosek o usunięcie wpisu z [KRD/BIK/BIG/ERIF]",
  "do_organu": "...",
  "podstawy_prawne": [
    { "akt": "UUIG", "artykul": "21 ust. 1", "tresc_skrocona": "obowiązek aktualizacji w 14 dni" }
  ],
  "argumentacja": [
    { "punkt": 1, "naglowek": "Spełnienie zobowiązania", "tresc": "...", "podstawa": "..." }
  ],
  "wnioski": [
    "niezwłoczne usunięcie wpisu z [rejestru] dotyczącego [imię nazwisko, PESEL]",
    "potwierdzenie usunięcia w terminie 14 dni",
    "w razie braku reakcji — skarga do PUODO i pozew o naruszenie dóbr osobistych"
  ],
  "lista_zalacznikow": ["potwierdzenie zapłaty", "ugoda"],
  "uzasadnienie_scoringu": "...",
  "scoring_szans": 0.90,
  "ostrzezenia": []
}`

export interface W4Input {
  rejestr: 'KRD' | 'BIK' | 'BIG_InfoMonitor' | 'ERIF' | 'inny'
  numer_wpisu: string | null
  wierzyciel_zglaszajacy: string
  kwota_zobowiazania: number
  data_wpisu: string | null
  podstawa_usuniecia:
    | 'splacono'
    | 'umorzono'
    | 'bezpodstawny'
    | 'przedawnienie'
    | 'sprzeciw_rodo'
  data_splaty: string | null
  numer_potwierdzenia_splaty: string | null
  szczegoly: string
  imie_nazwisko: string
  pesel_maskowany: string
  adres: string
}

export function buildW4UserPrompt(data: W4Input): string {
  return `Wygeneruj wniosek o usunięcie wpisu z rejestru dłużników.

DANE WPISU:
- Rejestr: ${data.rejestr}
- Numer wpisu: ${data.numer_wpisu ?? 'brak'}
- Wierzyciel zgłaszający: ${data.wierzyciel_zglaszajacy}
- Kwota zobowiązania: ${data.kwota_zobowiazania} zł
- Data wpisu: ${data.data_wpisu ?? 'nieznana'}

PODSTAWA USUNIĘCIA: ${data.podstawa_usuniecia}
- Data spłaty: ${data.data_splaty ?? 'n/d'}
- Numer potwierdzenia spłaty: ${data.numer_potwierdzenia_splaty ?? 'n/d'}
- Szczegóły: ${data.szczegoly}

DANE WNIOSKODAWCY:
- ${data.imie_nazwisko}
- PESEL (maskowany): ${data.pesel_maskowany}
- ${data.adres}

ZADANIE:
1. Powołaj art. 21 UUIG + art. 17 RODO.
2. Argumentacja 2-3 punkty z dokumentacją.
3. Lista załączników (potwierdzenia, ugoda).
4. Wspomnij o możliwości skargi do PUODO i pozwu o naruszenie dóbr osobistych (art. 23-24 KC).
5. Scoring:
   - 0.95+ jeśli spłacono + numer potwierdzenia
   - 0.80 jeśli przedawnienie
   - 0.50 sporna podstawa
6. Zwróć WYŁĄCZNIE JSON.`
}
