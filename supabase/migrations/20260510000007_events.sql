-- Migration 007: Events (event sourcing / audyt)
-- Source: knowledge base chunk T06_db_schema_007_008_009

CREATE TYPE event_type AS ENUM (
    -- Case lifecycle
    'case_created',
    'case_form_completed',
    'case_scoring_completed',
    'case_generation_started',
    'case_generation_completed',
    'case_generation_failed',
    'case_edited',
    'case_payment_completed',
    'case_pdf_downloaded',
    'case_sent',
    'case_resolved',
    'case_archived',

    -- Document
    'document_created',
    'document_edited',
    'document_version_created',
    'document_pdf_rendered',

    -- Upload/OCR
    'upload_created',
    'ocr_started',
    'ocr_completed',
    'ocr_failed',

    -- Payment
    'payment_initiated',
    'payment_succeeded',
    'payment_failed',
    'payment_refunded',

    -- Deadline
    'deadline_created',
    'deadline_reminder_sent',
    'deadline_expired',
    'deadline_completed',

    -- User
    'user_registered',
    'user_onboarding_completed',
    'user_subscription_started',
    'user_subscription_cancelled'
);

CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,

    event_type event_type NOT NULL,
    data JSONB DEFAULT '{}',

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_user ON public.events(user_id);
CREATE INDEX idx_events_case ON public.events(case_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_created ON public.events(created_at DESC);
