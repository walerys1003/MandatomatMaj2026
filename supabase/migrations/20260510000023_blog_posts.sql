-- Migration: blog_posts (T6-CMS-029)
-- Migration of blog from inline TS to DB for admin editing.

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 10 AND 200),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 50 AND 320),
  excerpt TEXT NOT NULL CHECK (length(excerpt) BETWEEN 20 AND 500),
  -- Markdown content
  content TEXT NOT NULL CHECK (length(content) >= 200),
  -- Author (FK to profiles; if NULL means "Redakcja Mandatomatu")
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Redakcja Mandatomatu',
  -- Reading time auto-calculated (200 words/min)
  reading_minutes INT NOT NULL DEFAULT 1,
  -- Keywords for meta tags + JSON-LD
  keywords TEXT[] NOT NULL DEFAULT '{}',
  -- Cross-linking
  related_category_slug TEXT,
  related_article_slugs TEXT[] NOT NULL DEFAULT '{}',
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  -- Publication dates
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  -- Hero image
  cover_image_url TEXT,
  cover_image_alt TEXT,
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- AI-assist marker (T6-CMS-035) — if generated draft
  ai_generated_draft BOOLEAN NOT NULL DEFAULT FALSE,
  ai_prompt_used TEXT
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status
  ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published
  ON blog_posts(published_at DESC)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled
  ON blog_posts(scheduled_for)
  WHERE status = 'draft' AND scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON blog_posts(related_category_slug)
  WHERE status = 'published';

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read: only published, and only past published_at
CREATE POLICY blog_posts_public_read ON blog_posts
  FOR SELECT
  USING (
    status = 'published'
    AND (published_at IS NULL OR published_at <= NOW())
  );

-- Authors: read own drafts
CREATE POLICY blog_posts_author_read ON blog_posts
  FOR SELECT
  USING (auth.uid() = author_id);

-- Trigger: updated_at + reading_minutes auto-calc
CREATE OR REPLACE FUNCTION blog_posts_before_save()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  word_count INT;
BEGIN
  NEW.updated_at = NOW();
  -- Approx reading time: count whitespace-delimited tokens / 200 wpm
  word_count := array_length(regexp_split_to_array(NEW.content, '\s+'), 1);
  IF word_count IS NULL THEN word_count := 1; END IF;
  NEW.reading_minutes = GREATEST(1, CEIL(word_count::FLOAT / 200));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_before_save ON blog_posts;
CREATE TRIGGER blog_posts_before_save
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION blog_posts_before_save();

COMMENT ON TABLE blog_posts IS
  'Blog posts in DB (T6-CMS-029) — replaces inline TS list.';
