# 2. Architektura techniczna - stack i struktura

**Chunk ID:** `T02_architektura_stack`
**Source:** tech (lines 50-372)
**Tags:** stack, nextjs, supabase, tailwind, structure, env_vars, konwencje
**Target Agents:** orchestrator, frontend, backend, devops

---

2. ARCHITEKTURA TECHNICZNA
2.1 Stack technologiczny
Frontend:       Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui
Backend:        Next.js API Routes (Route Handlers) + TypeScript
Baza danych:    Supabase (PostgreSQL + Auth + Storage + RLS + Realtime)
AI:             Claude API (Sonnet 4.6 — pisma, Haiku 4.5 — scoring/OCR parser)
OCR:            Tesseract.js (server-side MVP) → AWS Textract (V2)
PDF:            @react-pdf/renderer lub Puppeteer (HTML→PDF)
Płatności:      Stripe (PLN, jednorazowe + subskrypcje)
Faktury:        Fakturownia API (auto-generowanie)
E-mail:         Resend (transakcyjne) + AWS SES (masowe)
SMS:            SMSAPI.pl (przypomnienia terminów)
Hosting:        Vercel (frontend + API) + Supabase Cloud
Repo:           GitHub (monorepo z Turborepo)
CI/CD:          Vercel auto-deploy z main branch
Monitoring:     Sentry (błędy) + Vercel Analytics + PostHog (product analytics)

2.2 Struktura projektu (monorepo)
mandatomat/
├── apps/
│   └── web/                          # Next.js 14 App Router
│       ├── app/
│       │   ├── (marketing)/          # Strony publiczne (landing, cennik, blog)
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── cennik/
│       │   │   ├── jak-to-dziala/
│       │   │   ├── blog/
│       │   │   ├── kontakt/
│       │   │   └── layout.tsx
│       │   ├── (app)/                # Strony za logowaniem
│       │   │   ├── dashboard/
│       │   │   ├── sprawy/
│       │   │   │   ├── nowa/
│       │   │   │   │   ├── page.tsx              # Wybór kategorii
│       │   │   │   │   ├── [category]/
│       │   │   │   │   │   ├── page.tsx          # Wybór podtypu
│       │   │   │   │   │   └── [subtype]/
│       │   │   │   │   │       ├── formularz/    # Dynamiczny formularz
│       │   │   │   │   │       ├── podglad/      # Podgląd pisma
│       │   │   │   │   │       ├── platnosc/     # Checkout
│       │   │   │   │   │       └── pobranie/     # PDF download
│       │   │   │   └── [caseId]/
│       │   │   │       ├── page.tsx              # Szczegóły sprawy
│       │   │   │       ├── dokumenty/
│       │   │   │       ├── terminy/
│       │   │   │       └── historia/
│       │   │   ├── dokumenty/
│       │   │   ├── terminy/
│       │   │   ├── profil/
│       │   │   ├── ustawienia/
│       │   │   └── layout.tsx        # App shell z sidebar
│       │   ├── (admin)/              # Panel administracyjny
│       │   │   ├── admin/
│       │   │   │   ├── dashboard/
│       │   │   │   ├── uzytkownicy/
│       │   │   │   ├── sprawy/
│       │   │   │   ├── szablony/
│       │   │   │   ├── platnosci/
│       │   │   │   ├── prompty/
│       │   │   │   ├── analityka/
│       │   │   │   └── ustawienia/
│       │   │   └── layout.tsx
│       │   ├── (auth)/
│       │   │   ├── login/
│       │   │   ├── rejestracja/
│       │   │   ├── reset-hasla/
│       │   │   └── layout.tsx
│       │   ├── api/
│       │   │   ├── ai/
│       │   │   │   ├── generate-document/route.ts
│       │   │   │   ├── scoring/route.ts
│       │   │   │   ├── validate-document/route.ts
│       │   │   │   └── chat/route.ts
│       │   │   ├── cases/
│       │   │   │   ├── route.ts              # GET (list), POST (create)
│       │   │   │   └── [caseId]/
│       │   │   │       ├── route.ts          # GET, PATCH, DELETE
│       │   │   │       ├── documents/route.ts
│       │   │   │       └── events/route.ts
│       │   │   ├── documents/
│       │   │   │   ├── route.ts
│       │   │   │   └── [docId]/
│       │   │   │       ├── route.ts
│       │   │   │       ├── pdf/route.ts
│       │   │   │       └── versions/route.ts
│       │   │   ├── ocr/
│       │   │   │   ├── upload/route.ts
│       │   │   │   └── parse/route.ts
│       │   │   ├── billing/
│       │   │   │   ├── checkout/route.ts
│       │   │   │   ├── webhook/route.ts
│       │   │   │   └── invoices/route.ts
│       │   │   ├── deadlines/
│       │   │   │   ├── route.ts
│       │   │   │   └── check/route.ts        # CRON endpoint
│       │   │   ├── admin/
│       │   │   │   ├── users/route.ts
│       │   │   │   ├── stats/route.ts
│       │   │   │   ├── templates/route.ts
│       │   │   │   └── prompts/route.ts
│       │   │   └── health/route.ts
│       │   ├── layout.tsx                    # Root layout
│       │   ├── globals.css
│       │   └── not-found.tsx
│       ├── components/
│       │   ├── ui/                           # shadcn/ui components
│       │   ├── forms/
│       │   │   ├── dynamic-form.tsx          # Silnik dynamicznych formularzy
│       │   │   ├── field-renderers/
│       │   │   ├── case-type-selector.tsx
│       │   │   └── file-upload.tsx
│       │   ├── documents/
│       │   │   ├── markdown-preview.tsx
│       │   │   ├── markdown-editor.tsx
│       │   │   ├── pdf-viewer.tsx
│       │   │   └── document-card.tsx
│       │   ├── dashboard/
│       │   │   ├── stats-cards.tsx
│       │   │   ├── cases-list.tsx
│       │   │   ├── deadlines-widget.tsx
│       │   │   └── recent-activity.tsx
│       │   ├── scoring/
│       │   │   ├── scoring-form.tsx
│       │   │   ├── scoring-result.tsx
│       │   │   └── scoring-gauge.tsx
│       │   ├── layout/
│       │   │   ├── navbar.tsx
│       │   │   ├── sidebar.tsx
│       │   │   ├── footer.tsx
│       │   │   └── mobile-nav.tsx
│       │   ├── marketing/
│       │   │   ├── hero.tsx
│       │   │   ├── features-grid.tsx
│       │   │   ├── pricing-table.tsx
│       │   │   ├── testimonials.tsx
│       │   │   ├── how-it-works.tsx
│       │   │   ├── faq-accordion.tsx
│       │   │   └── cta-section.tsx
│       │   └── shared/
│       │       ├── loading-spinner.tsx
│       │       ├── error-boundary.tsx
│       │       ├── stepper.tsx
│       │       ├── countdown-timer.tsx
│       │       └── share-button.tsx
│       ├── lib/
│       │   ├── supabase/
│       │   │   ├── client.ts                # Browser client
│       │   │   ├── server.ts                # Server client
│       │   │   ├── admin.ts                 # Service role client
│       │   │   └── middleware.ts
│       │   ├── ai/
│       │   │   ├── claude.ts                # Claude API wrapper
│       │   │   ├── prompts/
│       │   │   │   ├── index.ts
│       │   │   │   ├── mandaty/
│       │   │   │   │   ├── sprzeciw-predkosc.md
│       │   │   │   │   ├── odmowa-przyjecia.md
│       │   │   │   │   ├── uchylenie-prawomocny.md
│       │   │   │   │   ├── odwolanie-straz.md
│       │   │   │   │   ├── odwolanie-itd.md
│       │   │   │   │   ├── odroczenie-raty.md
│       │   │   │   │   └── uchylenie-punktow.md
│       │   │   │   ├── parking/
│       │   │   │   │   ├── sprzeciw-prywatny.md
│       │   │   │   │   ├── reklamacja-zdm.md
│       │   │   │   │   ├── odwolanie-ztm.md
│       │   │   │   │   └── blad-identyfikacji.md
│       │   │   │   ├── windykacja/
│       │   │   │   │   ├── odpowiedz-wezwanie.md
│       │   │   │   │   ├── przedawnienie.md
│       │   │   │   │   ├── sprzeciw-epu.md
│       │   │   │   │   ├── usuniecie-krd-bik.md
│       │   │   │   │   └── skarga-rf.md
│       │   │   │   ├── ubezpieczenia/
│       │   │   │   │   ├── odwolanie-decyzja.md
│       │   │   │   │   ├── wezwanie-wyplata.md
│       │   │   │   │   └── skarga-rf.md
│       │   │   │   ├── etoll/
│       │   │   │   │   ├── odwolanie-kara.md
│       │   │   │   │   ├── reklamacja-podwojne.md
│       │   │   │   │   └── anulowanie.md
│       │   │   │   ├── kontrole/
│       │   │   │   │   ├── sprzeciw-zatrzymanie-pj.md
│       │   │   │   │   ├── cofniecie-decyzji.md
│       │   │   │   │   ├── weryfikacja-urzadzenia.md
│       │   │   │   │   └── korekta-punktow.md
│       │   │   │   ├── techniczne/
│       │   │   │   │   ├── pelnomocnictwo.md
│       │   │   │   │   ├── rodo-dostep.md
│       │   │   │   │   ├── rodo-usuniecie.md
│       │   │   │   │   └── lista-zalacznikow.md
│       │   │   │   ├── scoring.md
│       │   │   │   └── validation.md
│       │   │   └── templates/
│       │   │       └── ... (szablony pism .md z placeholderami)
│       │   ├── pdf/
│       │   │   ├── generator.ts
│       │   │   ├── templates/
│       │   │   │   └── legal-document.tsx
│       │   │   └── styles.ts
│       │   ├── ocr/
│       │   │   ├── tesseract.ts
│       │   │   └── parser.ts
│       │   ├── payments/
│       │   │   ├── stripe.ts
│       │   │   └── fakturownia.ts
│       │   ├── notifications/
│       │   │   ├── email.ts
│       │   │   └── sms.ts
│       │   ├── validators/
│       │   │   ├── case-schemas.ts           # Zod schemas per case_type
│       │   │   ├── document-schemas.ts
│       │   │   └── user-schemas.ts
│       │   ├── constants/
│       │   │   ├── case-types.ts             # Enum + metadata
│       │   │   ├── deadlines.ts              # Reguły terminów per typ
│       │   │   ├── pricing.ts                # Cennik
│       │   │   └── categories.ts             # Drzewo kategorii
│       │   ├── hooks/
│       │   │   ├── use-case.ts
│       │   │   ├── use-document.ts
│       │   │   ├── use-auth.ts
│       │   │   ├── use-deadlines.ts
│       │   │   └── use-scoring.ts
│       │   ├── utils/
│       │   │   ├── dates.ts
│       │   │   ├── formatting.ts
│       │   │   └── seo.ts
│       │   └── types/
│       │       ├── case.ts
│       │       ├── document.ts
│       │       ├── user.ts
│       │       ├── payment.ts
│       │       └── api.ts
│       ├── public/
│       │   ├── images/
│       │   ├── icons/
│       │   └── og/
│       ├── styles/
│       │   └── pdf-print.css
│       ├── middleware.ts                     # Auth + redirect logic
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
├── supabase/
│   ├── migrations/
│   │   ├── 001_auth_profiles.sql
│   │   ├── 002_cases.sql
│   │   ├── 003_documents.sql
│   │   ├── 004_uploads_ocr.sql
│   │   ├── 005_deadlines.sql
│   │   ├── 006_payments.sql
│   │   ├── 007_events.sql
│   │   ├── 008_templates.sql
│   │   ├── 009_admin.sql
│   │   ├── 010_rls_policies.sql
│   │   └── 011_functions_triggers.sql
│   ├── seed.sql
│   └── config.toml
├── docs/
│   ├── spec/
│   │   ├── 00-index.md
│   │   ├── 01-architektura.md
│   │   ├── 02-core.md
│   │   ├── 04-mandatomat.md            # Ten dokument
│   │   ├── 07-api.md
│   │   └── 08-db-schema.md
│   └── prompts/
│       └── ... (kopie promptów do review)
├── turbo.json
├── package.json
└── README.md

2.3 Konwencje kodowania
- TypeScript: strict mode, no any
- Nazwy plików: kebab-case (np. scoring-form.tsx)
- Komponenty React: PascalCase (np. ScoringForm)
- Funkcje/hooki: camelCase (np. useScoring)
- API Routes: /api/[domena]/[akcja] (np. /api/ai/scoring)
- Baza danych: snake_case (np. case_type, created_at)
- Prompty AI: pliki .md w lib/ai/prompts/[kategoria]/
- Szablony pism: pliki .md z placeholderami {{zmienna}}
- Walidacja: Zod schemas w lib/validators/
- Stany: React useState + SWR lub TanStack Query dla server state
- CSS: Tailwind utility classes + shadcn/ui, zero custom CSS (wyjątek: pdf-print.css)
- Testy: Vitest + Testing Library (minimum: API routes + AI prompts)
- Commit messages: Conventional Commits (feat:, fix:, docs:, refactor:)
- Zmienne środowiskowe: .env.local (never committed), prefiks NEXT_PUBLIC_ dla client-side

2.4 Zmienne środowiskowe (.env.local)
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Claude API
ANTHROPIC_API_KEY=sk-ant-...
# Lub APIPod:
# APIPOD_API_KEY=...
# APIPOD_BASE_URL=https://api.apipod.net/v1

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Fakturownia
FAKTUROWNIA_API_TOKEN=...
FAKTUROWNIA_DOMAIN=...

# Resend (e-mail)
RESEND_API_KEY=re_...
EMAIL_FROM=mandatomat@mandatomat.pl

# SMSAPI
SMSAPI_TOKEN=...
SMSAPI_FROM=Mandatomat

# App
NEXT_PUBLIC_APP_URL=https://mandatomat.pl
CRON_SECRET=... # do zabezpieczenia /api/deadlines/check
