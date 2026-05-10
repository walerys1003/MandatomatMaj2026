# Mandatomat

> **AI-generated odwołania od mandatów, opłat parkingowych, e-TOLL, ZTM/MPK, windykacji i ubezpieczeń.**
> Polish LegalTech SaaS — Bloomberg Terminal dla mandatów. Bez prawnika. W 5 minut.

## 🎯 Status projektu

**Tier 1 — Foundation: w toku** (kod aplikacji powstaje pod tym commitem)

- [x] Knowledge base (30 chunków, tag/agent indexes, retrieval CLI)
- [x] Plan 5×50 zadań (Tier 1–5)
- [x] Prompt v2 dla GenSpark AI Developer + Operations runbook + Evals harness
- [x] GitHub: 50 issues Tier 1, 19 etykiet, templates, CODEOWNERS
- [x] **Monorepo Turborepo + pnpm workspaces** (apps/web, packages/ui, packages/db-types, packages/config)
- [x] **TypeScript strict + ESLint + Prettier + Commitlint + Husky**
- [x] **Next.js 14 App Router skeleton** (RSC, middleware, error boundaries)
- [x] **Design tokens** (Precision Blue + Iron + Volt + Inter Tight, animacja 150ms)
- [x] **Bazowe komponenty UI** (Button, Card, Badge, StatusBadge, Spinner, Input)
- [x] **Supabase: 16 migracji SQL** (15 z planu + 1 storage), seed 5 typów MVP
- [x] **Observability stubs** (Sentry client/server/edge, Vercel cron config)
- [ ] Storybook + Vercel preview pipeline (Tier 1.5)
- [ ] Tier 2 — Auth + Landing
- [ ] Tier 3 — Wizard + AI generation pipeline
- [ ] Tier 4 — Stripe + Dashboard
- [ ] Tier 5 — SEO + Security audit

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

| Token | Wartość | Użycie |
|---|---|---|
| Primary | `#2563EB` (Precision Blue 600) | CTA, focus ring, linki |
| Neutral | Iron (`#09090B` → `#FAFAFA`) | 72% ekranu — tło, tekst, krawędzie |
| Success | `#16A34A` (Volt 600) | „Uwzględnione", success states |
| Danger | `#DC2626` (Signal 600) | Odrzucone, błędy |
| Warning | `#D97706` (Amber 600) | Termin w toku |
| Display | Inter Tight 800 / -0.04em | H1–H4 |
| Body | Inter 400/500 | tekst |
| Mono | JetBrains Mono | numery spraw, kwoty, daty |
| Animation | 150ms cubic-bezier(0.12, 0.8, 0.3, 1) | „snap" — najszybsza w LexMate24 |

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
- **Email**: Resend  · **SMS**: SMSAPI  · **OCR**: Tesseract.js w Inngest job
- **Observability**: Sentry + Axiom + PostHog

## 🔗 Linki

- **GitHub**: <https://github.com/walerys1003/MandatomatMaj2026>
- **Prompt dla AI Developer**: [`PROMPT_FOR_GENSPARK_AI_DEVELOPER.md`](./PROMPT_FOR_GENSPARK_AI_DEVELOPER.md)
- **Runbook operacyjny**: [`docs/RUNBOOK.md`](./docs/RUNBOOK.md)
- **Plan tieru**: [`plan/`](./plan/)
- **Knowledge base**: [`spec/chunks/`](./spec/chunks/) + [`spec/index/retrieval_guide.md`](./spec/index/retrieval_guide.md)

## 📜 Licencja

Proprietary — Mandatomat.pl
