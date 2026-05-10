-- Migration 001: Auth profiles
-- Source: knowledge base chunk T03_db_schema_001_002
--
-- Rozszerzenie auth.users o profil aplikacyjny + handler signup + auto-update updated_at.

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    pesel TEXT,                          -- legacy plaintext column; będzie zmigrowane do pesel_encrypted w 012
    address_street TEXT,
    address_city TEXT,
    address_zip TEXT,

    -- Preferencje
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    newsletter BOOLEAN DEFAULT false,

    -- Subskrypcja
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'kierowca', 'pro')),
    subscription_stripe_id TEXT,
    subscription_ends_at TIMESTAMPTZ,

    -- Limity
    documents_this_month INTEGER DEFAULT 0,
    documents_limit INTEGER DEFAULT 0,   -- 0 = pay-per-doc, 2 = kierowca, 999 = pro

    -- Meta
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    onboarding_completed BOOLEAN DEFAULT false,
    referral_code TEXT UNIQUE,
    referred_by TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, referral_code)
    VALUES (
        NEW.id,
        NEW.email,
        'MND-' || substr(md5(random()::text), 1, 8)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indeksy
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_plan);
