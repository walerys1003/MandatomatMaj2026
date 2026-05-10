# TIER 1 — FOUNDATION (50 zadań)

**Cel:** Repo, monorepo, Supabase (DB + Auth + Storage), design tokens, ENV, CI/CD, dokumentacja bazowa.
**Agenci paralelni:** Orchestrator + Database + Design + DevOps.
**Czas:** 3–5 dni (paralelnie).

## 1.1 Setup repozytorium i monorepo (Orchestrator + DevOps) [10]
1. `[T1-ORCH-001]` Init repo `MandatomatMaj2026` na GitHub, README + LICENSE (MIT/Proprietary).
2. `[T1-ORCH-002]` `.gitignore` (node_modules, .env, .next, .vercel, .wrangler, supabase/.branches).
3. `[T1-ORCH-003]` Turborepo init: `apps/web`, `packages/ui`, `packages/db-types`, `packages/eslint-config`.
4. `[T1-ORCH-004]` `pnpm` workspaces, `pnpm-workspace.yaml`, lockfile commit.
5. `[T1-DEV-005]` Konfiguracja TypeScript root + per-package (`strict: true`, `noUncheckedIndexedAccess`).
6. `[T1-DEV-006]` ESLint + Prettier + Husky + lint-staged (pre-commit: lint + typecheck).
7. `[T1-DEV-007]` Commitlint (Conventional Commits) na `commit-msg` hook.
8. `[T1-DEV-008]` GitHub Actions: workflow `ci.yml` (lint + typecheck + test) na każdy PR.
9. `[T1-DEV-009]` GitHub Actions: workflow `deploy.yml` (Vercel preview na PR, prod na merge do main).
10. `[T1-DEV-010]` Branch protection rules na `main` (require PR, require CI green, require 1 review).

## 1.2 Supabase project + Auth (Database) [10]
11. `[T1-DB-011]` Supabase project create (region eu-central-1), staging + production.
12. `[T1-DB-012]` `supabase init` w repo, `supabase/config.toml`, link do projektu.
13. `[T1-DB-013]` Migracja `001_auth_profiles.sql` — tabela `profiles`, trigger `handle_new_user`, `update_updated_at`. Z chunka **T03**.
14. `[T1-DB-014]` Migracja `002_cases.sql` — typy enum (`case_category`, `case_type`, `case_status`), tabela `cases`. Z chunka **T03**.
15. `[T1-DB-015]` Migracja `003_documents.sql` — `document_type`, `documents`, indeksy. Z chunka **T04**.
16. `[T1-DB-016]` Migracja `004_uploads_ocr.sql` — `ocr_status`, `uploads`. Z chunka **T04**.
17. `[T1-DB-017]` Migracja `005_deadlines.sql` — `deadline_status`, `reminder_channel`, `deadlines`, `reminders_log`. Z chunka **T05**.
18. `[T1-DB-018]` Migracja `006_payments.sql` — `payment_type`, `payment_status_enum`, `payments`, `promo_codes`. Z chunka **T05**.
19. `[T1-DB-019]` Migracja `007_events.sql` — `event_type`, `events` z partycjonowaniem po dacie. Z chunka **T06**.
20. `[T1-DB-020]` Migracja `008_templates.sql` — `case_type_config`, `category_config` + seed kategorii. Z chunka **T06**.

## 1.3 Supabase RLS + Functions + Storage (Database + Security) [10]
21. `[T1-DB-021]` Migracja `009_admin.sql` — `admin_logs`, `daily_stats`, `feedback`. Z chunka **T06**.
22. `[T1-DB-022]` Migracja `010_rls_policies.sql` — RLS na wszystkich tabelach + polityki SELECT/INSERT/UPDATE/DELETE. Z chunka **T07**.
23. `[T1-DB-023]` Migracja `011_functions_triggers.sql` — `set_case_deadline`, `increment_popularity`, `reset_monthly_document_counts`. Z chunka **T07**.
24. `[T1-SEC-024]` Dodatkowa migracja `012_security_extras.sql` — `pgcrypto`, kolumna `pesel_encrypted BYTEA` zamiast `pesel TEXT`, helper functions `encrypt_pesel(text)` / `decrypt_pesel(bytea)`.
25. `[T1-SEC-025]` Migracja `013_idempotency.sql` — tabela `stripe_events (event_id UNIQUE)` dla idempotencji webhooków.
26. `[T1-SEC-026]` Migracja `014_feature_flags.sql` — tabela `feature_flags (key, enabled, target_role, target_user_ids[])`.
27. `[T1-DB-027]` Migracja `015_form_schema_versioning.sql` — kolumna `form_schema_version` w `case_type_config` + `cases.form_schema_version_used`.
28. `[T1-DB-028]` Storage buckets: `uploads` (private, 10MB, mime: pdf/jpg/png), `documents` (private, signed URLs), `avatars` (public, 2MB), `public` (public, OG images).
29. `[T1-DB-029]` Storage RLS policies — user widzi tylko swoje uploads/documents.
30. `[T1-DB-030]` Seed `case_type_config` dla 5 priorytetowych typów (M1, M4, P1, P3, W1) — minimum dla MVP fazy 2.

## 1.4 Design tokens + Tailwind config (Design) [10]
31. `[T1-DES-031]` `tailwind.config.ts` — kolory `precision-blue`, `iron`, `volt`, `signal`, `status-amber` (z chunka **D01**).
32. `[T1-DES-032]` Fonts: `Inter Tight` (display), `Inter` (body), `JetBrains Mono` (mono) — `next/font/google` setup. Z chunka **D02**.
33. `[T1-DES-033]` `globals.css` — CSS variables + reset + `@layer base/components/utilities`.
34. `[T1-DES-034]` Spacing/radius/shadow tokens — kompaktowe wg specyfiki Mandatomat (radius 12px, gap 16px). Z chunka **D02**.
35. `[T1-DES-035]` Animation tokens — `--duration-snap: 150ms`, `--ease-snap: cubic-bezier(0.12, 0.8, 0.3, 1)`. Z chunka **D10**.
36. `[T1-DES-036]` `packages/ui` — bazowe komponenty z `shadcn/ui` (button, input, select, dialog, sheet, dropdown, tooltip, toast).
37. `[T1-DES-037]` Komponent `<Button>` z wariantami `primary | secondary-soft | ghost | danger | success` (cva).
38. `[T1-DES-038]` Komponenty `<Card>`, `<Badge>` (pill, mono variant), `<StatusBadge>` (per case_status). Z chunka **D06**.
39. `[T1-DES-039]` Storybook init w `apps/storybook` z bazowymi stories dla każdego komponentu UI.
40. `[T1-DES-040]` Dark mode toggle (CSS class `.dark` + media query) — wg specyfiki czystej zinc (D10).

## 1.5 ENV, secrets, observability (DevOps) [10]
41. `[T1-DEV-041]` `.env.example` — wszystkie zmienne z chunka **T02** (Supabase, Anthropic, Stripe, Resend, SMSAPI, Fakturownia, CRON_SECRET).
42. `[T1-DEV-042]` Vercel project link, ENV vars upload (preview + production).
43. `[T1-DEV-043]` Sentry SDK init (`apps/web/sentry.{client,server,edge}.config.ts`).
44. `[T1-DEV-044]` PostHog init (product analytics, feature flags wsparcie).
45. `[T1-DEV-045]` Vercel CRON config `vercel.json` — `/api/deadlines/check` co godzinę.
46. `[T1-DEV-046]` Upstash Redis (rate-limit) provisioning + ENV.
47. `[T1-DEV-047]` Inngest provisioning (background jobs: OCR, generowanie pism w tle).
48. `[T1-DEV-048]` README techniczne — quick start (clone, pnpm install, supabase start, supabase db reset, pnpm dev).
49. `[T1-DEV-049]` `CONTRIBUTING.md` + `CODEOWNERS` — kto reviewuje co (orchestrator wszystko).
50. `[T1-ORCH-050]` Status check: wszystkie migracje `pnpm db:migrate:local` przechodzą zielone, Storybook się buduje, CI zielone na main.

## Definition of Done Tier 1
- [ ] Repo na GitHub `MandatomatMaj2026` zainicjowane, branch `main` chroniony.
- [ ] `pnpm install && pnpm build` przechodzi zielone.
- [ ] `supabase db reset` aplikuje wszystkie 15 migracji bez błędu.
- [ ] Storybook renderuje 8+ komponentów bazowych.
- [ ] Vercel preview deployment działa na PR.
- [ ] Sentry odbiera testowy error z dev env.
