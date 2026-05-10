# Krytyczna ocena specyfikacji Mandatomat — co zmieniam / dodaję

## Co specyfikacja robi DOBRZE
1. **Kompletność warstwowa** — od DB schema po pixel-perfect hero. Mało spec dochodzi tak głęboko.
2. **Pipeline AI dwustopniowy** (Sonnet generuje + Haiku waliduje) — sprytnie dzieli koszt/jakość.
3. **Event sourcing** w tabeli `events` — właściwa decyzja dla audytu i analityki.
4. **RLS od dnia 1** — nie da się tego dorobić "później".
5. **Identyfikacja person 4×** z procentami ruchu — pozwala podejmować decyzje produktowe.
6. **Design system Mandatomatu** jest mocno odróżnialny od innych SaaS LexMate24 (Iron + Precision Blue + animacje 150ms = "Bloomberg dla mandatów").

## Czego BRAKUJE / co dodaję
1. **Brak dokumentacji limitów Anthropic** — przy targecie 50–100k MRR można uderzyć w rate-limity. Dodaję queue (BullMQ/Inngest) dla generowania pism.
2. **Brak fallbacku PDF** — Puppeteer w Vercel Functions ma 50MB limit i timeouty. Dodaję alternatywę `@react-pdf/renderer` (in-process, brak chrome).
3. **Brak idempotencji** w `/api/billing/webhook` — Stripe potrafi dostarczyć webhook 2× przy niestabilnym networku. Dodaję `event_id` UNIQUE w tabeli `payments`/`stripe_events`.
4. **Brak observability** — Sentry tak, ale brak structured logging i traces. Dodaję OpenTelemetry → Axiom/Logflare.
5. **Brak rate-limit per-user** na `/api/ai/generate-document` — można nabić kosztów Anthropic. Dodaję Upstash Redis rate-limit (5 req/min/user na generowanie).
6. **Brak kolejki OCR** — Tesseract w API route blokuje request 5–20s. Wynoszę do background job.
7. **PESEL bez szyfrowania per-row** — spec mówi AES-256, ale nie mówi jak. Dodaję `pgcrypto` + Supabase Vault dla klucza.
8. **Brak testów AI promptów** — golden-set + snapshoty. Dodaję `evals/` z 5 case'ami per case_type.
9. **Brak feature flags** — przy 34 typach pism trzeba móc wyłączyć typ bez deploya. Dodaję tabelę `feature_flags` lub PostHog Flags.
10. **Brak strategii migracji typu sprawy** — co gdy zmieniam `form_schema` a użytkownicy mają drafty na starym schemacie? Wersjonuję schemat (`form_schema_version`).

## Co bym ZMIENIŁ vs spec (i obronię w PR)
1. **Stack**: Next.js 14+ ✅. Ale komponenty UI: **shadcn/ui + Radix** (spec OK). Dodaję `cva` (class-variance-authority) — w spec brak, a niezbędne dla design tokens.
2. **Storage migracji**: spec mówi `001_*.sql` … `011_*.sql` w katalogu — OK, ale używam **`supabase migration new`** jako standardu (timestampowane), a ręczne pliki mapuję do tego.
3. **Claude Sonnet 4.6 / Haiku 4.5** — w 2026 te wersje istnieją (wg spec). Jeśli nie, fallback: Claude 3.5 Sonnet + Claude 3.5 Haiku. Konfigurowane przez ENV.
4. **PDF generator** — preferuję **`@react-pdf/renderer`** (działa na edge, brak chrome). Puppeteer jako fallback dla skomplikowanych pism.
5. **Wizard B2C** — spec mówi 3–4 kroki. **Dodaję krok 0** (opcjonalny upload + OCR) — jeśli user wgra zdjęcie mandatu, większość pól auto-fillujemy. Skraca to czas o 60%.
6. **Dashboard** — spec opisuje tabelę. **Dodaję widok kanban-like dla mobile** (status columns: Draft / Wysłane / Wynik).
7. **Onboarding** — spec wspomina "3 ekrany" w Fazie 8. Przesuwam na Fazę 1 (przed pierwszym wizardem), bo bez onboardingu konwersja scoring→zakup spada.
8. **Cennik** — spec ma 2 widoki (rozdz. 9 vs design D05). Konsoliduję: 99 zł / 249 zł pakiet 3 / 349 zł PRO+. Cennik design D05 wygrywa (silniejszy hook).

## Co wycinam z MVP (nice-to-have → V2)
- ePUAP/e-Doręczenia integration → V2 (i tak była w V2 w spec).
- B2B panel → V2 (spec to opisuje, ale na MVP wystarczy zwykły dashboard).
- AI Chat kontekstowy → V2.
- A/B testing cen → V2.
- Subskrypcje Stripe → MVP TYLKO single-payment, subskrypcje w V2 (bo wymaga billing portal, trial, dunning).
- SMS reminders → V2 (email wystarczy na MVP).

## Risk register
| Ryzyko | P | I | Mitigacja |
|---|---|---|---|
| Rate-limit Anthropic na peak | M | H | Queue + retry z backoff |
| Niska jakość OCR polskich pism urzędowych | H | M | Manual fallback + AI parser |
| Stripe fraud (chargebacks na mandaty 79zł × n) | L | M | 3DS + Stripe Radar |
| RODO incident (PESEL leak) | L | C | Szyfrowanie pgcrypto + audit log |
| Skarga prawników "to nieuprawniona porada prawna" | M | H | Disclaimer + "to wzór, weryfikuj" + brak personalizacji prawnej (tylko szablon) |
| Konkurencja kopiuje | H | M | Speed of execution + brand |
| AI hallucination (wymyślone art. KPW) | M | H | Validation prompt + golden set + manual review pierwszych 100 pism |

## Wnioski
Specyfikacja jest **wykonywalna** jako MVP w 6–8 tygodni. Główne luki dotyczą obserwowalności, kolejek i testowania AI. Design system jest unikalny i wart zachowania **bez kompromisów** — ale dodaję **subtelne motion dla AI generation** (typing effect na podglądzie pisma) bo zwiększa perceived speed.
