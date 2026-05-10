# Mandatomat — Runbook operatora

> Operacyjna instrukcja dla operatora (właściciela repo) i Orchestratora (GenSpark AI Developer).

## Spis treści

1. [Codzienne operacje](#1-codzienne-operacje)
2. [Setup lokalny (development)](#2-setup-lokalny-development)
3. [Deployment](#3-deployment)
4. [Sekrety — gdzie i jak](#4-sekrety--gdzie-i-jak)
5. [Migracje DB](#5-migracje-db)
6. [AI prompty + evals](#6-ai-prompty--evals)
7. [Disaster recovery](#7-disaster-recovery)
8. [Monitoring i alerty](#8-monitoring-i-alerty)
9. [RODO / incident response](#9-rodo--incident-response)
10. [Kontakty / eskalacja](#10-kontakty--eskalacja)

---

## 1. Codzienne operacje

### Operator (Ty)

| Czynność | Częstotliwość | Komenda / link |
|---|---|---|
| Sprawdź `[STATUS]` issue od Orchestratora | 1×/dzień | `gh issue list --label status` |
| Review otwartych PR-ów | 2–3×/dzień | `gh pr list` |
| Merge zatwierdzonych PR-ów | przy review | przycisk Squash and merge |
| Odpowiedź na `needs-secret` | natychmiast (blokuje pracę) | wpisz w Vercel ENV |
| Odpowiedź na `needs-decision` | w 24h | komentarz w issue |
| Sprawdź Sentry errors | 1×/dzień | https://sentry.io |
| Sprawdź Vercel deployments | 1×/dzień | https://vercel.com |

### Orchestrator (AI)

| Czynność | Częstotliwość |
|---|---|
| Otwarcie issue per zadanie | start tieru |
| Delegacja do sub-agentów | ciągle |
| Review PR-ów przed Twoim review | przed merge |
| Raport `[STATUS] Day N` | codziennie |
| Burndown vs plan | codziennie |
| Eskalacja blokerów | natychmiast |

---

## 2. Setup lokalny (development)

```bash
# 1. Clone
git clone https://github.com/walerys1003/MandatomatMaj2026.git
cd MandatomatMaj2026

# 2. Install (pnpm 9 + Node 20)
pnpm install

# 3. ENV
cp .env.example .env.local
# uzupełnij wartości — patrz sekcja 4

# 4. Supabase lokalnie
pnpm db:start          # docker compose up supabase
pnpm db:migrate:local  # aplikuje wszystkie migracje
pnpm db:seed           # seedy dla case_type_config + 5 priorytetowych typów

# 5. Dev server
pnpm dev               # localhost:3000

# 6. Storybook (opcjonalnie)
pnpm storybook         # localhost:6006
```

**Reset DB lokalnie:**
```bash
pnpm db:reset          # rm -rf .supabase + migrate + seed
```

---

## 3. Deployment

### Preview (każdy PR)
- Vercel automatycznie deployuje preview na każdy PR
- URL: `https://<branch>-mandatomat.vercel.app`
- Sprawdź `vercel logs <url>` jeśli build fails

### Production (merge do `main`)
- Vercel auto-deployuje na merge do `main`
- URL: `https://mandatomat.pl` (po podpięciu DNS)
- Build time: ~2–3 min

### Pre-prod checklist (przed launchem)
- [ ] Wszystkie migracje przeszły na production Supabase
- [ ] ENV vars na Vercel production: kompletne (sekcja 4)
- [ ] Stripe webhook endpoint dodany w Stripe Dashboard
- [ ] Resend domain verified (`mandatomat.pl`)
- [ ] DNS: A/CNAME → Vercel, MX → Resend
- [ ] Sentry release tag wypchnięty
- [ ] Sitemap.xml i robots.txt dostępne
- [ ] Lighthouse ≥ 90 na produkcji
- [ ] Smoke test: rejestracja → wizard → płatność (Stripe test card) → PDF → email

---

## 4. Sekrety — gdzie i jak

### Lista wszystkich (z `.env.example`)

| Klucz | Skąd | Vercel scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API | preview + prod |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings → API | preview + prod |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API (secret) | preview + prod |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys | preview + prod |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → API keys | preview (test) + prod (live) |
| `STRIPE_WEBHOOK_SECRET` | dashboard.stripe.com → Webhooks → endpoint | preview + prod |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | dashboard.stripe.com → API keys | preview + prod |
| `RESEND_API_KEY` | resend.com → API Keys | preview + prod |
| `FAKTUROWNIA_API_KEY` | fakturownia.pl → Konto → API | tylko prod |
| `FAKTUROWNIA_DOMAIN` | np. `mandatomat` | tylko prod |
| `UPSTASH_REDIS_REST_URL` | console.upstash.com → Redis → REST API | preview + prod |
| `UPSTASH_REDIS_REST_TOKEN` | console.upstash.com → Redis → REST API | preview + prod |
| `INNGEST_EVENT_KEY` | app.inngest.com → Settings | preview + prod |
| `INNGEST_SIGNING_KEY` | app.inngest.com → Settings | preview + prod |
| `SENTRY_DSN` | sentry.io → Project Settings | preview + prod |
| `SENTRY_AUTH_TOKEN` | sentry.io → Auth Tokens | tylko CI (GitHub) |
| `AXIOM_TOKEN` | app.axiom.co → API Tokens | preview + prod |
| `CRON_SECRET` | wygeneruj `openssl rand -hex 32` | tylko prod |
| `NEXT_PUBLIC_GA_ID` | analytics.google.com → Admin → Property | tylko prod |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `mandatomat.pl` | tylko prod |

### Jak dodać do Vercel
```bash
vercel env add ANTHROPIC_API_KEY production
# wklej wartość, Enter
```

Lub przez dashboard: Vercel → Project → Settings → Environment Variables.

---

## 5. Migracje DB

### Tworzenie nowej migracji
```bash
supabase migration new <name>
# tworzy supabase/migrations/<timestamp>_<name>.sql
```

**ZAWSZE** dodaj plik `down`:
```bash
touch supabase/migrations/<timestamp>_<name>.down.sql
```

### Aplikowanie
```bash
pnpm db:migrate:local          # lokalnie
pnpm db:migrate:staging        # staging (Supabase staging project)
pnpm db:migrate:prod           # production (uwaga!)
```

### Rollback (production)
```bash
# Krok 1: zastosuj down migration
supabase db query --file supabase/migrations/<timestamp>_<name>.down.sql

# Krok 2: usuń wpis z _migrations
supabase db query "DELETE FROM supabase_migrations.schema_migrations WHERE version='<timestamp>'"
```

### Najczęstsze problemy
- **"relation already exists"** — migracja częściowo się zaaplikowała, ręczne czyszczenie + retry
- **"violates RLS"** — nowa migracja nie ma policy dla istniejących userów, dodaj `ALTER POLICY` w tej samej migracji

---

## 6. AI prompty + evals

### Struktura
```
apps/web/lib/ai/prompts/
├── m1-mandat/
│   ├── v1.ts          ← system + user prompt
│   └── schema.ts      ← Zod input/output
└── ...

evals/
├── m1-mandat/
│   ├── case-001.json  ← golden test fixture
│   ├── case-002.json
│   └── ...
└── runner.ts          ← pnpm eval --case m1-mandat
```

### Uruchomienie evals
```bash
pnpm eval --case m1-mandat       # 1 typ
pnpm eval --tier 3                # wszystkie z tieru
pnpm eval --all                   # wszystkie 34 typy
```

**Gating:** `pnpm eval --all` musi być green przed deployem produkcji.

### Nowa wersja promptu
1. Skopiuj `v1.ts` → `v2.ts`, edytuj
2. Uruchom `pnpm eval --case <type> --version v2`
3. Jeśli scoring ≥ baseline `v1` (i lepszy o ≥ 2 punkty) — promuj do default
4. Jeśli gorszy — zostaw `v1` jako default, `v2` jako experiment (feature flag)

---

## 7. Disaster recovery

Patrz sekcja 13 w `PROMPT_FOR_GENSPARK_AI_DEVELOPER.md`. Skrót:

| Incident | Pierwsza reakcja |
|---|---|
| CI down | revert ostatniego merge, issue `[BLOCKED] CI down` |
| Migracja zepsuła staging | `down` migration → re-apply |
| Vercel build fails | `vercel logs` → fix w nowym PR |
| Stripe webhook lost | Stripe Dashboard → Resend |
| Anthropic rate-limit | Inngest queue retry automatyczny |
| RLS bypass | feature flag OFF + `[SECURITY-INCIDENT]` |
| PESEL leak | rotacja klucza Vault + RODO 72h notification |

### Backup DB
Supabase robi auto-backup codziennie. Manual restore:
```bash
supabase db dump --db-url <prod> > backup-$(date +%F).sql
# Restore: supabase db query --file backup-...sql --db-url <target>
```

---

## 8. Monitoring i alerty

### Dashboards
- **Sentry**: https://sentry.io/organizations/mandatomat/issues/
- **Vercel Analytics**: https://vercel.com/<team>/mandatomat/analytics
- **Axiom logs**: https://app.axiom.co/<workspace>/datasets/mandatomat
- **Stripe Radar**: https://dashboard.stripe.com/radar
- **Plausible**: https://plausible.io/mandatomat.pl

### Alerty (skonfiguruj na produkcji)
- Sentry: error rate > 1% → email + Slack
- Vercel: deployment fail → email
- Upstash: rate-limit hit > 100/h → email (DDoS detection)
- Stripe: failed payment > 5% → email
- Anthropic: API down > 5min → status page update

---

## 9. RODO / incident response

### Rejestr czynności (RoPA)
- `docs/rodo/ropa.md` (do utworzenia w Tierze 5)
- Aktualizuj przy każdej nowej operacji na danych osobowych

### Prawo do bycia zapomnianym
Endpoint `/api/account/delete` (Tier 5):
1. Soft delete `auth.users` (Supabase)
2. Anonimizacja `cases.user_id` → `NULL` (zachowanie analityki)
3. Hard delete `documents`, `uploads`, `payments`
4. Audit log w `events`

### 72h notification
W razie incydentu z danymi osobowymi:
1. Issue `[SECURITY-INCIDENT]` natychmiast
2. UODO notification: https://uodo.gov.pl/p/zgloszenie-naruszenia w 72h
3. Notyfikacja zainteresowanych osób (jeśli wysokie ryzyko)
4. Post-mortem w `docs/incidents/YYYY-MM-DD-<slug>.md`

---

## 10. Kontakty / eskalacja

| Rola | Kontakt |
|---|---|
| Operator (właściciel) | @walerys1003 |
| Orchestrator (AI) | issue z labelem `needs-decision` |
| Supabase support | https://supabase.com/dashboard/support |
| Anthropic support | https://support.anthropic.com |
| Stripe support | https://support.stripe.com |
| Vercel support | https://vercel.com/help |

---

**Ostatnia aktualizacja:** 2026-05-10 (Tier 0 — przed startem implementacji)
