# TIER 4 — PŁATNOŚCI + DASHBOARD + PDF + TERMINY (50 zadań)

**Cel:** Pełen flow płatności (Stripe + faktury), generowanie PDF, dashboard B2C z timeline/widget skuteczności, system terminów + reminder e-mail, panel admin (MVP).
**Agenci paralelni:** Payments (Stripe + Fakturownia) ‖ Backend (PDF + CRON) ‖ Frontend (Dashboard + Timeline) ‖ Notifications.
**Czas:** 7–10 dni.

## 4.1 Stripe checkout + webhook (Payments) [10]
1. `[T4-PAY-001]` `lib/payments/stripe.ts` — wrapper z metodami `createCheckoutSession`, `retrievePaymentIntent`, `refund`.
2. `[T4-PAY-002]` `POST /api/billing/checkout` — z chunka **T10**, walidacja promo_code, sprawdzenie limitu subskrypcji.
3. `[T4-PAY-003]` `POST /api/billing/webhook` — handlery: `checkout.session.completed`, `expired`, `payment_intent.succeeded`. Chunk **T10**.
4. `[T4-PAY-004]` Idempotency: każdy event_id zapisywany w `stripe_events`, drugi raz ignorowany.
5. `[T4-PAY-005]` `POST /api/billing/promo-codes/validate` — sprawdza ważność, max_uses, applicable_products.
6. `[T4-PAY-006]` Strona `/sprawy/[caseId]/platnosc` — preview ceny, kod promocyjny input, przycisk "Zapłać".
7. `[T4-PAY-007]` Strona `/sprawy/[caseId]/pobranie` — success page po Stripe redirect, fetch signed URL PDF.
8. `[T4-PAY-008]` Edge case: użytkownik z subskrypcją (kierowca/PRO+) — bypass Stripe, decrement limit.
9. `[T4-PAY-009]` `lib/payments/fakturownia.ts` — wrapper API, auto-faktura po `payment_succeeded`.
10. `[T4-PAY-010]` Endpoint `/api/billing/invoices` — lista faktur użytkownika + signed URL do PDF.

## 4.2 PDF generator + storage (Backend) [8]
11. `[T4-BE-011]` `lib/pdf/generator.ts` — primary: `@react-pdf/renderer`. Chunk **T11** (HTML→PDF jako fallback).
12. `[T4-BE-012]` `lib/pdf/templates/legal-document.tsx` — react-pdf template: A4, Times 12pt, marginesy 2.5/2/2/3 cm.
13. `[T4-BE-013]` Header z danymi nadawcy (right-aligned), miejscowość + data.
14. `[T4-BE-014]` Body Markdown → react-pdf nodes (mapper: heading/paragraph/list/em/strong).
15. `[T4-BE-015]` Footer "Wygenerowano przez Mandatomat.pl — {data}".
16. `[T4-BE-016]` `POST /api/documents/[docId]/pdf` — render → Storage `documents/{case_id}/{doc_id}_v{version}.pdf` → signed URL 1h. Chunk **T10**.
17. `[T4-BE-017]` Cache PDF — jeśli `documents.storage_path` istnieje, zwróć signed URL bez re-renderingu.
18. `[T4-BE-018]` Watermark "PROJEKT — przed płatnością" na PDF jeśli `payment_status != 'paid'`.

## 4.3 Dashboard użytkownika B2C (Frontend + Design) [12]
19. `[T4-FE-019]` Strona `/dashboard` — header "Panel" + powitanie, alert termin. Chunk **D06**.
20. `[T4-DES-020]` `<MetricsGrid>` — 4 kafle (Pisma w miesiącu / Oczekujące / Uwzględnione / Skuteczność %). Chunk **D06**.
21. `[T4-DES-021]` `<SuccessRateWidget>` — donut + breakdown + sparkline trend 12 tyg. Chunk **D06** + **D08**.
22. `[T4-DES-022]` `<QuickActionBar>` — 5 buttonów shortcut (Nowy mandat / Fotoradar / Parking / ZTM / Inne). Chunk **D08**.
23. `[T4-DES-023]` `<CasesTable>` — desktop: tabela 6 kolumn (Typ / Data / Instytucja / Status / Termin / Akcje). Chunk **D06**.
24. `[T4-DES-024]` `<CasesList>` — mobile: lista kart 64px ze status badge.
25. `[T4-DES-025]` `<StatusBadge>` — wszystkie warianty (draft, paid, sent, waiting, resolved, archived). Chunk **D06**.
26. `[T4-DES-026]` `<DeadlineCountdown>` — kolory wg dni (>14 iron-500, 7-14 amber, <7 signal). Chunk **D06**.
27. `[T4-FE-027]` Strona `/sprawy/[caseId]` — header + tabs (Dokumenty / Terminy / Historia / Szczegóły). Chunk **T14**.
28. `[T4-DES-028]` `<DocumentTimeline>` — horyzontalna timeline 6 punktów (Utworzono → Wygenerowano → Opłacono → Pobrano → Wysłano → Odpowiedź). Chunk **D08**.
29. `[T4-DES-029]` Mobile timeline — pionowa, 10px dots.
30. `[T4-FE-030]` Tab "Historia" — pełny event log z `events` table (timeline pionowy).

## 4.4 System terminów + CRON + email (Backend + Notifications) [10]
31. `[T4-BE-031]` Trigger `set_case_deadline` aktywny — auto-create `deadlines` row. Z chunka **T07**.
32. `[T4-BE-032]` `GET /api/deadlines` — lista terminów użytkownika z filtrowaniem.
33. `[T4-BE-033]` `POST /api/deadlines` — manual deadline (użytkownik dodaje własny).
34. `[T4-BE-034]` `GET /api/deadlines/check` — CRON, Vercel Cron co godzinę, Bearer auth. Chunk **T11**.
35. `[T4-NOTIF-035]` `lib/notifications/email.ts` — Resend wrapper, template `deadline-reminder`.
36. `[T4-NOTIF-036]` Email templates (React Email) — `deadline-d5.tsx`, `deadline-d3.tsx`, `deadline-d1.tsx`, `deadline-d0.tsx`.
37. `[T4-NOTIF-037]` Email template `welcome.tsx` (po rejestracji).
38. `[T4-NOTIF-038]` Email template `payment-success.tsx` (po opłaceniu, z link do PDF).
39. `[T4-FE-039]` Strona `/terminy` — kalendarz miesięczny + lista nadchodzących.
40. `[T4-FE-040]` `<DeadlineWidget>` na dashboardzie — najbliższe 3 terminy z countdown + akcje.

## 4.5 Panel admina MVP (Frontend + Backend) [8]
41. `[T4-ADM-041]` `(admin)/layout.tsx` — sidebar admin, gating `role === 'admin'` (server-side).
42. `[T4-ADM-042]` Strona `/admin/dashboard` — KPI: MRR, nowi użytkownicy, sprawy dziś, conversion. Chunk **T14**.
43. `[T4-ADM-043]` Strona `/admin/uzytkownicy` — tabela + filtry + row drawer ze szczegółami.
44. `[T4-ADM-044]` Strona `/admin/sprawy` — tabela wszystkich spraw + filtry + podgląd pisma.
45. `[T4-ADM-045]` Strona `/admin/platnosci` — lista płatności + dzienne sumy + Stripe link.
46. `[T4-ADM-046]` Strona `/admin/szablony` — lista `case_type_config` + edytor JSON form_schema (Monaco).
47. `[T4-ADM-047]` Strona `/admin/prompty` — Markdown editor per case_type + version history.
48. `[T4-ADM-048]` `/api/admin/stats` — agregaty z `daily_stats` (admin only, service_role bypass RLS).

## 4.6 Polish + tests (Orchestrator + Frontend) [2]
49. `[T4-FE-049]` Loading states — `<Spinner>` (NIE skeleton dla Mandatomatu, chunk **D10**) na każdej async operacji.
50. `[T4-ORCH-050]` E2E Playwright: scenariusz `register → wizard M1 → generate → checkout (test mode) → download PDF`.

## Definition of Done Tier 4
- [ ] Pełen flow `wizard → preview → Stripe checkout → webhook → PDF download` działa end-to-end.
- [ ] Dashboard pokazuje rzeczywiste metryki + listę spraw + widget skuteczności.
- [ ] Terminy auto-tworzone, CRON wysyła email reminders D-5/3/1/0.
- [ ] Panel admin pozwala podejrzeć użytkowników, sprawy, płatności.
- [ ] Faktura Fakturownia auto-generuje się po opłacie.
- [ ] PDF jest A4, Times Roman, drukowalny, ma stopkę.
