-- Migration: RAG embeddings for AI assistant (T7-AI-001, T7-AI-002, T7-AI-003)
-- Wymaga pgvector extension (Supabase ma w opcji "Enable extensions").

CREATE EXTENSION IF NOT EXISTS vector;

-- Chunks bazy wiedzy — każdy chunk T1-T20 + nowe content z bloga/poradników
CREATE TABLE IF NOT EXISTS rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Źródło chunka (np. "knowledge:T15", "blog:jak-odwolac-mandat", "category:fotoradar")
  source_type TEXT NOT NULL CHECK (source_type IN ('knowledge', 'blog', 'category', 'poradnik', 'faq', 'prompt')),
  source_id TEXT NOT NULL,
  -- Hierarchy
  parent_id UUID REFERENCES rag_chunks(id) ON DELETE CASCADE,
  -- Content
  title TEXT,
  content TEXT NOT NULL CHECK (length(content) BETWEEN 50 AND 8000),
  -- Token count (estimated for budgeting)
  token_count INT NOT NULL DEFAULT 0,
  -- Tags for filtering (np. "kpw", "kc", "kpa", "mandat", "fotoradar")
  tags TEXT[] NOT NULL DEFAULT '{}',
  -- Vector embedding (1536 dim for OpenAI text-embedding-3-small / Voyage voyage-3)
  embedding vector(1536),
  -- BM25-style tsvector for hybrid search
  search_vector tsvector,
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Quality control
  manually_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (source_type, source_id, parent_id)
);

-- HNSW index for fast vector search (Supabase 0.7+)
CREATE INDEX IF NOT EXISTS idx_rag_chunks_embedding
  ON rag_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- GIN index for tags + tsvector
CREATE INDEX IF NOT EXISTS idx_rag_chunks_tags ON rag_chunks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_search ON rag_chunks USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_source
  ON rag_chunks(source_type, source_id);

-- Trigger: auto-update tsvector when content changes (Polish dictionary)
CREATE OR REPLACE FUNCTION rag_chunks_update_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Use "simple" config (no stemming) — most resilient for Polish legal terms
  -- For better PL support consider 'pl_ispell' (Supabase ma niektóre extensions)
  NEW.search_vector = setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
                      setweight(to_tsvector('simple', NEW.content), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rag_chunks_before_save ON rag_chunks;
CREATE TRIGGER rag_chunks_before_save
  BEFORE INSERT OR UPDATE OF content, title ON rag_chunks
  FOR EACH ROW
  EXECUTE FUNCTION rag_chunks_update_search_vector();

-- Hybrid search function (BM25 + cosine, simple reranker by weighted sum)
CREATE OR REPLACE FUNCTION rag_search(
  query_text TEXT,
  query_embedding vector(1536),
  match_count INT DEFAULT 8,
  filter_tags TEXT[] DEFAULT NULL,
  filter_source_types TEXT[] DEFAULT NULL,
  bm25_weight FLOAT DEFAULT 0.3,
  vector_weight FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  source_id TEXT,
  title TEXT,
  content TEXT,
  tags TEXT[],
  bm25_score FLOAT,
  vector_score FLOAT,
  combined_score FLOAT
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.source_type,
    c.source_id,
    c.title,
    c.content,
    c.tags,
    ts_rank(c.search_vector, websearch_to_tsquery('simple', query_text))::FLOAT AS bm25_score,
    (1.0 - (c.embedding <=> query_embedding))::FLOAT AS vector_score,
    (
      bm25_weight * ts_rank(c.search_vector, websearch_to_tsquery('simple', query_text))::FLOAT
      + vector_weight * (1.0 - (c.embedding <=> query_embedding))::FLOAT
    )::FLOAT AS combined_score
  FROM rag_chunks c
  WHERE
    c.embedding IS NOT NULL
    AND (filter_tags IS NULL OR c.tags && filter_tags)
    AND (filter_source_types IS NULL OR c.source_type = ANY(filter_source_types))
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;

-- Public read (RAG content jest publiczne)
CREATE POLICY rag_chunks_public_read ON rag_chunks
  FOR SELECT
  USING (TRUE);

COMMENT ON TABLE rag_chunks IS
  'RAG embeddings + BM25 for AI assistant (T7-AI-001/002/003).';
COMMENT ON FUNCTION rag_search IS
  'Hybrid search: BM25 + vector cosine combined by weighted sum.';
