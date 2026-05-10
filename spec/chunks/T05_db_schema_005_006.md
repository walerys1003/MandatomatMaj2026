# 3. DB Schema - deadlines + payments (migracje 005-006)

**Chunk ID:** `T05_db_schema_005_006`
**Source:** tech (lines 684-824)
**Tags:** database, deadlines, payments, stripe, promo_codes
**Target Agents:** backend, database, payments

---

Migracja 005: Terminy i przypomnienia
-- 005_deadlines.sql

CREATE TYPE deadline_status AS ENUM (
    'active',
    'reminded_d5',
    'reminded_d3',
    'reminded_d1',
    'reminded_d0',
    'expired',
    'completed',
    'cancelled'
);

CREATE TYPE reminder_channel AS ENUM ('email', 'sms', 'push');

CREATE TABLE public.deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Termin
    title TEXT NOT NULL,                 -- np. "Termin na sprzeciw od mandatu"
    description TEXT,
    deadline_date DATE NOT NULL,
    
    -- Reguły przypomnień (w dniach przed terminem)
    remind_days INTEGER[] DEFAULT '{5,3,1,0}',
    
    -- Status
    status deadline_status DEFAULT 'active',
    
    -- Źródło
    source TEXT,                         -- 'auto' (z reguł) lub 'manual' (użytkownik)
    legal_basis TEXT,                    -- np. "art. 101 § 1 KPW — 7 dni"
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reminders_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deadline_id UUID NOT NULL REFERENCES public.deadlines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    channel reminder_channel NOT NULL,
    days_before INTEGER NOT NULL,        -- 5, 3, 1, 0
    sent_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
    error TEXT
);

CREATE INDEX idx_deadlines_user ON public.deadlines(user_id);
CREATE INDEX idx_deadlines_case ON public.deadlines(case_id);
CREATE INDEX idx_deadlines_date ON public.deadlines(deadline_date) WHERE status = 'active';
CREATE INDEX idx_deadlines_active ON public.deadlines(status, deadline_date) WHERE status = 'active';

CREATE TRIGGER deadlines_updated_at
    BEFORE UPDATE ON public.deadlines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

Migracja 006: Płatności
-- 006_payments.sql

CREATE TYPE payment_type AS ENUM (
    'one_time',          -- Jednorazowe pismo
    'package',           -- Pakiet (np. 3 pisma)
    'subscription',      -- Subskrypcja miesięczna
    'addon'              -- Dodatek (OCR, konsultacja)
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
    product_name TEXT NOT NULL,          -- np. "Odwołanie od mandatu"
    product_code TEXT NOT NULL,          -- np. "mandat_sprzeciw_predkosc"
    
    -- Faktura
    invoice_id TEXT,                     -- ID z Fakturownia
    invoice_url TEXT,
    
    -- Kody promocyjne
    promo_code TEXT,
    discount_percent INTEGER DEFAULT 0,
    original_amount INTEGER,             -- Kwota przed rabatem
    
    -- Meta
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

-- Tabela kodów promocyjnych
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
