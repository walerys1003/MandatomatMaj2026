# Launch Checklist — Mandatomat MVP (T5-ORCH-050)

Dokument operacyjny — kolejność czynności przed wypchnięciem na produkcję.
Każdy punkt musi być potwierdzony (✅) lub odroczony z uzasadnieniem (⏸).

## Faza 1: Pre-deploy verification

### Code & build
- [ ] `pnpm install` — clean install, brak warnings o peer dependencies
- [ ] `pnpm typecheck` — 0 errors (apart from known pre-existing UI package issues)
- [ ] `pnpm lint` — 0 errors, 0 warnings
- [ ] `pnpm test` — wszystkie testy przechodzą (cel: ≥70% coverage core libs)
- [ ] `pnpm build` — successful production build dla wszystkich apps
- [ ] `pnpm audit` — 0 high/critical vulnerabilities

### Environment variables (Vercel/staging)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — produkcyjny URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — produkcyjny anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — server-only, NIGDY w bundle
- [ ] `ANTHROPIC_API_KEY` — server-only
- [ ] `STRIPE_SECRET_KEY` — produkcyjny live key
- [ ] `STRIPE_WEBHOOK_SECRET` — z dashboard Stripe
- [ ] `NEXT_PUBLIC_SITE_URL` — `https://mandatomat.pl`
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — rate-limit
- [ ] `RESEND_API_KEY` — emails (faktury, reset hasła)

### Database (Supabase)
- [ ] Migracje 001-019 zaaplikowane na produkcji
- [ ] RLS audit: `select * from public.rls_audit` — wszystkie tabele `rls_enabled=true`
- [ ] Storage buckets utworzone: `uploads`, `documents`
- [ ] Seed data zaaplikowane (case_type_config, category_config)
- [ ] Backup automatyczny włączony (Daily, retention 7 dni)

## Faza 2: Security verification

### Headers (curl test)
```bash
curl -sI https://mandatomat.pl
```
Sprawdź obecność:
- [ ] `Content-Security-Policy: default-src 'self'; script-src ...`
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Cross-Origin-Opener-Policy: same-origin`
- [ ] BRAK `X-Powered-By`

### External tools
- [ ] [securityheaders.com](https://securityheaders.com) — score **A+**
- [ ] [observatory.mozilla.org](https://observatory.mozilla.org) — score **A+**
- [ ] [ssllabs.com](https://www.ssllabs.com/ssltest/) — score **A+**

### RLS smoke tests
Po stworzeniu test usera A i B:
- [ ] User A nie widzi spraw User B (`SELECT * FROM cases` zwraca tylko własne)
- [ ] User A nie może zmodyfikować payments
- [ ] User A nie może DELETE sprawy ze status != 'draft'
- [ ] Anon user nie widzi żadnych user data, tylko `case_type_config`

## Faza 3: Functional smoke tests

### User flows (manual)
- [ ] Rejestracja nowego usera → email confirmation → login
- [ ] Reset hasła
- [ ] Generacja darmowej oceny `/sprawdz-szanse` (rate-limit 5/min)
- [ ] Kalkulator przedawnienia `/kalkulator-przedawnienia` (5 różnych scenariuszy)
- [ ] Pełen flow: nowa sprawa → formularz → płatność Stripe (test card 4242...) → generacja → pobranie PDF
- [ ] PDF zawiera podpis, podstawy prawne, do_organu
- [ ] Generacja faktury VAT (PDF) i wysyłka mailem

### SEO routes
- [ ] `/sitemap.xml` zawiera 9 kategorii + 17 long-tail + 11 statycznych
- [ ] `/robots.txt` poprawne (allow + sitemap)
- [ ] `/kategoria/mandaty-karne` renderuje się + JSON-LD obecny (view source)
- [ ] `/poradnik/sprzeciw-od-nakazu-zaplaty-epu-lublin` renderuje + JSON-LD
- [ ] Lighthouse SEO score ≥ 95

### Performance & a11y
- [ ] Lighthouse Performance ≥ 90 (mobile)
- [ ] Lighthouse A11y ≥ 95
- [ ] axe-core devtools — 0 violations na kluczowych stronach (/, /sprawdz-szanse, /kalkulator)
- [ ] Skip-link działa (Tab od początku strony)
- [ ] Mobile responsive (320px-1920px)

## Faza 4: Monitoring & observability

- [ ] Sentry projekt skonfigurowany (lub stub aktywny — `lib/monitoring/sentry.ts`)
- [ ] Vercel Analytics włączone
- [ ] Supabase logs — alerts skonfigurowane (auth failures, slow queries > 1s)
- [ ] Stripe webhooks — alerty na failed events
- [ ] Upstash Redis — monitoring quota (rate-limit)
- [ ] Domain healthcheck (UptimeRobot / Better Uptime) — `/` i `/api/health`

## Faza 5: Legal & compliance

- [ ] Regulamin (`/regulamin`) — wszystkie § zaktualizowane (AI, RODO, security)
- [ ] Polityka prywatności (`/polityka-prywatnosci`) — pełna art. 13 RODO
- [ ] RODO (`/rodo`) — prawa art. 15-22
- [ ] Cookie banner aktywny i działający (zgody granularne)
- [ ] DPA z Anthropic + Supabase podpisane (Standard Contractual Clauses)
- [ ] DPIA dla AI sporządzony (PUODO ready)
- [ ] Tytuł działalności gospodarczej / KRS aktualne w stopce

## Faza 6: Marketing & content

- [ ] Domeny: `mandatomat.pl` + `www.mandatomat.pl` (redirect www → apex)
- [ ] OpenGraph image (`/opengraph-image.tsx`) renderuje się
- [ ] Email templates (Resend): faktura, reset hasła, dokument gotowy
- [ ] Google Analytics 4 / Plausible skonfigurowane
- [ ] Search Console — sitemap submitted

## Faza 7: Go/No-Go

**Decyzja go-live podejmowana po:**
- [ ] Wszystkie ✅ w fazach 1-5
- [ ] Akceptacja przez Tech Lead i Legal/DPO
- [ ] Plan rollback przygotowany (poprzedni deploy w Vercel → 1-click revert)
- [ ] On-call dyżur ustalony na pierwsze 24h po launchu

## Plan rollback

```bash
# 1. Vercel — rollback do poprzedniego deploymentu
vercel rollback [deployment-url]

# 2. Supabase migracje — manual rollback przez RAW SQL (jeśli problem w schemacie)
# Migracje są incremental — nie usuwają kolumn z danymi.

# 3. Komunikat dla użytkowników na Twitter/email — przy długim outage
```

## Post-launch (T+24h)

- [ ] Sentry — przegląd zgłoszeń (target: < 5 unique errors)
- [ ] Stripe Dashboard — przegląd płatności (target: 100% success rate)
- [ ] Supabase logs — przegląd auth + RLS errors
- [ ] User feedback przez email/formularz kontaktowy
- [ ] Lighthouse re-run na produkcji (nie staging)

---

**Status MVP:** ✅ Wszystkie 5 tierów ukończone. T5 = 50 zadań.
**Data:** 2026-05-10
