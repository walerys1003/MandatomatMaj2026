-- Migration 008: Case type config + category config + seed kategorii
-- Source: knowledge base chunk T06_db_schema_007_008_009

CREATE TABLE public.case_type_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_type case_type UNIQUE NOT NULL,
    category case_category NOT NULL,

    -- Wyświetlanie
    display_name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,

    -- Cennik (grosze)
    price_pln INTEGER NOT NULL,
    price_package_pln INTEGER,

    -- Formularz
    form_schema JSONB NOT NULL,

    -- Terminy
    default_deadline_days INTEGER,
    deadline_legal_basis TEXT,
    remind_days INTEGER[] DEFAULT '{5,3,1,0}',

    -- AI
    prompt_file TEXT NOT NULL,
    ai_model TEXT DEFAULT 'claude-sonnet-4-6',

    -- Adresat pisma
    default_addressee_type TEXT,

    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    slug TEXT UNIQUE NOT NULL,

    -- Meta
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    popularity INTEGER DEFAULT 0,
    success_rate NUMERIC(5,2),

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.category_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category case_category UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Seed: 7 kategorii głównych
INSERT INTO public.category_config (category, display_name, description, icon, color, sort_order) VALUES
    ('mandaty', 'Mandaty karne', 'Odwołania od mandatów Policji, Straży Miejskiej, ITD i fotoradarów', 'ShieldAlert', 'red', 1),
    ('parking', 'Parking i komunikacja', 'Reklamacje parkingowe i odwołania od opłat ZTM/MPK', 'Car', 'blue', 2),
    ('windykacja', 'Windykacja i EPU', 'Odpowiedzi na wezwania, sprzeciwy od nakazów zapłaty, KRD/BIK', 'FileWarning', 'amber', 3),
    ('ubezpieczenia', 'Ubezpieczenia OC/AC', 'Odwołania od decyzji ubezpieczycieli, skargi do Rzecznika', 'Shield', 'green', 4),
    ('etoll', 'e-TOLL / Autostrady', 'Odwołania od kar e-TOLL, reklamacje podwójnych naliczeń', 'Route', 'purple', 5),
    ('kontrole', 'Kontrole i punkty karne', 'Sprzeciwy od zatrzymania prawa jazdy, korekta punktów', 'ScanSearch', 'orange', 6),
    ('techniczne', 'Pisma techniczne', 'Pełnomocnictwa, wnioski RODO, listy załączników', 'FileText', 'gray', 7);

CREATE TRIGGER case_type_config_updated_at
    BEFORE UPDATE ON public.case_type_config
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
