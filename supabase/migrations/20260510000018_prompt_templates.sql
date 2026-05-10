-- Migration 018: Prompt templates z historią wersji
--
-- Przechowuje aktualną treść promptów AI per case_type oraz pełną historię zmian.
-- Pliki *.md z prompts/ migrowane są do tej tabeli przy seed; każda edycja w
-- /admin/prompty tworzy nową wersję (sequence per case_type).

CREATE TABLE public.prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_type case_type UNIQUE NOT NULL,

    -- Aktualna treść
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,

    -- Meta
    description TEXT,
    model TEXT DEFAULT 'claude-sonnet-4-6',
    temperature NUMERIC(3,2) DEFAULT 0.30,
    max_tokens INTEGER DEFAULT 4000,

    -- Audit
    last_edited_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prompt_templates_case_type ON public.prompt_templates(case_type);

CREATE TRIGGER prompt_templates_updated_at
    BEFORE UPDATE ON public.prompt_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Historia wersji — append-only
CREATE TABLE public.prompt_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.prompt_templates(id) ON DELETE CASCADE,
    case_type case_type NOT NULL,

    version INTEGER NOT NULL,
    content TEXT NOT NULL,

    -- Meta z chwili zapisu
    model TEXT,
    temperature NUMERIC(3,2),
    max_tokens INTEGER,

    -- Audit
    edited_by UUID REFERENCES public.profiles(id),
    edit_note TEXT,                          -- opcjonalny komentarz przy zapisie
    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE (template_id, version)
);

CREATE INDEX idx_prompt_versions_template ON public.prompt_template_versions(template_id, version DESC);
CREATE INDEX idx_prompt_versions_case_type ON public.prompt_template_versions(case_type);

-- RLS: tylko admini mogą czytać/zapisywać; service_role bypass.
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY prompt_templates_admin_select ON public.prompt_templates
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ));

CREATE POLICY prompt_versions_admin_select ON public.prompt_template_versions
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ));
