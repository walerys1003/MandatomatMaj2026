# TIER 7 — ADVANCED AI & PRODUCT EXPANSION (50 zadań)

**Cel:** Druga fala — zaawansowane funkcje AI, nowe produkty (Długomat, ZUS-mat), API publiczne, white-label dla kancelarii.
**Agenci paralelni:** AI ‖ Backend ‖ Frontend ‖ Product ‖ Sales.
**Czas:** 21–30 dni.
**Priorytet:** ŚREDNI-WYSOKI — moat technologiczny.

## 7.1 Advanced AI features (AI + Backend) [12]

1. `[T7-AI-001]` Multi-turn chat z prawnym AI assistant `/asystent` — Claude Sonnet z system prompt + RAG nad bazą wiedzy (chunks T1-T20).
2. `[T7-AI-002]` Vector embeddings — `pgvector` extension, embedding kazdego chunka (Voyage AI lub OpenAI text-embedding-3-small).
3. `[T7-AI-003]` Hybrid search — BM25 (Postgres `tsvector`) + vector cosine, reranking przez Cohere.
4. `[T7-AI-004]` "Wyjaśnij paragraf" — user wkleja paragraf prawa → AI wyjaśnia prostym językiem + przykłady.
5. `[T7-AI-005]` Document comparison — upload 2 PDF (np. 2 wezwania do zapłaty) → diff + AI summary różnic.
6. `[T7-AI-006]` Streaming responses — Server-Sent Events na `/api/ai/generate-document` (UX: tekst pojawia się stopniowo).
7. `[T7-AI-007]` AI confidence calibration — eval na 1000 cases, mierzymy correlation `score` vs actual outcome, kalibracja Platt scaling.
8. `[T7-AI-008]` Prompt caching (Anthropic) — system prompt cache control dla 90% wszystkich wywołań → -50% kosztów.
9. `[T7-AI-009]` Multi-model routing — Haiku dla scoring, Sonnet dla generate, Opus dla edge cases (>=18 lat sprawy starsze).
10. `[T7-AI-010]` Auto-improvement loop — co tydzień AI analizuje 100 najgorszych spraw, sugeruje update'y promptów do admin review.
11. `[T7-AI-011]` Fine-tuned classifier — własny model klasyfikacji case_type z dokumentu (HF Inference API, model `xlm-roberta`).
12. `[T7-AI-012]` Adversarial testing — set 200 trudnych spraw (edge cases, zła gramatyka, nietypowe sytuacje) jako regression eval.

## 7.2 Długomat — pisma do windykatorów (Product + AI) [10]

13. `[T7-DLG-013]` Routing `app.dlugomat.mandatomat.pl` lub subpath `/dlugomat` — nowy produkt w monorepo (`apps/dlugomat`).
14. `[T7-DLG-014]` 8 typów pism: sprzeciw od nakazu zapłaty, ugoda, przedawnienie, RODO usunięcie z KRD/BIK, reklamacja windykatora, skarga komornicza, wniosek o rozłożenie na raty, oświadczenie o przedawnieniu.
15. `[T7-DLG-015]` Prompty Długomat — analogiczna struktura jak Mandatomat, dedykowany `lib/dlugomat/prompts/`.
16. `[T7-DLG-016]` Kalkulator przedawnienia długu — termin 3/6/10 lat zależnie od typu długu (KC art. 118, 125, 731).
17. `[T7-DLG-017]` Integracja z `case_type_config` Mandatomatu — cross-sell wzajemny.
18. `[T7-DLG-018]` Pricing Długomat — 79 PLN/pismo (premium) bo wyższa wartość prawna.
19. `[T7-DLG-019]` Landing Długomat `/dlugomat` — hero, 8 typów, FAQ, pricing, CTA "Sprawdź czy dług przedawniony".
20. `[T7-DLG-020]` Bezpłatny kalkulator `/dlugomat/kalkulator-przedawnienia` — lead magnet, email gate.
21. `[T7-DLG-021]` Współdzielony auth (Supabase) między Mandatomat i Długomat (single sign-on).
22. `[T7-DLG-022]` Dashboard `/dlugomat/panel` — łączna lista spraw z obu produktów.

## 7.3 ZUS-mat — odwołania ZUS/KRUS (Product + AI) [8]

23. `[T7-ZUS-023]` Subdomain/subpath `/zus-mat` — 6 typów pism: odwołanie od decyzji ZUS, sprzeciw od orzeczenia lekarza orzecznika, wniosek o rentę, świadczenie chorobowe, składki KRUS, zwrot składek.
24. `[T7-ZUS-024]` Prompty ZUS-mat — bazują na ustawie systemowej i KPA.
25. `[T7-ZUS-025]` Integracja z procedurą odwoławczą — automatyczne wyliczanie terminów (30 dni od doręczenia).
26. `[T7-ZUS-026]` Wzory załączników — orzeczenie lekarskie, ewidencja lat pracy, świadectwa pracy.
27. `[T7-ZUS-027]` Landing `/zus-mat` + pricing (99 PLN/pismo).
28. `[T7-ZUS-028]` SEO long-tail — "odwołanie od ZUS" search volume 5400/mies (Senuto data).
29. `[T7-ZUS-029]` Partner integration — możliwy partner: kancelaria specjalizująca się w ZUS (revenue share 30/70).
30. `[T7-ZUS-030]` ZUS-specific kalkulator — wysokość emerytury wg lat pracy + składek.

## 7.4 Public API + Webhooks (Backend + DevRel) [10]

31. `[T7-API-031]` Public API `/api/v1/*` — REST + OpenAPI 3.1 spec, auth przez API keys.
32. `[T7-API-032]` API keys management `/profil/api-keys` — generate, revoke, scope per key (scoring/generate/read-only).
33. `[T7-API-033]` Rate limiting per API key — tier zależny (free 100/dzień, pro 10k/dzień).
34. `[T7-API-034]` Webhook delivery — user subscribe na events (`case.created`, `document.generated`, `payment.completed`).
35. `[T7-API-035]` Webhook retry logic — exponential backoff, max 5 prób, dead-letter queue.
36. `[T7-API-036]` API docs site `/api/docs` — Stoplight Elements lub Mintlify (auto z OpenAPI).
37. `[T7-API-037]` SDK JavaScript `@mandatomat/sdk` (npm publish) — typed client.
38. `[T7-API-038]` SDK Python `mandatomat-sdk` (PyPI publish) — równolegle z JS.
39. `[T7-API-039]` Postman collection + Insomnia workspace — auto-generated z OpenAPI.
40. `[T7-API-040]` API status page `/api/status` + uptime monitoring (BetterStack lub własny cron).

## 7.5 White-label dla kancelarii (Product + Sales) [10]

41. `[T7-WL-041]` Tenancy infra — `organizations` table (multi-tenant), każdy user przynależy do org.
42. `[T7-WL-042]` Custom branding per org — logo, kolory, custom domain (Vercel custom domains API).
43. `[T7-WL-043]` Org admin panel `/org/admin` — zarządzanie userami, billing org-level (zamiast user-level).
44. `[T7-WL-044]` Stripe Connect — kancelarie dostają revenue share (np. 70/30) przez Stripe Connect Express.
45. `[T7-WL-045]` Custom templates per org — kancelaria może override prompts lub add custom ones.
46. `[T7-WL-046]` Bulk operations — generate 50 pism naraz dla kancelarii (job queue).
47. `[T7-WL-047]` Org-level analytics — dashboard z metrykami całej organizacji.
48. `[T7-WL-048]` Pricing model B2B — 999 PLN/mies + 20 PLN/pismo (mniej niż retail).
49. `[T7-WL-049]` Sales materials — `docs/sales/B2B_DECK.pdf`, demo video, case studies kancelarii pilotażowych.
50. `[T7-WL-050]` Onboarding kancelarii — kalendarz Calendly + dedicated account manager (manual proces na MVP).

## Definition of Done Tier 7

- [ ] Asystent AI ma > 80% satisfaction (thumbs up).
- [ ] Długomat ma > 100 użytkowników w 30 dni.
- [ ] API ma > 5 zewnętrznych integracji w 60 dni.
- [ ] Min. 3 kancelarie white-label pilot.
- [ ] Prompt caching daje > 40% redukcji kosztów AI.
