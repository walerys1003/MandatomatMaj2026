-- Migration 003: Documents (markdown drafty + final PDF + załączniki)
-- Source: knowledge base chunk T04_db_schema_003_004

CREATE TYPE document_type AS ENUM (
    'draft_markdown',
    'final_pdf',
    'attachment',
    'ocr_source',
    'checklist',
    'instruction'
);

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Typ i treść
    doc_type document_type NOT NULL,
    title TEXT NOT NULL,
    content_markdown TEXT,

    -- Plik (Storage)
    storage_path TEXT,
    file_name TEXT,
    file_size INTEGER,                   -- w bajtach
    mime_type TEXT,

    -- Wersjonowanie
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    parent_document_id UUID REFERENCES public.documents(id),

    -- Meta AI
    ai_model_used TEXT,
    ai_prompt_version TEXT,
    ai_tokens_input INTEGER,
    ai_tokens_output INTEGER,
    ai_cost_usd NUMERIC(10,6),

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_case ON public.documents(case_id);
CREATE INDEX idx_documents_user ON public.documents(user_id);
CREATE INDEX idx_documents_type ON public.documents(doc_type);
CREATE INDEX idx_documents_current ON public.documents(case_id, is_current) WHERE is_current = true;

CREATE TRIGGER documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
