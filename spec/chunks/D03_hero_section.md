# 4.5 Hero Section - pixel-perfect instrukcja

**Chunk ID:** `D03_hero_section`
**Source:** design (lines 130-308)
**Tags:** design, hero, landing, phone_mockup, animacje, stats
**Target Agents:** design, frontend

---

Sekcja hero:
  Min-height: 640px (NAJNIŻSZY hero — szybko do treści)
  Padding-top: 140px, padding-bottom: 100px
  Background: var(--iron-50) — najczystszy off-white
  Position: relative, overflow: hidden

DEKORACJA TŁA:
  Agent AI: Mandatomat ma NAJSUBTELNIEJSZĄ dekorację ze wszystkich SaaS-ów.
  Prawie nic. Czystość.

  Element 1 — Siatka perspektywiczna:
    Position: absolute, bottom 0, left 0, right 0, height 50%
    Background-image: 
      linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)
    Background-size: 60px 60px
    Transform: perspective(600px) rotateX(45deg)
    Transform-origin: bottom center
    Opacity: 0.6
    Mask-image: linear-gradient(180deg, transparent 0%, black 60%)
    — siatka perspektywiczna z dołu — jak podłoga hali przemysłowej
    — widoczna ledwo, ale daje głębię i techniczność
  
  Element 2 — Accent dot:
    Position: absolute, top 20%, right 15%
    Width: 8px, height: 8px
    Border-radius: 50%
    Background: var(--blue-400)
    Opacity: 0.4
    — jeden mały punkt. To wszystko. Minimalizm.

LAYOUT (desktop):
  CSS Grid: grid-template-columns: 1.15fr 0.85fr
  Gap: 64px
  Align-items: center
  Max-width: 1280px

LEWA KOLUMNA (tekst):

  OVERLINE:
    Font: JetBrains Mono 11px weight 600, uppercase, letter-spacing 0.12em
    Color: var(--blue-600)
    Margin-bottom: 20px
    Treść: "MANDATOMAT.PL"
    — mono font w overline (jedyny SaaS) — wzmacnia wrażenie "systemu"

  H1:
    Font: Inter Tight 52px / 1.0 / -0.04em / 800
    Color: var(--iron-950)
    Margin-bottom: 20px
    Max-width: 520px
    
    Treść: "Odwołaj mandat w 3 minuty."
    
    Agent AI: najkrótszy H1 ze wszystkich SaaS-ów. 6 słów. 
    Bez emocji, bez pytań, bez "pomożemy Ci". 
    Czysta propozycja wartości. Czas. Akcja. Wynik.
    
    "3 minuty" — opcjonalnie w kolorze blue-600 (jedyny kolorowy fragment)

  PARAGRAPH:
    Font: Inter 17px / 1.6 / weight 400
    Color: var(--iron-500)
    Margin-bottom: 36px
    Max-width: 460px
    Treść: "AI generuje profesjonalne odwołanie dopasowane do Twojej sytuacji. 
    Mandaty drogowe, fotoradary, parkowanie, ZTM, e-TOLL, ubezpieczenia."

  BUTTON GROUP:
    Flex row, gap 12px
    
    Button 1 (primary):
      "Stwórz odwołanie →"
      Height: 52px, padding-h 32px
      Background: var(--blue-600)
      Color: white
      Font: Inter 15px weight 600
      Border-radius: 10px
      Shadow: 0 1px 3px rgba(37,99,235,0.15), 0 2px 8px rgba(37,99,235,0.1)
      
      Hover:
        Background: var(--blue-500)
        Shadow: 0 2px 6px rgba(37,99,235,0.2), 0 4px 14px rgba(37,99,235,0.12)
        Transform: translateY(-1px)
      
    Button 2 (secondary — NOT ghost, lekko wypełniony):
      "Sprawdź szanse — za darmo"
      Height: 52px, padding-h 28px
      Background: var(--blue-50)
      Border: 1px solid var(--blue-200)
      Color: var(--blue-700)
      Font: Inter 15px weight 500
      
      Hover: bg blue-100, border blue-300

  STATS LINE:
    Margin-top: 40px
    Flex row, gap 32px
    
    Każda metryka:
      Wartość: Inter Tight 24px weight 700, iron-900, tabular-nums
      Label: Inter 13px weight 400, iron-500
      
    "3 min" / "czas generowania"
    "76%" / "skuteczność"
    "100+" / "wzorów pism"
    
    Separator: pionowa linia 1px × 32px, iron-200
    
    Agent AI: mniejsze wartości niż Długomat (24px vs 28px) — 
    Mandatomat nie potrzebuje dramatycznych liczb, one mówią same za siebie

PRAWA KOLUMNA (VISUAL):
  DEVICE MOCKUP — telefon z interfejsem Mandatomat:
  
  NIE screenshot. NIE ilustracja. MOCKUP interfejsu w ramce telefonu.
  
  Ramka telefonu:
    Width: 320px, height: auto (proporcje iPhone 14/15)
    Background: iron-900 (ciemna ramka)
    Border-radius: 40px
    Padding: 12px
    Shadow: 0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.08)
    
  Ekran wewnątrz (radius 32px, overflow hidden):
    Background: white
    
    Status bar: 
      Height: 44px, flex row, justify-between, padding-h 24px
      "9:41" — Inter 15px weight 600, iron-900 (left)
      Signal + wifi + battery icons (right, iron-700)
    
    App header:
      Height: 56px, bg white, border-bottom 1px iron-100
      "Mandatomat" — Inter 16px weight 700, iron-900
      
    Content (wizard step 1):
      Padding: 20px
      
      H3: "Rodzaj mandatu" — Inter 17px weight 600, iron-900
      
      Trzy opcje (card-select, vertical stack, gap 10px):
        Karta 1: "Mandat za prędkość" 
          Ikona: gauge 20px, blue-500
          Selected: border 2px blue-500, bg blue-50
        Karta 2: "Fotoradar"
          Ikona: camera 20px, iron-400
          Unselected: border 1px iron-200
        Karta 3: "Opłata parkingowa"
          Ikona: car 20px, iron-400
          Unselected
        
        Każda karta: height 52px, radius 10px, padding-h 16px
          Flex row, gap 12px, align-center
          Inter 14px weight 500
      
      Button na dole: "Dalej →" full-width, blue-600, white, height 48px
    
    Home indicator: 4px × 134px, iron-300, radius 99px, centered, bottom 8px
  
  ANIMACJA MOCKUPU (Framer Motion):
    Cały mockup: fadeIn + translateY 20→0, delay 300ms, duration 600ms
    Karty wewnątrz: staggered fadeIn, delay 600ms, each +100ms
    Selected card (mandat za prędkość): 
      po 1200ms, auto-select animation (border 1px→2px blue, bg white→blue-50), 200ms
    
    Subtle float: translateY +/- 3px, 8s infinite, ease sine
      — subtelniejszy float niż Alimentomat (3px vs 4px)

MOBILE (< 768px):
  Single column, tekst na górze
  H1: 38px / 1.02 / -0.04em — nadal bardzo ściśnięty
  Mockup: ukryty (phone mockup na phone = meta i niepotrzebny)
  Zamiast mockupu: trzy stats karty w rzędzie (scrollowalnym)
  Buttons: stack, full-width
  Paragraph: 16px
  Padding-top: 100px (szybciej do treści na mobile)

4.6 SEKCJA „KATEGORIE PISM" — NAWIGACJA PRODUKTOWA