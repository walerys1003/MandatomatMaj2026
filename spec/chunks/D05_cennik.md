# 4.7 Sekcja Cennik - 3 plany + B2B teaser

**Chunk ID:** `D05_cennik`
**Source:** design (lines 462-551)
**Tags:** design, cennik, pricing, b2b, subskrypcja
**Target Agents:** design, frontend

---

4.7 SEKCJA CENNIK
Background: var(--iron-950) — ciemna sekcja
Padding: 100px 0

Overline: "CENNIK" — JetBrains Mono 11px, iron-400, uppercase, ls 0.12em
H2: "Jedno pismo lub pełna ochrona."
    Inter Tight 36px weight 700, white
    Margin-bottom: 16px
Paragraph: "Średni koszt odwołania u prawnika: 300–1 000 zł"
    Inter 16px, iron-400, line-through na kwotach (blue-400 przekreślenie)
    Margin-bottom: 56px

TRZY KARTY:

KARTA 1 — "Jedno pismo":
  Background: rgba(255,255,255,0.03)
  Border: 1px solid rgba(255,255,255,0.06)
  Radius: 14px, padding 32px
  
  Cena: "99 zł" — Inter Tight 40px weight 800, white
  Pod: "Jednorazowo" — Inter 14px, iron-400
  Separator: 1px rgba(255,255,255,0.06), margin-y 24px
  
  Cechy (Inter 14px, iron-300, gap 12px):
    ✓ Jedno pismo prawne
    ✓ AI dopasowanie do sytuacji
    ✓ PDF gotowy do wysłania
    ✓ Poradnik krok-po-kroku
  
  Ikona ✓: blue-400, 14px
  Button: ghost, border rgba(255,255,255,0.1), white
    "Stwórz pismo →"

KARTA 2 — "Pakiet 3 pism" (WYRÓŻNIONA):
  Background: white
  Shadow: 0 8px 32px rgba(0,0,0,0.3)
  
  Badge: "OSZCZĘDZASZ 25%" — blue-600 bg, white text, pill
    Inter 10px weight 700, uppercase
  
  Cena: "249 zł" — Inter Tight 40px weight 800, iron-950
  Pod: "Jednorazowo" — Inter 14px, iron-500
  Cena przekreślona: "297 zł" — Inter 14px, iron-400, line-through
  Separator: 1px iron-100
  
  Cechy (Inter 14px, iron-700):
    ✓ 3 pisma prawne (dowolny typ)
    ✓ Wszystko z Jednego pisma
    ✓ AI asystent prawny
    ✓ Kalendarz terminów
    ✓ Priorytetowe generowanie
  
  Ikona ✓: blue-600
  Button: blue-600 bg, white, full-width, "Wybierz pakiet →"

KARTA 3 — "PRO+ (Subskrypcja)":
  Background: rgba(255,255,255,0.03)
  Border: 1px solid rgba(255,255,255,0.06)
  
  Cena: "349 zł" — Inter Tight 40px weight 800, white
  Pod: "Miesięcznie" — Inter 14px, iron-400
  
  Cechy:
    ✓ Nielimitowane pisma
    ✓ Wszystkie kategorie
    ✓ AI prawnik 24/7
    ✓ OCR analiza dokumentów
    ✓ Kalendarz + alerty
    ✓ Eksport DOCX + PDF
    ✓ Raporty skuteczności
  
  Button: ghost, border rgba(255,255,255,0.1), white
    "Rozpocznij PRO+ →"

Pod kartami — B2B teaser:
  Max-width: 640px, centered
  Background: rgba(255,255,255,0.03), border 1px rgba(255,255,255,0.06), radius 14px
  Padding: 24px 28px
  Flex row, justify-between, align-center
  
  Left:
    "Jesteś firmą transportową lub kancelarią?"
    Inter 15px weight 500, iron-300
    Pod spodem: "Licencja B2B od 490 zł/mc. White-label, API, panel flotowy."
    Inter 13px, iron-400
  Right:
    Button: ghost small, border rgba(255,255,255,0.12), iron-200
    "Sprawdź ofertę B2B →"

4.8 DASHBOARD — PANEL UŻYTKOWNIKA