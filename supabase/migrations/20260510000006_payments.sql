-- Migration 006: Payments + promo codes
-- Source: knowledge base chunk T05_db_schema_005_006

CREATE TYPE payment_type AS ENUM (
    'one_time',
    'package',
    'subscription',
    'addon'
);

CREATE TYPE payment_status_enum AS ENUM (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded',
    'disputed'
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,

    -- Stripe
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_checkout_session_id TEXT,
    stripe_invoice_id TEXT,
    stripe_subscription_id TEXT,

    -- Kwoty
    amount INTEGER NOT NULL,             -- w groszach
    currency TEXT DEFAULT 'pln',

    -- Typ i status
    payment_type payment_type NOT NULL,
    status payment_status_enum DEFAULT 'pending',

    -- Produkt
    product_name TEXT NOT NULL,
    product_code TEXT NOT NULL,

    -- Faktura (Fakturownia)
    invoice_id TEXT,
    invoice_url TEXT,

    -- Promo
    promo_code TEXT,
    discount_percent INTEGER DEFAULT 0,
    original_amount INTEGER,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_case ON public.payments(case_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_stripe ON public.payments(stripe_payment_intent_id);

CREATE TRIGGER payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    max_uses INTEGER,                    -- NULL = unlimited
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    applicable_products TEXT[],          -- NULL = all products
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
