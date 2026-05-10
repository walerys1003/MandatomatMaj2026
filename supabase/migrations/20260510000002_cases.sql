-- Migration 002: Cases (główna tabela spraw)
-- Source: knowledge base chunk T03_db_schema_001_002
--
-- 7 kategorii × 34 podtypy spraw + 12 statusów lifecycle.

CREATE TYPE case_category AS ENUM (
    'mandaty',
    'parking',
    'windykacja',
    'ubezpieczenia',
    'etoll',
    'kontrole',
    'techniczne'
);

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

CREATE TYPE case_status AS ENUM (
    'draft',
    'form_completed',
    'generating',
    'preview',
    'editing',
    'payment_pending',
    'paid',
    'downloaded',
    'sent',
    'waiting',
    'resolved',
    'archived'
);

CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Klasyfikacja
    category case_category NOT NULL,
    case_type case_type NOT NULL,
    title TEXT NOT NULL,

    -- Status
    status case_status DEFAULT 'draft',
    priority INTEGER DEFAULT 0,

    -- Dane (dynamiczne per case_type)
    form_data JSONB DEFAULT '{}',
    ocr_data JSONB DEFAULT '{}',
    scoring_result JSONB,

    -- Powiązania
    parent_case_id UUID REFERENCES public.cases(id),

    -- Płatność
    payment_status TEXT DEFAULT 'unpaid'
        CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'free')),
    stripe_payment_intent_id TEXT,
    amount_paid INTEGER,                 -- w groszach

    -- Terminy
    deadline_date DATE,
    deadline_source TEXT,

    -- Meta
    is_demo BOOLEAN DEFAULT false,
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

CREATE TRIGGER cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
