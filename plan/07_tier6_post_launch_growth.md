# TIER 6 — POST-LAUNCH GROWTH (50 zadań)

**Cel:** Po publikacji MVP — pierwsza fala wzrostu: onboarding optymalizacja, conversion funnels, referral program, content marketing, customer support, retencja.
**Agenci paralelni:** Growth ‖ Frontend ‖ Backend ‖ Content ‖ Support.
**Czas:** 14–21 dni.
**Priorytet:** WYSOKI — bez tego MVP nie wzrośnie.

## 6.1 Onboarding optimization (Growth + Frontend) [10]

1. `[T6-ONB-001]` A/B test landing hero — wariant A "Bez prawnika w 5 minut" vs B "Sprawdź szanse za darmo" (Plausible goals).
2. `[T6-ONB-002]` Welcome email drip campaign — 5 wiadomości w 7 dni (Resend + cron):
   - Day 0: Witaj + tutorial video link
   - Day 1: "Pierwsza sprawa za darmo (scoring)"
   - Day 3: Case study sukcesu
   - Day 5: Porady prawne (link do bloga)
   - Day 7: Rabat 20% jeśli nie kupił.
3. `[T6-ONB-003]` In-app tooltip tour (`shepherd.js` lub własny) — 5 kroków na `/sprawy/nowa`.
4. `[T6-ONB-004]` Empty state CTA na `/panel` (jeśli `cases.length === 0`) → "Sprawdź szanse za darmo" + 3 najpopularniejsze typy spraw.
5. `[T6-ONB-005]` Progress bar w wizardzie (step 1/3, 2/3, 3/3) z liczbą sekund average per step (telemetria z PostHog).
6. `[T6-ONB-006]` "Skip OCR" CTA jeśli user > 15 sekund przy uploadzie — przekierowanie do ręcznego wypełnienia.
7. `[T6-ONB-007]` Gamifikacja — badge "Pierwsza sprawa", "5 spraw", "Pro user" widoczne w `/profil`.
8. `[T6-ONB-008]` Push notification permission ask — TYLKO po pierwszej wygranej sprawie (max 1× ever).
9. `[T6-ONB-009]` Smart defaults — jeśli user już ma case typu M1, kolejny case prefilluje imię/nazwisko/adres.
10. `[T6-ONB-010]` Onboarding metrics dashboard `/admin/onboarding` — funnel: visit → signup → first case → first paid (D1/D7/D30).

## 6.2 Conversion funnels (Growth + Backend) [10]

11. `[T6-CVR-011]` `/sprawdz-szanse` → paywall — jeśli score > 60 i user anon, modal "Zarejestruj się aby wygenerować pismo".
12. `[T6-CVR-012]` Exit-intent modal na `/sprawy/.../formularz` — "Zostaw email, wyślemy szablon za darmo".
13. `[T6-CVR-013]` Stripe Checkout → po success: cross-sell follow-up (Długomat, ZUS-mat) inline na thank-you page.
14. `[T6-CVR-014]` Abandoned cart recovery — Stripe Checkout Session created ale unfinished → email po 1h z linkiem powrotu.
15. `[T6-CVR-015]` Discount codes infra — `promo_codes` table (`code`, `discount_pct`, `valid_until`, `max_uses`, `used_count`) + UI w Stripe Checkout.
16. `[T6-CVR-016]` Pricing page A/B test — 2 plany (Free 0zł/Pro 49zł) vs 3 plany (Free/Standard/Pro).
17. `[T6-CVR-017]` Social proof — "X osób wygenerowało pismo dziś" live counter (Vercel KV).
18. `[T6-CVR-018]` Trust badges na pricing — Stripe secure logo, RODO compliant, "Zwrot 14 dni".
19. `[T6-CVR-019]` First-time user discount — automatic 30% off pierwszego pisma (Stripe coupon).
20. `[T6-CVR-020]` Conversion API webhook → Plausible custom event `payment_completed` z `value` w PLN.

## 6.3 Referral & sharing (Growth + Backend) [8]

21. `[T6-REF-021]` Referral program — `referrals` table (`referrer_user_id`, `referee_user_id`, `reward_pln`, `status`).
22. `[T6-REF-022]` Unique referral URL `mandatomat.pl/r/{user_short_id}` — middleware ustawia cookie 30 dni.
23. `[T6-REF-023]` Reward logic — gdy referee kupi pierwsze pismo, referrer dostaje 20 PLN credit (Stripe coupon lub balance).
24. `[T6-REF-024]` UI `/profil/poleceni` — lista poleconych, stan nagród, share buttons (FB/WhatsApp/email).
25. `[T6-REF-025]` Email template "Polecaj i zarabiaj" do existing users (1× po pierwszej wygranej sprawie).
26. `[T6-REF-026]` Anti-fraud — limit 10 nagród per user, weryfikacja IP/device fingerprint.
27. `[T6-REF-027]` Share success — po "wygraj/uchyl" guzik "Podziel się sukcesem" (anonimowy testimonial → moderacja → /opinie).
28. `[T6-REF-028]` Public testimonials wall `/opinie` — moderowane, JSON-LD `Review` schema.

## 6.4 Content marketing infra (Content + Backend) [8]

29. `[T6-CMS-029]` Migracja blog z MD plików → Supabase tabela `blog_posts` (lepszy admin editing).
30. `[T6-CMS-030]` Admin `/admin/blog` — lista, create/edit, preview, publish/draft toggle (markdown + frontmatter).
31. `[T6-CMS-031]` Auto-RSS feed `/blog/feed.xml` + sitemap z lastmod.
32. `[T6-CMS-032]` Newsletter subscribe form — Resend Audience API + double opt-in.
33. `[T6-CMS-033]` Weekly newsletter (cron sob 10:00) — top 3 nowe artykuły + 1 case study + CTA.
34. `[T6-CMS-034]` Content calendar `/admin/blog/kalendarz` — planowanie publikacji 4 tyg do przodu.
35. `[T6-CMS-035]` AI assist dla blog — `/admin/blog/nowy?ai=true` generuje draft z Claude na podstawie keyword + outline.
36. `[T6-CMS-036]` 10 kolejnych artykułów blog (z wewnętrznym linkowaniem do `/kategoria/[slug]` i `/poradnik/[slug]`).

## 6.5 Customer support (Support + Backend) [7]

37. `[T6-SUP-037]` Help Center `/pomoc` — accordion z 30 pytaniami FAQ (RODO, zwroty, jak działa, prawne).
38. `[T6-SUP-038]` Contact form `/kontakt` — Resend email do support@mandatomat.pl + auto-reply + ticket id.
39. `[T6-SUP-039]` Tickets table + admin `/admin/tickety` (status: open/in_progress/closed, priority, assigned_to).
40. `[T6-SUP-040]` In-app chat widget — Crisp lub Front (lazy load, gated by consent).
41. `[T6-SUP-041]` Canned responses library — admin szablony odpowiedzi (top 20 FAQ).
42. `[T6-SUP-042]` SLA tracking — pierwsza odpowiedź < 4h business hours (alert Slack).
43. `[T6-SUP-043]` Status banner na `/status` — manual incident reporting z admin UI.

## 6.6 Retention & churn (Growth + Backend) [7]

44. `[T6-RET-044]` Inactivity email — 14 dni bez logowania → "Wracaj, masz X spraw w toku".
45. `[T6-RET-045]` Win-back campaign — anulowana subskrypcja → 30% off na 3 miesiące (Stripe coupon).
46. `[T6-RET-046]` NPS survey — 30 dni po pierwszym paid → modal "Polećbyś Mandatomat? 0-10".
47. `[T6-RET-047]` Churn prediction — heurystyka: 0 spraw w 30 dni + Pro plan → flag w admin + outreach.
48. `[T6-RET-048]` Subscription pause — "Pauzuj na 1/2/3 miesiące" zamiast cancel (Stripe `pause_collection`).
49. `[T6-RET-049]` Cancellation survey — przed potwierdzeniem cancel, modal "Dlaczego? (cena/funkcjonalność/inne)".
50. `[T6-RET-050]` Loyalty rewards — 6 mies. ciągłej subskrypcji = darmowy miesiąc bonus.

## Definition of Done Tier 6

- [ ] A/B testy mają min. 95% confidence po 2 tyg.
- [ ] Drip email open rate > 25%, CTR > 5%.
- [ ] Referral program: min. 5% userów polec kogoś.
- [ ] Newsletter subscribers > 500 w 30 dni.
- [ ] Help Center pokrywa top 80% pytań support.
- [ ] NPS > 40, churn < 5%/mies.
