# Contributing to Mandatomat

Ten dokument opisuje zasady pracy dla **wszystkich sub-agentów** (Orchestrator, Database, Backend, Frontend, Design, AI, Payments, Notifications, OCR, SEO, Security, DevOps).

## TL;DR

1. **Issue → branch → PR → CI green → review → merge**
2. **Conventional Commits** + branch naming convention (poniżej)
3. **Każdy PR ma użyte chunki w opisie** — to jest audit trail decyzji
4. **NIE mergujemy nic bez zielonego CI** (lint + typecheck + test + build)

## 1. Branch naming

Format: `t<tier>/<agent>/<task-id-num>-<slug>`

| Przykład | Co znaczy |
|---|---|
| `t1/database/013-migration-001-profiles` | Tier 1, agent database, zadanie [T1-DB-013] |
| `t2/frontend/047-landing-hero` | Tier 2, agent frontend, zadanie [T2-FE-047] |
| `t3/ai/098-prompt-m1-mandat` | Tier 3, agent ai, zadanie [T3-AI-098] |
| `t4/payments/156-stripe-webhook` | Tier 4, agent payments, zadanie [T4-PAY-156] |
| `t5/seo/210-longtail-mandat-50zl` | Tier 5, agent seo, zadanie [T5-SEO-210] |

Slug: kebab-case, max 5 słów. Tylko ASCII, bez polskich znaków.

## 2. Commit messages — Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

| Type | Kiedy użyć |
|---|---|
| `feat` | Nowa funkcjonalność (komponent, endpoint, migracja) |
| `fix` | Bugfix |
| `refactor` | Zmiana kodu bez zmiany zachowania |
| `docs` | Dokumentacja, README, komentarze |
| `test` | Dodanie/zmiana testów |
| `style` | Formatowanie, brakujące średniki — bez zmiany kodu |
| `chore` | Zależności, config, narzędzia |
| `perf` | Optymalizacja wydajności |
| `ci` | Zmiany w CI/CD |

**Scope** = nazwa agenta lub modułu: `db`, `auth`, `wizard`, `ai`, `stripe`, `dashboard`, `seo`, `ui`.

### Przykłady

```
feat(db): add migration 001_auth_profiles

Adds profiles table with handle_new_user trigger and update_updated_at.
RLS enabled (own row only). Indexes on email and created_at.

Used: T03_db_schema_001_002
Closes #13
```

```
fix(stripe): make webhook idempotent

Previously double-delivered webhooks created duplicate payments.
Now using stripe_events.event_id UNIQUE constraint.

Used: T10_backend_api_pdf_billing, T05_db_schema_005_006
Closes #156
```

## 3. PR template

Każdy PR MUSI używać szablonu z `.github/PULL_REQUEST_TEMPLATE.md` — zawiera:
- Task ID (np. `[T1-DB-013]`)
- Lista chunków bazy wiedzy użytych w pracy
- Definition of Done odhaczone
- Test plan (jak zostało zweryfikowane)
- Screenshots / GIFs (dla UI)
- Migration impact (dla DB)

## 4. Selective retrieval — zasada

Przed startem zadania **zawsze** wywołaj:

```bash
node spec/index/retrieve.mjs --task "<opis zadania>"
# lub
node spec/index/retrieve.mjs --tag <tag>
# lub
node spec/index/retrieve.mjs --agent <twój-agent>
```

Załaduj **TYLKO** te chunki. NIE ładuj `spec/raw/*` (60–80 stron) — to anti-pattern marnujący tokeny.

## 5. Code quality gates

CI musi być **zielone** dla każdego PR:

| Check | Co sprawdza | Tool |
|---|---|---|
| Lint | ESLint rules | `pnpm lint` |
| Typecheck | TS strict | `pnpm typecheck` |
| Test | Unit + integration | `pnpm test` |
| Build | Next build sukces | `pnpm build` |
| Format | Prettier | `pnpm format:check` |

## 6. Definition of Done — per task

Każde zadanie ma DoD w pliku planu (`plan/02..06_*.md`). PR nie merge'uje się bez:
- [ ] Wszystkie punkty DoD odhaczone w opisie PR
- [ ] CI green (5 checków powyżej)
- [ ] 1 approval (od Orchestratora)
- [ ] Kod zgodny z chunkami wskazanymi w zadaniu
- [ ] Brak regresji w testach E2E (jeśli dotyczy)

## 7. Migracje DB — szczególne zasady

- Plik: `supabase/migrations/<timestamp>_<name>.sql`
- **ZAWSZE** dodaj `down` migration w `supabase/migrations/<timestamp>_<name>.down.sql`
- Test lokalny: `pnpm db:migrate:local` przechodzi zielone
- Test rollback: `pnpm db:rollback:local` przechodzi zielone
- RLS: każda tabela z `user_id` MUSI mieć politykę RLS (test: `SELECT` z innego usera = 0 rzędów)

## 8. RLS testing pattern

```sql
-- Pseudo-test w teście integracyjnym:
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"user-A-uuid"}';
INSERT INTO cases (user_id, ...) VALUES ('user-B-uuid', ...);
-- Powinien zwrócić error: new row violates row-level security policy
```

## 9. AI prompts — versioning

Prompty w `apps/web/lib/ai/prompts/<case_type>/v1.ts`:
- ZAWSZE wersjonuj (`v1`, `v2`, ...) — nie nadpisuj
- Golden test w `evals/<case_type>/v1.test.ts`
- Score baseline ≥ 80 przed promocją promptu z `v1` do `vN`

## 10. Sekrety

**NIGDY** nie commituj sekretów. `.env` w `.gitignore`. Gdy potrzebujesz sekretu:
1. Dodaj klucz do `.env.example` z placeholderem (np. `STRIPE_SECRET_KEY=sk_test_xxx`)
2. Otwórz issue z labelem `needs-secret` — operator dostarczy
3. W kodzie używaj `process.env.X` (z walidacją Zod w `apps/web/env.ts`)

## 11. CODEOWNERS

`Orchestrator` reviewuje **wszystkie** PR-y. Patrz `.github/CODEOWNERS` (gdy będzie utworzony).

## 12. Auto-merge wyjątek

PR z labelem `auto-merge-ok` MOŻE być mergeowany bez review IF:
- Zmienia tylko ścieżki: `docs/`, `*.md`, `.github/`, `evals/`
- CI green
- Nie ruszył migracji, kodu produkcyjnego, ani sekretów

Wyjątek dotyczy tylko Orchestratora.

## 13. Komunikacja w PR

- **Polski** w komentarzach review (czytelne dla operatora)
- **Angielski** w opisie PR (szablon) i komentarzach kodu
- @-mention Orchestrator dla pytań kierunkowych (`needs-decision` issue zamiast)

---

**Cel końcowy:** czysty `git log`, każdy commit zrozumiały bez kontekstu, każdy PR audytowalny przez chunki bazy wiedzy.
