# Mandatomat

> **AI-generated odwołania od mandatów, opłat parkingowych, e-TOLL, ZTM/MPK, windykacji i ubezpieczeń.**
> Polish LegalTech SaaS — Bloomberg Terminal dla mandatów. Bez prawnika. W 5 minut.

## 🎯 Status projektu

**Tier 1 — Foundation: ✅ DONE** (`0de8de8`)
**Tier 2 — Auth + Landing: ✅ DONE** (`5f9d2a4`)
**Tier 3 — Wizard + AI Pipeline (phase 1+2): ✅ DONE** (`f92d6f3`)

### Tier 1+2 (foundation, auth, landing)

- [x] Knowledge base (30 chunków, tag/agent indexes, retrieval CLI)
- [x] Plan 5×50 zadań (Tier 1–5) + GitHub 50 issues Tier 1, 19 etykiet, templates, CODEOWNERS
- [x] **Monorepo Turborepo + pnpm workspaces** (apps/web, packages/ui, packages/db-types, packages/config)
- [x] **TypeScript strict + ESLint + Prettier + Commitlint + Husky**
- [x] **Next.js 14 App Router skeleton** (RSC, middleware, error boundaries)
- [x] **Design tokens** (Precision Blue + Iron + Volt + Inter Tight, animacja 150ms)
- [x] **UI library — 16 komponentów** (Button, Card, Badge, Spinner, Input, Logo, Checkbox, Textarea, Select, Stepper, Accordion, Alert, StatusBadge, MarkdownPreview, ScoringGauge) + 4 form-engine moduły (CardSelectGrid, DynamicForm, FieldRenderer, OcrUploader, zod-builder)
- [x] **Supabase: 17 migracji SQL** (16 z Tier 1+2 + migracja 017 documents_validation)
- [x] **Auth — pełen flow** (login, rejestracja, reset hasła + confirm, magic-link callback)
- [x] **Server Actions auth** z Zod, IP rate-limit (Upstash + memory fallback), enumeration prevention
- [x] **Middleware** chroniący `/panel`, `/sprawy`, `/profil`, `/ustawienia` z `?next=`
- [x] **Landing page** + marketing layout (sticky Navbar 72px + Footer iron-950)
- [x] **Strony statyczne** (regulamin, polityka prywatności, RODO, kontakt, o-nas, jak-to-dziala)
- [x] **App layout** (Sidebar 240px + Topbar 64px + Dashboard `/panel`)
- [x] **Profil + Ustawienia** + RODO export (JSON) + RODO delete (anonimizacja + auth.users)
- [x] **SEO**: sitemap.ts, robots.ts, opengraph-image.tsx, JSON-LD Organization + WebSite + FAQPage
- [x] **Observability stubs** (Sentry client/server/edge, Vercel cron config)

### Tier 3 phase 1 (wizard engine + cases CRUD) — `85b8b3c`

- [x] **5 MVP form schemas** (M1, M4, P1, P3, W1) z conditional fields + AI-suggested options + OCR autofill hints — `apps/web/src/lib/cases/schemas.ts`
- [x] **DB enum mapping** (TS shortId ↔ DB ENUM) dla wszystkich 34 typów — `lib/cases/db-mapping.ts`
- [x] **Wizard pages** (3-step): `/sprawy/nowa` (kategorie) → `/sprawy/nowa/[category]` (subtypy) → `/sprawy/nowa/[category]/[subtype]/formularz`
- [x] **Cases CRUD API**: `POST/GET /api/cases` + `GET/PATCH/DELETE /api/cases/[caseId]` (DELETE tylko `status='draft'`)

### Tier 3 phase 2 (AI pipeline + OCR + preview) — `f92d6f3`

- [x] **Claude wrapper** (`lib/ai/claude.ts`): PRICING (Sonnet/Haiku/Opus per 1M tokens), `calcCostUsd()`, `extractJson()`, `generateDocument()` z retry, `scoringAnalysis()` (Haiku), `validateDocument()` (Haiku), `parseOcrDocument()` (Sonnet vision)
- [x] **5 prompt templates** (M1, M4, P1, P3, W1) + `loadPrompt()` discriminated union loader
- [x] **letter-to-markdown.ts** — render `LetterResponse` → Markdown z polskimi datami i strukturą pisma urzędowego
- [x] **`POST /api/ai/scoring`** — public endpoint (rate-limited, anon by IP / auth bucket 'ai'), Haiku
- [x] **`POST /api/ai/generate-document`** — pełen pipeline: auth → rate limit → idempotency → Claude Sonnet → Zod → render Markdown → INSERT documents → status `preview` → background Haiku validation
- [x] **`POST /api/uploads`** — multipart upload → Supabase Storage bucket 'uploads' → Claude vision parse (JPEG/PNG/WebP) → `uploads.ocr_parsed_data` + `detected_fields`, telemetria `ocr_completed`
- [x] **`/sprawy/[caseId]/podglad`** — pełna strona z PreviewClient: ScoringGauge + uzasadnienie + taby Podgląd/Edycja (sessionStorage) + banner walidacji z polling Haiku w tle + przycisk "Generuj pismo" z `Idempotency-Key`
- [x] **`/sprawdz-szanse`** (free tier) — public landing + ScoringForm z 7 kategoriami, ScoringGauge result + recommendations + legal_basis_hints
- [x] **OcrUploader** komponent (drag&drop, thumb, parse spinner, OcrResultPanel z confidence badge) + integracja w wizard-client.tsx (`ocrData` → `DynamicForm` matching przez `field.autoFillFromOcr`)
- [x] **migration 017** — `documents.score INTEGER (0..100 CHECK)`, `validation_passed BOOLEAN`, `validation_issues JSONB`
- [x] **Navbar** — link `Sprawdź szanse` z highlight styling

### Tier 3+4+5 — P-packs (UX/SEO/Ops/Admin/AI/E2E) — `5ced0fa`

| Pack | Zakres                                                          | Status | Commit         |
| ---- | --------------------------------------------------------------- | ------ | -------------- |
| P7   | Onboarding gating + ścieżka `/witaj`                            | ✅     | `35a8b7a`      |
| P8   | Loading skeletons (`/panel`, `/sprawy`, `/terminy`)             | ✅     | `4338a47`      |
| P9   | Subskrypcja `/profil/subskrypcja` + Stripe webhook              | ✅     | `a2ef1fb`      |
| P10  | CrossSellBanner + heurystyka `pickCrossSellProduct`             | ✅     | `e263928`      |
| P11  | Anti-bounce wizard (`beforeunload`) + ConfirmDialog regenerate  | ✅     | `6d9a1fc`      |
| P12  | AIBadge sparkle + ValidationBanner + scoring weryfikacja        | ✅     | (już istniało) |
| P13  | FileUpload drag&drop (OcrUploader, 484 linii)                   | ✅     | (już istniało) |
| P14  | CodeEditor (lekki, CSP-safe) + version history `/admin/prompty` | ✅     | `1718c44`      |
| P15  | PDF watermark "PROJEKT" gdy `!isPaid`                           | ✅     | (już istniało) |
| P16  | Blog: 5 artykułów + RelatedArticles + JSON-LD Article           | ✅     | `d751bb9`      |
| P17  | `@next/bundle-analyzer` + lazy admin CodeEditor                 | ✅     | `f799706`      |
| P18  | DPA `docs/legal/dpa.md` + `/status` page + 18× 301 redirects    | ✅     | `e585975`      |
| P19  | Validation system prompt + eval runner CLI (90 evals)           | ✅     | `5ced0fa`      |
| P20  | Playwright E2E: 6 specs / 72 testów (chromium + mobile)         | ✅     | (już istniało) |

**Stan końcowy 250 zadań:** ~245/250 ✅, ~5 do produkcyjnego dopięcia (uzupełnienie kategorii w `db-mapping`, wartości produkcyjne secrets dla Stripe/Anthropic, opublikowanie DPA, finalna konfiguracja domeny).

### Endpointy dodane w P-packach

- `GET /blog` + `GET /blog/[slug]` — 5 publicznych artykułów (SSG, JSON-LD)
- `GET /status` — public status page (Stripe / Anthropic / Supabase / Resend)
- `GET /profil/subskrypcja` — zarządzanie subskrypcją (cancel / resume)
- `GET /admin/szablony/[caseType]` + `GET /admin/prompty/[caseType]` — z `<CodeEditor>` (lazy)

### Skrypty CLI dodane w P-packach

- `pnpm -F @mandatomat/web analyze` — bundle analyzer (`.next/analyze/{client,server}.html`)
- `pnpm -F @mandatomat/web evals` — uruchom 90 evals przez Claude API (próg 70%)
- `pnpm -F @mandatomat/web evals:dry` — walidacja struktury bez LLM
- `pnpm test:e2e` — Playwright (chromium + mobile-chrome)

### 301 redirects (P18 — `next.config.mjs`)

- `/artykul/:slug` → `/blog/:slug` · `/artykuly` → `/blog` · `/blog-archiwum` → `/blog`
- `/faq` · `/pomoc` → `/jak-to-dziala` · `/cennik` → `/#cennik`
- `/rejestracja` → `/signup` · `/logowanie` → `/login` · `/dashboard` → `/panel`
- `/sprawa/:id` → `/sprawy/:id`
- `/mandat` `/fotoradar` `/parking` `/windykacja` `/epu` → `/kategoria/*`
- `/privacy` → `/polityka-prywatnosci` · `/terms` → `/regulamin` · `/gdpr` → `/rodo`

## 🛣️ Mapa endpointów (Tier 1–3)

### Public (anonimowi)

- `GET /` — landing
- `GET /sprawdz-szanse` — darmowe pre-scoring szans (Haiku)
- `GET /jak-to-dziala`, `/cennik`, `/o-nas`, `/kontakt`, `/regulamin`, `/polityka-prywatnosci`, `/rodo`
- `GET /login`, `/rejestracja`, `/reset-hasla`, `/reset-hasla/potwierdz`
- `POST /api/ai/scoring` — public Haiku scoring (rate-limited)
- `GET /api/health` — liveness probe

### Auth required (`/panel`, `/sprawy`, `/profil`, `/ustawienia`)

- `GET /panel` — dashboard listy spraw
- `GET /sprawy/nowa` → `/sprawy/nowa/[category]` → `/sprawy/nowa/[category]/[subtype]/formularz` — wizard 3-step
- `GET /sprawy/[caseId]/podglad` — podgląd + edycja + scoring + validation + generuj pismo
- `GET /profil`, `/ustawienia` — RODO export/delete

### API routes (auth required, RLS-enforced)

- `POST/GET /api/cases` — utwórz draft / lista
- `GET/PATCH/DELETE /api/cases/[caseId]`
- `POST /api/ai/generate-document` — pełen pipeline (Idempotency-Key zalecany)
- `POST /api/uploads` — multipart upload + Claude vision OCR
- `GET /api/profile`, `PATCH /api/profile`, `GET /api/profile/export`, `DELETE /api/profile/delete`
- `GET /api/auth/callback` — magic-link / OAuth callback

## 🏗️ Architektura

```
mandatomat/                       # monorepo root (Turborepo + pnpm workspaces)
├── apps/
│   └── web/                      # Next.js 14 App Router (Vercel fra1)
│       ├── src/app/              # routes (RSC + Server Actions)
│       │   ├── layout.tsx        # Inter Tight / Inter / JetBrains Mono via next/font
│       │   ├── page.tsx          # landing (placeholder)
│       │   ├── error.tsx, not-found.tsx
│       │   └── api/health/       # liveness probe (edge runtime)
│       ├── src/lib/supabase/     # server / client / admin SDK
│       ├── src/lib/env.ts        # zod-validated env (server + client)
│       ├── src/middleware.ts     # session refresh + headers
│       ├── sentry.{client,server,edge}.config.ts
│       └── vercel.json           # cron schedule + security headers
├── packages/
│   ├── ui/                       # design tokens + shadcn-style komponenty
│   │   ├── src/tokens/           # colors / typography / layout / motion
│   │   ├── src/components/       # Button, Card, Badge, StatusBadge, Spinner, Input
│   │   └── tailwind.preset.cjs   # Tailwind preset (kolory + radius + motion)
│   ├── db-types/                 # Supabase generated types + domain enums (34 case types)
│   └── config/                   # ESLint + tsconfig presets (base/react/next)
├── supabase/
│   ├── config.toml               # local stack config (Postgres 15, eu-central-1)
│   ├── seed.sql                  # 5 typów MVP (M1, M4, P1, P3, W1)
│   └── migrations/               # 16 migracji SQL
│       ├── ...001_auth_profiles.sql      # profiles + handle_new_user trigger
│       ├── ...002_cases.sql              # 7 kategorii × 34 case_types + 12 statusów
│       ├── ...003_documents.sql          # versioned drafts + AI cost tracking
│       ├── ...004_uploads_ocr.sql
│       ├── ...005_deadlines.sql          # remind_days[] + reminders_log
│       ├── ...006_payments.sql           # Stripe + promo_codes
│       ├── ...007_events.sql             # event sourcing / audyt
│       ├── ...008_templates.sql          # case_type_config + 7 kategorii seed
│       ├── ...009_admin.sql              # admin_logs + daily_stats + feedback
│       ├── ...010_rls_policies.sql       # RLS na wszystkich tabelach
│       ├── ...011_functions_triggers.sql # set_case_deadline + popularity + reset
│       ├── ...012_security_extras.sql    # pgcrypto + pesel_encrypted (BYTEA)
│       ├── ...013_idempotency.sql        # stripe_events (UNIQUE event_id)
│       ├── ...014_feature_flags.sql      # kill-switch + 6 seed flags
│       ├── ...015_form_schema_versioning.sql
│       └── ...016_storage_buckets.sql    # uploads/documents/avatars/public
├── spec/                         # KNOWLEDGE BASE (read-only)
│   ├── raw/                      # 3 oryginalne pliki specyfikacji
│   ├── chunks/                   # 30 chunków markdown (T01-T20 + D01-D10)
│   └── index/                    # chunks/tag/agent indexes + retrieve.mjs CLI
├── plan/                         # plan 5×50 zadań
├── docs/RUNBOOK.md               # operations playbook
├── evals/                        # AI golden-set test harness
├── scripts/
│   ├── tier1-issues.json         # 50 task definicji
│   ├── create-tier1-issues.sh    # idempotent gh issue create
│   └── kb-integrity.mjs          # CI check: chunks ↔ index parity
└── .github/                      # workflows, CODEOWNERS, templates, labeler
```

## 🚀 Quick start

### Wymagania

- **Node.js 20+** (`.nvmrc` = 20.18.0)
- **pnpm 9+**
- **Supabase CLI** (`brew install supabase/tap/supabase` lub `npm i -g supabase`)
- **Docker** (do `supabase start`)

### Instalacja

```bash
git clone https://github.com/walerys1003/MandatomatMaj2026.git
cd MandatomatMaj2026
pnpm install

cp .env.example apps/web/.env.local
# Wypełnij wartości zgodnie z docs/RUNBOOK.md sekcja 4
```

### Lokalna baza

```bash
pnpm db:start                 # uruchamia Postgres + GoTrue + Storage + Studio
pnpm db:migrate:local         # aplikuje 16 migracji
pnpm --filter @mandatomat/db-types generate  # regeneruje TS types
```

### Dev server

```bash
pnpm dev                      # turbo run dev → apps/web :3000
```

### CI checks lokalnie

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
node scripts/kb-integrity.mjs # KB integrity (30 chunków)
```

## 🎨 Design system

**Tożsamość**: Bloomberg Terminal — ale dla mandatów. Czysty, gęsty, profesjonalny.

| Token     | Wartość                               | Użycie                             |
| --------- | ------------------------------------- | ---------------------------------- |
| Primary   | `#2563EB` (Precision Blue 600)        | CTA, focus ring, linki             |
| Neutral   | Iron (`#09090B` → `#FAFAFA`)          | 72% ekranu — tło, tekst, krawędzie |
| Success   | `#16A34A` (Volt 600)                  | „Uwzględnione", success states     |
| Danger    | `#DC2626` (Signal 600)                | Odrzucone, błędy                   |
| Warning   | `#D97706` (Amber 600)                 | Termin w toku                      |
| Display   | Inter Tight 800 / -0.04em             | H1–H4                              |
| Body      | Inter 400/500                         | tekst                              |
| Mono      | JetBrains Mono                        | numery spraw, kwoty, daty          |
| Animation | 150ms cubic-bezier(0.12, 0.8, 0.3, 1) | „snap" — najszybsza w LexMate24    |

Szczegóły: `spec/chunks/D01_..D10_*.md` + `packages/ui/src/tokens/*.ts`.

## 🗄️ Data model

- **34 case types** w 7 kategoriach (mandaty, parking, windykacja, ubezpieczenia, e-TOLL, kontrole, techniczne)
- **12 statusów lifecycle** sprawy (`draft → form_completed → generating → preview → paid → sent → resolved`)
- **PESEL szyfrowany** (pgcrypto AES-256, klucz w GUC `app.settings.pesel_encryption_key`)
- **RLS** na wszystkich tabelach z danymi użytkownika (`auth.uid() = user_id`)
- **Stripe idempotency** (`stripe_events.event_id UNIQUE`)
- **Form schema versioning** — istniejące drafty nie zepsują się przy zmianie `case_type_config`
- **Feature flags** — kill-switch dla nowych funkcji
- **Event sourcing** — pełen audit trail w `events`

## 🚢 Deploy

- **Hosting**: Vercel, region `fra1`
- **DB / Auth / Storage**: Supabase, region `eu-central-1`
- **AI**: Anthropic (Sonnet 4.6 generation, Haiku 4.5 scoring)
- **Płatności**: Stripe + Fakturownia (faktury PL)
- **Email**: Resend · **SMS**: SMSAPI · **OCR**: Tesseract.js w Inngest job
- **Observability**: Sentry + Axiom + PostHog

## 🔗 Linki

- **GitHub**: <https://github.com/walerys1003/MandatomatMaj2026>
- **Prompt dla AI Developer**: [`PROMPT_FOR_GENSPARK_AI_DEVELOPER.md`](./PROMPT_FOR_GENSPARK_AI_DEVELOPER.md)
- **Runbook operacyjny**: [`docs/RUNBOOK.md`](./docs/RUNBOOK.md)
- **Plan tieru**: [`plan/`](./plan/)
- **Knowledge base**: [`spec/chunks/`](./spec/chunks/) + [`spec/index/retrieval_guide.md`](./spec/index/retrieval_guide.md)

## 📜 Licencja

Proprietary — Mandatomat.pl
