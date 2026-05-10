# TIER 9 — INTELLIGENCE & DATA (50 zadań)

**Cel:** Data warehouse, advanced analytics, ML models własne, recommendation engine, predictive analytics.
**Agenci paralelni:** Data ‖ ML ‖ Backend ‖ Product.
**Czas:** 30–45 dni.
**Priorytet:** ŚREDNI — competitive advantage długoterminowy.

## 9.1 Data warehouse & ETL (Data) [10]

1. `[T9-DW-001]` BigQuery lub Snowflake setup — wybór po cost analysis (BQ tańszy dla małego volume).
2. `[T9-DW-002]` ETL pipeline Supabase → DWH — Airbyte lub własny Fivetran-like (cron daily).
3. `[T9-DW-003]` `fact_cases`, `fact_documents`, `fact_payments`, `dim_users`, `dim_case_types`, `dim_dates` — star schema.
4. `[T9-DW-004]` dbt models — `staging` → `intermediate` → `marts` (finance, product, growth).
5. `[T9-DW-005]` Anonimizacja PII w DWH — PESEL zostaje hash, email tokenized.
6. `[T9-DW-006]` Stripe data sync — Stripe Sigma lub własny webhook → DWH.
7. `[T9-DW-007]` Plausible/PostHog → DWH eksport (events grain).
8. `[T9-DW-008]` Sentry → DWH (errors per release).
9. `[T9-DW-009]` Anthropic usage → DWH (cost per case_type, per user, per day).
10. `[T9-DW-010]` Data quality monitoring — Great Expectations testy (null counts, schema drift).

## 9.2 BI & dashboards (Data + Product) [10]

11. `[T9-BI-011]` Metabase lub Lightdash deployment — self-hosted na Hetzner Cloud.
12. `[T9-BI-012]` Exec dashboard — MRR, ARR, MAU, CAC, LTV, churn, NPS (top 10 KPI).
13. `[T9-BI-013]` Product dashboard — funnel visit→signup→case→paid, retention cohorts.
14. `[T9-BI-014]` Growth dashboard — referral conversion, paid channels ROI, organic vs paid.
15. `[T9-BI-015]` AI cost dashboard — koszt per case_type, per model, alerty budget.
16. `[T9-BI-016]` Customer success dashboard — top 100 power users, churn risk, expansion candidates.
17. `[T9-BI-017]` Case outcome dashboard — % win rate per case_type (jeśli user oznaczył outcome).
18. `[T9-BI-018]` Cohort retention — D1/D7/D30/D90 per signup month.
19. `[T9-BI-019]` Funnel analysis — drill-down do drop-off na każdym kroku wizard.
20. `[T9-BI-020]` SQL playground dla power users — read-only access do mart layer.

## 9.3 Recommendation engine (ML) [10]

21. `[T9-ML-021]` Next-best-action — po pierwszym case, rekomendacja kolejnego (collaborative filtering, item-item similarity).
22. `[T9-ML-022]` Case type prediction — user opisuje sprawę 1 zdaniem → classifier predicts case_type (top 3 z confidence).
23. `[T9-ML-023]` Pricing optimization — A/B test cen per segment (cohort × case_type), Bayesian bandits.
24. `[T9-ML-024]` Churn prediction model — XGBoost na features (login frequency, cases count, payment history) → prob(churn 30d).
25. `[T9-ML-025]` LTV prediction — model na pierwsze 30 dni → expected LTV 12 mies.
26. `[T9-ML-026]` Optimal send time — email send time per user (hour ML model na open rates).
27. `[T9-ML-027]` Content recommendations — sugerowane artykuły blog na podstawie browsed kategorii.
28. `[T9-ML-028]` Search ranking — `/szukaj` z BM25 + learning-to-rank na clickthrough data.
29. `[T9-ML-029]` Anomaly detection — wykrywanie nietypowych wzorców (fraud, abuse).
30. `[T9-ML-030]` Model registry — MLflow lub własny, każdy model wersjonowany + A/B traffic split.

## 9.4 Predictive analytics & insights (ML + Product) [10]

31. `[T9-PRED-031]` "Szansa wygranej" precision update — model na real outcomes (jeśli user oznaczył wygrana/przegrana).
32. `[T9-PRED-032]` Expected processing time — ile dni urząd odpowie? Model na historical data.
33. `[T9-PRED-033]` Optimal pricing — predict willingness to pay per case_type per region.
34. `[T9-PRED-034]` Demand forecasting — ile spraw oczekiwać w kolejnym tygodniu (Prophet/ARIMA).
35. `[T9-PRED-035]` Geo insights — heatmapa Polski z hot zones (które miasta najwięcej mandatów).
36. `[T9-PRED-036]` Trend reports — kwartalny PDF "Stan mandatów w PL" jako lead magnet (PR/media coverage).
37. `[T9-PRED-037]` Personalized insights email — miesięczny raport per user "Twoja statystyka".
38. `[T9-PRED-038]` Predictive deadline alerts — "Termin za 3 dni" gdy AI wie z OCR daty doręczenia.
39. `[T9-PRED-039]` Smart notifications — wybór czasu/kanału (email/push/SMS) per user behavior.
40. `[T9-PRED-040]` Case success replay — top 100 wygranych spraw → publiczna baza wzorów (anonimizowana).

## 9.5 Experimentation platform (Data + Product) [10]

41. `[T9-EXP-041]` A/B testing infra — własny lub GrowthBook, server-side experiment assignment.
42. `[T9-EXP-042]` Statistical engine — frequentist + Bayesian, MDE calculator.
43. `[T9-EXP-043]` Experiment registry — `experiments` table (hypothesis, status, variants, metrics, results).
44. `[T9-EXP-044]` Multi-armed bandits — Thompson sampling dla optimization (vs A/B tradycyjnego).
45. `[T9-EXP-045]` Holdout group — 5% userów zawsze widzi baseline (eternal control).
46. `[T9-EXP-046]` Feature flags + experiments integration — feature flag = treatment assignment.
47. `[T9-EXP-047]` Experiment review process — eng + product + design sign-off przed launch.
48. `[T9-EXP-048]` Post-experiment analysis template — `docs/experiments/TEMPLATE.md`.
49. `[T9-EXP-049]` Experimentation training — 3 warsztaty dla teamu (designing experiments, reading results).
50. `[T9-EXP-050]` Public experiments log `/transparentnosc/eksperymenty` — quarterly, dla transparentności.

## Definition of Done Tier 9

- [ ] DWH refresh < 1h dla 99% dni.
- [ ] Top 20 KPI w dashboardach refreshed daily.
- [ ] Recommendation engine A/B vs baseline +10% CTR.
- [ ] Churn model AUC > 0.75.
- [ ] Min. 1 eksperyment / tydzień zakończony decyzją.
