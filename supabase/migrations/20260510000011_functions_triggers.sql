-- Migration 011: Funkcje i triggery — set_case_deadline, increment_popularity, reset_monthly
-- Source: knowledge base chunk T07_db_schema_010_011

-- Funkcja: automatyczne ustawianie deadline'u po wypełnieniu formularza
CREATE OR REPLACE FUNCTION public.set_case_deadline()
RETURNS TRIGGER AS $$
DECLARE
    config_row RECORD;
BEGIN
    SELECT default_deadline_days, deadline_legal_basis
    INTO config_row
    FROM public.case_type_config
    WHERE case_type = NEW.case_type;

    IF NEW.status = 'form_completed' AND OLD.status = 'draft' AND config_row.default_deadline_days IS NOT NULL THEN
        IF NEW.form_data->>'data_doreczenia' IS NOT NULL THEN
            NEW.deadline_date := (NEW.form_data->>'data_doreczenia')::DATE + config_row.default_deadline_days;
        ELSE
            NEW.deadline_date := CURRENT_DATE + config_row.default_deadline_days;
        END IF;
        NEW.deadline_source := config_row.deadline_legal_basis;

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

-- Funkcja: reset miesięcznych liczników (CRON 1. dnia miesiąca)
CREATE OR REPLACE FUNCTION public.reset_monthly_document_counts()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles SET documents_this_month = 0;
END;
$$ LANGUAGE plpgsql;
