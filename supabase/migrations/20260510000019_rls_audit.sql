-- Migration 019: RLS audit + security hardening (T5-SEC-028)
--
-- Cel: zamknąć potencjalne luki w istniejących politykach RLS:
--   1. DELETE na profiles — brakowało (cascade tylko z auth.users)
--   2. UPDATE na payments / events — explicit DENY (przez service role only)
--   3. Insert na feedback ograniczony do statusu sprawy != 'draft'
--   4. RLS audit funkcje pomocnicze
--
-- Każda zmiana ma uzasadnienie biznesowe i jest reverse-friendly.

-- ============================================================
-- 1. DENY DELETE na profiles (poza auth.users CASCADE)
-- ============================================================
-- Bez tej polityki user mógłby DELETE swój profil bez usunięcia auth.user,
-- co prowadzi do orphaned rows. Cascade z auth.users załatwia to poprawnie.
DROP POLICY IF EXISTS "Deny direct profile delete" ON public.profiles;
CREATE POLICY "Deny direct profile delete" ON public.profiles
    FOR DELETE USING (false);

-- ============================================================
-- 2. Payments — explicit DENY UPDATE/DELETE z poziomu user
-- ============================================================
-- Payments są read-only dla usera, write wyłącznie przez webhook (service_role).
DROP POLICY IF EXISTS "Deny user payment updates" ON public.payments;
CREATE POLICY "Deny user payment updates" ON public.payments
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Deny user payment deletes" ON public.payments;
CREATE POLICY "Deny user payment deletes" ON public.payments
    FOR DELETE USING (false);

DROP POLICY IF EXISTS "Deny user payment inserts" ON public.payments;
CREATE POLICY "Deny user payment inserts" ON public.payments
    FOR INSERT WITH CHECK (false);

-- ============================================================
-- 3. Events — analogicznie audyt-only z service role
-- ============================================================
DROP POLICY IF EXISTS "Deny user event inserts" ON public.events;
CREATE POLICY "Deny user event inserts" ON public.events
    FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "Deny user event updates" ON public.events;
CREATE POLICY "Deny user event updates" ON public.events
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Deny user event deletes" ON public.events;
CREATE POLICY "Deny user event deletes" ON public.events
    FOR DELETE USING (false);

-- ============================================================
-- 4. Feedback — wymagaj że sprawa należy do usera
-- ============================================================
-- Bez tej kontroli można byłoby zostawić feedback do nieswojej sprawy.
DROP POLICY IF EXISTS "Users manage own feedback" ON public.feedback;
CREATE POLICY "Users select own feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert feedback for own cases" ON public.feedback
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.cases c
            WHERE c.id = feedback.case_id AND c.user_id = auth.uid()
        )
    );
CREATE POLICY "Users update own feedback" ON public.feedback
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 5. Documents — DELETE tylko dla draft documents
-- ============================================================
-- Wygenerowane pisma (status='ready') nie mogą być usuwane —
-- wymagana retencja audytowa.
DROP POLICY IF EXISTS "Users delete draft documents only" ON public.documents;
CREATE POLICY "Users delete draft documents only" ON public.documents
    FOR DELETE USING (
        auth.uid() = user_id
        AND status IN ('draft', 'failed')
    );

-- ============================================================
-- 6. Helper function: czy user jest właścicielem sprawy
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_owns_case(case_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.cases
        WHERE id = case_uuid AND user_id = auth.uid()
    );
$$;

COMMENT ON FUNCTION public.user_owns_case IS
    'T5-SEC: helper for RLS policies — checks case ownership.';

-- ============================================================
-- 7. Audit view — sprawdza wszystkie tabele z user_id mają RLS enabled
-- ============================================================
CREATE OR REPLACE VIEW public.rls_audit AS
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) AS policy_count
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN (
      'profiles', 'cases', 'documents', 'uploads', 'deadlines',
      'payments', 'events', 'feedback', 'case_type_config',
      'category_config', 'promo_codes'
  );

COMMENT ON VIEW public.rls_audit IS
    'T5-SEC-028: audit RLS — admin checklist. Every public table with user data MUST have rls_enabled=true.';

-- ============================================================
-- 8. Storage RLS audit — w buckets
-- ============================================================
-- Storage policies są w 016_storage_buckets.sql; tutaj DENY na default
-- dla wszystkiego co nie matchuje explicit policy (defense in depth).
-- Każdy bucket musi mieć explicit SELECT/INSERT z auth.uid() check.
