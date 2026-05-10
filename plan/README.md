# Plan wdrożenia Mandatomat — 10 tierów × 50 zadań = 500 zadań

## Struktura

### Faza 1 — MVP Launch (Tier 1-5, ukończone ~248/250 ✅)

| Plik | Zawartość |
|---|---|
| `00_critical_review.md` | Krytyczna ocena specyfikacji — co dodaję, zmieniam, wycinam, ryzyka |
| `01_orchestration_strategy.md` | Model agentów paralelnych + DAG zależności |
| `02_tier1_foundation.md` | TIER 1: Repo, monorepo, Supabase (DB+Auth+Storage), design tokens, ENV, CI/CD |
| `03_tier2_auth_landing.md` | TIER 2: Auth, middleware, landing page, layout shell, profil |
| `04_tier3_core_ai.md` | TIER 3: Dynamic Form, wizard, Claude API, 5 priorytetowych typów, OCR |
| `05_tier4_payments_dashboard.md` | TIER 4: Stripe, PDF, dashboard B2C, terminy, panel admin MVP |
| `06_tier5_seo_polish_launch.md` | TIER 5: 29 pozostałych typów, SEO long-tail, security audit, launch |

### Faza 2 — Growth & Scale (Tier 6-10, nowe 250 zadań)

| Plik | Zawartość |
|---|---|
| `07_tier6_post_launch_growth.md` | TIER 6: Onboarding optimization, conversion funnels, referral, content marketing, customer support, retention (50 zadań, **PRIORYTET WYSOKI**) |
| `08_tier7_advanced_ai_product.md` | TIER 7: Advanced AI (RAG, streaming, prompt caching), Długomat, ZUS-mat, Public API, White-label kancelarie (50 zadań, **PRIORYTET ŚREDNI-WYSOKI**) |
| `09_tier8_mobile_compliance_scale.md` | TIER 8: PWA, React Native (iOS/Android), audyt RODO/UODO, ISO 27001 readiness, performance scale, SLO/SLI (50 zadań, **PRIORYTET ŚREDNI**) |
| `10_tier9_intelligence_data.md` | TIER 9: Data warehouse, BI, ML recommendation engine, predictive analytics, experimentation platform (50 zadań, **PRIORYTET ŚREDNI**) |
| `11_tier10_international_ecosystem.md` | TIER 10: i18n (CZ/SK/DE), marketplace prawniczy, AI ecosystem (ChatGPT Plugin, MCP), M&A readiness, Series A (50 zadań, **PRIORYTET NISKI / vision**) |

## Sumaryczny scope

### Faza 1 (MVP)
- **34 typy pism** generowanych przez Claude
- **15 migracji SQL** Supabase
- **~30 API routes**
- **~70 komponentów React**
- **~40 stron** (marketing + app + admin + SEO long-tail)
- **5 tierów** po 50 zadań = **250 zadań** (✅ ~248/250 done)
- **Czas wdrożenia (paralelnie)**: 5–6 tygodni

### Faza 2 (Growth)
- **3 nowe produkty** (Długomat, ZUS-mat, white-label B2B)
- **Mobile** (PWA + React Native iOS/Android)
- **Public API + SDK** (JS + Python)
- **3 nowe rynki** (CZ, SK, DE)
- **Data warehouse + ML models** (recommendation, churn, LTV)
- **Marketplace prawniczy** (booking, escrow, KYC)
- **5 tierów** po 50 zadań = **250 zadań**
- **Czas wdrożenia (paralelnie)**: 4–6 miesięcy

### Łącznie
- **10 tierów × 50 zadań = 500 zadań**
- **Czas wdrożenia całości**: ~6-7 miesięcy

## Rola tej bazy wiedzy

Nie ładuj całej spec do każdej sesji. Użyj `node spec/index/retrieve.mjs --task "..."` lub `--tag <tag>` żeby pobrać tylko relewantne chunki (typowo 1–3 chunki, ~10–20 KB).

Każde zadanie w tierach ma **wskazane chunki** w polu "Z chunka **TXX**" — to jest minimum kontekstu do tego zadania.

## Definition of Done dla każdego tieru

Każdy tier ma własną sekcję DoD na końcu pliku. Tier nie może być uznany za zamknięty bez przejścia wszystkich punktów DoD.

## Status zadań

Status każdego zadania śledzony jest w GitHub Issues (label `tier-1`, `tier-2`, ..., `agent-backend`, `agent-design`, etc.) lub w `plan/status.json` (auto-generowany z PRów).
