# 4.8 Dashboard - panel użytkownika B2C

**Chunk ID:** `D06_dashboard_b2c`
**Source:** design (lines 551-718)
**Tags:** design, dashboard, sidebar, metryki, tabela, skutecznosc
**Target Agents:** design, frontend

---

4.8 DASHBOARD — PANEL UŻYTKOWNIKA
FILOZOFIA: Dashboard Mandatomatu to najbardziej "SaaS-owy" panel w LexMate24.
Bardziej Stripe Dashboard niż portal prawny. Gęstszy, bardziej tabelaryczny,
więcej danych na ekranie. Użytkownik Mandatomatu to często kierowca z wieloma 
mandatami — potrzebuje przeglądać wiele spraw naraz.

SIDEBAR:
  Width: 256px (węższy niż Długomat — mniej modułów)
  Background: var(--iron-950)
  
  Logo:
    "Mandatomat" — Inter Tight 17px weight 700, white
    ".pl" — Inter Tight 17px weight 700, blue-400 (kolorowy suffix)
    Pod spodem: brak "LexMate24" — Mandatomat jest na tyle silną marką, 
      że submarka jest zbędna w sidebarze
    Margin-bottom: 32px
    
  Nawigacja:
    Domyślnie: ikona iron-500, tekst iron-400
    Hover: bg rgba(255,255,255,0.04), tekst iron-200
    Active: bg rgba(37,99,235,0.08), tekst white, ikona blue-400
      Left indicator: 3px, blue-500
    
    Font labels: Inter 14px weight 500
    Ikony: 18px, stroke 1.5px
    
  Elementy:
    ⬡ Panel
    📋 Moje pisma
    📚 Szablony (link do katalogu)
    📅 Kalendarz terminów
    📊 Statystyki
    💳 Płatności
    --- separator (1px rgba(255,255,255,0.05)) ---
    👤 Profil
    ⚙ Ustawienia
    
    Jeśli PRO+: badge "PRO+" obok loganu
      pill, blue-600 bg, white text, 10px, uppercase

  BUTTON (dół sidebar, przed separator):
    "+ Nowe pismo" — full-width, blue-600, white, height 40px
    Inter 13px weight 600
    Radius 8px
    Margin-bottom: 16px

MAIN CONTENT:
  Background: var(--iron-50) — najczystszy gray
  Padding: 28px 32px (MNIEJSZY padding niż inne SaaS-y — gęstość)
  
  HEADER:
    Flex row, justify-between, align-center
    H3: "Panel" — Inter Tight 22px weight 700, iron-900
    Right: 
      Search (compact): 200px input, height 36px, iron-100 bg, iron-300 border
      Notification bell (18px, iron-500)
      Avatar: 32px circle, iron-200 bg

METRYKI (pod header):
  CSS Grid 4 kolumny, gap 12px, margin-bottom 24px
  
  Każda karta:
    Background: white, border 1px iron-100, radius 10px, padding 16px
    — mniejsze padding i radius niż inne SaaS-y = kompaktowość
    
    Overline: JetBrains Mono 10px, iron-400, uppercase, ls 0.06em
    Wartość: Inter Tight 22px weight 700, iron-900, tabular-nums
    Trend: Inter 11px, volt-600 (up) / signal-600 (down)
    
    "PISMA W TYM MIESIĄCU" → "7"
    "OCZEKUJĄCE" → "3" (status-amber-500)
    "UWZGLĘDNIONE" → "4" (volt-500)
    "SKUTECZNOŚĆ" → "76%" (volt-500)

WIDGET "SKUTECZNOŚĆ" (UNIKALNY DLA MANDATOMAT):
  Karta wyróżniona, full-width, margin-bottom 24px
  Background: white, border iron-100, radius 12px, padding 24px
  
  Layout: flex row, gap 32px, align-center
  
  Left (donut chart):
    Width: 100px, height: 100px
    SVG circle chart:
      Track: iron-100 (360°)
      Segment 1 (uwzględnione): volt-500 (76% = ~274°)
      Segment 2 (odmowa): signal-400 (12%)
      Segment 3 (oczekujące): status-amber-400 (12%)
    Center text: "76%" — Inter Tight 20px weight 700, iron-900
  
  Center (legenda):
    Każdy item: flex row, gap 8px, align-center
    Dot 8px circle + tekst Inter 13px weight 500 iron-700 + wartość iron-500
    ● Uwzględnione: volt-500, "23 pisma"
    ● Odmowa: signal-400, "4 pisma"
    ● Oczekujące: status-amber-400, "3 pisma"
  
  Right (trend sparkline):
    Width: 200px, height: 60px
    SVG line chart, stroke blue-400, stroke-width 2, fill none
    Trend line last 12 weeks
    Pod spodem: "Trend skuteczności (12 tyg.)" — Inter 11px, iron-400

LISTA PISM (tabela, nie karty — Mandatomat jest tabelaryczny):
  Background: white, border iron-100, radius 12px, overflow hidden
  
  Table header:
    Background: iron-50
    Font: Inter 12px weight 600, iron-500, uppercase, ls 0.04em
    Height: 44px
    Border-bottom: 1px iron-200
    
  Kolumny:
    "Typ pisma" — 25% width
    "Data" — 12%
    "Instytucja" — 18%
    "Status" — 15%
    "Termin odpowiedzi" — 15%
    "Akcje" — 15%
  
  Table row:
    Height: 60px
    Border-bottom: 1px iron-50
    Font: Inter 14px weight 400, iron-800
    Hover: bg blue-50/30
    
    Typ pisma: 
      Flex row, gap 10px
      Ikona kategorii: 20px, blue-500 (w circle 32px, blue-50 bg, radius 8px)
      Nazwa: Inter 14px weight 500, iron-900
      Kategoria: Inter 12px, iron-500
    
    Data: JetBrains Mono 13px, iron-600
    
    Instytucja: Inter 14px, iron-700
    
    Status (badge pill):
      "Wersja robocza" — iron-100 bg, iron-600 text
      "Wysłane" — blue-100 bg, blue-700 text
      "Oczekuje" — status-amber-100 bg, status-amber-700 text
      "Uwzględnione" — volt-100 bg, volt-700 text
      "Odmowa" — signal-100 bg, signal-700 text
      JetBrains Mono 11px weight 600, uppercase
    
    Termin: 
      >14 dni: Inter 13px, iron-500 ("do 12.05.2026")
      7-14 dni: Inter 13px weight 500, status-amber-600
      <7 dni: Inter 13px weight 600, signal-600
      Brak: "—" iron-300
    
    Akcje:
      Button group: 2 ghost buttons, gap 4px
        "Otwórz" — 13px, blue-600
        "⋮" — dropdown (Edytuj, Duplikuj, Pobierz PDF, Usuń)

  Table footer:
    Background: iron-50
    Height: 48px
    Flex row, justify-between, align-center, padding-h 16px
    Left: "Wyświetlam 1-10 z 30" — Inter 13px, iron-500
    Right: Pagination (numbered buttons, active: blue-600 bg white text)

MOBILE dashboard:
  Bottom nav: 5 ikon (Panel, Pisma, Nowe, Kalendarz, Menu)
    Ikona "Nowe" (środkowa): blue-600 bg circle, white "+" icon
  Tabela → lista kart (każda karta: typ + status + termin, kompaktowa)
  Metryki: 2×2 grid
  Widget skuteczności: ukryty (zbyt złożony), zamiast: prosty % w karcie metryki
