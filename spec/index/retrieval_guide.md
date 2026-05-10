# Mandatomat — Knowledge Base Retrieval Guide

## Jak korzystać z bazy wiedzy (dla AI Code Agent)

Specyfikacja Mandatomat została podzielona na **30 chunków** (~190KB → ~6KB średnio na chunk). Zamiast ładować całość, korzystaj z **selektywnego retrievalu**.

## Pliki indeksowe

- `spec/index/chunks_index.json` — pełny indeks wszystkich chunków (id, title, tags, agents, ścieżka)
- `spec/index/tag_index.json` — odwrotny indeks `tag → [chunk_ids]`
- `spec/index/agent_index.json` — odwrotny indeks `agent → [chunk_ids]`
- `spec/chunks/<chunk_id>.md` — pojedynczy chunk z metadanymi w nagłówku

## Retrieval per zadanie (recipe)

| Zadanie | Załaduj chunki |
|---|---|
| Setup repo, monorepo, Next.js | `T02_architektura_stack`, `T20_roadmap_instrukcje` |
| Migracje SQL Supabase | `T03_db_schema_001_002` → `T07_db_schema_010_011` |
| Auth + middleware | `T08_backend_middleware_claude`, `T07_db_schema_010_011` |
| Endpoint `/api/ai/generate-document` | `T09_backend_api_generate_scoring`, `T15_ai_prompts_pipeline`, `T08_backend_middleware_claude` |
| Endpoint Stripe checkout/webhook | `T10_backend_api_pdf_billing`, `T05_db_schema_005_006` |
| CRON deadlines | `T11_backend_api_deadlines_ocr_pdf`, `T05_db_schema_005_006` |
| OCR pipeline | `T11_backend_api_deadlines_ocr_pdf`, `T04_db_schema_003_004` |
| Landing page (UI) | `D01_tozsamosc_kolory`, `D02_typografia_layout`, `D03_hero_section`, `D04_kategorie_pism`, `D05_cennik`, `D10_animacje_dark_responsive` |
| Dynamic Form engine | `T12_frontend_landing_dynamic_form`, `D07_wizard` |
| Wizard UI | `D07_wizard`, `T12_frontend_landing_dynamic_form` |
| Dashboard B2C | `D06_dashboard_b2c`, `T14_dashboard_admin`, `D08_komponenty_unikalne` |
| Panel admina | `T14_dashboard_admin`, `T06_db_schema_007_008_009` |
| Panel B2B | `D09_b2b_panel` |
| Prompty AI per case_type | `T15_ai_prompts_pipeline`, `T16_katalog_pism_mandaty`, `T17_katalog_pism_windykacja_etoll` |
| Strony SEO long-tail | `T18_seo_marketing`, `T16/T17` (formularze) |
| Bezpieczeństwo, RODO | `T19_security_rodo_design`, `T07_db_schema_010_011` |
| System kolorów / design tokens | `D01_tozsamosc_kolory`, `D02_typografia_layout`, `D10_animacje_dark_responsive` |

## Retrieval per agent (paralelnie)

- **Orchestrator** (planuje, koordynuje, review) → `T01`, `T02`, `T20`
- **Database agent** (migracje, RLS, triggery) → `T03`–`T07`
- **Backend agent** (API routes, integracje) → `T08`–`T11`, `T15`
- **AI agent** (prompty, pipeline Claude) → `T15`, `T16`, `T17`, `T08`, `T09`
- **Frontend agent** (komponenty React, strony) → `T12`–`T14`, `D03`–`D09`
- **Design agent** (design system, tokens, animacje) → `D01`–`D10`
- **Payments agent** (Stripe, Fakturownia) → `T05`, `T10`
- **Notifications agent** (Resend, SMSAPI, CRON) → `T11`, `T05`
- **OCR agent** (Tesseract, parser) → `T11`, `T04`
- **SEO agent** (long-tail pages, structured data) → `T18`, `T16`, `T17`
- **Security agent** (RODO, RLS, rate-limit) → `T19`, `T07`

## Wzorzec użycia w sesji kodowania

1. **Sprawdź `chunks_index.json`** — wybierz chunki na podstawie `tags`/`agents` zgodnych z zadaniem.
2. **Załaduj 1–3 najbardziej pasujące chunki** (typowo <20KB).
3. **Implementuj** zadanie używając tylko załadowanego kontekstu.
4. **Nie ładuj** całej spec — to anti-pattern, marnuje tokeny.

Przykład komendy `grep` do wyszukania chunków po tagu:
```bash
jq -r '.tag_index["wizard"][]' spec/index/tag_index.json
```
