# 3. DB Schema - profiles + cases (migracje 001-002)

**Chunk ID:** `T03_db_schema_001_002`
**Source:** tech (lines 376-583)
**Tags:** database, supabase, schema, profiles, cases, case_type_enum, rls
**Target Agents:** backend, database

---

Migracja 001: Profil użytkownika
-- 001_auth_profiles.sql
-- Rozszerzenie profilu Supabase Auth

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    pesel TEXT,                          -- opcjonalne, do auto-fill formularzy
    address_street TEXT,
    address_city TEXT,
    address_zip TEXT,
    
    -- Preferencje
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    newsletter BOOLEAN DEFAULT false,
    
    -- Subskrypcja
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'kierowca', 'pro')),
    subscription_stripe_id TEXT,         -- Stripe subscription ID
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

-- Trigger updated_at
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

Migracja 002: Sprawy (Cases)
-- 002_cases.sql

-- Enum kategorii głównych
CREATE TYPE case_category AS ENUM (
    'mandaty',
    'parking',
    'windykacja',
    'ubezpieczenia',
    'etoll',
    'kontrole',
    'techniczne'
);

-- Enum typów spraw (wszystkie 34 podtypy)
CREATE TYPE case_type AS ENUM (
    -- Mandaty (7)
    'mandat_sprzeciw_predkosc',
    'mandat_odmowa_przyjecia',
    'mandat_uchylenie_prawomocny',
    'mandat_odwolanie_straz',
    'mandat_odwolanie_itd',
    'mandat_odroczenie_raty',
    'mandat_uchylenie_punktow',
    
    -- Parking (4)
    'parking_sprzeciw_prywatny',
    'parking_reklamacja_zdm',
    'parking_odwolanie_ztm',
    'parking_blad_identyfikacji',
    
    -- Windykacja (5)
    'windykacja_odpowiedz_wezwanie',
    'windykacja_przedawnienie',
    'windykacja_sprzeciw_epu',
    'windykacja_usuniecie_krd_bik',
    'windykacja_skarga_rf',
    
    -- Ubezpieczenia (3)
    'ubezpieczenie_odwolanie_decyzja',
    'ubezpieczenie_wezwanie_wyplata',
    'ubezpieczenie_skarga_rf',
    
    -- e-TOLL (3)
    'etoll_odwolanie_kara',
    'etoll_reklamacja_podwojne',
    'etoll_anulowanie',
    
    -- Kontrole (4)
    'kontrola_sprzeciw_zatrzymanie_pj',
    'kontrola_cofniecie_decyzji',
    'kontrola_weryfikacja_urzadzenia',
    'kontrola_korekta_punktow',
    
    -- Techniczne (4)
    'techniczne_pelnomocnictwo',
    'techniczne_rodo_dostep',
    'techniczne_rodo_usuniecie',
    'techniczne_lista_zalacznikow',
    
    -- Pakiety (scoring — nie generuje pisma)
    'scoring_szans'
);

-- Enum statusów
CREATE TYPE case_status AS ENUM (
    'draft',           -- Formularz rozpoczęty, nie ukończony
    'form_completed',  -- Formularz wypełniony, oczekuje na generowanie
    'generating',      -- AI generuje pismo
    'preview',         -- Pismo wygenerowane, podgląd
    'editing',         -- Użytkownik edytuje
    'payment_pending', -- Oczekuje na płatność
    'paid',            -- Zapłacone, PDF gotowy do pobrania
    'downloaded',      -- PDF pobrany
    'sent',            -- Wysłane (ePUAP/email/poczta)
    'waiting',         -- Oczekuje na odpowiedź organu
    'resolved',        -- Sprawa zakończona
    'archived'         -- Zarchiwizowana
);

CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Klasyfikacja
    category case_category NOT NULL,
    case_type case_type NOT NULL,
    title TEXT NOT NULL,                 -- Auto-generowany z typu, np. "Sprzeciw od mandatu za prędkość"
    
    -- Status
    status case_status DEFAULT 'draft',
    priority INTEGER DEFAULT 0,          -- 0=normal, 1=urgent (bliski termin)
    
    -- Dane formularza (JSONB — dynamiczne per case_type)
    form_data JSONB DEFAULT '{}',
    
    -- Dane z OCR (jeśli użytkownik wgrał dokument)
    ocr_data JSONB DEFAULT '{}',
    
    -- Scoring (jeśli wykonany)
    scoring_result JSONB,                -- {score: 72, reasoning: "..."}
    
    -- Powiązania
    parent_case_id UUID REFERENCES public.cases(id),  -- Dla spraw powiązanych
    
    -- Płatność
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'free')),
    stripe_payment_intent_id TEXT,
    amount_paid INTEGER,                 -- w groszach (7900 = 79 zł)
    
    -- Terminy
    deadline_date DATE,                  -- Główny termin (np. D+7 na sprzeciw)
    deadline_source TEXT,                -- Skąd pochodzi termin
    
    -- Meta
    is_demo BOOLEAN DEFAULT false,       -- Sprawa demo z onboardingu
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indeksy
CREATE INDEX idx_cases_user ON public.cases(user_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_type ON public.cases(case_type);
CREATE INDEX idx_cases_category ON public.cases(category);
CREATE INDEX idx_cases_deadline ON public.cases(deadline_date) WHERE deadline_date IS NOT NULL;
CREATE INDEX idx_cases_payment ON public.cases(payment_status);
CREATE INDEX idx_cases_created ON public.cases(created_at DESC);

-- Trigger updated_at
CREATE TRIGGER cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
