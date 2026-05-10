# Mandatomat — Maj 2026

> **Polski SaaS LegalTech** generujący pisma prawne (odwołania od mandatów, parkingowych, windykacyjnych, ubezpieczeniowych, e-TOLL, kontroli, technicznych) przy pomocy AI (Claude Sonnet 4.6 + Haiku 4.5).

To repozytorium zawiera **kompletną specyfikację, krytyczną ocenę i plan wykonania** projektu Mandatomat — gotowe do podania w ręce **GenSpark AI Developer** jako autonomicznemu zespołowi inżynierskiemu.

## 🎯 Punkt startowy

**Otwórz plik [`PROMPT_FOR_GENSPARK_AI_DEVELOPER.md`](./PROMPT_FOR_GENSPARK_AI_DEVELOPER.md)** — tam jest gotowy prompt do skopiowania.

## 📁 Struktura repo

```
.
├── PROMPT_FOR_GENSPARK_AI_DEVELOPER.md   ← GŁÓWNY DELIVERABLE
├── plan/                                  ← Plan wykonania (5 tierów × 50 zadań = 250)
│   ├── README.md                          (overview)
│   ├── 00_critical_review.md              (krytyka spec + risk register)
│   ├── 01_orchestration_strategy.md       (DAG agentów paralelnych)
│   ├── 02_tier1_foundation.md             (50 zadań — repo, DB, design tokens)
│   ├── 03_tier2_auth_landing.md           (50 zadań — auth, landing, profil)
│   ├── 04_tier3_core_ai.md                (50 zadań — wizard, Claude, OCR)
│   ├── 05_tier4_payments_dashboard.md     (50 zadań — Stripe, dashboard)
│   └── 06_tier5_seo_polish_launch.md      (50 zadań — SEO, security, launch)
└── spec/                                  ← Baza wiedzy (semantic chunks)
    ├── raw/                               (oryginalne pliki spec — referencja)
    ├── chunks/                            (30 chunków: T01–T20 + D01–D10)
    └── index/
        ├── chunks_index.json              (metadane wszystkich chunków)
        ├── tag_index.json                 (133 tagi → chunki)
        ├── agent_index.json               (14 agentów → chunki)
        ├── retrieval_guide.md             (jak korzystać z bazy)
        └── retrieve.mjs                   (CLI helper do selective retrieval)
```

## 🧠 Filozofia bazy wiedzy (RAG)

Specyfikacja ma ~80 stron. **Nie ładuj całości** do każdej sesji AI. Zamiast tego:

```bash
# Pobierz tylko chunki potrzebne do konkretnego zadania
node spec/index/retrieve.mjs --task "build wizard with breadcrumb tabs"
node spec/index/retrieve.mjs --tag stripe
node spec/index/retrieve.mjs --agent backend
node spec/index/retrieve.mjs --chunk D03_hero_section
```

Każdy task w plikach tieru ma już wskazane chunki w polu **„Z chunka **TXX**"** — to jest minimum kontekstu wymagane do tego zadania.

## 🏗️ Stack docelowy (do implementacji)

- **Framework:** Next.js 14 App Router + TypeScript (strict)
- **UI:** Tailwind + shadcn/ui + Radix
- **DB / Auth:** Supabase (Postgres 15 + RLS + pgcrypto)
- **AI:** Anthropic Claude (Sonnet 4.6 generuje, Haiku 4.5 waliduje)
- **Płatności:** Stripe + Fakturownia
- **PDF:** `@react-pdf/renderer` (primary) + Puppeteer (fallback)
- **OCR:** Tesseract.js w background (Inngest/BullMQ + Upstash Redis)
- **Email:** Resend
- **Hosting:** Vercel (region `fra1`)
- **Monitoring:** Sentry + Axiom

## 🎨 Design system — kierunek

**Iron (zinc neutrals) + Precision Blue `#2563EB` + Volt Green** + Inter Tight + animacje 150ms.
Pełen direction w `spec/chunks/D01–D10`. Cel: poziom Linear / Stripe / Vercel — nie polski LegalTech.

## 📊 Scope MVP

- **34 typy pism** w 7 kategoriach (Mandaty, Parking, Windykacja, Ubezpieczenia, e-TOLL, Kontrole, Techniczne)
- **15 migracji SQL** Supabase (12 z spec + 3 dodane: pgcrypto, idempotency, feature_flags)
- **~30 API routes**, **~70 komponentów React**, **~40 stron**
- **Czas wdrożenia paralelnie:** 5–6 tygodni

## ✅ Status projektu

- [x] Specyfikacja przeczytana i przeanalizowana
- [x] Baza wiedzy zbudowana (30 chunków + indeksy + CLI helper)
- [x] Krytyczna ocena spec + risk register
- [x] Plan 5 × 50 = 250 zadań rozpisany
- [x] Strategia orkiestracji + DAG paralelizmu
- [x] Prompt dla GenSpark AI Developer wygenerowany
- [ ] Implementacja (Tier 1 → 5) — start gdy GenSpark dostanie prompt

## 🚀 Następny krok

1. Skopiuj zawartość `PROMPT_FOR_GENSPARK_AI_DEVELOPER.md` do GenSpark AI Developer.
2. Połącz GenSpark z tym repo.
3. Dostarczaj sekrety na żądanie (label `needs-secret`).
4. Review PR-ów z `main` (każdy PR = jedno zadanie z planu).

---

**Licencja:** Proprietary. Wszelkie prawa zastrzeżone.
**Kontakt:** operator projektu Mandatomat.
