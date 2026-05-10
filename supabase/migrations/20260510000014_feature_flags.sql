-- Migration 014: Feature flags
-- Source: plan/00_critical_review.md (zmiana #6)
--
-- Lekka tabela kill-switch / dark-launch dla nowych funkcji.
-- Backend czyta przez cached fetch (5min TTL); admin toggluje przez panel.

CREATE TABLE public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT false,
    description TEXT,

    -- Targeting (opcjonalny)
    target_role TEXT CHECK (target_role IN ('user', 'admin', 'moderator', NULL)),
    target_user_ids UUID[],
    rollout_percent INTEGER DEFAULT 100 CHECK (rollout_percent BETWEEN 0 AND 100),

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Każdy zalogowany może czytać włączone flagi (do feature gating po stronie klienta)
CREATE POLICY "Anyone reads enabled flags" ON public.feature_flags
    FOR SELECT USING (enabled = true);

-- Seed startowy: kluczowe flagi MVP
INSERT INTO public.feature_flags (key, enabled, description) VALUES
    ('ocr_enabled', false, 'Włącza OCR uploads — domyślnie OFF do testów Tier 3'),
    ('scoring_enabled', true, 'Pre-scoring szans przed generowaniem pisma'),
    ('subscription_kierowca', false, 'Plan miesięczny "Kierowca" 49 zł / 2 pisma'),
    ('subscription_pro', false, 'Plan miesięczny "Pro" 199 zł / unlimited'),
    ('b2b_panel', false, 'Panel B2B dla biur prawnych'),
    ('admin_evals_dashboard', true, 'Wewnętrzny dashboard wyników eval-i AI');
