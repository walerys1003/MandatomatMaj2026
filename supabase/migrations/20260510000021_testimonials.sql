-- Migration: testimonials (T6-REF-027/028)
-- Moderated user reviews wall for /opinie page + Schema.org Review JSON-LD.

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Public display name (first name only or pseudonym)
  display_name TEXT NOT NULL,
  -- Optional city for social proof (e.g., "Warszawa", "Kraków")
  city TEXT,
  -- Case type slug for filtering by category (e.g., "mandat-za-predkosc")
  case_type_slug TEXT,
  -- Star rating 1-5
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  -- Public-facing body (markdown allowed, sanitized on render)
  body TEXT NOT NULL CHECK (length(body) BETWEEN 20 AND 2000),
  -- Moderation status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  moderation_note TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Outcome marker (won/in-progress/lost) for credibility
  outcome TEXT CHECK (outcome IN ('won', 'in_progress', 'lost', 'unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_status
  ON testimonials(status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_testimonials_case_type
  ON testimonials(case_type_slug) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_testimonials_created
  ON testimonials(created_at DESC) WHERE status = 'approved';

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read: only approved
CREATE POLICY testimonials_public_read ON testimonials
  FOR SELECT
  USING (status = 'approved');

-- User can read own (any status)
CREATE POLICY testimonials_own_read ON testimonials
  FOR SELECT
  USING (auth.uid() = user_id);

-- User can insert own
CREATE POLICY testimonials_own_insert ON testimonials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION testimonials_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS testimonials_updated_at ON testimonials;
CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION testimonials_set_updated_at();

-- Helper view: aggregated rating per case_type_slug
CREATE OR REPLACE VIEW testimonials_aggregated AS
SELECT
  case_type_slug,
  COUNT(*)::INT AS count,
  ROUND(AVG(rating)::NUMERIC, 2) AS avg_rating
FROM testimonials
WHERE status = 'approved'
GROUP BY case_type_slug;

COMMENT ON TABLE testimonials IS
  'Moderowane opinie userów do /opinie page. T6-REF-027/028.';
