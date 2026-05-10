-- Migration 010: Row Level Security (RLS) policies
-- Source: knowledge base chunk T07_db_schema_010_011
--
-- ZASADA: każdy user widzi WYŁĄCZNIE swoje dane (auth.uid() = user_id).
-- Admin omija RLS przez SUPABASE_SERVICE_ROLE_KEY w server-only ścieżkach.
-- Drafty można usuwać; sprawy ze statusem != 'draft' są audytowane (delete blocked).

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Cases
CREATE POLICY "Users view own cases" ON public.cases
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own cases" ON public.cases
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cases" ON public.cases
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete draft cases only" ON public.cases
    FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

-- Documents
CREATE POLICY "Users view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

-- Uploads
CREATE POLICY "Users view own uploads" ON public.uploads
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own uploads" ON public.uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deadlines
CREATE POLICY "Users view own deadlines" ON public.deadlines
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own deadlines" ON public.deadlines
    FOR ALL USING (auth.uid() = user_id);

-- Payments (read only — write tylko przez service role w webhooku)
CREATE POLICY "Users view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Events (read only — write tylko przez service role)
CREATE POLICY "Users view own events" ON public.events
    FOR SELECT USING (auth.uid() = user_id);

-- Feedback
CREATE POLICY "Users manage own feedback" ON public.feedback
    FOR ALL USING (auth.uid() = user_id);

-- Public read na konfiguracjach (nie zawierają danych użytkownika)
ALTER TABLE public.case_type_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active case_type_config" ON public.case_type_config
    FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone reads active categories" ON public.category_config
    FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone reads active promo_codes" ON public.promo_codes
    FOR SELECT USING (is_active = true);
