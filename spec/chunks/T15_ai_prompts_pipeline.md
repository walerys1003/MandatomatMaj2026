# 8. System AI - prompty + pipeline generowania

**Chunk ID:** `T15_ai_prompts_pipeline`
**Source:** tech (lines 2488-2613)
**Tags:** ai, prompty, pipeline, claude, markdown, frontmatter
**Target Agents:** ai, backend

---

8. SYSTEM AI — PROMPTY I PIPELINE
8.1 Architektura promptów
Każdy typ pisma ma osobny plik .md w lib/ai/prompts/[kategoria]/[typ].md. Struktura każdego promptu:
---
case_type: mandat_sprzeciw_predkosc
model: claude-sonnet-4-6
max_tokens: 3500
version: 1.0
last_updated: 2025-09-01
---

SYSTEM PROMPT:

Jesteś doświadczonym prawnikiem specjalizującym się w prawie wykroczeń 
i prawie o ruchu drogowym w Polsce. Generujesz pisma procesowe 
(sprzeciwy, odwołania, wnioski) w języku polskim.

ZASADY:
1. Styl: formalny, urzędowy, precyzyjny
2. Każde twierdzenie popieraj przepisem (artykuł, paragraf, ustawa)
3. Używaj aktualnych przepisów (Kodeks wykroczeń, KPW, ustawa Prawo o ruchu drogowym)
4. NIE wymyślaj danych — używaj WYŁĄCZNIE danych z pola DANE SPRAWY
5. Jeśli brakuje danych, wstaw placeholder [[UZUPEŁNIJ: opis]]
6. Ton: {{ton}} (ugodowy/stanowczy — z danych formularza)
7. Format wyjściowy: Markdown z sekcjami ##

INSTRUKCJA:
Wygeneruj kompletny SPRZECIW OD MANDATU ZA PRZEKROCZENIE PRĘDKOŚCI zawierający:

## {{miejscowość}}, dnia {{data_dzisiejsza}}

{{imie_nazwisko}}
{{adres}}
{{kod_pocztowy}} {{miasto}}

## {{adresat — organ wystawiający}}
{{adres_organu}}

## SPRZECIW OD MANDATU KARNEGO

Dotyczy: mandatu karnego nr {{numer_mandatu}} z dnia {{data_mandatu}}
wystawionego przez {{organ}}

Na podstawie art. 101 § 1 Kodeksu postępowania w sprawach o wykroczenia 
wnoszę sprzeciw od mandatu karnego nr {{numer_mandatu}} i żądam jego uchylenia w całości.

## UZASADNIENIE

[AI generuje na podstawie wybranych okoliczności z formularza:
- wadliwe urządzenie → art. 33 ust. 3 ustawy Prawo o miarach
- brak legalizacji → Rozporządzenie MIiR w sprawie przyrządów pomiarowych
- nieprawidłowe oznakowanie → art. 39 Prawa o ruchu drogowym
- błąd identyfikacji → brak jednoznacznej identyfikacji kierowcy
- błędy proceduralne → naruszenie procedury z art. 97 KPW
]

## DOWODY

1. [lista na podstawie zaznaczonych okoliczności i uploadów]

## ZAŁĄCZNIKI

1. Kopia mandatu karnego
2. [auto-generowana lista na podstawie checklisty]

---

Z poważaniem,

{{imie_nazwisko}}

(podpis własnoręczny)

8.2 Pipeline generowania (krok po kroku)
1. FORMULARZ → form_data (JSON)
   Użytkownik wypełnia dynamiczny wizard (3-6 kroków)
   Walidacja: Zod schema per case_type

2. (opcjonalnie) UPLOAD → OCR → ocr_parsed_data
   Użytkownik wgrywa zdjęcie mandatu / wezwania
   Tesseract → raw text → Claude Haiku parser → JSON z polami
   Auto-fill formularza z wykrytych danych

3. LOAD PROMPT
   Backend ładuje .md z lib/ai/prompts/[kategoria]/[typ].md
   Parsuje frontmatter (model, max_tokens, version)

4. MERGE DATA
   System prompt + user data + OCR data → payload

5. CALL CLAUDE API (Sonnet 4.6)
   Input: ~1500-3000 tokenów (prompt + dane)
   Output: ~2000-3500 tokenów (pismo Markdown)
   Koszt: ~0.02-0.06 USD = 0.08-0.25 PLN

6. VALIDATION (Haiku 4.5 — tani)
   "Czy pismo zawiera: nagłówek, strony, żądanie, uzasadnienie, podpis, załączniki?"
   Output: {isValid, issues[], suggestions[]}
   Koszt: ~0.002 USD = 0.008 PLN

7. SAVE DOCUMENT
   Markdown → baza danych (documents.content_markdown)
   + checklista załączników (osobny dokument)
   + instrukcja (osobny dokument)

8. PREVIEW
   Użytkownik widzi podgląd Markdown (render HTML)
   Może przełączyć na edycję i zmienić treść
   Może uruchomić re-generację (nowy prompt)

9. PAYMENT
   Stripe Checkout → webhook → status: paid

10. PDF RENDER
    Markdown → HTML (marked.js) → PDF (Puppeteer)
    Styl: Times New Roman 12pt, A4, marginesy sądowe
    Stopka: "Wygenerowano przez Mandatomat.pl — data"

11. DOWNLOAD / SEND
    Signed URL do pobrania (TTL 1h)
    Opcjonalnie: wysyłka ePUAP/e-mail (V2)

12. DEADLINE
    Auto-ustawienie terminu na podstawie case_type_config
    Rozpoczęcie sekwencji przypomnień (D-5, D-3, D-1, D-0)
