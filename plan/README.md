# Plan wdrożenia Mandatomat — 5 tierów × 50 zadań = 250 zadań

## Struktura

| Plik | Zawartość |
|---|---|
| `00_critical_review.md` | Krytyczna ocena specyfikacji — co dodaję, zmieniam, wycinam, ryzyka |
| `01_orchestration_strategy.md` | Model agentów paralelnych + DAG zależności |
| `02_tier1_foundation.md` | TIER 1: Repo, monorepo, Supabase (DB+Auth+Storage), design tokens, ENV, CI/CD |
| `03_tier2_auth_landing.md` | TIER 2: Auth, middleware, landing page, layout shell, profil |
| `04_tier3_core_ai.md` | TIER 3: Dynamic Form, wizard, Claude API, 5 priorytetowych typów, OCR |
| `05_tier4_payments_dashboard.md` | TIER 4: Stripe, PDF, dashboard B2C, terminy, panel admin MVP |
| `06_tier5_seo_polish_launch.md` | TIER 5: 29 pozostałych typów, SEO long-tail, security audit, launch |

## Sumaryczny scope

- **34 typy pism** generowanych przez Claude
- **15 migracji SQL** Supabase (12 z spec + 3 dodane: encryption, idempotency, feature_flags)
- **~30 API routes**
- **~70 komponentów React**
- **~40 stron** (marketing + app + admin + SEO long-tail)
- **5 tierów** po 50 zadań = **250 zadań**
- **Czas wdrożenia (paralelnie)**: 5–6 tygodni

## Rola tej bazy wiedzy

Nie ładuj całej spec do każdej sesji. Użyj `node spec/index/retrieve.mjs --task "..."` lub `--tag <tag>` żeby pobrać tylko relewantne chunki (typowo 1–3 chunki, ~10–20 KB).

Każde zadanie w tierach ma **wskazane chunki** w polu "Z chunka **TXX**" — to jest minimum kontekstu do tego zadania.

## Definition of Done dla każdego tieru

Każdy tier ma własną sekcję DoD na końcu pliku. Tier nie może być uznany za zamknięty bez przejścia wszystkich punktów DoD.

## Status zadań

Status każdego zadania śledzony jest w GitHub Issues (label `tier-1`, `tier-2`, ..., `agent-backend`, `agent-design`, etc.) lub w `plan/status.json` (auto-generowany z PRów).
