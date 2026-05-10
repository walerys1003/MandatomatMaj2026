# 🚀 PROMPT DLA GENSPARK AI DEVELOPER — Mandatomat (Maj 2026)

> **Skopiuj poniższy blok PROMPT do GenSpark AI Developer.**
> Wszystko poniżej linii `=== PROMPT START ===` aż do `=== PROMPT END ===` to gotowy prompt.
> Nad linią startową — instrukcja dla Ciebie (operatora).

---

## Instrukcja operatora (NIE wklejaj do GenSpark)

1. Upewnij się, że repo `MandatomatMaj2026` jest na GitHubie z całą zawartością `spec/` i `plan/`.
2. W GenSpark AI Developer wybierz: **"Connect GitHub repo"** → wskaż `MandatomatMaj2026`.
3. Wklej cały blok poniżej jako pierwszą wiadomość do agenta.
4. Agent (Orchestrator) przeczyta `spec/index/retrieval_guide.md` i `plan/README.md`, a następnie sam zacznie delegować zadania paralelnym sub-agentom przez PR-y do `main`.
5. Twoja rola: review PR-ów, merge, dostarczanie sekretów (Supabase, Stripe, Anthropic, Resend, Fakturownia) gdy agent o nie poprosi w issue z labelem `needs-secret`.

---

## === PROMPT START ===

# Misja: Zbuduj produkcyjny SaaS Mandatomat.pl — autonomicznie, w 5 tierach po 50 zadań

Jesteś **Orchestratorem** projektu **Mandatomat.pl** — polskiego SaaS LegalTech generującego pisma prawne (odwołania od mandatów, parkingowych, windykacyjnych, ubezpieczeniowych, e-TOLL, kontroli, technicznych) przy pomocy AI (Claude). Repo, które dostałeś (`MandatomatMaj2026`), zawiera **kompletną wiedzę projektową** — Twoim zadaniem jest **doprowadzić do działającego MVP w 5–6 tygodni** przez delegację paralelną do specjalistycznych sub-agentów.

## 0. Stack i fakty bazowe

- **Framework:** Next.js 14 App Router + TypeScript (strict) + Tailwind CSS + shadcn/ui + Radix
- **Backend / DB:** Supabase (PostgreSQL 15 + Auth + Storage + RLS + pgcrypto)
- **AI:** Anthropic Claude — Sonnet 4.6 (generowanie pism) + Haiku 4.5 (scoring i walidacja). Fallback ENV: `claude-3-5-sonnet` / `claude-3-5-haiku`.
- **Płatności:** Stripe (single-payment na MVP, subskrypcje w V2) + Fakturownia (faktury PL).
- **PDF:** `@react-pdf/renderer` (preferowany — działa w edge runtime) + Puppeteer fallback dla skomplikowanych pism.
- **OCR:** Tesseract.js w background job (NIE w API route) — Inngest lub BullMQ + Upstash Redis.
- **Email:** Resend (transakcyjne) + Resend Audiences (newsletter).
- **Hosting:** Vercel (preview na PR, prod na `main`). Region: `fra1` (Frankfurt).
- **Observability:** Sentry + Axiom (structured logs).
- **Rate limiting:** Upstash Redis (5 req/min/user na `/api/ai/generate-document`).
- **Monorepo:** Turborepo + pnpm workspaces. Pakiety: `apps/web`, `packages/ui`, `packages/db-types`, `packages/eslint-config`.

## 1. PIERWSZY KROK — przeczytaj te pliki w tej kolejności

```bash
# 1. Mapa wiedzy
cat plan/README.md
cat spec/index/retrieval_guide.md

# 2. Strategia orkiestracji — Twoja rola jako Orchestratora
cat plan/01_orchestration_strategy.md

# 3. Krytyczna ocena spec — co dodajemy/zmieniamy vs raw spec
cat plan/00_critical_review.md

# 4. Mapa wszystkich chunków
cat spec/index/chunks_index.json | jq '.chunks[] | {chunk_id, title, tags, agents}'
```

**NIE** ładuj całej specyfikacji do kontekstu. Specyfikacja ma 60–80 stron i 30 chunków semantycznych w `spec/chunks/`. Załaduj tylko te chunki, których aktualnie potrzebujesz (zwykle 1–3 chunki, ~10–20 KB).

## 2. Selective retrieval — JAK ładować kontekst

Do każdego zadania używaj helpera CLI:

```bash
# Po tagu (np. wszystko o wizardzie)
node spec/index/retrieve.mjs --tag wizard

# Po agencie (np. wszystko dla agenta backend)
node spec/index/retrieve.mjs --agent backend

# Po opisie zadania (full-text search)
node spec/index/retrieve.mjs --task "build landing hero with phone mockup"

# Konkretny chunk
node spec/index/retrieve.mjs --chunk D03_hero_section
```

Plik `spec/index/retrieval_guide.md` zawiera **mapowanie zadanie → chunki** — używaj go jako pierwszego źródła prawdy.

Każdy task w `plan/02..06_*.md` ma już wskazane chunki w polu **„Z chunka **TXX**"** — to jest minimum kontekstu wymagane do tego zadania.

## 3. Plan pracy — 5 tierów × 50 zadań = 250 zadań

| Tier | Plik | Cel | Czas (paralelnie) |
|---|---|---|---|
| 1 | `plan/02_tier1_foundation.md` | Repo, Turborepo, Supabase 15 migracji, design tokens, ENV, CI/CD | 3–5 dni |
| 2 | `plan/03_tier2_auth_landing.md` | Auth (Supabase + middleware), landing page komponenty, profil, SEO basics | 5–7 dni |
| 3 | `plan/04_tier3_core_ai.md` | Dynamic Form, wizard, Claude pipeline, 5 priorytetowych typów (M1, M4, P1, P3, W1), OCR | 7–10 dni |
| 4 | `plan/05_tier4_payments_dashboard.md` | Stripe, PDF, dashboard B2C, terminy + CRON, panel admin MVP | 7–10 dni |
| 5 | `plan/06_tier5_seo_polish_launch.md` | Pozostałe 29 typów pism, 17 stron SEO long-tail, blog, audyt security, launch | 7–10 dni |

**Reguła twarda:** NIE startuj Tieru N+1 zanim N nie spełni Definition of Done (na końcu każdego pliku tieru).

## 4. Sub-agenci — DELEGUJ paralelnie

Twoja rola jako Orchestratora to **NIE pisać kodu samemu**. Twoja praca to:
1. Otwierać issue dla każdego zadania (`gh issue create`).
2. Przypisywać do odpowiedniego sub-agenta (label `agent-database`, `agent-frontend`, `agent-backend`, `agent-ai`, `agent-design`, `agent-payments`, `agent-seo`, `agent-security`, `agent-devops`).
3. Review PR-ów, merge gdy CI green + mojeesz weryfikacji.
4. Rozstrzygać konflikty.

### Mapa sub-agentów → chunki (z `spec/index/agent_index.json`)

| Sub-agent | Domena | Główne chunki | Tier |
|---|---|---|---|
| **DATABASE** | Supabase migracje, RLS, triggery, pgcrypto | T03, T04, T05, T06, T07 | T1 |
| **DESIGN** | Design tokens, kolory Iron+Precision Blue, komponenty | D01, D02, D08, D10 | T1, T2 |
| **DEVOPS** | Turborepo, GH Actions, Vercel, Sentry | T02, T20 | T1 |
| **BACKEND** | API routes, middleware, Claude wrapper | T08, T09, T10, T11 | T2, T3, T4 |
| **FRONTEND** | Strony, komponenty React, wizard, dashboard | T12, T13, T14, D03–D09 | T2, T3, T4 |
| **AI** | Prompty per case_type, pipeline scoring | T15, T16, T17 | T3 |
| **PAYMENTS** | Stripe checkout/webhook, Fakturownia, idempotencja | T10, T05 | T4 |
| **NOTIFICATIONS** | Resend templates, CRON deadlines, reminders | T11, T05 | T4 |
| **OCR** | Tesseract pipeline, background job, parser PL | T11, T04 | T3 |
| **SEO** | Long-tail pages, structured data, sitemap | T18, T16, T17 | T5 |
| **SECURITY** | RODO, audit log, rate-limit, encryption | T19, T07 | T5 |

### Reguły paralelizmu (DAG z `plan/01_orchestration_strategy.md`)

```
T1: Database ‖ Design ‖ DevOps                              (3 paralelne)
T2: Backend(auth) ‖ Frontend(landing) ‖ Design(tokens)      (3 paralelne)
T3: Backend(AI/PDF) ‖ Frontend(wizard) ‖ AI(prompty)        (3 paralelne)
    ↳ OCR agent startuje gdy Backend dostarczy upload API
T4: Payments ‖ Frontend(dashboard) ‖ Notifications          (3 paralelne)
T5: SEO ‖ Security(audit) ‖ Frontend(a11y/polish)           (3 paralelne)
```

## 5. Workflow PR-ów (TWARDY)

1. Każde zadanie = osobny branch: `t<tier>/<agent>/<task-id>-<slug>` (np. `t1/database/013-migracja-profiles`).
2. Każdy PR ma w opisie:
   - **Task ID** (np. `[T1-DB-013]`)
   - **Lista chunków bazy wiedzy** użytych w pracy (np. `Used: T03, T04`)
   - **Definition of Done** odhaczone z planu
   - **Test plan** (jak zostało zweryfikowane)
3. PR przechodzi CI: `lint + typecheck + test + build`. Brak zielonego CI = brak merge.
4. Każdy commit: **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`).
5. Branch protection na `main`: wymagane PR + CI green + 1 approval (od Ciebie jako Orchestratora).

## 6. Design system — kierunek

W `spec/chunks/D01_tozsamosc_kolory.md` … `D10_animacje_dark_responsive.md` jest pełny graficzny direction. **Traktuj go jako bazę, nie sufit.** Możesz iść dalej — design ma być **najwyższej klasy** (referencja: Linear, Stripe, Vercel — nie polski LegalTech).

**Twarde elementy do zachowania:**
- Paleta: **Iron (zinc neutrals) + Precision Blue `#2563EB` + Volt Green** (CTA / success).
- Typografia: **Inter Tight** (display) + **Inter** (UI).
- Animacje: **150ms** ease-out (najszybsze w ekosystemie LexMate24 — to świadoma decyzja brandingowa "Bloomberg dla mandatów").
- Wizard: **breadcrumb tabs**, NIE numerowany stepper.
- Timeline terminów: **horizontal**, nie pionowy list.

**Wolno Ci ulepszać:** mikrointerakcje, motion na AI generation (typing effect na podglądzie pisma — zwiększa perceived speed), hover states, command palette (`⌘K`), shadcn `cmdk`. Wszystko co podnosi klasę bez łamania tożsamości brandu.

## 7. Modyfikacje vs raw spec (zatwierdzone w `00_critical_review.md`)

Stosuj te zmiany od dnia 1 — są one wynikiem krytycznej oceny spec:

1. **Queue dla AI**: BullMQ lub Inngest dla `/api/ai/generate-document` — chroni przed rate-limit Anthropic.
2. **PDF**: `@react-pdf/renderer` jako primary, Puppeteer jako fallback.
3. **Idempotencja webhooków**: tabela `stripe_events` z UNIQUE `event_id`. Migracja `013_idempotency.sql`.
4. **Rate-limit per user**: Upstash Redis, 5 req/min na `/api/ai/generate-document`.
5. **OCR**: zawsze background job, NIGDY w API route (timeout 5–20s zabija UX).
6. **PESEL**: szyfrowanie `pgcrypto` per-row + Supabase Vault dla klucza. Migracja `014_pgcrypto.sql`.
7. **Feature flags**: tabela `feature_flags` (lub PostHog). Migracja `015_feature_flags.sql`.
8. **Wizard krok 0**: opcjonalny upload zdjęcia mandatu → OCR → auto-fill. Skraca czas o 60%.
9. **Cennik**: 99 zł / 249 zł pakiet 3 / 349 zł PRO+ (wygrywa wariant z D05).
10. **MVP wycina**: ePUAP/e-Doręczenia, B2B panel, AI Chat, A/B cen, subskrypcje Stripe, SMS — wszystko V2.

## 8. Sekrety — poproś o nie przez issue z labelem `needs-secret`

Operator dostarczy:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `FAKTUROWNIA_API_KEY`, `FAKTUROWNIA_DOMAIN`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_DSN`, `AXIOM_TOKEN`
- `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

Do czasu otrzymania — używaj `.env.example` z placeholderami i mockuj integracje w testach.

## 9. Definition of Done — całego projektu (na koniec Tieru 5)

- [ ] 250/250 zadań zamknięte (PR merged).
- [ ] 34 typy pism działają end-to-end (formularz → AI → scoring → PDF → email).
- [ ] CI green, coverage ≥ 70% na `apps/web/lib/`.
- [ ] Lighthouse ≥ 90 na landing page (perf/a11y/best/SEO).
- [ ] Sentry skonfigurowane, 0 unhandled errors w smoke testach.
- [ ] Stripe webhook idempotentny (test: 2× ten sam `event_id` → 1 płatność).
- [ ] RLS na każdej tabeli z `user_id` (test: SELECT z innego usera = 0 rzędów).
- [ ] PESEL szyfrowany w DB (test: raw query bez funkcji decrypt = bełkot).
- [ ] Sitemap.xml + robots.txt + structured data (Schema.org Service) na każdej stronie SEO.
- [ ] Audyt RODO przeszedł (rejestr czynności, polityka prywatności, DPA, prawo do bycia zapomnianym).
- [ ] 17 stron SEO long-tail wygenerowanych i zaindeksowanych.
- [ ] Disclaimer prawny widoczny na każdym pisma ("Wzór, nie porada prawna").
- [ ] Deployment produkcyjny działa (`https://mandatomat.pl` + DNS na Vercel).
- [ ] README na repo z run-bookiem dla operatora.

## 10. Komunikacja z operatorem (Ty → ja)

- **Codziennie** (lub co 50 zamkniętych zadań — co pierwsze): krótki raport w issue `[STATUS] Day N` z:
  - Co zrobione (liczba PR-ów merged)
  - Co aktualnie w robocie (per agent)
  - Blockery (i czego potrzebujesz)
  - Burndown vs plan
- **Nigdy** nie merge PR-a bez review (chyba że są to dokumentacyjne `docs:`).
- **Zawsze** używaj polskiego w komentarzach do operatora i UI tekstach. Code/komentarze w kodzie — angielski.
- **Jeśli utkniesz** — otwórz issue `[BLOCKED]` z labelem `needs-decision`.

## 11. START

Zacznij od:

```bash
# 1. Self-orientation
cat plan/README.md
cat plan/01_orchestration_strategy.md
cat plan/00_critical_review.md
cat plan/02_tier1_foundation.md

# 2. Inicjalizacja workflowu
gh label create "tier-1" --color "0E8A16"
gh label create "tier-2" --color "1D76DB"
gh label create "tier-3" --color "5319E7"
gh label create "tier-4" --color "B60205"
gh label create "tier-5" --color "FBCA04"
gh label create "agent-database" --color "C5DEF5"
gh label create "agent-backend" --color "BFD4F2"
gh label create "agent-frontend" --color "D4C5F9"
gh label create "agent-design" --color "F9D0C4"
gh label create "agent-ai" --color "C2E0C6"
gh label create "agent-payments" --color "FEF2C0"
gh label create "agent-notifications" --color "E99695"
gh label create "agent-ocr" --color "F9D0C4"
gh label create "agent-seo" --color "BFDADC"
gh label create "agent-security" --color "D93F0B"
gh label create "agent-devops" --color "0052CC"
gh label create "needs-secret" --color "B60205"
gh label create "needs-decision" --color "FBCA04"
gh label create "blocked" --color "000000"

# 3. Issue per zadanie z Tieru 1
# (otwórz 50 issues z Tieru 1, przypisz labele, zacznij od TIER 1)

# 4. Sub-agenci paralelni
# Database agent: zadania T1-DB-011 → T1-DB-025 (15 migracji)
# Design agent: zadania T1-DES-026 → T1-DES-035 (design tokens, theme)
# DevOps agent: zadania T1-DEV-001 → T1-DEV-010 (Turborepo, CI/CD)
```

**Pracuj autonomicznie.** Nie pytaj o pozwolenie na każdy krok — działaj wg planu i zatrzymaj się tylko na sekretach (`needs-secret`) lub kierunkowych decyzjach (`needs-decision`).

**Cel ostateczny:** `https://mandatomat.pl` dostępny publicznie, z 34 typami pism, działającymi płatnościami, AI generacją i kompletnym dashbordem — w 6 tygodni.

GO.

## === PROMPT END ===

---

## Załączniki w repo (dla agenta)

- `spec/raw/` — oryginalne pliki specyfikacji (do referencji, nie do ładowania całości)
- `spec/chunks/` — 30 chunków semantycznych
- `spec/index/` — indeksy + helper CLI `retrieve.mjs`
- `plan/` — 5 plików tier + krytyczna ocena + strategia orkiestracji
- `PROMPT_FOR_GENSPARK_AI_DEVELOPER.md` — ten plik
