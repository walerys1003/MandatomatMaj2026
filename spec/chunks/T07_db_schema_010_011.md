# 3. DB Schema - RLS + funkcje/triggery (migracje 010-011)

**Chunk ID:** `T07_db_schema_010_011`
**Source:** tech (lines 1034-1176)
**Tags:** database, rls, triggers, functions, storage_buckets, security
**Target Agents:** backend, database, security

---

Migracja 010: Row Level Security (RLS)
-- 010_rls_policies.sql

-- Włączenie RLS na wszystkich tabelach
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles: user widzi i edytuje tylko swój profil
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Cases: user widzi i zarządza tylko swoimi sprawami
CREATE POLICY "Users view own cases" ON public.cases
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own cases" ON public.cases
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cases" ON public.cases
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cases" ON public.cases
    FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

-- Documents: user widzi i zarządza tylko swoimi dokumentami
CREATE POLICY "Users view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

-- Uploads: jak documents
CREATE POLICY "Users view own uploads" ON public.uploads
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own uploads" ON public.uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deadlines
CREATE POLICY "Users view own deadlines" ON public.deadlines
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own deadlines" ON public.deadlines
    FOR ALL USING (auth.uid() = user_id);

-- Payments
CREATE POLICY "Users view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Events
CREATE POLICY "Users view own events" ON public.events
    FOR SELECT USING (auth.uid() = user_id);

-- Feedback
CREATE POLICY "Users manage own feedback" ON public.feedback
    FOR ALL USING (auth.uid() = user_id);

-- Admin: pełny dostęp (przez service_role key w API routes, RLS omijany)
-- Admin dashboard używa supabase.admin client z SUPABASE_SERVICE_ROLE_KEY

Migracja 011: Funkcje i triggery
-- 011_functions_triggers.sql

-- Funkcja: automatyczne ustawianie deadline'u po wypełnieniu formularza
CREATE OR REPLACE FUNCTION public.set_case_deadline()
RETURNS TRIGGER AS $$
DECLARE
    config_row RECORD;
BEGIN
    -- Pobierz konfigurację dla danego case_type
    SELECT default_deadline_days, deadline_legal_basis 
    INTO config_row
    FROM public.case_type_config 
    WHERE case_type = NEW.case_type;
    
    -- Ustaw deadline jeśli zmienił się status na 'form_completed' i jest konfiguracja
    IF NEW.status = 'form_completed' AND OLD.status = 'draft' AND config_row.default_deadline_days IS NOT NULL THEN
        -- Sprawdź czy użytkownik podał datę doręczenia w form_data
        IF NEW.form_data->>'data_doreczenia' IS NOT NULL THEN
            NEW.deadline_date := (NEW.form_data->>'data_doreczenia')::DATE + config_row.default_deadline_days;
        ELSE
            NEW.deadline_date := CURRENT_DATE + config_row.default_deadline_days;
        END IF;
        NEW.deadline_source := config_row.deadline_legal_basis;
        
        -- Stwórz wpis w deadlines
        INSERT INTO public.deadlines (case_id, user_id, title, deadline_date, legal_basis, source)
        VALUES (
            NEW.id,
            NEW.user_id,
            'Termin na złożenie: ' || (SELECT display_name FROM public.case_type_config WHERE case_type = NEW.case_type),
            NEW.deadline_date,
            config_row.deadline_legal_basis,
            'auto'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_set_deadline
    BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.set_case_deadline();

-- Funkcja: aktualizacja popularity po każdym zakupie
CREATE OR REPLACE FUNCTION public.increment_popularity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
        UPDATE public.case_type_config
        SET popularity = popularity + 1
        WHERE case_type = NEW.case_type;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_increment_popularity
    AFTER UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.increment_popularity();

-- Funkcja: reset monthly document count (wywoływana CRON-em 1. dnia miesiąca)
CREATE OR REPLACE FUNCTION public.reset_monthly_document_counts()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles SET documents_this_month = 0;
END;
$$ LANGUAGE plpgsql;

3.2 Supabase Storage Buckets
Buckety:
1. uploads         — Pliki wgrane przez użytkowników (mandat, wezwanie, nakaz)
                      Polityka: user widzi tylko swoje, max 10MB, PDF/JPG/PNG
2. documents       — Wygenerowane PDF-y
                      Polityka: user widzi tylko swoje, signed URLs (TTL 1h)
3. avatars         — Zdjęcia profilowe (opcjonalne)
4. public          — Publiczne assety (logo, ikony, OG images)
