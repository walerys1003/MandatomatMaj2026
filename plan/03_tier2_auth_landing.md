# TIER 2 — AUTH + LANDING + LAYOUT (50 zadań)

**Cel:** Auth Supabase, middleware, kompletny landing z hero, kategoriami, cennikiem, FAQ, footer. App shell (sidebar + topbar). Profil użytkownika.
**Agenci paralelni:** Backend (auth) ‖ Frontend (UI) ‖ Design (komponenty) ‖ SEO (metadata).
**Czas:** 5–7 dni.

## 2.1 Auth + middleware (Backend + Security) [10]
1. `[T2-BE-001]` Supabase auth helpers — `lib/supabase/{client,server,admin,middleware}.ts`. Chunk **T02**, **T08**.
2. `[T2-BE-002]` `middleware.ts` — protected paths, admin guard, rate-limit (Upstash). Chunk **T08**.
3. `[T2-BE-003]` `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh` (delegated to Supabase, custom redirect logic).
4. `[T2-FE-004]` Strona `/login` — email + password, magic link, OAuth Google (opcja). Z chunka **T13** stylem.
5. `[T2-FE-005]` Strona `/rejestracja` — email + password + checkbox RODO + checkbox newsletter (opcjonalny).
6. `[T2-FE-006]` Strona `/reset-hasla` + `/reset-hasla/confirm` — flow z mailem.
7. `[T2-BE-007]` Endpoint `/api/profile` GET/PATCH (current user profile + update).
8. `[T2-BE-008]` Endpoint `/api/profile/delete` (RODO right-to-delete, cascade).
9. `[T2-BE-009]` Endpoint `/api/profile/export` (RODO data portability, JSON dump).
10. `[T2-SEC-010]` Rate-limit `/api/auth/*` (10 req/min/IP) + ban for repeated failures.

## 2.2 Layout shell (Frontend + Design) [10]
11. `[T2-FE-011]` Root layout `app/layout.tsx` — fonts, metadata, providers (Theme, Toast, QueryClient).
12. `[T2-FE-012]` `(marketing)/layout.tsx` — public navbar + footer (white).
13. `[T2-FE-013]` `(app)/layout.tsx` — sidebar + topbar + main content. Z chunka **D06**.
14. `[T2-FE-014]` `(auth)/layout.tsx` — minimal centered layout.
15. `[T2-DES-015]` `<Sidebar>` desktop — width 256px, iron-950 bg, items: Panel/Pisma/Szablony/Kalendarz/Statystyki/Płatności/Profil/Ustawienia. Chunk **D06**.
16. `[T2-DES-016]` `<MobileBottomNav>` — 5 ikon (Panel, Pisma, Nowe+, Kalendarz, Menu) z elevated FAB środkowym. Chunk **D10**.
17. `[T2-DES-017]` `<Topbar>` — search compact, notification bell, avatar. Chunk **D06**.
18. `[T2-DES-018]` `<Footer>` — 5 kolumn (Produkt, Pomoc, Firma, Prawne, Social) + drobnym dane firmy/NIP.
19. `[T2-DES-019]` `<Logo>` komponent — "Mandatomat" Inter Tight + ".pl" blue-400 suffix. Chunk **D06**.
20. `[T2-DES-020]` `<Stepper>` (BREADCRUMB TABS) — wg specyfiki Mandatomatu, NIE numbered dots. Chunk **D07**.

## 2.3 Landing page — hero + kategorie + cennik (Frontend + Design) [15]
21. `[T2-DES-021]` `<Hero>` — overline mono, H1 "Odwołaj mandat w 3 minuty.", paragraph, dwa CTA, stats line. Chunk **D03**.
22. `[T2-DES-022]` `<HeroBackground>` — siatka perspektywiczna (linear-gradient overlay 60×60) + accent dot. Chunk **D03**.
23. `[T2-DES-023]` `<PhoneMockup>` — ramka iron-900, ekran z wizard step 1, animacje Framer Motion (subtle float 3px). Chunk **D03**.
24. `[T2-DES-024]` `<HowItWorks>` — 4 kroki: Wybór → Pytania → Generowanie → Pobranie + animacja fadeIn stagger.
25. `[T2-DES-025]` `<CategoryGrid>` — 9 kart kategorii (3 kolumny desktop, scroll mobile). Chunk **D04**.
26. `[T2-DES-026]` `<CategorySearch>` — input 56px, debounce 200ms, dropdown z 5 wynikami. Chunk **D04**.
27. `[T2-DES-027]` `<PricingSection>` — 3 karty (99 zł / 249 zł pakiet / 349 zł PRO+) + B2B teaser. Chunk **D05**.
28. `[T2-DES-028]` `<CaseStudy>` — 4 kroki w rzędzie z connected line + cytat. Chunk **D10** (sekcja 4.16).
29. `[T2-DES-029]` `<SocialProof>` — liczniki ("12 345 wygenerowanych pism", "76% skuteczność") z count-up animation.
30. `[T2-DES-030]` `<SuccessRateTracker>` (landing variant) — donut chart 120px + breakdown + best categories. Chunk **D08**.
31. `[T2-DES-031]` `<FaqAccordion>` — 8–10 pytań z FAQPage JSON-LD.
32. `[T2-DES-032]` `<CtaFooter>` — "Nie czekaj. Termin biegnie." + duży przycisk.
33. `[T2-FE-033]` Landing page `app/(marketing)/page.tsx` — komponuje wszystkie sekcje.
34. `[T2-FE-034]` Strona `/jak-to-dziala` — long-form explainer.
35. `[T2-FE-035]` Strony statyczne `/regulamin`, `/polityka-prywatnosci`, `/rodo`, `/kontakt`, `/o-nas`.

## 2.4 Profil + ustawienia użytkownika (Frontend + Backend) [8]
36. `[T2-FE-036]` Strona `/profil` — formularz: imię, nazwisko, telefon, adres, PESEL (opcjonalny, encrypted save).
37. `[T2-FE-037]` Strona `/ustawienia/powiadomienia` — toggle email/SMS/newsletter.
38. `[T2-FE-038]` Strona `/ustawienia/bezpieczenstwo` — zmiana hasła, sesje aktywne, 2FA (V2 placeholder).
39. `[T2-FE-039]` Strona `/ustawienia/dane` — eksport danych (RODO), usunięcie konta z confirm modal.
40. `[T2-BE-040]` `/api/profile/sessions` GET — lista aktywnych sesji.
41. `[T2-BE-041]` `/api/profile/change-password` POST — z weryfikacją starego hasła.
42. `[T2-FE-042]` `<EmptyDashboard>` — wariant zero spraw, CTA "Stwórz pierwsze pismo →" (chunk **D10** empty state — surowy, ikona+tekst).
43. `[T2-FE-043]` Onboarding modal po pierwszym logowaniu — 3 ekrany wyjaśniające flow (skip dostępny).

## 2.5 SEO bazowe + metadata + a11y (SEO + Frontend) [7]
44. `[T2-SEO-044]` `<Metadata>` per strona — Open Graph, Twitter, canonical, hreflang.
45. `[T2-SEO-045]` `app/sitemap.ts` — generowany dynamicznie.
46. `[T2-SEO-046]` `app/robots.ts` — allow / dla marketing, disallow /api, /admin, /(app).
47. `[T2-SEO-047]` `og/[slug]/route.ts` — dynamicznie generowane OG images (Vercel OG).
48. `[T2-SEO-048]` JSON-LD Organization + WebSite na stronie głównej.
49. `[T2-A11Y-049]` Audit: focus visible, aria-labels, kontrast WCAG AA na wszystkich stronach Tier 2.
50. `[T2-ORCH-050]` Smoke E2E (Playwright): rejestracja → potwierdzenie email → login → /dashboard widoczny.

## Definition of Done Tier 2
- [ ] Użytkownik może się zarejestrować, zalogować, zresetować hasło.
- [ ] Landing page renderuje się pixel-perfect zgodnie z chunkami D03–D05, D08.
- [ ] Lighthouse: Performance ≥ 90, A11y ≥ 95, SEO ≥ 95 na `/`.
- [ ] Empty dashboard widoczny po rejestracji.
- [ ] RODO endpoints działają (export + delete).
- [ ] Wszystkie strony statyczne (regulamin etc.) opublikowane.
