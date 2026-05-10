# 4.6 Sekcja Katalog Pism - 9 kategorii + search

**Chunk ID:** `D04_kategorie_pism`
**Source:** design (lines 308-462)
**Tags:** design, kategorie, search, karty, landing
**Target Agents:** design, frontend

---

4.6 SEKCJA „KATEGORIE PISM" — NAWIGACJA PRODUKTOWA
Mandatomat ma 100+ wzorów pism w 9 kategoriach. To wymaga dedykowanej sekcji nawigacyjnej, jakiej nie ma żaden inny SaaS LexMate24.
Background: white
Padding: 100px 0

OVERLINE + H2:
  Overline: "KATALOG PISM" — JetBrains Mono 11px, blue-600, uppercase, ls 0.12em
  H2: "100+ wzorów pism. Znajdź swój w 10 sekund."
    Inter Tight 36px weight 700, iron-900
    Margin-bottom: 16px
  Paragraph: "Wybierz kategorię lub wpisz problem — AI znajdzie najlepszy wzór."
    Inter 16px, iron-500
    Margin-bottom: 48px

SEARCH BAR (przed kategoriami):
  Max-width: 640px, centered, margin-bottom: 48px
  
  Input:
    Height: 56px (DUŻY — to najważniejszy element sekcji)
    Width: 100%
    Background: white
    Border: 2px solid iron-200
    Border-radius: 14px
    Padding-left: 52px (miejsce na ikonę)
    Font: Inter 16px weight 400, iron-900
    Placeholder: "np. odwołanie od mandatu za prędkość..." — iron-400
    
    Ikona search: 20px, iron-400, position absolute left 18px
    
    Focus:
      Border-color: blue-500
      Shadow: 0 0 0 4px rgba(37,99,235,0.08)
      Ikona: blue-500
    
    Agent AI: search implementacja — filtruje kategorie i pisma w real-time.
    Debounce 200ms. Wyniki pojawiają się pod inputem jako dropdown
    (max 5 wyników, karta per wynik: ikona + tytuł + kategoria + cena).

KARTY KATEGORII:
  CSS Grid: 3 kolumny (desktop), gap 16px
  Max-width: 1080px, centered

  Każda karta:
    Background: white
    Border: 1.5px solid iron-100
    Border-radius: 14px
    Padding: 28px
    Cursor: pointer
    Transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1)
    
    Hover:
      Border-color: blue-300
      Shadow: 0 4px 16px rgba(37,99,235,0.06), 0 2px 4px rgba(0,0,0,0.02)
      Transform: translateY(-2px)
      
    Active:
      Transform: translateY(0)
      Shadow: 0 1px 2px rgba(0,0,0,0.04)
    
    Struktura wewnątrz:
      Row 1: Flex row, justify-between, align-start
        Left: 
          Ikona: 36px × 36px, border-radius 10px, bg blue-50, 
            ikona 20px blue-600, flex center
        Right:
          Badge: pill, iron-100 bg, iron-700 text, JetBrains Mono 12px weight 600
            "28 wzorów"
      
      Row 2: margin-top 16px
        H4: Inter 17px weight 600, iron-900
        Paragraph: Inter 14px, iron-500, lh 1.55, margin-top 6px, 2 linie max
      
      Row 3: margin-top 16px
        Tags: flex wrap, gap 6px
          Każdy tag: pill, iron-50 bg, iron-600 text, 
            Inter 11px weight 500, padding 3px 8px, radius 99px

  KARTY (9 sztuk):
  
    1. MANDATY KARNE
       Ikona: Lucide "siren" (sygnalizator policyjny)
       H4: "Mandaty karne"
       Paragraph: "Policja, Straż Miejska, Straż Graniczna. Odwołania, uchylenia, sprzeciwy."
       Tags: "odwołanie" "uchylenie" "sprzeciw" "umorzenie"
       Badge: "28 wzorów"
    
    2. FOTORADARY
       Ikona: Lucide "camera"
       H4: "Fotoradary i pomiar prędkości"
       Paragraph: "Kwestionowanie pomiaru, błędy urządzenia, brak kalibracji, nieprawidłowe oznakowanie."
       Tags: "sprzeciw" "kwestionowanie" "CANARD" "ISKRA"
       Badge: "22 wzory"
    
    3. PARKING
       Ikona: Lucide "parking-circle" (P w okręgu)
       H4: "Opłaty parkingowe"
       Paragraph: "ZDM, APCOA, parkowanie prywatne. Reklamacje, odwołania, umorzenia."
       Tags: "reklamacja" "odwołanie" "umorzenie" "ZDM"
       Badge: "23 wzory"
    
    4. KOMUNIKACJA ZTM/MPK
       Ikona: Lucide "bus" (autobus)
       H4: "Komunikacja miejska"
       Paragraph: "Opłaty dodatkowe ZTM, MPK, SKM. Odwołania, umorzenia, przedawnienia."
       Tags: "opłata dodatkowa" "odwołanie" "bilet" "przedawnienie"
       Badge: "16 wzorów"
    
    5. INSPEKCJA TRANSPORTU (ITD)
       Ikona: Lucide "truck"
       H4: "Inspekcja Transportu Drogowego"
       Paragraph: "Odwołania od decyzji ITD, kontrole, kary administracyjne."
       Tags: "odwołanie" "kara" "tachograf" "CMR"
       Badge: "19 wzorów"
    
    6. e-TOLL / viaTOLL
       Ikona: Lucide "highway" (lub "route")
       H4: "e-TOLL i viaTOLL"
       Paragraph: "Reklamacje naliczonych opłat, korekty, umorzenia, oświadczenia."
       Tags: "reklamacja" "korekta" "umorzenie"
       Badge: "9 wzorów"
    
    7. UBEZPIECZENIA OC/AC
       Ikona: Lucide "shield" (tarcza)
       H4: "Ubezpieczenia OC/AC"
       Paragraph: "Odwołania od decyzji, reklamacje odszkodowań, Rzecznik Finansowy."
       Tags: "odwołanie" "reklamacja" "odszkodowanie" "RF"
       Badge: "12 wzorów"
    
    8. PUNKTY KARNE
       Ikona: Lucide "alert-triangle"
       H4: "Punkty karne"
       Paragraph: "Weryfikacja, korekta ewidencji, przywrócenie uprawnień."
       Tags: "weryfikacja" "korekta" "CEPiK"
       Badge: "8 wzorów"
    
    9. WINDYKACJA / EPU (cross-sell)
       Ikona: Lucide "file-warning"
       H4: "Windykacja i EPU"
       Paragraph: "Sprzeciwy od nakazów zapłaty, przedawnienia. Obsługiwane przez Długomat."
       Tags: "sprzeciw" "przedawnienie" "e-Sąd"
       Badge: "→ Długomat"
       Karta: border 1.5px dashed iron-200 (dashed = "to nie jest nasz moduł, to cross-sell")
       Badge kolor: navy-100 bg, navy-700 text (paleta Długomatu)
       Link na klik: `/dlugomat` (zewnętrzny redirect)

MOBILE:
  Search bar: full-width, height 48px
  Karty: horizontal scroll (snap) z peek (widać krawędź następnej karty)
    Alternatywnie: 1 kolumna, kompaktowe (H4 + badge w jednym rzędzie, bez paragraph)
  Wariant kompaktowy mobile:
    Każda karta: height 64px, flex row, gap 12px
    Ikona 40px box + H4 14px + badge na prawo
    No paragraph, no tags

4.7 SEKCJA CENNIK