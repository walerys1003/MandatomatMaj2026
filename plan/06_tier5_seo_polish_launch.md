# TIER 5 — KATALOG PEŁNY + SEO + POLISH + LAUNCH (50 zadań)

**Cel:** Pozostałe 29 typów pism, strony SEO long-tail, blog, security audit, performance polish, accessibility, monitoring, launch.
**Agenci paralelni:** AI (prompty 29 typów) ‖ SEO (long-tail pages) ‖ Security ‖ Frontend (a11y/perf).
**Czas:** 10–14 dni.

## 5.1 Pozostałe 29 typów pism — prompty + form_schema (AI + Backend) [15]
1. `[T5-AI-001]` Prompt `mandaty/odmowa-przyjecia.md` (M2) + form_schema seed.
2. `[T5-AI-002]` Prompt `mandaty/uchylenie-prawomocny.md` (M3).
3. `[T5-AI-003]` Prompt `mandaty/odwolanie-itd.md` (M5).
4. `[T5-AI-004]` Prompt `mandaty/odroczenie-raty.md` (M6).
5. `[T5-AI-005]` Prompt `mandaty/uchylenie-punktow.md` (M7).
6. `[T5-AI-006]` Prompt `parking/reklamacja-zdm.md` (P2).
7. `[T5-AI-007]` Prompt `parking/blad-identyfikacji.md` (P4).
8. `[T5-AI-008]` Prompty windykacja: `przedawnienie.md` (W2), `sprzeciw-epu.md` (W3), `usuniecie-krd-bik.md` (W4), `skarga-rf.md` (W5). Chunk **T17**.
9. `[T5-AI-009]` Prompty ubezpieczenia: `odwolanie-decyzja.md` (U1), `wezwanie-wyplata.md` (U2), `skarga-rf.md` (U3). Chunk **T17**.
10. `[T5-AI-010]` Prompty e-TOLL: `odwolanie-kara.md` (E1), `reklamacja-podwojne.md` (E2), `anulowanie.md` (E3). Chunk **T17**.
11. `[T5-AI-011]` Prompty kontrole: `sprzeciw-zatrzymanie-pj.md` (K1), `cofniecie-decyzji.md` (K2), `weryfikacja-urzadzenia.md` (K3), `korekta-punktow.md` (K4).
12. `[T5-AI-012]` Prompty techniczne: `pelnomocnictwo.md` (T1), `rodo-dostep.md` (T2), `rodo-usuniecie.md` (T3), `lista-zalacznikow.md` (T4).
13. `[T5-BE-013]` Seed `case_type_config` dla wszystkich 34 typów (display_name, price, form_schema, prompt_file, deadline_days, slug, SEO).
14. `[T5-AI-014]` Golden set evaluations dla każdego z 29 nowych typów (min. 3 case'y each = 87 testów).
15. `[T5-AI-015]` Kalkulator przedawnienia w W2 — funkcja JS `calculatePrescription(debtType, dateLastAction)` zwraca `{ years, expired }`.

## 5.2 Strony SEO long-tail (SEO + Frontend) [12]
16. `[T5-SEO-016]` Generator `app/(marketing)/[slug]/page.tsx` (catch-all) — pobiera `case_type_config` po slug, renderuje stronę.
17. `[T5-SEO-017]` Template strony SEO: hero + opis problemu (2000+ słów z prompta admin) + scoring inline + FAQ (5-8 pytań) + CTA.
18. `[T5-SEO-018]` JSON-LD `FAQPage` schema na każdej stronie SEO (z `case_type_config.faq_data`).
19. `[T5-SEO-019]` JSON-LD `Product` schema (cena, dostępność, SKU = case_type).
20. `[T5-SEO-020]` JSON-LD `BreadcrumbList`.
21. `[T5-SEO-021]` Content writing 17 stron SEO (2000 słów each, AI-generated draft + human review). Chunk **T18**.
22. `[T5-SEO-022]` `app/blog/[slug]/page.tsx` — Markdown blog posts z `posts/*.md`.
23. `[T5-SEO-023]` 5 pierwszych artykułów blogowych (Jak odwołać mandat z fotoradaru / Przedawnienie mandatu / Parking prywatny / EPU krok po kroku / Punkty karne weryfikacja).
24. `[T5-SEO-024]` `<RelatedArticles>` na końcu każdej strony SEO.
25. `[T5-SEO-025]` Internal linking — sidebar "Powiązane pisma" na stronach SEO.
26. `[T5-SEO-026]` 301 redirecty z popularnych wariantów URL (`/odwolanie-mandat` → `/odwolanie-od-mandatu-za-predkosc`).
27. `[T5-SEO-027]` Google Search Console + Google Analytics 4 + Plausible (privacy-first) integration.

## 5.3 Security audit + RODO finalizacja (Security) [8]
28. `[T5-SEC-028]` Audit RLS — test każdej tabeli z client poziomu user A widzi tylko swoje dane B nigdy.
29. `[T5-SEC-029]` `pgcrypto` test — PESEL zapisany szyfrowanie, odczyt tylko przez `decrypt_pesel(...)` w server-side.
30. `[T5-SEC-030]` Rate-limit audit — wszystkie `/api/*` mają middleware rate-limit (zróżnicowane: scoring 5/min, generate 3/min, others 100/min).
31. `[T5-SEC-031]` CSP headers (`next.config.ts`) — strict, no inline scripts (kromé Stripe.js i Vercel Analytics whitelist).
32. `[T5-SEC-032]` Cookie audit — wszystkie cookies `Secure; HttpOnly; SameSite=Lax`, banner cookie consent (TCF v2 lub light wersja).
33. `[T5-SEC-033]` DPA review (Supabase, Anthropic, Stripe, Resend, Sentry, PostHog) — checklist w `docs/legal/dpa.md`.
34. `[T5-SEC-034]` Pen-test podstawowy — OWASP ZAP automated scan na staging.
35. `[T5-SEC-035]` Polityka prywatności + regulamin — finalna wersja z prawnikiem (placeholder + TODO note dla user).

## 5.4 Performance + a11y polish (Frontend) [8]
36. `[T5-FE-036]` Lighthouse audit każdej kluczowej strony — target: Performance ≥ 90, A11y ≥ 95, SEO ≥ 95, Best Practices ≥ 95.
37. `[T5-FE-037]` Image optimization — wszystkie `<img>` → `next/image` z width/height + priority dla hero.
38. `[T5-FE-038]` Bundle analyze — `@next/bundle-analyzer`, redukcja initial JS ≤ 200KB gzipped.
39. `[T5-FE-039]` Code split — admin panel jako dynamic import, framer-motion w lazy load.
40. `[T5-FE-040]` Font subsetting — Inter Tight + Inter latin + latin-ext only.
41. `[T5-FE-041]` A11y — pełen audit z axe-core, naprawa wszystkich critical/serious findings.
42. `[T5-FE-042]` Keyboard navigation — wszystkie interactive elements tabbable, focus visible.
43. `[T5-FE-043]` Mobile testing — iOS Safari + Android Chrome real device (lub BrowserStack).

## 5.5 Tests + monitoring + launch (Orchestrator + DevOps) [7]
44. `[T5-ORCH-044]` Playwright E2E suite — 5 happy paths (register, scoring, full wizard, payment, profile delete).
45. `[T5-ORCH-045]` Vitest unit tests — `lib/validators`, `lib/utils`, `lib/payments`, kalkulator przedawnienia. Coverage ≥ 70%.
46. `[T5-ORCH-046]` Integration tests — API routes z testową instancją Supabase.
47. `[T5-DEV-047]` Sentry alerts — error rate spike, latency p95 > 3s, AI cost > $50/dzień.
48. `[T5-DEV-048]` Status page (statuspage.io lub własny `/status`) z Supabase/Stripe/Anthropic uptime.
49. `[T5-DEV-049]` Backup strategy — Supabase point-in-time recovery enabled, daily exports do R2/S3.
50. `[T5-ORCH-050]` 🚀 LAUNCH checklist: domena, SSL, sitemap submitted, DNS, monitoring, alert oncall, README final, post launch retro.

## Definition of Done Tier 5
- [ ] Wszystkie 34 typy pism generują się i mają strony SEO.
- [ ] 17 stron long-tail + 5 artykułów blog opublikowane.
- [ ] Lighthouse ≥ 90/95/95/95 na wszystkich kluczowych stronach.
- [ ] OWASP ZAP scan: zero high/critical findings.
- [ ] E2E suite zielona (5/5).
- [ ] Production live na `mandatomat.pl` z SSL.
- [ ] Monitoring + alerts skonfigurowane.
- [ ] Backup strategy działa (test restore wykonany).

## Post-launch (poza tierami 1-5)
- Subskrypcje (Stripe Billing portal + dunning)
- ePUAP/e-Doręczenia integration
- B2B panel + API publiczne
- AI Chat kontekstowy
- Referral program
- A/B testing cen
- SMS reminders
