# TIER 10 — INTERNATIONAL & ECOSYSTEM (50 zadań)

**Cel:** Ekspansja międzynarodowa (CZ/SK/DE), marketplace prawniczy, AI ekosystem, M&A readiness.
**Agenci paralelni:** Intl ‖ Marketplace ‖ AI ‖ Corporate.
**Czas:** 45–90 dni.
**Priorytet:** NISKI (long-term) — vision/Series A roadmap.

## 10.1 Internacjonalizacja (Intl + Frontend) [12]

1. `[T10-I18N-001]` `next-intl` setup — locale routing `/pl/...`, `/cs/...`, `/sk/...`, `/de/...`.
2. `[T10-I18N-002]` Translation keys — wszystkie UI strings do `messages/{locale}.json` (~2000 keys).
3. `[T10-I18N-003]` Crowdin lub Lokalise integration — workflow tłumaczeń.
4. `[T10-I18N-004]` Locale switcher — w navbarze + auto-detect z `Accept-Language` header.
5. `[T10-I18N-005]` Locale-specific routing — case types per kraj (CZ ma "pokuta", DE "Bußgeld").
6. `[T10-I18N-006]` Currency conversion — Stripe automatic (EUR/CZK), display per locale.
7. `[T10-I18N-007]` Date/number formatting — `Intl.DateTimeFormat`, `Intl.NumberFormat`.
8. `[T10-I18N-008]` RTL support readiness — gdyby kiedyś rozszerzyć na Arabic.
9. `[T10-I18N-009]` SEO hreflang tags — alternate links w head.
10. `[T10-I18N-010]` Local SEO — sitemap per locale, separate Search Console properties.
11. `[T10-I18N-011]` Native speaker review — 3 native PL/CS/SK/DE prawników review tłumaczeń terminów prawnych.
12. `[T10-I18N-012]` Pricing per market — Big Mac index based, PPP adjustment.

## 10.2 Czechy (Intl + Legal) [8]

13. `[T10-CZ-013]` Czech legal research — Zákon o silničním provozu, ČSN normy, Vlast. terminy.
14. `[T10-CZ-014]` 10 typów pism CZ — odvolání proti pokutě, námitka, atd.
15. `[T10-CZ-015]` Czech prompts — Claude w czeskim (test quality).
16. `[T10-CZ-016]` Local partner / lawyer review — kancelaria w Pradze.
17. `[T10-CZ-017]` Domena `mandatomat.cz` lub `pokutomat.cz` — research conflicts.
18. `[T10-CZ-018]` Local payment methods — Stripe + opcja "Twint" (jeśli relevant) lub karta only.
19. `[T10-CZ-019]` GDPR + Czech personal data law — review.
20. `[T10-CZ-020]` Czech ads — Google CZ + Seznam (lokalny search engine).

## 10.3 Niemcy (Intl + Legal) [10]

21. `[T10-DE-021]` German legal research — StVG, BKatV, Anhörungsbogen procedure.
22. `[T10-DE-022]` 15 typów pism DE — Einspruch gegen Bußgeldbescheid, Anhörungsbogen, atd.
23. `[T10-DE-023]` German prompts — Claude w niemieckim (test quality, prawniczy język).
24. `[T10-DE-024]` Lokalny partner — kancelaria w DE specjalizująca się Verkehrsrecht.
25. `[T10-DE-025]` Domena `bussgeld-bot.de` lub similar — DE preferred branding.
26. `[T10-DE-026]` Stripe DE compliance — SEPA, Sofort, Klarna integration.
27. `[T10-DE-027]` Impressum + Datenschutzerklärung — surowe wymogi DE.
28. `[T10-DE-028]` Rechtsdienstleistungsgesetz (RDG) compliance — czy AI generated letters wymagają adwokata?
29. `[T10-DE-029]` Pilot z 100 użytkownikami w Berlin/München przed full launch.
30. `[T10-DE-030]` German content marketing — Anwalt.de, Verkehrsportal.de partnerships.

## 10.4 Marketplace prawniczy (Marketplace + Product) [10]

31. `[T10-MP-031]` "Find a lawyer" — gdy AI nie radzi sobie (edge case), oferta human lawyer (revenue share).
32. `[T10-MP-032]` Lawyer profiles — verified profiles, specializations, ratings, hourly rate.
33. `[T10-MP-033]` Booking system — kalendarz prawników, video call (Daily.co integration).
34. `[T10-MP-034]` Escrow payments — Stripe Connect, hold do delivery, release po confirm.
35. `[T10-MP-035]` Reviews system — po session, mutual rating (user-lawyer).
36. `[T10-MP-036]` Lawyer dashboard — zarobki, oczekujące, kalendarz.
37. `[T10-MP-037]` Pricing — 20% commission Mandatomat, 80% lawyer.
38. `[T10-MP-038]` KYC dla lawyers — uprawnienia OIRP/ORA verification, ID check (Veriff/Onfido).
39. `[T10-MP-039]` Dispute resolution — internal mediation team, escalation to PayPal-style flow.
40. `[T10-MP-040]` Lawyer marketing campaign — outreach do 1000 kancelarii prawnych.

## 10.5 AI ecosystem & M&A (AI + Corporate) [10]

41. `[T10-ECO-041]` Mandatomat Plugin dla ChatGPT — user pyta GPT "Pomóż mi z mandatem", GPT calls Mandatomat API.
42. `[T10-ECO-042]` MCP (Model Context Protocol) server — Claude.ai users mogą connect Mandatomat.
43. `[T10-ECO-043]` Browser extension — Chrome/Firefox/Edge, "Wykryj mandat na stronie WWW".
44. `[T10-ECO-044]` Zapier integration — trigger "new case", action "generate document".
45. `[T10-ECO-045]` Make.com / n8n connectors.
46. `[T10-ECO-046]` Salesforce/HubSpot integration — dla B2B (kancelarie używają tych CRM).
47. `[T10-ECO-047]` Open-source komponenty — `@mandatomat/legal-pl` npm package z public utilities (kalkulator przedawnienia etc.).
48. `[T10-ECO-048]` M&A readiness — data room (financials, legal, IP, team), 3-year forecast, due diligence pack.
49. `[T10-ECO-049]` Series A pitch deck — 15 slides, narrative, market size, traction, ask ($3-5M).
50. `[T10-ECO-050]` Strategic partnerships — talks z PZU/Warta/Allianz (insurance bundle), ZDM/GDDKiA (B2G), media (rynekprawny.pl, Rzeczpospolita) PR.

## Definition of Done Tier 10

- [ ] Min. 1 nowy rynek (CZ/SK/DE) live z > 100 płacącymi.
- [ ] Marketplace z > 20 verified lawyers.
- [ ] Min. 3 ecosystem integracje (ChatGPT Plugin / MCP / Zapier).
- [ ] Data room kompletny, Series A pitch gotowy.
- [ ] M&A interest letter from min. 1 strategic buyer.
