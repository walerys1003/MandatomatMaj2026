# TIER 3 — CORE: WIZARD + AI + GENEROWANIE PISM (50 zadań)

**Cel:** Dynamic Form engine, scoring (free), wizard 3-4 krokowy, integracja Claude API, prompty dla 5 priorytetowych typów (M1, M4, P1, P3, W1), preview + edytor Markdown, OCR pipeline.
**Agenci paralelni:** AI (prompty, pipeline) ‖ Backend (API routes) ‖ Frontend (wizard, preview) ‖ OCR (Tesseract + parser).
**Czas:** 7–10 dni.

## 3.1 Dynamic Form engine (Frontend) [10]
1. `[T3-FE-001]` Typy `FormField`, `FormSchema`, `FormStep`, walidatory Zod builder. Chunk **T12**.
2. `[T3-FE-002]` `<DynamicForm>` — silnik renderujący pola na podstawie JSON schema + Zod resolver. Chunk **T12**.
3. `[T3-FE-003]` `<FieldRenderer>` — switch po typie (text/number/date/email/tel/textarea/select/radio/checkbox/checklist/file/money).
4. `[T3-FE-004]` `<CardSelectGrid>` — 2-kolumnowy grid kart wyboru. Chunk **D07** (krok 1 wizarda).
5. `[T3-FE-005]` `<FileUpload>` — drag&drop, preview thumbnail, progress bar.
6. `[T3-FE-006]` Wsparcie pól warunkowych (`conditionalOn: { field, value }`) — pole pokazuje się tylko gdy spełnione.
7. `[T3-FE-007]` Auto-fill z OCR — `autoFillFromOcr: 'sygnatura'` mapuje OCR → form value.
8. `[T3-FE-008]` `<AIBadge>` (sparkle ikona) na sugerowanych opcjach selecta + tooltip. Chunk **D07**.
9. `[T3-FE-009]` Persistencja draftu w `localStorage` co 2 sekundy + restore przy powrocie.
10. `[T3-FE-010]` `<Stepper>` (breadcrumb tabs) integrated z DynamicForm — krok aktywny + ukończone. Chunk **D07**.

## 3.2 Wizard pages + flow (Frontend + Backend) [10]
11. `[T3-FE-011]` Strona `/sprawy/nowa` — wybór kategorii (7 kart, ikony Lucide). Chunk **D07**.
12. `[T3-FE-012]` Strona `/sprawy/nowa/[category]` — wybór podtypu (np. mandaty → 7 typów).
13. `[T3-FE-013]` Strona `/sprawy/nowa/[category]/[subtype]/formularz` — wizard z DynamicForm.
14. `[T3-BE-014]` `POST /api/cases` — utworzenie nowej sprawy (status: `draft`).
15. `[T3-BE-015]` `PATCH /api/cases/[caseId]` — update form_data step-by-step.
16. `[T3-BE-016]` `GET /api/cases` — lista spraw użytkownika (z paginacją + filtrami).
17. `[T3-BE-017]` `GET /api/cases/[caseId]` — szczegóły sprawy (z dokumentami).
18. `[T3-BE-018]` `DELETE /api/cases/[caseId]` — tylko gdy status `draft`. Chunk **T07** (RLS).
19. `[T3-FE-019]` Walidacja per krok — nie można przejść dalej bez wymaganych pól.
20. `[T3-FE-020]` Anti-bounce — modal "Czy na pewno wyjść?" z opcją "Zapisz i wróć później".

## 3.3 Scoring engine (free) (AI + Backend + Frontend) [6]
21. `[T3-AI-021]` Prompt `lib/ai/prompts/scoring.md` — system prompt z chunka **T08** (sekcja `scoringAnalysis`).
22. `[T3-BE-022]` `POST /api/ai/scoring` — Claude Haiku, walidacja Zod, response `{score, reasoning}`. Chunk **T09**.
23. `[T3-BE-023]` Rate-limit `/api/ai/scoring` — 5 req/min/IP (anonim) + 20 req/h/user (zalogowany).
24. `[T3-FE-024]` Strona `/sprawdz-szanse` — formularz: kategoria, opis, dowody?, data zdarzenia.
25. `[T3-FE-025]` `<ScoringGauge>` — animowany SVG donut, kolor wg %. Chunk **T13**.
26. `[T3-FE-026]` Wynik scoring + CTA "Wygeneruj pismo — od 79 zł" (jeśli score ≥ 30%).

## 3.4 Claude API + generowanie pisma (AI + Backend) [10]
27. `[T3-AI-027]` `lib/ai/claude.ts` — wrapper z PRICING table, generateDocument, validateDocument, scoringAnalysis. Chunk **T08**.
28. `[T3-AI-028]` `lib/ai/prompts/index.ts` — `loadPrompt(file)` z parserem frontmatter (gray-matter).
29. `[T3-AI-029]` Prompt `mandaty/sprzeciw-predkosc.md` (M1) — z chunka **T15** + **T16** (M1 fields).
30. `[T3-AI-030]` Prompt `mandaty/odwolanie-straz.md` (M4).
31. `[T3-AI-031]` Prompt `parking/sprzeciw-prywatny.md` (P1) — z chunka **T16**.
32. `[T3-AI-032]` Prompt `parking/odwolanie-ztm.md` (P3).
33. `[T3-AI-033]` Prompt `windykacja/odpowiedz-wezwanie.md` (W1) — z chunka **T17**.
34. `[T3-BE-034]` `POST /api/ai/generate-document` — pipeline: load prompt → call Claude → save doc → validate → save checklist + instruction. Chunk **T09**.
35. `[T3-BE-035]` Idempotency: jeśli istnieje aktualny doc dla case_id, zwróć go (`?regenerate=true` wymusza nowy).
36. `[T3-BE-036]` Inngest job `generate-document.background` — alternatywa async (gdy Claude > 30s).

## 3.5 Walidacja AI + golden set (AI) [4]
37. `[T3-AI-037]` Prompt `validation.md` — Haiku, JSON output `{isValid, issues, suggestions}`. Chunk **T08**.
38. `[T3-AI-038]` `evals/cases/M1_*.json` — 5 golden case'ów dla M1 (input + expected sections in output).
39. `[T3-AI-039]` `evals/cases/W1_*.json` — 5 golden dla W1 (z różnymi powodami kwestionowania).
40. `[T3-AI-040]` Skrypt `pnpm eval:prompts` — runner: dla każdego golden → call Claude → check sections present + assert no hallucinated articles.

## 3.6 Markdown preview + edytor (Frontend) [5]
41. `[T3-FE-041]` `<MarkdownPreview>` — render z `marked` + `DOMPurify`, font Times serif dla podglądu pisma. Chunk **T13**.
42. `[T3-FE-042]` `<MarkdownEditor>` — Tabs (Podgląd | Edycja), textarea mono, live preview.
43. `[T3-FE-043]` Validation banner — żółty pasek z listą `issues` z validation prompta.
44. `[T3-FE-044]` Strona `/sprawy/[caseId]/podglad` — 2 kolumny: dokument 560px + panel boczny 280px. Chunk **D07**.
45. `[T3-FE-045]` Re-generate button (kosztuje token, modal z confirm).

## 3.7 OCR pipeline (OCR + Backend) [5]
46. `[T3-OCR-046]` `lib/ocr/tesseract.ts` — `extractTextFromImage(buffer)` z worker pol. Chunk **T11**.
47. `[T3-OCR-047]` `lib/ocr/parser.ts` — Claude Haiku JSON parser (sygnatura, kwota, organ, etc.). Chunk **T11**.
48. `[T3-BE-048]` `POST /api/ocr/upload` — upload do Storage `uploads/`, status `uploaded`.
49. `[T3-BE-049]` Inngest job `process-ocr` — Tesseract → parser → update `uploads.ocr_parsed_data` + status `completed`.
50. `[T3-FE-050]` `<OcrUploader>` — drag&drop, status pill (uploaded → processing → completed), confidence bar, preview parsed fields w formularzu.

## Definition of Done Tier 3
- [ ] Użytkownik może wybrać kategorię → podtyp → wypełnić wizard → wygenerować pismo.
- [ ] 5 typów pism (M1, M4, P1, P3, W1) generuje się poprawnie z Claude API.
- [ ] Scoring darmowy działa, gauge animuje się, CTA do zakupu.
- [ ] OCR uploaded image → parsed JSON → auto-fill formularza.
- [ ] Markdown preview + edycja + walidacja widoczne.
- [ ] `pnpm eval:prompts` przechodzi dla 5 typów (10 golden cases).
- [ ] Średni czas generowania pisma < 30 sekund.
