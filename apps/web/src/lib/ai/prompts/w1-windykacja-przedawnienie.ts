/**
 * Prompt W1 — odpowiedź na wezwanie do zapłaty z zarzutem przedawnienia.
 *
 * Podstawa: art. 117–125 KC (przedawnienie roszczeń).
 *
 * Strategia AI: liczy termin przedawnienia (3 lub 6 lat) na podstawie
 * data_wymagalnosci, sprawdza czy bieg przedawnienia był przerwany
 * (uznanie długu, pozew sądowy), i konstruuje zarzut.
 */

export const W1_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w obronie
konsumentów przed firmami windykacyjnymi i funduszami sekurytyzacyjnymi.

KLUCZOWA WIEDZA — PRZEDAWNIENIE (art. 117–125 KC):
- Termin podstawowy: 6 lat (art. 118 KC, od 9 lipca 2018 r.).
- Termin dla roszczeń związanych z prowadzeniem działalności gospodarczej: 3 LATA
  (np. faktury B2C od telekomu, banków, sklepów na raty).
- Bieg przedawnienia: od dnia wymagalności (art. 120 § 1 KC).
- Roszczenia przedawnione PRZED 9.07.2018 r. — termin zachowany według starych
  zasad (10 lat / 3 lata), ale UWAGA: art. 5 ust. 4 nowelizacji z 13.04.2018 r.
  zrównał terminy.
- PRZERWANIE biegu (art. 123 KC):
  a) uznanie długu (pisemne, ustne, przez zachowanie się jak częściowa spłata)
  b) wniesienie pozwu / wniosku do sądu / komornika
  c) wszczęcie mediacji
- ZAWIESZENIE (art. 121 KC): siły wyższe, małoletność, ubezwłasnowolnienie.
- Po nowelizacji 2018: przedawnienie konsumenckie SĄD UWZGLĘDNIA Z URZĘDU
  (art. 117 § 2¹ KC) — bardzo silne.

DODATKOWE ZARZUTY OBRONY:
- Brak cesji wierzytelności (art. 509 KC) — windykator MUSI udowodnić nabycie długu.
- Brak istnienia zobowiązania (np. user nie zaciągał kredytu).
- Naruszenie RODO przy windykacji (art. 6 RODO + ustawa o ochronie danych).
- Naruszenie ustawy o przeciwdziałaniu praniu pieniędzy (gdy szantaż BIK/KRD).

ZASADY:
1. STYL: stanowczy, prawniczy. To NIE jest grzeczna prośba.
2. PODSTAWY PRAWNE: KC (art. 117–125, 509, 471), KPC (art. 504), RODO art. 6, 17.
3. STRUKTURA: zarzut formalny (przedawnienie) jako pierwszy, zarzuty merytoryczne
   uzupełniająco.
4. WNIOSKI: oddalenie wezwania w całości + odmowa zapłaty + ostrzeżenie przed
   wpisem do BIK/KRD/ERIF (gdyby było bezpodstawne).

OUTPUT — JSON jak inne prompty.`

export interface W1Input {
  wierzyciel: string
  pierwotny_wierzyciel: string | null
  numer_sprawy: string
  data_wezwania: string // ISO
  kwota_zadania: number
  rodzaj_zobowiazania: string

  // Daty kluczowe
  data_wymagalnosci: string // ISO
  data_ostatniej_platnosci: string | null

  // Przerwanie biegu
  czy_uznano_dlug: 'nie' | 'tak_dawno' | 'tak_niedawno' | 'nie_pamietam'
  czy_byl_pozew: 'nie' | 'tak_oddalony' | 'tak_aktywny' | 'nie_wiem'

  // Dodatkowe zarzuty
  kwestionuje_dlug: string[] | null
  opis_dodatkowy: string | null

  imie_nazwisko: string
  adres: string
  data_pisma: string // dzisiejsza data ISO
}

export function buildW1UserPrompt(data: W1Input): string {
  // Oblicz lata od wymagalności
  const wymagalnoscDate = new Date(data.data_wymagalnosci)
  const today = new Date(data.data_pisma)
  const yearsElapsed =
    (today.getTime() - wymagalnoscDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

  // Określ właściwy termin
  const consumerCategories = ['telekom', 'kredyt_konsum', 'karta_kredytowa', 'sklep_raty']
  const isConsumer = consumerCategories.includes(data.rodzaj_zobowiazania)
  const limitYears = isConsumer ? 3 : 6

  return `Wygeneruj odpowiedź na wezwanie do zapłaty z zarzutem przedawnienia.

DANE WEZWANIA:
- Wierzyciel (firma windykacyjna): ${data.wierzyciel}
${data.pierwotny_wierzyciel ? `- Pierwotny wierzyciel: ${data.pierwotny_wierzyciel}` : '- Pierwotny wierzyciel: nie ujawniony / brak danych'}
- Numer sprawy: ${data.numer_sprawy}
- Data wezwania: ${data.data_wezwania}
- Kwota żądania: ${data.kwota_zadania} zł
- Rodzaj zobowiązania: ${data.rodzaj_zobowiazania}

DATY KLUCZOWE:
- Data wymagalności: ${data.data_wymagalnosci}
- Czas od wymagalności: ${yearsElapsed.toFixed(1)} lat
- Właściwy termin przedawnienia: ${limitYears} lat (${isConsumer ? 'roszczenie konsumenckie B2C' : 'roszczenie ogólne'})
- Stan na dziś: ${yearsElapsed > limitYears ? 'PRZEDAWNIONE' : 'NIE przedawnione'}
${data.data_ostatniej_platnosci ? `- Data ostatniej płatności: ${data.data_ostatniej_platnosci}` : '- Brak płatności po wymagalności'}

PRZERWANIE BIEGU PRZEDAWNIENIA:
- Uznanie długu: ${data.czy_uznano_dlug}
- Pozew/nakaz zapłaty: ${data.czy_byl_pozew}

DODATKOWE ZARZUTY:
${(data.kwestionuje_dlug ?? []).map((z) => `- ${z}`).join('\n') || '- brak'}
${data.opis_dodatkowy ? `\nOPIS DODATKOWY:\n${data.opis_dodatkowy}` : ''}

DANE WNOSZĄCEGO:
- ${data.imie_nazwisko}
- ${data.adres}
- Data pisma: ${data.data_pisma}

ZADANIE:
1. PRZED WSZYSTKIM: oblicz czy roszczenie jest przedawnione przy uwzględnieniu
   ewentualnego przerwania biegu (art. 123 KC).
2. Skonstruuj zarzut przedawnienia jako PIERWSZY w piśmie.
3. Dodaj zarzuty z "kwestionuje_dlug" jako drugorzędne.
4. Powołaj art. 117 § 2¹ KC (sąd uwzględnia przedawnienie konsumenckie z urzędu).
5. SCORING:
   - 0.90+: jednoznacznie przedawnione, brak uznania, brak pozwu
   - 0.70–0.89: przedawnione, ale ryzyko uznania długu w wątpliwych okolicznościach
   - 0.45–0.69: graniczna data, wymaga interpretacji
   - <0.45: nieprzedawnione lub silne dowody przerwania biegu — ostrzezenia[] musi
            zawierać rekomendację konsultacji prawnej

Zwróć WYŁĄCZNIE JSON zgodnie z formatem z system prompt.`
}
