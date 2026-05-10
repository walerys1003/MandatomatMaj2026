-- Migration 009: Admin logs + daily stats + feedback
-- Source: knowledge base chunk T06_db_schema_007_008_009

CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_logs_admin ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_target ON public.admin_logs(target_type, target_id);
CREATE INDEX idx_admin_logs_created ON public.admin_logs(created_at DESC);

CREATE TABLE public.daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,

    -- Użytkownicy
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,

    -- Sprawy
    cases_created INTEGER DEFAULT 0,
    cases_paid INTEGER DEFAULT 0,
    cases_by_category JSONB DEFAULT '{}',
    cases_by_type JSONB DEFAULT '{}',

    -- Przychody (grosze)
    revenue_total INTEGER DEFAULT 0,
    revenue_by_product JSONB DEFAULT '{}',
    average_order_value INTEGER DEFAULT 0,

    -- Scoring
    scorings_completed INTEGER DEFAULT 0,
    scoring_to_purchase_rate NUMERIC(5,2),

    -- OCR
    ocr_processed INTEGER DEFAULT 0,
    ocr_success_rate NUMERIC(5,2),

    -- AI
    ai_tokens_total INTEGER DEFAULT 0,
    ai_cost_total NUMERIC(10,4),

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    case_id UUID REFERENCES public.cases(id),

    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    outcome TEXT CHECK (outcome IN ('success', 'partial', 'failure', 'pending', 'unknown')),
    comment TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_feedback_user ON public.feedback(user_id);
CREATE INDEX idx_feedback_case ON public.feedback(case_id);
