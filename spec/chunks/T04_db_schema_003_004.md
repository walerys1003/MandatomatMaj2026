# 3. DB Schema - documents + uploads/OCR (migracje 003-004)

**Chunk ID:** `T04_db_schema_003_004`
**Source:** tech (lines 584-683)
**Tags:** database, documents, uploads, ocr, storage
**Target Agents:** backend, database

---

Migracja 003: Dokumenty
-- 003_documents.sql

CREATE TYPE document_type AS ENUM (
    'draft_markdown',      -- Markdown z AI (edytowalny)
    'final_pdf',           -- Wyrenderowany PDF
    'attachment',          -- Załącznik użytkownika (skan, zdjęcie)
    'ocr_source',          -- Dokument źródłowy do OCR
    'checklist',           -- Wygenerowana checklista załączników
    'instruction'          -- Instrukcja dla użytkownika (jak złożyć, gdzie wysłać)
);

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Typ i treść
    doc_type document_type NOT NULL,
    title TEXT NOT NULL,
    content_markdown TEXT,               -- Treść Markdown (dla draft/checklist/instruction)
    
    -- Plik (Storage)
    storage_path TEXT,                   -- Ścieżka w Supabase Storage
    file_name TEXT,
    file_size INTEGER,                   -- w bajtach
    mime_type TEXT,
    
    -- Wersjonowanie
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    parent_document_id UUID REFERENCES public.documents(id),
    
    -- Meta AI
    ai_model_used TEXT,                  -- np. 'claude-sonnet-4.6'
    ai_prompt_version TEXT,              -- Wersja promptu użytego do generowania
    ai_tokens_input INTEGER,
    ai_tokens_output INTEGER,
    ai_cost_usd NUMERIC(10,6),          -- Koszt API za to generowanie
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indeksy
CREATE INDEX idx_documents_case ON public.documents(case_id);
CREATE INDEX idx_documents_user ON public.documents(user_id);
CREATE INDEX idx_documents_type ON public.documents(doc_type);
CREATE INDEX idx_documents_current ON public.documents(case_id, is_current) WHERE is_current = true;

CREATE TRIGGER documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

Migracja 004: Uploady i OCR
-- 004_uploads_ocr.sql

CREATE TYPE ocr_status AS ENUM (
    'uploaded',
    'processing',
    'completed',
    'failed',
    'reviewed'          -- Użytkownik zweryfikował wyniki
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
    ocr_raw_text TEXT,                   -- Surowy tekst z Tesseract
    ocr_parsed_data JSONB,              -- Strukturalny JSON z AI parsera
    ocr_confidence NUMERIC(5,2),         -- Pewność OCR (0-100%)
    ocr_error TEXT,                       -- Komunikat błędu
    
    -- Wykryte pola (auto-fill)
    detected_fields JSONB,               -- {sygnatura, data, kwota, organ, typ_pisma}
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_uploads_user ON public.uploads(user_id);
CREATE INDEX idx_uploads_case ON public.uploads(case_id);
CREATE INDEX idx_uploads_ocr_status ON public.uploads(ocr_status);

CREATE TRIGGER uploads_updated_at
    BEFORE UPDATE ON public.uploads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
