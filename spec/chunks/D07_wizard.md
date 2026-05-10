# 4.9 Wizard - 3-4 krokowy formularz

**Chunk ID:** `D07_wizard`
**Source:** design (lines 719-940)
**Tags:** design, wizard, formularz, stepper, card_select, preview, platnosc
**Target Agents:** design, frontend

---

4.9 WIZARD — SPECYFIKA MANDATOMAT
KLUCZOWA RÓŻNICA: Mandatomat wizard to NAJKRÓTSZY wizard ze wszystkich SaaS-ów.
3-4 kroki (vs. 6 Długomat, 4-7 Rozwodomat, 5 Alimentomat).
Powód: mandaty są proste. Mniej pól, mniej danych, szybciej do wyniku.

TOP BAR:
  Background: white (czysty, jasny — kontrast z ciemnym dashboardem)
  Height: 64px (niższy niż inne SaaS-y), sticky
  Border-bottom: 1px iron-100
  
  Left: "← Wstecz" ghost, iron-600, Inter 14px weight 500
  Center: 
    "Odwołanie od mandatu" — Inter 15px weight 600, iron-900
    Krok: "Krok 1 z 3" — Inter 12px, iron-400 (obok, nie pod spodem — oszczędność miejsca)
  Right: "×" close button, 20px, iron-400
    Hover: iron-600
    — zamknięcie wizarda (nie "Zapisz i wyjdź" — Mandatomat nie dramatyzuje)

PROGRESS BAR:
  Height: 2px (NAJCIEŃSZY — Mandatomat nie potrzebuje grubej wizualizacji)
  Track: iron-100
  Fill: blue-500
  No glow, no animation — statyczny, zmiana skokowa

STEP INDICATOR:
  BRAK TRADYCYJNEGO STEPPERA.
  
  Mandatomat zamiast kropek z numerami używa BREAD-CRUMB TABS:
  Flex row, gap 0, max-width 560px, centered, margin-top 32px, margin-bottom 40px
  
  Każdy tab:
    Padding: 10px 20px
    Border-bottom: 2px solid
    Font: Inter 13px weight 500, uppercase, ls 0.04em
    
    Ukończony: text iron-500, border blue-500
    Aktywny: text blue-600 weight 600, border blue-600
    Przyszły: text iron-300, border iron-100
    
    Separator: brak (taby stykają się)
    
  Taby: "RODZAJ" | "DANE" | "PODGLĄD" | "PŁATNOŚĆ"
  (Mandatomat 4-krokowy: typ → dane → preview → pay)

FORMULARZ:
  Max-width: 520px (NAJWĘŻSZY), centered
  Background: white (bez karty-wrappera — sam formularz na białym tle)
  Padding: 0 (formularz bezpośrednio na stronie, nie w karcie)
  
  Agent AI: brak karty okalającej formularz to celowa decyzja.
  Mandatomat jest PŁASKI — mniej warstw, mniej głębi, mniej "pudełek w pudełkach".
  Formularz oddycha bezpośrednio na stronie.

KROK 1 — RODZAJ MANDATU:
  H3: "Co chcesz odwołać?" — Inter Tight 24px weight 700, iron-900
  Margin-bottom: 24px
  
  CARD-SELECT GRID (2 kolumny, gap 12px):
    Każda karta:
      Height: auto (content-driven), min-height 80px
      Border: 1.5px solid iron-200
      Radius: 12px
      Padding: 16px 20px
      Cursor: pointer
      
      Flex column, gap 4px
      Ikona: 24px, iron-400
      Tytuł: Inter 14px weight 600, iron-900
      Opis: Inter 12px, iron-500 (1 linia)
      
      Selected: border 2px blue-500, bg blue-50, ikona blue-600
      Hover (unselected): border iron-300, shadow sm
    
    Opcje:
      [siren] "Mandat karny" / "Policja, Straż Miejska"
      [camera] "Fotoradar" / "CANARD, pomiar prędkości"
      [parking-circle] "Opłata parkingowa" / "ZDM, APCOA, prywatne"
      [bus] "Komunikacja miejska" / "ZTM, MPK, SKM"
      [truck] "ITD" / "Inspekcja Transportu"
      [highway] "e-TOLL" / "viaTOLL, opłaty drogowe"
      [shield] "Ubezpieczenie" / "OC, AC, odszkodowanie"
      [file-warning] "Inne" / "Opisz swoją sytuację"

KROK 2 — DANE (dynamiczne pytania):
  H3: "Szczegóły mandatu" — Inter Tight 24px weight 700, iron-900
  
  Agent AI: pola zmieniają się dynamicznie w zależności od wybranego rodzaju (krok 1).
  
  WARIANT: Mandat karny (Policja):
    Select: "Kto wystawił?" — Policja drogowa / Straż Miejska / Straż Graniczna / Inne
    Input: "Numer mandatu" — placeholder "np. XYZ123456"
    Date: "Data wystawienia mandatu"
    Number: "Kwota mandatu" — zł
    Select: "Powód odwołania" (KLUCZOWE POLE):
      Dropdown z AI-sugestiami, ikona sparkle ✨ obok opcji sugerowanych:
        ✨ "Błąd urządzenia pomiarowego"
        ✨ "Nie byłem kierowcą"
        ✨ "Nieczytelne oznakowanie"
        "Nieprawidłowa procedura kontroli"
        "Przekroczenie terminu wystawienia"
        "Okoliczności łagodzące"
        "Inne (opiszę)"
    Textarea (jeśli "Inne"): "Opisz okoliczności" — max 500 znaków
    
  WARIANT: Fotoradar:
    Select: "Typ urządzenia" — CANARD / ISKRA / Ultralyte / Nieznany
    Input: "Numer sprawy/mandatu"
    Date: "Data zdarzenia"
    Input: "Lokalizacja pomiaru"
    Number: "Prędkość zmierzona / dozwolona" — dwa pola obok siebie
    Select: "Powód odwołania" (AI-sugestie):
      ✨ "Brak legalizacji urządzenia"
      ✨ "Niepewność pomiarowa"
      ✨ "Nie byłem kierowcą"
      "Nieprawidłowe ustawienie urządzenia"
      "Brak oznakowania fotoradaru"
      "Inne"
    
  WARIANT: Opłata parkingowa:
    Select: "Miasto"
    Select: "Operator" — ZDM / APCOA / Inny (input)
    Input: "Numer opłaty/wezwania"
    Date: "Data zdarzenia"
    Number: "Kwota"
    Select: "Powód reklamacji":
      ✨ "Opłata uiszczona w aplikacji"
      ✨ "Awaria parkometru"
      "Nieczytelne oznakowanie strefy"
      "Pojazd nie był zaparkowany w tym miejscu"
      "Przedawnienie roszczenia"
      "Inne"
  
  WARIANT: ZTM/MPK:
    Select: "Miasto"
    Select: "Przewoźnik" — ZTM Warszawa / MPK Kraków / SKM / Inny
    Input: "Numer opłaty dodatkowej"
    Date: "Data zdarzenia"
    Toggle: "Czy posiadałeś ważny bilet?"
      Jeśli tak: upload biletu / screenshot (drag-drop zone, compact, height 120px)
    Select: "Powód odwołania":
      ✨ "Posiadałem ważny bilet (załączam dowód)"
      ✨ "Awaria kasownika"
      "Przedawnienie (po 1 roku)"
      "Okoliczności losowe"
      "Inne"

  Agent AI: ikona ✨ (sparkle) przed AI-sugerowanymi opcjami.
  Implementacja: Lucide "sparkles" 14px, blue-400.
  Tooltip: "AI sugeruje tę opcję na podstawie analizy podobnych spraw"

KROK 3 — PODGLĄD:
  Background: iron-50
  Layout: 2 kolumny (dokument 560px + panel 280px)
  
  DOKUMENT:
    Identyczna struktura jak Długomat (karta A4, serif text, watermark),
    ale MNIEJSZY padding (48px 40px) i MNIEJSZY shadow (lg nie xl)
    — Mandatomat wizualnie "lżejszy" od Długomatu
  
  PANEL BOCZNY:
    Mniejszy (280px vs 320px), 1 karta zamiast 2:
    
    Karta — Podsumowanie + płatność:
      Background: white, border iron-100, radius 12px, padding 20px
      
      Sekcja 1 — meta:
        "Odwołanie od mandatu" — Inter 13px, iron-500
        "Mandat za prędkość • Policja" — Inter 14px weight 500, iron-800
        Separator: 1px iron-100
      
      Sekcja 2 — walidacja (kompaktowa):
        Flex row, justify-between
        "Kompletność:" — Inter 13px, iron-500
        "92%" — Inter 13px weight 600, volt-600
        Badge: volt-100 bg, volt-700 text, "OK"
      
      Sekcja 3 — cena:
        Separator: 1px iron-100
        "99 zł" — Inter Tight 28px weight 700, iron-900
        "Prawnik: ~500 zł" — Inter 13px, iron-400, line-through
        
      Button: blue-600 bg, white, full-width, height 44px
        "Zapłać i pobierz →"
      
      Pod button: ikony płatności (Visa, MC, BLIK, P24) 
        szare, 20px height, flex row gap 6px, centered

KROK 4 — PŁATNOŚĆ (po Stripe Checkout redirect):
  Success page:
    Max-width: 480px, centered, padding-top: 80px
    
    Ikona: check-circle 64px, volt-500
      Animacja: scale 0→1, spring stiffness 200, duration 400ms
      Bez draw-in (szybciej niż Długomat — Mandatomat nie celebruje, zamyka)
    
    H2: "Gotowe." — Inter Tight 28px weight 700, iron-900
      (jednosłowowe — najkrótszy success message w LexMate24)
    
    Paragraph: "Twoje odwołanie jest gotowe do pobrania."
      Inter 16px, iron-500, margin-bottom 32px
    
    Karta z plikiem:
      Background: iron-50, border iron-200, radius 12px, padding 20px
      Flex row, gap 16px, align-center
      Ikona: file-text 24px, blue-500
      Nazwa: "Odwolanie_mandat_XYZ123456.pdf" — JetBrains Mono 13px, iron-700
      Rozmiar: "128 KB" — Inter 12px, iron-400
      Button: "Pobierz" primary small, blue-600
    
    Pod kartą:
      Link: "Wróć do panelu" — Inter 14px, blue-600, underline
      
    Instrukcja (margin-top 40px):
      Karta: border iron-200, radius 12px, padding 24px
      H4: "Co dalej?" — Inter 16px weight 600, iron-900
      Ordered list (Inter 14px, iron-600, lh 1.6):
        1. "Wydrukuj odwołanie lub wyślij przez ePUAP"
        2. "Złóż w ciągu 7 dni od otrzymania mandatu"
        3. "Oczekuj na odpowiedź (14-30 dni)"
      
      Każdy item: number w circle (20px, blue-50 bg, blue-600 text, 11px weight 600)
