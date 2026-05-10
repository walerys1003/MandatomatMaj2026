-- Migration 004: Uploads + OCR
-- Source: knowledge base chunk T04_db_schema_003_004

CREATE TYPE ocr_status AS ENUM (
    'uploaded',
    'processing',
    'completed',
    'failed',
    'reviewed'
);

CREATE TABLE public.uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,

    -- Plik
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,

    -- OCR
    ocr_status ocr_status DEFAULT 'uploaded',
    ocr_raw_text TEXT,
    ocr_parsed_data JSONB,
    ocr_confidence NUMERIC(5,2),
    ocr_error TEXT,

    -- Auto-fill
    detected_fields JSONB,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_uploads_user ON public.uploads(user_id);
CREATE INDEX idx_uploads_case ON public.uploads(case_id);
CREATE INDEX idx_uploads_ocr_status ON public.uploads(ocr_status);

CREATE TRIGGER uploads_updated_at
    BEFORE UPDATE ON public.uploads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
