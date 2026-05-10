-- Migration 013: Stripe webhook idempotency
-- Source: plan/00_critical_review.md (zmiana #5)
--
-- Stripe może wysłać ten sam event więcej niż raz (retry, duplikat).
-- Tabela `stripe_events` z UNIQUE event_id pozwala bezpiecznie dropnąć duplikat.

CREATE TABLE public.stripe_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT now(),
    processing_status TEXT DEFAULT 'success'
        CHECK (processing_status IN ('success', 'failed', 'skipped')),
    error_message TEXT
);

CREATE INDEX idx_stripe_events_type ON public.stripe_events(event_type);
CREATE INDEX idx_stripe_events_processed ON public.stripe_events(processed_at DESC);

-- RLS: tylko service_role
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- (brak policy = brak dostępu z anon/auth role)

COMMENT ON TABLE public.stripe_events IS
    'Idempotency log dla webhooków Stripe. Insert MUSI być pierwszą operacją w handlerze, ON CONFLICT (event_id) DO NOTHING — duplikaty drop.';
