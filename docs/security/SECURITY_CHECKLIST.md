# Security Checklist — Mandatomat (T5-SEC)

Dokument weryfikacyjny wszystkich kontroli bezpieczeństwa przed launchem
produkcyjnym. Każdy punkt MUSI być potwierdzony (✅) lub jawnie odroczony
(⏸ z uzasadnieniem) przed wypchnięciem na produkcję.

## 1. Autoryzacja i autentykacja

- ✅ **Supabase Auth** z PKCE flow (browser-only secrets)
- ✅ **RLS enabled** na wszystkich tabelach z `user_id` (audyt: `select * from public.rls_audit`)
- ✅ **Service role key** używany TYLKO w server actions / webhookach (nigdy w klient)
- ✅ **Middleware** chroni `/panel`, `/sprawy`, `/profil`, `/ustawienia`, `/kreator`
- ✅ **Admin paths** (`/admin/*`) wymagają roli `admin` w `profiles.role`
- ✅ **Reset hasła** wymaga email confirmation + token z TTL 1h
- ✅ **CSRF** — Server Actions Next.js + same-origin policy (frame-ancestors 'none')

## 2. Row Level Security (RLS)

- ✅ Migracja `20260510000010_rls_policies.sql` — bazowy zestaw polityk
- ✅ Migracja `20260510000019_rls_audit.sql` — hardening:
  - DENY DELETE na profiles (cascade z auth.users wystarczy)
  - DENY UPDATE/DELETE/INSERT na payments z poziomu user (tylko service role)
  - DENY INSERT/UPDATE/DELETE na events (audyt-only)
  - Feedback INSERT wymaga ownership sprawy
  - Documents DELETE tylko dla draft/failed
- ✅ Storage buckets — explicit RLS w `20260510000016_storage_buckets.sql`
- ✅ Helper `user_owns_case(uuid)` — dla złożonych polityk

## 3. Security headers (T5-SEC-029)

- ✅ **Content-Security-Policy** — strict, allowlist Supabase + Stripe + Anthropic
- ✅ **Strict-Transport-Security** — 1 rok, includeSubDomains, preload
- ✅ **X-Frame-Options: DENY** + frame-ancestors 'none'
- ✅ **X-Content-Type-Options: nosniff**
- ✅ **Referrer-Policy: strict-origin-when-cross-origin**
- ✅ **Permissions-Policy** — wyłączone camera/microphone/geolocation
- ✅ **Cross-Origin-Opener-Policy: same-origin**
- ✅ **Cross-Origin-Resource-Policy: same-origin**
- ✅ **Cache-Control: no-store** dla `/api/*`

## 4. Rate limiting

- ✅ **auth bucket**: 10 req/min/IP — login/signup/reset
- ✅ **ai bucket**: 30 req/min/user — generation endpoints
- ✅ **default**: 60 req/min/IP — pozostałe API
- ✅ Fallback do "allow" w dev (brak Upstash env)
- ⏸ Distributed rate-limit dla scenariuszy DDoS — odroczone do post-MVP (Cloudflare WAF)

## 5. Walidacja i sanityzacja danych

- ✅ **Zod** na wszystkich Server Actions input
- ✅ **JSON parsing** Claude'a walidowany przez `letterResponseSchema`
- ✅ **PDF generator** — sanityzuje stringi przed renderowaniem (no XSS w PDF)
- ✅ **Upload limity** — 10MB/plik, type allowlist (image/*, pdf)
- ✅ **OCR** — Tesseract w sandboxie (Edge Function, no system access)

## 6. Sekrety i konfiguracja

- ✅ Wszystkie sekrety w `.env.local` / Vercel env
- ✅ `NEXT_PUBLIC_*` tylko dla bezpiecznych wartości (URL, anon key)
- ✅ Service role key NIGDY w bundle client
- ✅ Anthropic API key tylko w server-only files (`'server-only'` import)
- ✅ Stripe webhook signature weryfikowana (`stripe.webhooks.constructEvent`)
- ✅ Idempotency keys dla webhooks (tabela `idempotency_keys`)

## 7. Audyt i monitoring

- ✅ Tabela `events` — audit log każdej istotnej akcji (LLM call, payment, doc gen)
- ✅ Sentry (T5-DEV-046) — error tracking + breadcrumbs
- ⏸ External SIEM — odroczone do skali B2B
- ✅ `rls_audit` view — okresowa weryfikacja RLS w Supabase

## 8. Dane osobowe (RODO)

- ✅ **Polityka prywatności** (`/polityka-prywatnosci`) — pełna informacja art. 13 RODO
- ✅ **Regulamin** (`/regulamin`) — usługa świadczona drogą elektroniczną (UŚUDE)
- ✅ **RODO** (`/rodo`) — separate page z prawami art. 15-22
- ✅ **Wniosek RODO** generator (T2/T3) — prawo dostępu i usunięcia
- ✅ **Cookie banner** — zgody granularne, opcjonalne analytics
- ✅ **Retencja** — sprawy z `status != 'draft'` → 5 lat (audyt księgowy)
- ✅ **DPA** z Supabase (Frankfurt) i Anthropic (USA + Standard Contractual Clauses)
- ⏸ **DPIA** dla AI — przygotowane, do publikacji przed launch

## 9. Płatności (PCI DSS scope)

- ✅ **Stripe Checkout** — całość PCI-DSS po stronie Stripe (SAQ A)
- ✅ Brak kart kredytowych w naszej bazie / logach
- ✅ Webhook signature verification + idempotency
- ✅ Refund policy w regulaminie zgodnie z UoPK

## 10. Zależności i dependency security

- ✅ `pnpm audit` — 0 high/critical vulnerabilities
- ✅ Renovate / Dependabot — automatyczne PR-y z update
- ✅ Lock file committed (`pnpm-lock.yaml`)
- ✅ Brak deprecated packages w produkcji

## 11. Pre-launch sprawdzenie

Po deployu na staging URL:
```bash
# 1. CSP poprawnie ustawione
curl -sI https://staging.mandatomat.pl | grep -i content-security-policy

# 2. HSTS
curl -sI https://staging.mandatomat.pl | grep -i strict-transport

# 3. Brak X-Powered-By
curl -sI https://staging.mandatomat.pl | grep -i x-powered  # powinno być puste

# 4. observatory.mozilla.org — score A+
# 5. securityheaders.com — score A+
```

## Odpowiedzialny

- **Tech lead**: weryfikacja sekcji 1-7, 10
- **Legal/DPO**: weryfikacja sekcji 8, 9
- **Ostatnia weryfikacja**: pending (przed launch)
