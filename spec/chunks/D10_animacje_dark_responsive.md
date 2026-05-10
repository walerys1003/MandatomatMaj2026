# 4.12-4.16 Animacje + Dark mode + Empty/Error states + Responsywność + Case Study + Tabela porównawcza

**Chunk ID:** `D10_animacje_dark_responsive`
**Source:** design (lines 1185-1458)
**Tags:** design, animacje, dark_mode, empty_state, error, mobile, responsive, case_study
**Target Agents:** design, frontend

---

4.12 ANIMACJE — SPECYFIKA MANDATOMAT
Agent AI: Mandatomat ma NAJSZYBSZE animacje w CAŁYM ekosystemie LexMate24.
Duration bazowy: 150ms (vs. 200ms Długomat, 300ms Alimentomat, 400ms Rozwodomat).
Ease: cubic-bezier(0.12, 0.8, 0.3, 1) — snap. Natychmiastowy start, szybkie zakończenie.
Wrażenie: KLIK — gotowe. Zero czekania. Maszyna.

Page transitions:
  Wejście: opacity 0→1, duration 200ms (bez translateY — brak ruchu, czysta zmiana)
  Wyjście: opacity 1→0, duration 100ms

Wizard step transitions:
  BRAK SLIDE. Crossfade only:
  Wychodzący: opacity 1→0, 100ms
  Wchodzący: opacity 0→1, 150ms
  Brak delay między nimi — natychmiastowa zmiana
  
  Agent AI: slide transitions są za wolne dla Mandatomatu.
  Mandatomat zmienia krok jak przełączanie zakładek w przeglądarce — SNAP.

Card hover:
  Shadow sm→md, border-color iron-100→blue-200
  Duration: 150ms
  TranslateY: 0→(-1px) — MINIMALNY ruch, ledwo widoczny
  
  Agent AI: w Mandatomacie hover effects są SUBTYLNIEJSZE niż w innych SaaS-ach.
  1px translateY (nie 2-3px). Powód: gęsty UI z wieloma kartami — 
  gdyby wszystkie skakały po 3px, ekran wyglądałby jak trzęsienie ziemi.

Table row hover:
  Background: transparent→blue-50/30
  Duration: 100ms (natychmiastowy)
  Brak transform

Button click:
  Scale 1→0.98→1, duration 80ms (NAJKRÓTSZA ze wszystkich SaaS-ów)
  Bez spring, bez bounce — mechaniczny klik

Loading state:
  BRAK skeleton shimmer (zbyt wolny wizualnie).
  Zamiast tego: spinner.
  
  Spinner Mandatomat:
    24px × 24px
    Border: 2px solid iron-100
    Border-top: 2px solid blue-500
    Animation: rotate 360deg, 600ms, linear, infinite
    Obok: "Generowanie..." — Inter 14px, iron-500
    
  Agent AI: wiem, że skeleton > spinner w większości przypadków.
  Ale Mandatomat spinner jest celowy — komunikuje "trwa operacja, zaraz skończę"
  w sposób bardziej "techniczny" niż skeleton. Skeleton sugeruje "ładuje się strona",
  spinner sugeruje "system przetwarza Twoje dane". Mandatomat = system.

Donut chart (dashboard):
  Draw-in: 1.2s, ease [0.22, 1, 0.36, 1], clockwise od 12h
  Segments pojawiają się po kolei (volt→signal→amber), stagger 200ms
  Counter w centrum: 0→76%, 800ms, delay 300ms

Success po płatności:
  Ikona check: scale 0→1, spring stiffness 300, damping 20, duration 300ms
  BRAK dodatkowych efektów. Brak shield animation (Długomat), 
  brak calm draw (Rozwodomat), brak confetti (Alimentomat).
  Jeden check, jedno słowo "Gotowe.", jeden przycisk "Pobierz".
  Mandatomat nie celebruje — ZAMYKA SPRAWĘ.

Toast notification:
  SlideIn z góry (translateY -12→0), duration 150ms
  Background: iron-900, text white, Inter 14px weight 500
  Ikona: 16px (check-circle volt, alert-triangle amber, x-circle signal)
  Auto-dismiss: 3s (NAJKRÓTSZY czas wyświetlania)
  No close button — znika sam

4.13 DARK MODE — SPECYFIKA MANDATOMAT
Background: #09090B (iron-950 — NAJCZYSTSZY ciemny ze wszystkich SaaS-ów)
  Brak kolorowego podtonu. Nie navy-black (Długomat), nie violet-black (Alimentomat),
  nie teal-black (Rozwodomat). CZYSTY zinc-black. Techniczny. Neutralny.

Surface: #18181B (iron-900)
Elevated: #27272A (iron-800)
Border: rgba(63,63,70,0.5) (iron-700 at 50%)
Text primary: #FAFAFA
Text secondary: #A1A1AA
Text muted: #71717A

Primary: blue-500 (jaśniejszy)
Success: volt-400
Danger: signal-400
Warning: status-amber-400

Karty:
  Background: #18181B
  Border: 1px solid rgba(63,63,70,0.4)
  Shadow: 0 1px 3px rgba(0,0,0,0.4)

Tabela:
  Header bg: #18181B
  Row hover: rgba(37,99,235,0.04) — subtelny blue tint
  Alternating rows: #18181B / #1C1C20

Sidebar:
  Praktycznie bez zmian (już ciemny)
  Active item: rgba(37,99,235,0.1)

Agent AI: Dark mode Mandatomatu jest NAJCZYSTSZY — 
zero kolorowych podtonów w tle. Daje wrażenie profesjonalnego 
narzędzia developerskiego (jak VS Code dark theme).

4.14 STANY PUSTE I BŁĘDÓW
EMPTY STATE (brak pism):
  Ilustracja: BRAK ilustracji. Mandatomat nie ilustruje — informuje.
  
  Centralnie:
    Ikona: file-plus 48px, iron-300, stroke 1.5px
    H3: "Brak pism" — Inter Tight 20px weight 700, iron-700
    Paragraph: "Stwórz pierwsze odwołanie w 3 minuty." — Inter 15px, iron-500
    Button: blue-600, white, "Nowe pismo →"
  
  Agent AI: ZERO dekoracji. Ikona + tekst + button. 
  Mandatomat empty state jest NAJSUROWSZY — ale nie zimny. 
  Prosty, funkcjonalny, bez fałszywej empatii.

ERROR STATE:
  Card: border-left 3px signal-500, bg signal-50, radius 10px, padding 20px
  
  Layout: flex row, gap 12px
  Ikona: alert-circle 20px, signal-600
  Content:
    "Nie udało się wygenerować pisma." — Inter 15px weight 600, iron-900
    "Spróbuj ponownie lub skontaktuj się z pomocą." — Inter 14px, iron-600
  Button: "Ponów" ghost small, signal-600
  
  Agent AI: krótkie, rzeczowe. Brak "Przepraszamy" (Mandatomat nie przeprasza — naprawia).

404:
  Centralnie, max-width 400px
  "404" — Inter Tight 72px weight 800, iron-200
  "Nie znaleziono strony." — Inter 16px, iron-500
  Link: "Panel →" blue-600
  
  To wszystko. Żadnych ilustracji, żadnych żartów, żadnego "Ups".

4.15 RESPONSYWNOŚĆ
MOBILE:
  Bottom nav: 5 ikon (Panel, Pisma, Nowe+, Kalendarz, Menu)
    Ikona "Nowe+" (środkowa): 
      Circle 48px, blue-600 bg, white "+" 20px
      Elevated -8px nad bar (mniej niż Długomat -12px — subtelniej)
  
  Dashboard: tabela → lista kompaktowa
    Każdy item: 64px height, flex row
    Left: ikona kategorii w circle 36px
    Center: typ + instytucja + data (2 linie)
    Right: status badge + chevron-right 16px iron-300
  
  Wizard: full-width formularz, brak panelu bocznego
    SuccessEstimator: pod formularzem (nie boczny), full-width
  
  Kategorie: horizontal scroll z snap, peek 24px
  
  H1 hero: 34px / 1.02 / -0.04em (nadal ściśnięty — charakter zachowany)
  Device mockup: ukryty
  Stats: horizontal scroll (3 elementy, snap)

TABLET:
  Sidebar: collapsed 64px (węższy niż inne SaaS-y)
  Tabela: zachowana, mniejsze padding (8px)
  Wizard: panel boczny → inline pod formularzem
  Kategorie: 2 kolumny

PRINT:
  Pismo: drukowalne na A4
  Marginesy: 2.5cm
  Font: Times New Roman 12pt
  Dashboard/lista: niepotrzebne, @media print { display: none }

4.16 SEKCJA CASE STUDY (LANDING PAGE)
Mandatomat jako jedyny SaaS ma dedykowaną sekcję Case Study na landing page — bo mandaty to najczęstszy i najbardziej relatable problem.
Background: iron-50
Padding: 100px 0

Overline: "PRZYKŁAD" — JetBrains Mono 11px, blue-600, uppercase
H2: "Od mandatu do uchylenia — w 3 minuty."
    Inter Tight 36px weight 700, iron-900
    Margin-bottom: 56px

LAYOUT: 4 kroki w rzędzie, connected line
Max-width: 1080px, centered

  Linia łącząca: 2px, iron-200, position absolute, top 32px (center of dots)
  
  Każdy krok:
    Flex column, align-center, text-center
    Width: 25%
    
    Circle: 64px, bg white, border 2px iron-200, shadow sm
      Wewnątrz: ikona 28px, blue-500
      Ukończony: bg blue-600, border blue-600, ikona white
    
    Tytuł: Inter 15px weight 600, iron-900, margin-top 20px
    Opis: Inter 13px, iron-500, max-width 200px, margin-top 8px
    
  Krok 1: 
    Ikona: smartphone (telefon)
    "Wejście na stronę"
    "Wybieram 'Mandat za prędkość'"
  
  Krok 2:
    Ikona: edit-3 (formularz)
    "3 pytania"
    "Policja, fotoradar, błąd urządzenia"
  
  Krok 3:
    Ikona: file-check (dokument z check)
    "Gotowe pismo"
    "AI generuje odwołanie z argumentami"
  
  Krok 4:
    Ikona: check-circle (sukces)
    "Uchylenie mandatu"
    "76% skuteczność w tej kategorii"

  Pod krokami — cytat:
    Max-width: 560px, centered, margin-top 56px
    Background: white, border iron-100, radius 14px, padding 28px
    
    Cytat: "Mandat za fotoradar — 500 zł. Odwołanie przez Mandatomat — 99 zł i 3 minuty. 
    Po miesiącu dostałem pismo: mandat uchylony."
    Inter 16px italic, iron-700, line-height 1.65
    
    Autor: "— Marek, Warszawa" — Inter 14px weight 500, iron-500, margin-top 16px
    
    Agent AI: cytat jest generyczny (nie prawdziwy). W produkcji: zbierać realne testimoniale.

MOBILE:
  4 kroki → 2×2 grid LUB vertical stack
  Linia łącząca: pionowa (jeśli stack)
  Circles: 48px

5. PODSUMOWANIE PORÓWNAWCZE — SZYBKA REFERENCYJNA TABELA
| Aspekt              | Alimentomat         | Rozwodomat          | Długomat            | Mandatomat          |
|---------------------|---------------------|---------------------|---------------------|---------------------|
| Display font        | Instrument Serif    | Playfair Display    | Space Grotesk       | Inter Tight         |
| Charakter fontu     | Klasyczny serif     | Elegancki serif     | Geometric sans      | Tight industrial    |
| H1 size/weight      | 56px / 400          | 52px / 500          | 56px / 700          | 52px / 800          |
| H1 letter-spacing   | -0.02em             | -0.02em             | -0.03em             | -0.04em             |
| Body size           | 16px / 1.65         | 17px / 1.7          | 16px / 1.6          | 16px / 1.6          |
| Primary color       | Royal Violet #4C1D95| Deep Teal #0E7490   | Fortress Navy #1D4ED8| Precision Blue #2563EB|
| Accent              | Burnished Gold      | Sage Green          | Emerald Signal      | Volt Green          |
| Neutrals            | Warm Gray           | Stone               | Slate               | Iron (zinc)         |
| Hero background     | Warm off-white      | Subtle gradient     | DARK navy-950       | Clean off-white     |
| Hero visual         | Floating cards      | Centered text only  | Terminal Card       | Phone mockup        |
| Sidebar bg          | royal-950           | teal-950            | navy-950            | iron-950            |
| Dashboard unikalny  | —                   | Checklist docs      | Deadline Radar      | Success Rate widget |
| Wizard kroków       | 5                   | 4–7 (branching)     | 6                   | 3–4                 |
| Wizard first step   | Formularz           | Card-select branch  | OCR Upload (dark)   | Card-select grid    |
| Wizard bg           | Jasny               | Jasny               | Krok 1: CIEMNY      | Jasny               |
| Animacja bazowa     | 300ms               | 400ms               | 200ms               | 150ms               |
| Ease                | [0.4, 0, 0.2, 1]   | [0.25, 0.46, 0.45, 0.94]| [0.16, 1, 0.3, 1]| [0.12, 0.8, 0.3, 1]|
| Success animation   | Confetti            | Calm check draw-in  | Shield draw-in      | Check scale (snap)  |
| Section padding     | 120px               | 140px               | 140px               | 100px               |
| Card padding        | 24px                | 28px                | 24px                | 20px                |
| Card gap            | 24px                | 32px                | 20px                | 16px                |
| Content max-width   | 1080px              | 1020px              | 1080px              | 1140px              |
| Border-radius cards | 14px                | 16px                | 14px                | 12px                |
| Empty state style   | Ilustracja + tekst  | Ilustracja + tekst  | Ilustracja + tekst  | Ikona + tekst TYLKO |
| Dark mode podton    | Fioletowy           | Tealowy             | Navy                | BRAK (czysty zinc)  |
| Emocja              | Ciepło + siła       | Spokój + godność    | Bezpieczeństwo + nadzieja| Efektywność + precyzja|
| Archetypt           | Opiekun-Wojownik    | Mędrzec-Przewodnik  | Forteca             | Inżynier            |
| Tempo               | Umiarkowane         | Wolne               | Dynamiczne          | Najszybsze          |
| Gęstość UI          | Średnia             | Niska (dużo whitespace)| Wysoka           | Najwyższa           |
| Mobile FAB kolor    | royal-600           | teal-600            | emerald-500         | blue-600            |
| Mobile FAB offset   | -8px                | -8px                | -12px               | -8px                |

