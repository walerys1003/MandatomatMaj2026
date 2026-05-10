# TIER 8 — MOBILE, COMPLIANCE & SCALE (50 zadań)

**Cel:** Aplikacja mobilna (PWA + React Native), pełen compliance (UODO, audyt RODO), skalowanie infra.
**Agenci paralelni:** Mobile ‖ Compliance ‖ DevOps ‖ Backend.
**Czas:** 30–45 dni.
**Priorytet:** ŚREDNI — niezbędne przy 10k+ MAU.

## 8.1 Progressive Web App (Mobile + Frontend) [10]

1. `[T8-PWA-001]` `manifest.json` + ikony 192/512/maskable + theme_color.
2. `[T8-PWA-002]` Service Worker (`next-pwa` lub Workbox) — offline shell, cache strategii.
3. `[T8-PWA-003]` Install prompt — custom banner zamiast browser default (UX: lepszy CTA).
4. `[T8-PWA-004]` Offline mode — wizard działa offline (form data w IndexedDB), sync gdy online.
5. `[T8-PWA-005]` Push notifications — Web Push API (VAPID keys), opt-in po pierwszej wygranej.
6. `[T8-PWA-006]` Background sync — formularze submited offline lecą po reconnect.
7. `[T8-PWA-007]` App shortcuts (`manifest.json` shortcuts) — szybki dostęp do "Nowa sprawa" z home screen.
8. `[T8-PWA-008]` Add to home screen onboarding — 3-krokowy tutorial dla iOS/Android.
9. `[T8-PWA-009]` PWA Lighthouse audit — score > 90.
10. `[T8-PWA-010]` Touch gestures — swipe between wizard steps na mobile.

## 8.2 React Native app (Mobile) [12]

11. `[T8-RN-011]` `apps/mobile` — Expo SDK 51 + EAS Build, monorepo integration.
12. `[T8-RN-012]` Shared types — `packages/db-types` reuse w mobile.
13. `[T8-RN-013]` Auth flow mobile — Supabase JS SDK + Expo SecureStore dla tokens.
14. `[T8-RN-014]` Onboarding screens — 4 ekrany swipe + email/social signup.
15. `[T8-RN-015]` Camera OCR — Expo Camera + przesyłka do `/api/uploads`.
16. `[T8-RN-016]` Wizard mobile — natywne form inputs (DateTimePicker, Picker).
17. `[T8-RN-017]` Push notifications native — Expo Notifications + APNs/FCM.
18. `[T8-RN-018]` In-App Purchases — RevenueCat (Stripe nie supportuje natywnie iOS/Android).
19. `[T8-RN-019]` Deep links — `mandatomat://case/{id}` + universal links.
20. `[T8-RN-020]` App Store submission — screenshoty, opis, kategoria Finance/Productivity, age 17+.
21. `[T8-RN-021]` Google Play submission — analogicznie + Data Safety form.
22. `[T8-RN-022]` Crash reporting — Sentry React Native SDK.

## 8.3 Compliance — UODO + audyt RODO (Compliance + Legal) [10]

23. `[T8-CMP-023]` Rejestr czynności przetwarzania — `docs/compliance/REJESTR_CZYNNOSCI.md` (art. 30 RODO).
24. `[T8-CMP-024]` DPIA (Data Protection Impact Assessment) — `docs/compliance/DPIA.md`.
25. `[T8-CMP-025]` IOD (Inspector Ochrony Danych) — wyznaczenie + kontakt na stronie.
26. `[T8-CMP-026]` Polityka retencji — automatyczne usuwanie inactive accounts po 24 mies (cron).
27. `[T8-CMP-027]` Audyt zewnętrzny RODO — zatrudnienie kancelarii (Maruta, Traple, DLA Piper) → raport + remediation.
28. `[T8-CMP-028]` ISO 27001 readiness — gap analysis (kontrolki A.5-A.18).
29. `[T8-CMP-029]` SOC 2 Type I — przygotowanie do audytu (jeśli targetujemy B2B enterprise).
30. `[T8-CMP-030]` Right to portability — eksport JSON + CSV + PDF wszystkich danych usera (art. 20 RODO).
31. `[T8-CMP-031]` Cookie banner v2 — TCF v2.2 compliant (jeśli włączymy reklamy).
32. `[T8-CMP-032]` Wpis do UODO — zgłoszenie naruszenia ochrony danych (incident response template).

## 8.4 Performance & scale (DevOps + Backend) [10]

33. `[T8-PRF-033]` Database read replicas — Supabase Postgres read replica w eu-west.
34. `[T8-PRF-034]` Connection pooling — Supavisor (transaction mode) dla serverless.
35. `[T8-PRF-035]` Query optimization — `EXPLAIN ANALYZE` na top 20 queries, dodanie indeksów.
36. `[T8-PRF-036]` CDN dla statycznych assets — Cloudflare przed Vercel (cache static + R2 origin).
37. `[T8-PRF-037]` Redis cache — Upstash dla najczęstszych queries (case_type_config, prompty).
38. `[T8-PRF-038]` Edge functions — wybrane API routes (`/api/ai/scoring`) na Edge runtime (niższe latency).
39. `[T8-PRF-039]` Image optimization at edge — Cloudflare Images zamiast next/image dla user uploads.
40. `[T8-PRF-040]` Load testing — k6 lub Artillery, target 1000 RPS bez degradacji p95 < 500ms.
41. `[T8-PRF-041]` Auto-scaling — Vercel Pro plan, monitoring concurrent functions.
42. `[T8-PRF-042]` Cost monitoring — codzienne raporty Vercel + Supabase + Anthropic w Slack.

## 8.5 Reliability & DR (DevOps) [8]

43. `[T8-REL-043]` Chaos engineering — zaplanowane outage testy (kwartalnie).
44. `[T8-REL-044]` Runbook expansion — top 20 incident scenarios z step-by-step.
45. `[T8-REL-045]` On-call rotation — PagerDuty schedule, 1 tydzień per dev, weekend rotation.
46. `[T8-REL-046]` Post-mortem template — `docs/postmortems/TEMPLATE.md`, blameless culture.
47. `[T8-REL-047]` Health checks expansion — deep healthcheck (DB write/read, Claude API, Stripe, Resend) co 1 min.
48. `[T8-REL-048]` Feature flags — LaunchDarkly lub własny (`feature_flags` table), kill-switch dla każdej nowej funkcji.
49. `[T8-REL-049]` Canary deployments — Vercel preview deploys z 10% traffic dla 1h przed full rollout.
50. `[T8-REL-050]` SLO dashboard — Datadog/Grafana z error budget tracking (99.9% uptime target = 43.2 min/mies).

## Definition of Done Tier 8

- [ ] PWA score Lighthouse ≥ 90.
- [ ] App Store + Google Play approved.
- [ ] Audyt RODO przeszedł bez critical findings.
- [ ] Load test 1000 RPS p95 < 500ms.
- [ ] SLO uptime 99.9% przez 30 dni.
- [ ] Post-mortem dla każdego P1 incidentu w 48h.
