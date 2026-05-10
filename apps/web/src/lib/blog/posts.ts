/**
 * Blog — definicje 5 pierwszych artykułów (T5-SEO-022/023).
 *
 * Strategia: artykuły inline w TS (nie .md) — 0 dependencies (bez gray-matter
 * w bundlu klienta), prosty TypeScript SSG przez generateStaticParams.
 * Każdy artykuł ma slug, frontmatter (tytuł/opis/data/keywords) i content
 * jako Markdown string (renderowany przez @mandatomat/ui MarkdownPreview).
 *
 * Cross-linking (T5-SEO-025): pole `relatedCategorySlug` (do /kategoria/<slug>)
 * + `relatedArticleSlugs` (do innych artykułów).
 */

export interface BlogPost {
  slug: string
  title: string
  description: string
  /** Krótki teaser pod H1 na liście */
  excerpt: string
  /** ISO date YYYY-MM-DD */
  publishedAt: string
  /** ISO date — opcjonalnie, dla "Zaktualizowano" */
  updatedAt?: string
  /** Autor — domyślnie redakcja Mandatomatu */
  author: string
  /** Czas czytania (minuty) — kalkulator: ~200 słów / min */
  readingMinutes: number
  /** Słowa kluczowe — meta keywords + JSON-LD */
  keywords: string[]
  /** Slug kategorii do której artykuł najbardziej pasuje (do CTA + RelatedArticles) */
  relatedCategorySlug: string
  /** Inne polecane artykuły (slugi z tej tabeli) */
  relatedArticleSlugs: string[]
  /** Treść w Markdown — wzbogacona o strong, listy, blockquote */
  content: string
}

const POST_FOTORADAR: BlogPost = {
  slug: 'jak-odwolac-mandat-z-fotoradaru',
  title: 'Jak odwołać mandat z fotoradaru — kompletny przewodnik 2025',
  description:
    'Mandat z fotoradaru można skutecznie odwołać. Sprawdź podstawy prawne (art. 92a KW), terminy, dowody i wzór sprzeciwu — krok po kroku.',
  excerpt:
    'Otrzymałeś zdjęcie z fotoradaru i wezwanie do wskazania kierowcy? Pokazujemy jak prawidłowo zareagować, kiedy odmówić przyjęcia mandatu i jak napisać skuteczny sprzeciw.',
  publishedAt: '2026-04-15',
  updatedAt: '2026-05-01',
  author: 'Redakcja Mandatomat',
  readingMinutes: 7,
  keywords: [
    'mandat fotoradar',
    'odwołanie od mandatu',
    'art. 92a KW',
    'sprzeciw od mandatu',
    'fotoradar 2025',
    'wskazanie kierowcy',
  ],
  relatedCategorySlug: 'mandaty-karne',
  relatedArticleSlugs: ['punkty-karne-jak-zweryfikowac', 'parking-prywatny-czy-trzeba-placic'],
  content: `
## Krótki przegląd — co warto wiedzieć

Mandat z fotoradaru **nie jest jeszcze prawomocny** w momencie otrzymania wezwania pocztą. Masz **7 dni** na zwrot oświadczenia (wskazanie kierowcy lub odmowa przyjęcia mandatu) i **14 dni** na sprzeciw, jeśli sprawa trafi do sądu.

> **Najczęstszy błąd:** podpisanie i odesłanie mandatu "na automacie", bez sprawdzenia czy zdjęcie spełnia wymogi formalne. Po podpisie mandat jest prawomocny — uchylenie wymaga już wniosku do sądu (art. 101 § 1 KPSW) i tylko 3 enumeratywnych przesłanek.

## Krok 1 — sprawdź wezwanie

Wezwanie z Inspektoratu Transportu Drogowego (ITD) lub od Policji zawiera:

1. **Zdjęcie pojazdu** — musi pokazywać wyraźnie tablicę rejestracyjną, kierowcę i prędkościomierz urządzenia.
2. **Numer protokołu** + nazwę urządzenia (np. *Iskra-1*, *MultaRadar*, *PoliScan FM1*).
3. **Świadectwo legalizacji** urządzenia — niewymagane do pisma, ale możesz zażądać go (RODO + kpa).
4. **Pouczenie** o możliwości odmowy przyjęcia mandatu (art. 97 § 2 KPSW).

## Krok 2 — kiedy warto się odwoływać

Realne szanse uchylenia mandatu pojawiają się gdy:

- **Zdjęcie nie identyfikuje kierowcy** — widoczna tylko tablica, twarz zasłonięta. Wtedy organ musi udowodnić kto prowadził (a nie ty mu wskazać).
- **Brak świadectwa legalizacji** urządzenia w dniu pomiaru — fotoradar musi mieć aktualne świadectwo Głównego Urzędu Miar.
- **Błąd w protokole** — niezgodność numeru rejestracyjnego, daty, miejsca.
- **Strefa pomiaru niezgodna z przepisami** — np. fotoradar w obszarze, gdzie zgodnie z ustawą o drogach publicznych nie powinien stać.
- **Tablice rejestracyjne były sklonowane** — wymagana opinia rzeczoznawcy, ale to bardzo silna przesłanka.

## Krok 3 — pismo sprzeciwu

Pismo musi zawierać:

1. **Nagłówek** — Twoje dane + adresat (sąd rejonowy właściwy dla miejsca wykroczenia).
2. **Sygnaturę** wezwania.
3. **Wniosek główny** — *"wnoszę o uchylenie mandatu / wnoszę sprzeciw od nakazu zapłaty"*.
4. **Uzasadnienie** — punkt po punkcie, ze wskazaniem przepisów (art. 92a KW, art. 97 § 2 KPSW).
5. **Dowody** — zdjęcia, kopia wezwania, świadectwo legalizacji (jeśli posiadasz).
6. **Podpis** + data.

> **Wskazówka:** jeśli nie wiesz kto prowadził pojazd (np. samochód służbowy, członek rodziny), masz prawo to wskazać. Nie musisz "zgadywać" — odpowiedzialność spada wtedy na właściciela pojazdu jako "osobę zobowiązaną do wskazania kierowcy" (art. 96 § 3 KW), ale kara jest niższa niż za samo wykroczenie.

## Krok 4 — co dalej

Po wysłaniu sprzeciwu:

- **Sprawa trafia do sądu** — otrzymasz wezwanie na rozprawę (zwykle 2–6 miesięcy).
- **Możesz cofnąć sprzeciw** do dnia rozprawy bez konsekwencji — np. gdy znajdziesz dowody potwierdzające winę.
- **Wyrok zaoczny** możliwy gdy nie stawisz się na rozprawie — masz 7 dni na sprzeciw od wyroku zaocznego.

## Podsumowanie

Odwołanie od mandatu z fotoradaru to **realna ścieżka**, gdy masz konkretne podstawy. Sam fakt "nie zgadzam się z mandatem" nie wystarczy — sąd potrzebuje argumentów prawnych i dowodów. Mandatomat generuje pismo z odpowiednimi podstawami w 60 sekund — wystarczy podać dane z wezwania.
`,
}

const POST_PRZEDAWNIENIE: BlogPost = {
  slug: 'przedawnienie-mandatu-i-dlugu',
  title: 'Przedawnienie mandatu i długu — kiedy nie musisz już płacić',
  description:
    'Przedawnienie roszczeń: 3 lata, 6 lat, 10 lat. Sprawdź, kiedy dług z mandatu, faktury lub pożyczki nie jest już egzekwowalny — i jak skutecznie podnieść zarzut.',
  excerpt:
    'Windykator przysłał wezwanie do zapłaty starego długu? Sprawdź czy roszczenie się nie przedawniło. Pokazujemy 3-, 6- i 10-letnie terminy oraz jak skutecznie podnieść zarzut.',
  publishedAt: '2026-04-20',
  author: 'Redakcja Mandatomat',
  readingMinutes: 8,
  keywords: [
    'przedawnienie',
    'przedawnienie długu',
    'art. 117 KC',
    'KRUK przedawnienie',
    'EOS przedawnienie',
    'windykacja stary dług',
  ],
  relatedCategorySlug: 'windykacja',
  relatedArticleSlugs: ['epu-sprzeciw-od-nakazu-zaplaty', 'jak-odwolac-mandat-z-fotoradaru'],
  content: `
## Czym jest przedawnienie

Przedawnienie to **wygaśnięcie obowiązku zapłaty po upływie określonego czasu**. Roszczenie nadal istnieje, ale dłużnik może *odmówić zapłaty* podnosząc zarzut przedawnienia (art. 117 § 2 KC). Sąd nie sprawdza tego z urzędu w sprawach gospodarczych — **musisz sam go podnieść**.

> Od **9 lipca 2018** sąd bada przedawnienie z urzędu w sprawach **konsumenckich** (długi prywatne wobec firm). To duża zmiana — wcześniej trzeba było aktywnie się bronić.

## Terminy podstawowe (po reformie 2018)

| Rodzaj roszczenia | Termin | Podstawa |
|---|---|---|
| Roszczenia majątkowe (ogólne) | **6 lat** | art. 118 KC |
| Roszczenia okresowe (czynsz, raty) | **3 lata** | art. 118 KC |
| Roszczenia związane z działalnością gospodarczą | **3 lata** | art. 118 KC |
| Roszczenia z umowy ubezpieczenia | **3 lata** | art. 819 KC |
| Roszczenia z czynów niedozwolonych | **3 lata** od dowiedzenia się | art. 442¹ KC |
| Mandaty karne i kary administracyjne | **3 lata** od prawomocności | różne |
| Roszczenia stwierdzone wyrokiem | **6 lat** | art. 125 KC |

## Najczęstsze sytuacje

### Faktura za prąd / gaz / telefon

Najczęściej **3 lata** (świadczenie okresowe). Termin biegnie od dnia wymagalności (data płatności na fakturze).

### Pożyczka chwilówka

**3 lata** dla firmy pożyczkowej (przedsiębiorca). Termin liczony od dnia, w którym pożyczka miała być spłacona.

### Stary mandat parkingowy lub karny

Mandat administracyjny (np. parking strefa płatna) — **5 lat** od daty doręczenia (zgodnie z ordynacją podatkową art. 70). Mandat karny prawomocny — **3 lata** od uprawomocnienia (KW art. 45).

### Dług sprzedany do KRUK / EOS / Intrum

Sprzedaż wierzytelności **nie przerywa biegu przedawnienia**. Liczy się termin od pierwotnej wymagalności roszczenia, nie od daty zakupu długu przez windykatora.

## Co przerywa bieg przedawnienia

Termin biegnie od nowa po:

1. **Uznaniu długu** przez dłużnika (np. podpisanie ugody, częściowa spłata, prośba o odroczenie).
2. **Zawezwaniu do próby ugodowej** — tylko **raz** może przerwać bieg (po reformie 2022).
3. **Złożeniu pozwu** — sprawa sądowa, w tym EPU.
4. **Wszczęciu egzekucji komorniczej** — ale tylko gdy egzekucja jest skuteczna, nie gdy umorzona z powodu bezskuteczności.

> **Uwaga:** sama korespondencja z windykatorem, telefony, prośba o "uzgodnienie szczegółów" **nie przerywają biegu**. Windykatorzy często sugerują że "potwierdzenie kwoty" przerwie przedawnienie — to nieprawda, jeśli nie ma elementu uznania długu.

## Jak podnieść zarzut przedawnienia

Pismo zawiera:

1. **Nagłówek** — adresat (windykator / sąd).
2. **Powołanie sygnatury** sprawy.
3. **Treść:** *"Niniejszym podnoszę zarzut przedawnienia roszczenia objętego wezwaniem nr ... z dnia ..."*.
4. **Uzasadnienie** — kiedy roszczenie stało się wymagalne, jaki termin przedawnienia obowiązuje, kiedy minął.
5. **Wniosek** — *"wnoszę o umorzenie postępowania / odstąpienie od dochodzenia roszczenia"*.

## Co po podniesieniu zarzutu

- Windykator może **zaprzestać** egzekwowania (bo nie ma prawnych narzędzi).
- Może też wystąpić z **pozwem o uznanie długu** — wtedy sąd zbada czy faktycznie się przedawniło.
- Jeśli wyrok już zapadł (EPU), masz **14 dni na sprzeciw** od dnia doręczenia — w sprzeciwie podnosisz przedawnienie.

## Podsumowanie

Przedawnienie to **realna obrona** przed starymi długami, ale wymaga aktywnego działania. Mandatomat generuje pismo z prawidłowym wyliczeniem terminów na podstawie konkretnej sprawy — wystarczy podać datę powstania roszczenia i typ.
`,
}

const POST_PARKING: BlogPost = {
  slug: 'parking-prywatny-czy-trzeba-placic',
  title: 'Parking prywatny — czy musisz płacić "opłatę dodatkową"?',
  description:
    'Wezwanie z parkingu prywatnego (Centrum Handlowe, McDonalds, hotel) na 100–500 zł? Sprawdź, kiedy nie ma podstawy prawnej i jak skutecznie zakwestionować.',
  excerpt:
    'Operatorzy parkingów prywatnych wysyłają wezwania na setki złotych za "przekroczenie czasu". Pokazujemy, kiedy to nie jest prawnie skuteczne i jak nie płacić bezpodstawnie.',
  publishedAt: '2026-04-25',
  author: 'Redakcja Mandatomat',
  readingMinutes: 6,
  keywords: [
    'parking prywatny',
    'opłata dodatkowa parking',
    'APCOA',
    'CityParking',
    'parking centrum handlowe',
    'umowa adhezyjna parking',
  ],
  relatedCategorySlug: 'parking',
  relatedArticleSlugs: ['jak-odwolac-mandat-z-fotoradaru', 'przedawnienie-mandatu-i-dlugu'],
  content: `
## "Opłata dodatkowa" to NIE mandat

Wezwanie z parkingu prywatnego (np. APCOA, CityParking, Indigo, parkingi przy galeriach) to **nie mandat karny** — to roszczenie cywilnoprawne z umowy.

> Operator twierdzi, że "wjeżdżając na parking zawarłeś umowę". Owszem — ale tylko jeśli:
> 1. **Tablice informacyjne** są wyraźnie widoczne przy wjeździe (nie schowane za drzewem).
> 2. **Cennik** jest dostępny przed wjazdem (nie tylko przy bramce wyjazdowej).
> 3. **Identyfikacja pojazdu** jest niewątpliwa (zdjęcie ANPR, paragon, bilet wjazdowy z numerem rejestracyjnym).

## Najczęstsze podstawy do zakwestionowania

### 1. Brak skutecznego zawarcia umowy

Operator musi udowodnić, że umowa została skutecznie zawarta. Jeśli **tablica nie była widoczna** lub **regulamin parkingu ukryty** — nie ma umowy adhezyjnej.

### 2. Klauzule abuzywne

Opłata 200+ zł za 30 minut spóźnienia to często **klauzula niedozwolona** (art. 385¹ KC). Rejestr Klauzul Niedozwolonych UOKiK zawiera setki podobnych zapisów uznanych za nieuczciwe wobec konsumenta.

### 3. Nieproporcjonalność

Sąd Najwyższy: opłata dodatkowa **nie może być rażąco wyższa** niż realna szkoda operatora. 500 zł za 1h spóźnienia gdy stawka godzinowa to 5 zł — niesprawiedliwe i nieskuteczne.

### 4. Brak identyfikacji właściciela pojazdu

Operator zna tylko **numer rejestracyjny**. Nie ma podstaw aby żądać danych właściciela od CEPiK — tylko organy publiczne (Policja, ITD) mają to uprawnienie. Dlatego w 80% przypadków windykator próbuje ściągnąć pieniądze "na strach", bez realnej możliwości pozwania.

## Co zrobić po otrzymaniu wezwania

### Krok 1 — nie ignoruj, ale nie panikuj

Brak reakcji oznacza, że operator może:
- Sprzedać dług firmie windykacyjnej (KRUK, EOS) za 10–20% wartości.
- W skrajnych przypadkach skierować sprawę do sądu (EPU).

### Krok 2 — pisemna reklamacja

Wyślij pismo:
1. **Listem poleconym** (zachowaj potwierdzenie nadania).
2. Treść: *"kwestionuję zasadność opłaty dodatkowej w wysokości X zł, gdyż..."* + lista podstaw.
3. Wniosek: *"wnoszę o anulowanie wezwania w całości / w części..."*.

### Krok 3 — odpowiedź operatora

Zwykle dostaniesz jedno z:
- **Anulowanie** — jeśli argumenty mocne, operator nie chce ryzykować przegranej w sądzie.
- **Korekta kwoty** — np. obniżka o 50%.
- **Podtrzymanie** + groźba windykacji — wtedy czekaj na pozew (rzadko przychodzi).

## Co NIE działa

- "Nie pamiętam, czy widziałem tablicę" — operator pokaże dokumentację fotograficzną.
- "Mój samochód, ale nie ja prowadziłem" — operator może żądać wskazania kierowcy.
- "Nie zapłacę, niech pozwą" — działa, ale tylko jeśli operator faktycznie nie pozwie. Ryzyko: koszty sądowe + odsetki.

## Podsumowanie

Parkingi prywatne często działają na zasadzie *"strach kosztuje"* — wysyłają milion wezwań, licząc, że 30% zapłaci bez kwestionowania. Pisemna, prawnie umotywowana reklamacja ma **wysoką skuteczność** (60–80% spraw kończy się anulowaniem). Mandatomat generuje pismo z aktualną listą klauzul abuzywnych i orzecznictwem.
`,
}

const POST_EPU: BlogPost = {
  slug: 'epu-sprzeciw-od-nakazu-zaplaty',
  title: 'EPU — sprzeciw od nakazu zapłaty krok po kroku (14-dniowy termin)',
  description:
    'Sąd w Lublinie wydał nakaz zapłaty? Masz tylko 14 dni na sprzeciw. Sprawdź, jak złożyć skuteczny sprzeciw EPU i odzyskać prawo do obrony w sądzie właściwym.',
  excerpt:
    'Nakaz zapłaty z Sądu Rejonowego Lublin-Zachód (EPU) dociera niespodziewanie i ma 14-dniowy termin sprzeciwu. Pokazujemy jak skutecznie zareagować i przenieść sprawę do sądu właściwego.',
  publishedAt: '2026-04-30',
  author: 'Redakcja Mandatomat',
  readingMinutes: 9,
  keywords: [
    'EPU sprzeciw',
    'nakaz zapłaty Lublin',
    'sąd Lublin-Zachód',
    'art. 503 KPC',
    'elektroniczne postępowanie upominawcze',
    'sprzeciw 14 dni',
  ],
  relatedCategorySlug: 'windykacja',
  relatedArticleSlugs: ['przedawnienie-mandatu-i-dlugu', 'parking-prywatny-czy-trzeba-placic'],
  content: `
## EPU w 60 sekundach

**Elektroniczne Postępowanie Upominawcze** (EPU) to uproszczona ścieżka dochodzenia roszczeń przed Sądem Rejonowym Lublin-Zachód. Powodowie (najczęściej windykatorzy) składają pozew online, sąd wydaje **nakaz zapłaty** bez rozprawy, a pozwany dostaje go pocztą.

> **Najważniejsze:** masz tylko **14 dni** od dnia odebrania nakazu na złożenie sprzeciwu (art. 503 § 1 KPC). Po tym terminie nakaz staje się prawomocny i można go skierować do komornika.

## Jak rozpoznać nakaz zapłaty z EPU

Koperta zawiera:

1. **Nakaz zapłaty** — jednostronicowy dokument z nadrukowanym podpisem referendarza.
2. **Pouczenie o sprzeciwie** (musi być załączone — gdy go brak, można żądać wznowienia terminu).
3. **Pozew** — z uzasadnieniem powoda i listą dowodów.

## Krok 1 — sprawdź czy doręczenie było skuteczne

Nakaz uważa się za doręczony jeśli:
- Odebrałeś go osobiście **lub**
- Awizowano go i nie odebrałeś w ciągu 14 dni (fikcja doręczenia, art. 139 § 1 KPC) **i** mieszkasz pod adresem, na który wysłano.

**Wyjątek (T17 — windykacja):** od **7 listopada 2019** w EPU jest tzw. doręczenie referendarskie. Jeśli pozwany **nie odbierze** korespondencji, nakaz **NIE staje się prawomocny** — sąd umarza sprawę. To duża zmiana na korzyść konsumentów.

## Krok 2 — oblicz termin

14 dni biegnie od **dnia po dniu doręczenia**. Przykład: doręczenie w piątek 1 maja → termin do **piątku 15 maja włącznie** (do 23:59).

> **Uwaga:** termin to **dzień nadania** pisma w urzędzie pocztowym (data stempla). Nie data wpływu do sądu.

## Krok 3 — pismo sprzeciwu

Sprzeciw musi zawierać:

### Część formalna
1. **Sąd** — zawsze: *Sąd Rejonowy Lublin-Zachód w Lublinie, VI Wydział Cywilny*.
2. **Strony** — pozwany (Ty) + powód (z nakazu).
3. **Sygnatura akt** — z nakazu.

### Część merytoryczna
4. **Tytuł:** *"Sprzeciw od nakazu zapłaty z dnia ..."*.
5. **Wniosek główny:** *"wnoszę o uchylenie nakazu zapłaty w całości / w części"*.
6. **Wniosek ewentualny:** *"o przekazanie sprawy do sądu właściwego ze względu na miejsce zamieszkania pozwanego"* (zwykle to Twój sąd rejonowy).
7. **Uzasadnienie** — punkt po punkcie:
   - Kwestionuję istnienie roszczenia (czy w ogóle istnieje).
   - Kwestionuję wysokość roszczenia (jeśli zawyżone).
   - Podnoszę zarzut przedawnienia (jeśli aktualne).
   - Wskazuję brak legitymacji procesowej powoda (np. cesja niewiarygodna).
   - Wskazuję klauzule abuzywne w umowie (jeśli umowa konsumencka).

### Wnioski dowodowe
8. **Wniosek o przeprowadzenie dowodów** z:
   - dokumentów (Twoje umowy, korespondencja).
   - zeznań świadków.
   - opinii biegłego (rzadko).

## Krok 4 — wysyłka

**Listem poleconym za potwierdzeniem nadania** na adres:
*Sąd Rejonowy Lublin-Zachód w Lublinie, ul. Krakowskie Przedmieście 76, 20-076 Lublin, VI Wydział Cywilny.*

Można też złożyć osobiście lub przez **portal informacyjny sądów powszechnych** (jeśli masz konto).

## Co dalej

1. **Sąd uchyla nakaz** automatycznie po skutecznym sprzeciwie.
2. Sprawa przechodzi do **sądu właściwego** (zwykle wg miejsca zamieszkania pozwanego).
3. Powód musi **uzupełnić pozew** (do EPU składa się okrojony pozew bez wszystkich dowodów).
4. Otrzymasz **wezwanie na rozprawę** — zwykle 3–8 miesięcy.

## Najczęstsze błędy

- **Niedotrzymanie 14-dniowego terminu** — nakaz prawomocny, jedyna ścieżka to wznowienie postępowania.
- **Brak uzasadnienia** — sprzeciw musi zawierać minimum jeden zarzut, sam wniosek "nie zgadzam się" nie wystarczy.
- **Wysłanie do złego sądu** — sprzeciw musi trafić do **Sądu Lublin-Zachód**, nie do sądu właściwego dla Ciebie.
- **Brak dowodu nadania** — bez awizacji listu poleconego nie udowodnisz, że dotrzymałeś terminu.

## Podsumowanie

Sprzeciw EPU to standardowa procedura — 14 dni to mało, ale wystarczająco. Mandatomat generuje sprzeciw z prawidłowym układem (formalne wnioski + 5 typowych zarzutów merytorycznych) i wskazuje właściwy sąd. Wystarczy podać sygnaturę z nakazu.
`,
}

const POST_PUNKTY: BlogPost = {
  slug: 'punkty-karne-jak-zweryfikowac',
  title: 'Punkty karne w CEPiK — jak sprawdzić i skorygować błędy',
  description:
    'Punkty karne kasują się po 12 miesiącach od daty wykroczenia (od 17.09.2022). Sprawdź jak zweryfikować stan, jak skorygować błąd urzędniczy i odzyskać czyste konto.',
  excerpt:
    'CEPiK pokazuje punkty, których nie powinno już być? Sprawdź jak działa nowy system kasowania (12 miesięcy od daty wykroczenia) i jak skorygować błąd urzędniczy.',
  publishedAt: '2026-05-05',
  author: 'Redakcja Mandatomat',
  readingMinutes: 6,
  keywords: [
    'punkty karne',
    'CEPiK punkty',
    'kasowanie punktów',
    '12 miesięcy punkty',
    'korekta CEPiK',
    'cofnięcie uprawnień',
  ],
  relatedCategorySlug: 'kontrole-drogowe',
  relatedArticleSlugs: ['jak-odwolac-mandat-z-fotoradaru'],
  content: `
## Reforma punktów karnych — od 17.09.2022

Najważniejsze zmiany:

- **Skasowanie punktów po 12 miesiącach** od daty popełnienia wykroczenia (wcześniej: 1 rok od zapłacenia mandatu).
- **Brak możliwości redukcji** punktów przez kursy (zniesione).
- **Wyższe stawki** — mandat za przekroczenie prędkości +30 km/h to 800 zł i 9 punktów (wcześniej 200 zł i 4 pkt).
- **Limit 24 punkty** w 12 miesięcy → cofnięcie uprawnień (wcześniej 24/2 lata).

## Jak sprawdzić stan punktów

1. **Portal mObywatel** — aplikacja mobilna lub web, login profil zaufany.
2. **Punkt CEPiK** — informacja w urzędzie skarbowym lub starostwie (na żądanie, ID + opłata).
3. **Wniosek RODO** — art. 15 RODO, bezpłatny pierwszy raz, organ ma 30 dni.

## Najczęstsze błędy w CEPiK

### 1. Punkty z mandatu, który został anulowany

Jeśli sąd uchylił mandat lub umorzyłeś sprawę — **punkty powinny zniknąć automatycznie**, ale w 20% przypadków trzeba interweniować.

### 2. Duplikat punktów

Te same punkty z jednego wykroczenia naliczone dwukrotnie (raz przez Policję, raz przez ITD) — trzeba żądać korekty.

### 3. Punkty z błędną datą

Wpisana data wystawienia mandatu zamiast daty wykroczenia — wpływa na termin kasowania (12 miesięcy od wykroczenia).

### 4. Punkty po reformie sprzed 17.09.2022

Punkty z wykroczeń popełnionych przed reformą **kasują się według starych zasad** (1 rok od zapłaty mandatu). Niektóre systemy informatyczne błędnie stosują nowe reguły — sprawdź daty.

## Wniosek o korektę

### Adresat
Wojewódzki Inspektorat Transportu Drogowego (WITD) lub Komenda Wojewódzka Policji (Wydział Ruchu Drogowego) — w zależności od organu, który nałożył mandat.

### Treść
1. **Nagłówek** — Twoje dane, PESEL, data.
2. **Adresat** — z pełnym adresem.
3. **Podanie** — *"Wnoszę o korektę / usunięcie wpisu w CEPiK punktu/punktów karnych nr ... z dnia ..."*.
4. **Uzasadnienie** — który punkt jest błędny, dlaczego (z dowodami).
5. **Wnioski dowodowe** — wyrok sądu, decyzja o uchyleniu, paragony, korespondencja.
6. **Podpis** + data.

### Termin rozpatrzenia
30 dni (KPA art. 35) — w sprawach skomplikowanych do 60 dni z pisemnym uzasadnieniem.

## Co po korekcie

- **Pozytywna decyzja** — punkty znikają z CEPiK natychmiast (synchronizacja co 24h).
- **Negatywna decyzja** — masz **14 dni** na odwołanie do organu wyższego stopnia (Główny Inspektor Transportu Drogowego).
- **Brak odpowiedzi** w terminie — możesz złożyć ponaglenie albo skargę do WSA.

## Cofnięcie uprawnień (24 punkty)

Jeśli zbliżasz się do 24 punktów:

1. **Odwołanie od decyzji starosty** o cofnięciu — masz 14 dni od doręczenia.
2. **Wzruszenie decyzji** — art. 154–156 KPA, gdy wyszły nowe okoliczności.
3. **Korekta wcześniejszych mandatów** — jeśli któryś można uchylić, suma punktów spada.

## Podsumowanie

CEPiK zawiera błędy częściej niż myślisz — 5–10% wpisów wymaga korekty. Mandatomat generuje wniosek do właściwego organu z odpowiednimi przepisami i wzorem uzasadnienia. Wystarczy 5 minut.
`,
}

export const BLOG_POSTS: readonly BlogPost[] = [
  POST_FOTORADAR,
  POST_PRZEDAWNIENIE,
  POST_PARKING,
  POST_EPU,
  POST_PUNKTY,
] as const

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function getAllPostSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug)
}

export function getRelatedPosts(slug: string, limit = 2): BlogPost[] {
  const current = getPostBySlug(slug)
  if (!current) return []
  return current.relatedArticleSlugs
    .map(getPostBySlug)
    .filter((p): p is BlogPost => p !== undefined)
    .slice(0, limit)
}
