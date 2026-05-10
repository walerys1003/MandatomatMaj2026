# 14-16. Roadmap wdrożenia + Instrukcje dla AI Agent + KPI

**Chunk ID:** `T20_roadmap_instrukcje`
**Source:** tech (lines 2983-3162)
**Tags:** roadmap, fazy, instrukcje, kpi, kontekst
**Target Agents:** orchestrator

---

Faza 0: Setup (Dzień 1-2)
□ Utworzenie repo GitHub
□ Inicjalizacja Next.js 14 + TypeScript + Tailwind + shadcn/ui
□ Konfiguracja Supabase (Cloud lub self-hosted)
□ Wykonanie migracji 001-011
□ Konfiguracja zmiennych środowiskowych
□ Deployment pipeline na Vercel
□ Konfiguracja Sentry + PostHog

Faza 1: Core + Auth + Landing (Dzień 3-7)
□ Supabase Auth (rejestracja, logowanie, reset)
□ Middleware (auth routes protection)
□ Landing page (hero, features, jak to działa, FAQ, footer)
□ Layout aplikacji (sidebar, navbar)
□ Profil użytkownika (CRUD)
□ Podstawowy dashboard (puste stany)

Faza 2: Formularz + AI (Dzień 8-14)
□ Dynamic Form engine (komponent + Zod schema builder)
□ Konfiguracja case_type_config (seed 5 pierwszych typów: M1, M4, P1, P3, W1)
□ Claude API wrapper (generate + scoring + validate)
□ Prompty dla 5 typów (pliki .md)
□ API: /api/ai/scoring
□ API: /api/ai/generate-document
□ Scoring page (formularz + gauge + CTA)
□ Wizard formularza (3 kroki)
□ Podgląd Markdown + edytor

Faza 3: PDF + Płatności (Dzień 15-20)
□ PDF generator (Puppeteer)
□ API: /api/documents/[docId]/pdf
□ Stripe integration (Checkout + Webhook)
□ API: /api/billing/checkout + webhook
□ Fakturownia integration (auto-faktury)
□ Flow: formularz → generuj → podgląd → płać → pobierz PDF
□ Kody promocyjne (CRUD admin + walidacja checkout)

Faza 4: Terminy + Powiadomienia (Dzień 21-25)
□ System terminów (auto z case_type_config)
□ CRON: /api/deadlines/check (Vercel CRON lub external)
□ Resend integration (email templates)
□ SMSAPI integration (V2 — opcjonalnie MVP)
□ Widget terminów w dashboard
□ Strona terminów użytkownika

Faza 5: OCR (Dzień 26-29)
□ File upload komponent (drag&drop + preview)
□ Supabase Storage upload
□ Tesseract.js OCR (server-side)
□ Claude Haiku parser (OCR text → JSON)
□ Auto-fill formularza z OCR danych
□ API: /api/ocr/upload + /api/ocr/parse

Faza 6: Rozszerzenie katalogu (Dzień 30-40)
□ Dodanie pozostałych 29 typów pism (prompty .md + form_schema JSON)
□ Seedy case_type_config dla wszystkich 34 typów
□ Strony SEO per case_type (/odwolanie-od-mandatu-za-predkosc etc.)
□ Blog: 5 pierwszych artykułów (2000+ słów)
□ Structured Data (JSON-LD) na stronach SEO
□ Sitemap.xml + robots.txt

Faza 7: Panel admina (Dzień 41-48)
□ Admin layout (sidebar + header)
□ Dashboard (KPI, wykresy)
□ CRUD użytkownicy
□ CRUD sprawy (podgląd + status management)
□ CRUD szablony (edytor form_schema + prompt)
□ CRUD kody promocyjne
□ Analityka (funnel, przychody, AI costs)
□ Eksport CSV

Faza 8: Polish + Launch (Dzień 49-56)
□ Onboarding flow (3 ekrany po rejestracji)
□ Empty states (piękne komunikaty gdy brak danych)
□ Error handling (error boundaries, fallback UI)
□ Loading states (skeletony + spinners)
□ Performance: Lighthouse audit (target: 90+ wszystkie)
□ Accessibility: keyboard nav, screen reader, focus traps
□ Mobile testing (Safari, Chrome Android)
□ E2E testy (Playwright — happy path: register → scoring → form → pay → download)
□ Security audit (headers, CORS, rate limits)
□ Regulamin + Polityka prywatności (strony)
□ OG images per strona SEO
□ 301 redirecty z wariantów URL
□ Google Search Console + Analytics setup
� LAUNCH �

Faza 9: Post-launch (Miesiąc 2-3)
□ Feedback loop: widget "Oceń pismo" (1-5 gwiazdek + outcome)
□ Subskrypcja "Kierowca" (Stripe recurring)
□ A/B testing cen (Stripe Price variants)
□ e-wysyłka (ePUAP/e-Doręczenia) — V2
□ AI Chat kontekstowy ("Co dalej?") — V2
□ Blog: 10+ artykułów SEO
□ Cross-sell banner do Długomatu/Alimentomatu
□ Referral system (polecenie = 20% zniżka)

15. INSTRUKCJE DLA AI CODE AGENT (Kilo Code / Genspark)
15.1 Kontekst sesji (wklej jako pierwszy prompt sesji)
KONTEKST PROJEKTU:
Budujesz Mandatomat.pl — SaaS LegalTech generujący pisma procesowe (odwołania od mandatów, 
reklamacje parkingowe, sprzeciwy od nakazów zapłaty) z pomocą AI.

STACK: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Claude API + Stripe + Puppeteer

KONWENCJE:
- TypeScript strict, no any
- Pliki: kebab-case, Komponenty: PascalCase
- Walidacja: Zod
- CSS: Tailwind utility + shadcn/ui, zero custom CSS
- API routes w app/api/
- Prompty AI: pliki .md w lib/ai/prompts/

AKTUALNY ETAP: [wpisz fazę z roadmapy]

PRZECZYTAJ SPECYFIKACJE:
- docs/spec/00-index.md (spis treści)
- docs/spec/01-architektura.md (stack i struktura)
- docs/spec/04-mandatomat.md (TEN PLIK — główna specyfikacja)

DZISIEJSZE ZADANIE: [opisz konkretne zadanie]

15.2 Zasady dla agenta
1. Przed implementacją ZAWSZE sprawdź schemat bazy danych (docs/spec/08-db-schema.md)
2. Przed tworzeniem komponentu sprawdź czy nie istnieje w shadcn/ui
3. Każdy nowy API route MUSI mieć: auth check, Zod validation, error handling, event logging
4. Każdy nowy komponent formularza MUSI używać Dynamic Form engine
5. Prompty AI ZAWSZE w plikach .md (nie inline w kodzie)
6. NIE instaluj nowych dependencji bez pytania — najpierw sprawdź czy jest w Next.js/Supabase
7. Przy zmianach bazy danych — twórz nową migrację SQL (nie modyfikuj istniejących)
8. Testuj na danych z seeda, nie na produkcji
9. Komentarze w kodzie: po angielsku, zwięzłe, tylko gdy nieoczywiste
10. Commit message: Conventional Commits (feat: add scoring endpoint)

15.3 Optymalizacja tokenów
Specyfikacja jest podzielona na moduły. W każdej sesji ładuj TYLKO relewantne pliki:
* Pracujesz nad formularzami? → 04-mandatomat.md(http://04-mandatomat.md/) (sekcja 9: Katalog pism)
* Pracujesz nad API? → 04-mandatomat.md(http://04-mandatomat.md/) (sekcja 4: Backend) + 08-db-schema.md(http://08-db-schema.md/)
* Pracujesz nad UI? → 04-mandatomat.md(http://04-mandatomat.md/) (sekcja 5: Frontend + sekcja 13: Design System)
* Pracujesz nad AI/promptami? → 04-mandatomat.md(http://04-mandatomat.md/) (sekcja 8: System AI)
* Pracujesz nad adminem? → 04-mandatomat.md(http://04-mandatomat.md/) (sekcja 7: Panel admina)
* Pracujesz nad płatnościami? → 04-mandatomat.md(http://04-mandatomat.md/) (sekcja 4.3: Stripe routes)
NIE ładuj pełnej specyfikacji do każdego promptu. Ładuj 00-index.md(http://00-index.md/) (1 strona) + 1-2 relewantne sekcje.
16. PODSUMOWANIE KLUCZOWYCH METRYK PRODUKTU
---------------------------------------------
| |Metryka | |Wartość |
---------------------------------------------
| |Typy pism | |34 (30 płatnych + 4 techniczne) |
---------------------------------------------
| |Kategorie | |7 |
---------------------------------------------
| |Cena bazowa | |79 zł |
---------------------------------------------
| |Cena najwyższa | |149 zł (sprzeciw EPU) |
---------------------------------------------
| |ARPU szacowany | |109 zł |
---------------------------------------------
| |Koszt generowania pisma | |0.08–0.25 PLN (API Claude) |
---------------------------------------------
| |Marża na piśmie | |99%+ |
---------------------------------------------
| |Czas generowania | |<30 sekund |
---------------------------------------------
| |Czas użytkownika (formularz + edycja) | |3–5 minut |
---------------------------------------------
| |Darmowy magnes | |Scoring szans (0–100%) |
---------------------------------------------
| |Tabele w bazie | |12 |
---------------------------------------------
| |API routes | |~25 |
---------------------------------------------
| |Komponenty React | |~50 |
---------------------------------------------
| |Pliki promptów AI | |34+ |
---------------------------------------------
| |Stron SEO (long-tail) | |17+ |
---------------------------------------------
| |Szacowany czas wdrożenia MVP | |8 tygodni (solo dev z AI agent) |
Ta specyfikacja to kompletna instrukcja wdrożeniowa. Każda sekcja jest wystarczająco szczegółowa, żeby AI Code Agent (Kilo Code z Claude Opus 4.6) mógł implementować moduł po module, bez zgadywania. Struktura plików, schematy bazy danych, endpointy API, prompty AI, cenniki, reguły terminów, design system — wszystko jest zdefiniowane.
Zacznij od Fazy 0 (setup repo + migracje), potem Faza 1 (auth + landing), i idź sekwencyjnie. Każda faza to 5-7 dni przy pracy z agentem AI kodującym.