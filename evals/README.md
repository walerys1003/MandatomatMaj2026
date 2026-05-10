# Mandatomat — AI Evals (Golden Set)

Harness do testowania promptów AI dla każdego z 34 typów pism.

## Struktura

```
evals/
├── README.md                       (ten plik)
├── runner.ts                       (CLI runner)
├── lib/
│   ├── scorer.ts                   (LLM-as-judge — Haiku 4.5)
│   ├── fixtures.ts                 (loader fixtures)
│   └── types.ts                    (Zod schemas)
├── m1-mandat/                      (Mandat — przekroczenie prędkości)
│   ├── case-001.json               (input + expected)
│   ├── case-002.json
│   └── ...
├── m4-zasloniecie-tablic/
├── p1-strefa-platnego-parkowania/
├── p3-parking-prywatny/
├── w1-windykacja-przedawniona/
└── ... (29 pozostałych typów dodawanych w Tierze 5)
```

## Format fixture (`case-XXX.json`)

```json
{
  "id": "m1-001",
  "case_type": "M1_mandat_predkosc",
  "input": {
    "imie": "Jan",
    "nazwisko": "Kowalski",
    "pesel": "85010112345",
    "adres": "ul. Marszałkowska 1, 00-001 Warszawa",
    "data_mandatu": "2026-04-15",
    "miejsce_mandatu": "ul. Wiejska 4, Warszawa",
    "numer_mandatu": "MK/12345/2026",
    "kwota_mandatu": 500,
    "predkosc_zmierzona": 65,
    "predkosc_dozwolona": 50,
    "powod_odwolania": "wadliwy_pomiar",
    "uzasadnienie_szczegolowe": "Pomiar wykonany w obszarze zabudowanym, ale brak znaku D-43..."
  },
  "expected": {
    "must_contain_keywords": [
      "odwołanie",
      "art. 99 § 1 KPW",
      "wnoszę o uchylenie",
      "Jan Kowalski",
      "MK/12345/2026"
    ],
    "must_contain_sections": [
      "nagłówek (data, miejsce, dane wnoszącego)",
      "adresat (organ wystawiający mandat)",
      "określenie pisma (Odwołanie od mandatu karnego)",
      "uzasadnienie",
      "wnioski",
      "podpis"
    ],
    "must_cite_articles": ["art. 99 § 1 KPW", "art. 92a § 1 PoRD"],
    "min_word_count": 300,
    "max_word_count": 800,
    "tone": "formal-legal-polish",
    "must_not_contain": [
      "halo",
      "cześć",
      "imho",
      "podaję wam"
    ],
    "scoring_threshold": 80
  }
}
```

## Uruchomienie

```bash
# Pojedynczy case
pnpm eval --case m1-mandat-001

# Wszystkie case'y dla typu
pnpm eval --type m1-mandat

# Wszystkie z tieru
pnpm eval --tier 3

# Pełny suite (gating dla deploy production)
pnpm eval --all

# Z konkretną wersją promptu
pnpm eval --type m1-mandat --version v2

# Verbose (pokazuje wygenerowany tekst)
pnpm eval --type m1-mandat --verbose
```

## Scorer (LLM-as-judge)

Używamy **Claude Haiku 4.5** (tańsze) jako judge'a, który ocenia:

| Wymiar | Skala | Waga |
|---|---|---|
| **Compliance** (czy zawiera wymagane sekcje, art., keywords) | 0–100 | 40% |
| **Legal accuracy** (czy cytaty art. są poprawne, czy uzasadnienie ma sens) | 0–100 | 30% |
| **Structure** (czy ma nagłówek, adresata, podpis itd.) | 0–100 | 15% |
| **Tone** (czy formalny, polski prawniczy) | 0–100 | 10% |
| **No hallucination** (czy nie zmyślił art., danych) | 0–100 | 5% |

**Scoring threshold: 80** — case pass jeśli ważona suma ≥ 80.

## Definition of Done dla evals (per case_type)

- [ ] ≥ 5 fixtures (case-001 do case-005)
- [ ] Każdy fixture przechodzi `pnpm eval --case <id>` z scoring ≥ 80
- [ ] Pokrycie różnych scenariuszy (typowy, edge case, brakujące pole, długie uzasadnienie)
- [ ] Średni scoring across 5 fixtures ≥ 85
- [ ] Output deterministyczny przy `temperature: 0` (test 3× — różnica < 5 pts)

## Reżim pracy z promptami

1. Wersjonuj prompty: `apps/web/lib/ai/prompts/<type>/v1.ts`, `v2.ts`...
2. Każda zmiana = nowa wersja, nigdy nie nadpisuj
3. Przed promocją wersji `vN+1` do default: `pnpm eval --type <type> --version vN+1` musi być ≥ baseline
4. Feature flag `prompt_version_<type>` w `feature_flags` table dla canary releases (10% userów na vN+1)

## CI integration

W `.github/workflows/ci.yml` (Tier 5):
```yaml
evals:
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - run: pnpm eval --all
  # blokuje deploy production jeśli failed
```

## Edge cases do pokrycia (każdy typ pisma)

1. **Happy path** — pełne dane, typowy scenariusz
2. **Brakujące dane opcjonalne** — np. brak numeru mandatu (mandat ustny)
3. **Edge case prawny** — np. mandat już prawomocny (powinien odmówić generacji lub zaznaczyć)
4. **Długie uzasadnienie** — 2000+ znaków user input, czy nie ucina kontekstu
5. **Wieloznaczne** — np. "wadliwy pomiar" + "brak znaku" jednocześnie

## Anty-pattern: NIE testuj UI w evals

Evals testują **tylko output AI**. UI (formularz, wizard) testuj w E2E (Playwright) w `apps/web/e2e/`.

---

**Status:** harness do utworzenia w Tierze 3 (`[T3-AI-???]`). Pierwsze 5 typów (M1, M4, P1, P3, W1) musi mieć evals przed Tierem 4.
