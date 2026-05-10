-- Migration 017: Documents — kolumny walidacji AI
-- Source: Tier 3 chunk T11 (validateDocument przez Haiku) + plan/04_tier3.
--
-- Po wygenerowaniu pisma przez Sonnet, Haiku waliduje treść (struktura,
-- podstawy prawne, halucynacje). Wynik zapisujemy w 3 nowych kolumnach,
-- żeby UI mógł pokazać banner ostrzeżeń + score gauge.

ALTER TABLE public.documents
    ADD COLUMN IF NOT EXISTS score INTEGER,                    -- 0..100
    ADD COLUMN IF NOT EXISTS validation_passed BOOLEAN,        -- czy NIE ma issues=error
    ADD COLUMN IF NOT EXISTS validation_issues JSONB DEFAULT '[]'::jsonb;

-- CHECK constraint dla score (0..100) — bezpieczeństwo przed nieprawidłowym
-- update z aplikacji.
ALTER TABLE public.documents
    ADD CONSTRAINT documents_score_range
    CHECK (score IS NULL OR (score >= 0 AND score <= 100));

CREATE INDEX IF NOT EXISTS idx_documents_validation
    ON public.documents(case_id, validation_passed)
    WHERE validation_passed IS NOT NULL;

COMMENT ON COLUMN public.documents.score IS
    'Wynik walidacji AI (Haiku) 0-100. NULL gdy nie zwalidowano jeszcze.';
COMMENT ON COLUMN public.documents.validation_passed IS
    'true gdy brak issues z severity=error. NULL gdy nie zwalidowano.';
COMMENT ON COLUMN public.documents.validation_issues IS
    'Tablica issues z validateDocument: [{severity, category, message, suggestion}]';
