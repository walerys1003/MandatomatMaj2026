-- Migration: newsletter_subscribers + promo_codes (T6-CMS-032, T6-CVR-015)

-- Newsletter subscribers — double opt-in flow
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  -- Confirmation token (sent in opt-in email)
  confirmation_token TEXT,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  -- Source: 'footer', 'blog', 'admin' etc.
  source TEXT,
  -- IP + UA snapshot for GDPR audit
  ip_address INET,
  user_agent TEXT,
  -- Linked user (if signed up later)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_confirmed
  ON newsletter_subscribers(confirmed_at)
  WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_newsletter_token
  ON newsletter_subscribers(confirmation_token)
  WHERE confirmation_token IS NOT NULL;

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can insert (subscribe via form) — controlled by API rate limit
CREATE POLICY newsletter_public_subscribe ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (TRUE);

-- Only owner (matched by linked user_id) can read their own row
CREATE POLICY newsletter_owner_read ON newsletter_subscribers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Promo codes (T6-CVR-015) — coupon storage shared with Stripe
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Public code (e.g., "WELCOME20")
  code TEXT NOT NULL UNIQUE CHECK (code = upper(code)),
  -- Mirror to Stripe coupon id for sync
  stripe_coupon_id TEXT,
  -- Discount percentage 1-100
  discount_pct SMALLINT NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  -- Valid date range
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  -- Usage limits
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  max_uses_per_user INT DEFAULT 1,
  -- Restrictions
  applies_to_case_types TEXT[],
  first_time_only BOOLEAN NOT NULL DEFAULT FALSE,
  -- Status
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_active
  ON promo_codes(active, valid_until)
  WHERE active = TRUE;

-- Redemptions table (one row per actual use)
CREATE TABLE IF NOT EXISTS promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID,
  stripe_session_id TEXT,
  discount_pln NUMERIC(8, 2) NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (promo_code_id, user_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user
  ON promo_redemptions(user_id, redeemed_at DESC);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;

-- Promo codes read: anyone (codes are public by design, but only via API helper)
CREATE POLICY promo_codes_public_read ON promo_codes
  FOR SELECT
  USING (active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Redemptions: user can read own
CREATE POLICY promo_redemptions_own_read ON promo_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger update_at
CREATE OR REPLACE FUNCTION promo_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS promo_codes_updated_at ON promo_codes;
CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION promo_set_updated_at();

COMMENT ON TABLE newsletter_subscribers IS
  'Newsletter subscribers z double opt-in (T6-CMS-032).';
COMMENT ON TABLE promo_codes IS
  'Promo codes mirror dla Stripe coupons (T6-CVR-015).';
