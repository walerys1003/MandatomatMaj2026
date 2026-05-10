# 4.11 Panel B2B - layout dla firm transportowych/kancelarii

**Chunk ID:** `D09_b2b_panel`
**Source:** design (lines 1097-1185)
**Tags:** design, b2b, panel, flota, api, raporty
**Target Agents:** design, frontend

---

4.11 PANEL B2B — ODMIENNE UI
FILOZOFIA: Panel B2B Mandatomatu to osobny layout dla firm transportowych,
kancelarii i NGO. Ciemniejszy, bardziej korporacyjny, z rozbudowaną analityką.

SIDEBAR B2B:
  Width: 280px
  Background: iron-950 (ciemniejszy niż B2C iron-950 — pełna czerń)
  
  Logo: [Logo klienta] (white-label) LUB "Mandatomat B2B"
    Inter Tight 16px weight 700, white
    Badge: "BUSINESS" pill, blue-700 bg, blue-200 text, 10px
  
  Nawigacja rozszerzona:
    Sekcja "ZARZĄDZANIE":
      ⬡ Dashboard
      📋 Sprawy (lista wszystkich spraw firmy)
      📊 Raporty
      📅 Kalendarz
    
    Sekcja "ORGANIZACJA":
      👥 Zespół (subkonta, role)
      🚚 Flota (pojazdy, przypisania — DLA FIRM TRANSPORTOWYCH)
      ⚙ Ustawienia firmy
      🔑 API (klucze, webhooks)
    
    Sekcja "ROZLICZENIA":
      💳 Fakturacja
      📜 Licencja
      📈 Zużycie (ile pism w okresie)

DASHBOARD B2B:
  Background: iron-100 (jaśniejszy niż B2C — więcej kart wymaga kontrastu)
  
  Metryki rozszerzone (6 kart, grid 3×2):
    "PISMA W OKRESIE" → "47"
    "AKTYWNE SPRAWY" → "12"
    "SKUTECZNOŚĆ" → "78%"
    "OSZCZĘDNOŚCI" → "14 100 zł" (vs. koszt prawnika)
    "ŚREDNI CZAS" → "2.4 min"
    "SUBKONTA" → "8 użytkowników"
  
  Tabela spraw:
    Dodatkowe kolumny:
      "Pojazd" (nr rejestracyjny — dla flot)
      "Pracownik" (kto złożył)
      "Koszt" (ile pismo kosztowało firmę)
    
    Filtry nad tabelą:
      Select: Pracownik, Pojazd, Kategoria, Status, Data od-do
      Button: "Eksport CSV" ghost iron-600
      Button: "Eksport PDF" ghost iron-600
  
  RAPORT MIESIĘCZNY (karta):
    Background: white, border iron-100, radius 14px, padding 28px
    
    H3: "Raport — kwiecień 2026" — Inter Tight 20px weight 700, iron-900
    
    Chart: bar chart (recharts), 12 słupków (miesiące)
      Kolor słupków: blue-500
      Oś Y: liczba pism
      Oś X: miesiące (JetBrains Mono 11px)
      
    Pod chartem: 
      "Łączna oszczędność vs. kancelaria: 14 100 zł w tym miesiącu"
      Inter 14px weight 500, volt-600
      Ikona: trending-up 16px

PANEL API:
  Dokumentacja inline (markdown renderer):
    Endpoints:
      POST /api/v1/documents/create — tworzenie pisma
      GET /api/v1/documents/{id} — pobranie pisma
      GET /api/v1/documents — lista pism
      GET /api/v1/stats — statystyki
    
    Code snippets (syntax highlighted, JetBrains Mono 13px):
      curl, Python, JavaScript
    
    API key display:
      Input readonly, JetBrains Mono 14px, masked (••••••••)
      Button: "Pokaż" / "Kopiuj" ghost small
      Button: "Regeneruj klucz" ghost danger small
    
    Webhook URL:
      Input editable, placeholder "https://twoja-firma.pl/webhook"
      Events: document.created, document.paid, document.completed, case.resolved
      Checkboxes per event

4.12 ANIMACJE — SPECYFIKA MANDATOMAT