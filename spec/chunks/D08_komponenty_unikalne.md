# 4.10 Komponenty unikalne (SuccessRate, QuickAction, SuccessEstimator, Timeline)

**Chunk ID:** `D08_komponenty_unikalne`
**Source:** design (lines 940-1097)
**Tags:** design, komponenty, success_rate, timeline, estimator
**Target Agents:** design, frontend

---


4.10 KOMPONENTY UNIKALNE DLA MANDATOMAT
Widget skuteczności (Success Rate Tracker)
KOMPONENT: SuccessRateTracker
Lokalizacja: dashboard, strona statystyk, landing page

  Na landing page (sekcja social proof):
    Background: white, border iron-100, radius 16px, padding 32px
    Max-width: 800px, centered
    
    Layout: CSS Grid 3 kolumny
    
    Col 1 — Donut chart:
      120px × 120px SVG
      Segments:
        volt-500 (76% = uwzględnione)
        signal-400 (12% = odmowa)
        status-amber-400 (12% = w trakcie)
      Center: "76%" Inter Tight 28px weight 700, iron-900
      Animacja: draw-in od 12 o'clock, 1.5s, ease out (on scroll trigger)
    
    Col 2 — Breakdown:
      Vertical stack, gap 12px
      Każdy: flex row, gap 8px
        Dot 10px circle [kolor]
        Label: Inter 14px weight 500, iron-700
        Value: Inter 14px weight 600, iron-900, tabular-nums
      
      "Uwzględnione" — "2 340 pism"
      "Odmowa" — "372 pisma"
      "W trakcie" — "368 pism"
    
    Col 3 — Best categories:
      H4: "Najwyższa skuteczność" — Inter 14px weight 600, iron-900
      
      Lista (top 3):
        Każdy: flex row, justify-between
        Kategoria: Inter 13px, iron-700
        Procent: Inter 13px weight 600, volt-600
        Mini progress bar: 60px × 4px, iron-100 track, volt-500 fill
        
        "Fotoradary" — "87%"
        "Opłaty parkingowe" — "82%"
        "ZTM/MPK" — "79%"

Quick Action Bar (dashboard)
KOMPONENT: QuickActionBar
Lokalizacja: dashboard, pod metrykami

  Full-width, margin-bottom 24px
  Background: blue-50, border 1px blue-100, radius 12px, padding 16px
  Flex row, gap 12px, align-center, justify-center, flex-wrap
  
  Każdy action:
    Button: height 36px, radius 8px, padding-h 16px
    Font: Inter 13px weight 500
    Background: white, border 1px blue-200, color blue-700
    Ikona: 16px, blue-500, przed tekstem, gap 6px
    
    Hover: bg blue-100, border blue-300
    
  Actions:
    [+ siren] "Nowy mandat"
    [+ camera] "Nowy fotoradar"
    [+ parking-circle] "Nowe parkowanie"
    [+ bus] "Nowe ZTM/MPK"
    [+ file-text] "Inne pismo"
    
  Agent AI: Quick Action Bar to shortcut do wizarda z pre-selected kategorią.
  Kliknięcie "Nowy mandat" → otwiera wizard z krokiem 1 pre-selected na "Mandat karny".

AI Szacunkowa Skuteczność (inline w wizardzie)
KOMPONENT: SuccessEstimator
Lokalizacja: wizard krok 2, pod polem "Powód odwołania"

  Pojawia się po wybraniu powodu odwołania (300ms delay).
  
  Card:
    Background: blue-50, border 1px blue-100, radius 10px, padding 14px
    Flex row, gap 12px, align-center
    
    Left: circular mini-chart (36 kontynuuję dokładnie od miejsca przerwania:
    Left: circular mini-chart (36px × 36px):
      SVG circle, stroke-width 3px
      Track: blue-100
      Fill: volt-500 (jeśli ≥70%), status-amber-500 (40-69%), signal-400 (<40%)
      Center: procent, Inter 11px weight 700
    
    Center:
      "Szacunkowa skuteczność: 82%" — Inter 13px weight 600, iron-800
      "Na podstawie 1 240 podobnych spraw" — Inter 12px, iron-500
    
    Right:
      Ikona: info-circle 16px, blue-400
      Tooltip (on hover/click): 
        "Szacunek oparty na analizie AI rozstrzygniętych spraw 
        z tym samym powodem odwołania. Rzeczywisty wynik może się różnić."
        — Inter 13px, iron-700, max-width 240px, bg white, shadow lg, radius 10px, padding 16px
    
    Animacja wejścia: 
      SlideDown (height 0→auto, opacity 0→1), 250ms, ease [0.16, 1, 0.3, 1]
      Progress fill w mini-chart: 0→target%, 800ms, delay 200ms
    
    Zmiana powodu odwołania:
      Komponent fade-out (opacity 1→0, 100ms), 
      update danych, 
      fade-in (opacity 0→1, 200ms) z nową wartością
    
    Agent AI: ten komponent wywołuje lekki endpoint /api/ai/estimate-success
    z parametrami { category, reason, institution }. 
    Response: { score: 82, sample_size: 1240 }.
    Na start (brak danych historycznych): hardcoded scores per kategoria+powód,
    potem dynamicznie z tabeli case_events/payments.

Status Timeline (historia pisma)
KOMPONENT: DocumentTimeline
Lokalizacja: strona szczegółów pisma (/panel/pisma/[id])

  Agent AI: Mandatomat timeline jest HORYZONTALNA (nie pionowa jak Rozwodomat).
  Powód: sprawy mandatowe mają mniej etapów (4-6 vs 8-10 w rozwodzie),
  horyzontalny layout jest bardziej kompaktowy i "procesowy".

  Full-width, margin-bottom 32px
  Background: white, border iron-100, radius 12px, padding 24px

  Flex row, align-center, justify-between
  Linia łącząca: 2px, iron-100, position absolute, top 50% of dots
  
  Każdy punkt:
    Dot: 14px circle (z-index nad linią)
    Label pod dot: Inter 12px weight 500, margin-top 8px
    Data pod label: Inter 11px, iron-400
    
    Ukończony: dot blue-600, fill, linia blue-600 (do następnego ukończonego)
    Aktywny: dot blue-500, ring 4px blue-100 (pulsujący), linia iron-200
    Przyszły: dot iron-200, outline only, linia iron-100
    Success: dot volt-500
    Failed: dot signal-500
  
  Punkty timeline (mandat):
    ✓ "Utworzono" — "20.04.2026"
    ✓ "Wygenerowano" — "20.04.2026"
    ✓ "Opłacono" — "20.04.2026"
    ✓ "Pobrano PDF" — "20.04.2026"
    ● "Wysłano" — "21.04.2026" (aktywny)
    ○ "Odpowiedź" — "oczekuje (14-30 dni)"
  
  Ostatni punkt (wynik): 
    Wariant A (pozytywny): dot volt-500, label "Uwzględnione" weight 600 volt-700
    Wariant B (negatywny): dot signal-500, label "Odmowa" weight 600 signal-700
    Wariant C (oczekuje): dot status-amber-400, label "Oczekuje" iron-500

  MOBILE:
    Timeline zmienia się na PIONOWĄ (vertical), minimalistyczną:
    Linia 2px po lewej, dots 10px, labels po prawej
    Bardziej kompaktowa niż Rozwodomat (mniej padding, mniej tekstu)

4.11 PANEL B2B — ODMIENNE UI