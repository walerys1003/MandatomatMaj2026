-- Migration 020: Subscription columns + history
-- Faza T20 / P7: Subskrypcja "Kierowca" (Stripe recurring) + plany.
--
-- Rozszerza profiles o brakujące kolumny używane przez kod backendu
-- (subscription_tier, subscription_status, monthly_quota_remaining, etc.)
-- + tworzy tabelę subscriptions (historia + audit Stripe).

-- ============================================================
-- 1. profiles — nowe kolumny
-- ============================================================

-- subscription_tier: kanoniczne pole T20 (alias dla subscription_plan, ale z pro_plus)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS subscription_tier TEXT
        CHECK (subscription_tier IN ('free', 'kierowca', 'pro', 'pro_plus'));

-- subscription_status: stan z Stripe (active / past_due / canceled / incomplete / trialing)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS subscription_status TEXT
        CHECK (subscription_status IN (
            'active', 'inactive', 'past_due', 'canceled', 'incomplete',
            'incomplete_expired', 'trialing', 'unpaid', 'paused'
        ));

-- monthly_quota_remaining: ile pism user może jeszcze wygenerować w tym okresie
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS monthly_quota_remaining INTEGER DEFAULT 0;

-- monthly_quota_total: limit miesięczny (3 dla kierowca, 999 dla pro)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS monthly_quota_total INTEGER DEFAULT 0;

-- subscription_period_end: kiedy odnowi się quota
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- stripe_customer_id: główny identyfikator klienta w Stripe (1:1 per user)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- subscription_cancel_at_period_end: czy user oznaczył subskrypcję do cancel
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT false;

-- Backfill: skopiuj subscription_plan → subscription_tier dla istniejących
UPDATE public.profiles
SET subscription_tier = subscription_plan
WHERE subscription_tier IS NULL AND subscription_plan IS NOT NULL;

-- Default na 'free' dla nowych rekordów
ALTER TABLE public.profiles
    ALTER COLUMN subscription_tier SET DEFAULT 'free';

-- Indeks po stripe_customer_id (lookup w webhook)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- ============================================================
-- 2. subscriptions — pełna historia (każda zmiana = nowy rekord)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Stripe identifiers
    stripe_subscription_id TEXT NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    stripe_price_id TEXT,
    stripe_product_code TEXT,  -- 'SUB_KIEROWCA' | 'SUB_PRO'

    -- Plan
    tier TEXT NOT NULL CHECK (tier IN ('kierowca', 'pro', 'pro_plus')),
    status TEXT NOT NULL CHECK (status IN (
        'active', 'past_due', 'canceled', 'incomplete',
        'incomplete_expired', 'trialing', 'unpaid', 'paused'
    )),

    -- Period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,

    -- Pricing snapshot (grosze)
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'pln',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- Tylko 1 aktywna subskrypcja per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_active_per_user
    ON public.subscriptions(user_id)
    WHERE status IN ('active', 'trialing', 'past_due');

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 3. RLS — user widzi swoje subskrypcje (read-only przez API)
-- ============================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users view own subscriptions" ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Insert/update tylko service_role (webhook) — brak policy dla authenticated
