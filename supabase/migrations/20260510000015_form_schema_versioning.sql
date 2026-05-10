-- Migration 015: Form schema versioning
-- Source: plan/00_critical_review.md (zmiana #7)
--
-- Gdy zmienimy `form_schema` w `case_type_config`, istniejące drafty
-- z poprzednim schematem nie mogą się zepsuć. Każda sprawa zapisuje
-- wersję schematu, na której została utworzona.

ALTER TABLE public.case_type_config
    ADD COLUMN IF NOT EXISTS form_schema_version INTEGER DEFAULT 1 NOT NULL;

ALTER TABLE public.cases
    ADD COLUMN IF NOT EXISTS form_schema_version_used INTEGER;

-- Trigger: przy INSERT do cases skopiuj aktualną wersję schematu
CREATE OR REPLACE FUNCTION public.trg_case_capture_schema_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.form_schema_version_used IS NULL THEN
        SELECT form_schema_version
        INTO NEW.form_schema_version_used
        FROM public.case_type_config
        WHERE case_type = NEW.case_type;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_capture_schema_version
    BEFORE INSERT ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.trg_case_capture_schema_version();

-- Trigger: bumpuj wersję gdy zmieni się form_schema
CREATE OR REPLACE FUNCTION public.trg_bump_form_schema_version()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.form_schema IS DISTINCT FROM NEW.form_schema THEN
        NEW.form_schema_version := COALESCE(OLD.form_schema_version, 0) + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER case_type_config_bump_version
    BEFORE UPDATE ON public.case_type_config
    FOR EACH ROW EXECUTE FUNCTION public.trg_bump_form_schema_version();
