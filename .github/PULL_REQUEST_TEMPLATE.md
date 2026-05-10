<!-- Każdy PR MUSI wypełnić wszystkie sekcje. PR-y bez wypełnionego template'u nie będą review'owane. -->

## Task ID
<!-- np. [T1-DB-013] — musi się zgadzać z numerem issue -->
`[T?-???-???]`

Closes #???

## Agent
<!-- Zaznacz krzyżykiem jednego -->
- [ ] `agent-database`
- [ ] `agent-backend`
- [ ] `agent-frontend`
- [ ] `agent-design`
- [ ] `agent-ai`
- [ ] `agent-payments`
- [ ] `agent-notifications`
- [ ] `agent-ocr`
- [ ] `agent-seo`
- [ ] `agent-security`
- [ ] `agent-devops`
- [ ] `orchestrator`

## Tier
- [ ] `tier-1` (Foundation)
- [ ] `tier-2` (Auth + Landing)
- [ ] `tier-3` (Core AI + Wizard)
- [ ] `tier-4` (Payments + Dashboard)
- [ ] `tier-5` (SEO + Polish + Launch)

## Knowledge base chunks used
<!-- Wymień chunki z spec/chunks/ użyte do tego PR. Audit trail decyzji. -->
- `T??_xxx`
- `D??_xxx`

Komenda do reprodukcji kontekstu:
```bash
node spec/index/retrieve.mjs --chunk T??_xxx
```

## Description
<!-- Co ten PR robi? Krótko, konkretnie. -->



## Definition of Done (z planu)
<!-- Skopiuj z plan/02..06_*.md odpowiednie punkty DoD i odhacz. -->
- [ ]
- [ ]
- [ ]

## Test plan
<!-- Jak to zostało zweryfikowane? Komendy, screenshoty, logi. -->

```bash
# Komendy:
pnpm lint
pnpm typecheck
pnpm test <ścieżka>
pnpm build
```

Wynik:
- [ ] Lint green
- [ ] Typecheck green
- [ ] Testy green
- [ ] Build green

## Migration impact (jeśli dotyczy DB)
<!-- Tylko dla agent-database. -->
- [ ] Nie dotyczy
- [ ] Migracja `supabase/migrations/<file>.sql` dodana
- [ ] Migracja `<file>.down.sql` (rollback) dodana
- [ ] `pnpm db:migrate:local` przechodzi
- [ ] `pnpm db:rollback:local` przechodzi
- [ ] RLS dodana (jeśli tabela ma `user_id`)
- [ ] RLS test napisany

## UI impact (jeśli dotyczy frontend/design)
<!-- Tylko dla agent-frontend / agent-design. -->
- [ ] Nie dotyczy
- [ ] Screenshots / GIFs poniżej
- [ ] Storybook story dodana
- [ ] A11y check (axe / lighthouse): score ≥ 90
- [ ] Dark mode tested
- [ ] Mobile (390px) tested

<!-- Wklej screenshoty / nagrania -->

## Security impact (jeśli dotyczy)
- [ ] Nie dotyczy
- [ ] Nowe sekrety dodane do `.env.example` (z placeholder)
- [ ] Issue `needs-secret` otwarte (jeśli production deployment)
- [ ] Rate-limit dodany (jeśli endpoint AI / publiczny)
- [ ] Wrażliwe dane (PESEL, dane osobowe) szyfrowane (`pgcrypto`)
- [ ] Audit log w `events` (jeśli operacja na danych osobowych)

## Breaking changes
- [ ] Brak
- [ ] Tak — opisz poniżej + plan migracji



## Reviewer notes
<!-- Co reviewer (Orchestrator) powinien szczególnie sprawdzić? -->

