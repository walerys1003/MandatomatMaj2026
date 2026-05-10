-- Migration 005: Deadlines + reminders log
-- Source: knowledge base chunk T05_db_schema_005_006

CREATE TYPE deadline_status AS ENUM (
    'active',
    'reminded_d5',
    'reminded_d3',
    'reminded_d1',
    'reminded_d0',
    'expired',
    'completed',
    'cancelled'
);

CREATE TYPE reminder_channel AS ENUM ('email', 'sms', 'push');

CREATE TABLE public.deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,
    deadline_date DATE NOT NULL,

    remind_days INTEGER[] DEFAULT '{5,3,1,0}',

    status deadline_status DEFAULT 'active',

    source TEXT,
    legal_basis TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reminders_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deadline_id UUID NOT NULL REFERENCES public.deadlines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    channel reminder_channel NOT NULL,
    days_before INTEGER NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
    error TEXT
);

CREATE INDEX idx_deadlines_user ON public.deadlines(user_id);
CREATE INDEX idx_deadlines_case ON public.deadlines(case_id);
CREATE INDEX idx_deadlines_date ON public.deadlines(deadline_date) WHERE status = 'active';
CREATE INDEX idx_deadlines_active ON public.deadlines(status, deadline_date) WHERE status = 'active';

CREATE TRIGGER deadlines_updated_at
    BEFORE UPDATE ON public.deadlines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
