# Strategia orkiestracji agentów

## Model: Orchestrator + 8 wyspecjalizowanych agentów

```
                    ┌────────────────┐
                    │  ORCHESTRATOR  │  (planuje, deleguje, review, merge)
                    └────────┬───────┘
                             │
        ┌────────┬───────────┼───────────┬────────────┬────────────┐
        ▼        ▼           ▼           ▼            ▼            ▼
   ┌────────┐ ┌──────┐  ┌─────────┐  ┌───────┐  ┌──────────┐  ┌────────┐
   │DATABASE│ │BACKEND│  │FRONTEND │  │ DESIGN │  │   AI     │  │PAYMENTS│
   │ agent  │ │ agent │  │ agent   │  │ agent  │  │ agent    │  │ agent  │
   └────────┘ └──────┘  └─────────┘  └───────┘  └──────────┘  └────────┘
                             │           │
                             ▼           ▼
                       ┌─────────┐  ┌────────┐
                       │   SEO   │  │SECURITY│
                       │  agent  │  │ agent  │
                       └─────────┘  └────────┘
```

## Reguły paralelizmu (DAG)

Agenci pracują paralelnie tam, gdzie nie ma zależności. Przy zależności — sekwencja.

| Faza | Agenci paralelni | Zależności |
|---|---|---|
| Tier 1 (foundation) | Database ‖ Design ‖ Orchestrator | — |
| Tier 2 (auth + landing skeleton) | Backend (auth) ‖ Frontend (landing) ‖ Design (tokens) | Tier 1 |
| Tier 3 (core features) | Backend (AI/PDF) ‖ Frontend (wizard) ‖ AI (prompty) | Tier 2 |
| Tier 4 (panel + payments) | Backend (Stripe) ‖ Frontend (dashboard) ‖ Payments (webhook) | Tier 3 |
| Tier 5 (polish + SEO) | SEO ‖ Security audit ‖ Frontend (a11y) | Tier 4 |

## Komunikacja między agentami

- **Pull requests** są jednostką pracy. Każdy agent otwiera PR do `main` z przedrostkiem: `[T2-DB-005]`, `[T3-FE-013]` itd.
- **Knowledge base lookup** — każdy agent przed startem zadania wywołuje `node spec/index/retrieve.mjs --tag <X>` i ładuje TYLKO odpowiednie chunki.
- **Status** publikowany w `plan/status.json` (kto co robi, blocked-by).
- **Konflikty** rozstrzyga Orchestrator (nie merge bez review).

## Zasady commit i PR
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`.
- Każdy PR ma w opisie listę chunków bazy wiedzy, których użył (do śledzenia decyzji).
- Każdy PR przechodzi `lint + typecheck + test` (CI GitHub Actions).
