-- Migration 012: Security extras — pgcrypto + szyfrowany PESEL
-- Source: plan/00_critical_review.md (zmiana #4 vs spec)
--
-- Spec miał `pesel TEXT` w jasnym. Dla zgodności z RODO szyfrujemy
-- AES-256 (pgcrypto). Klucz w `app.settings.pesel_encryption_key` (Supabase
-- Vault / GUC ustawiany na poziomie projektu).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Dodaj kolumnę szyfrowaną
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pesel_encrypted BYTEA;

-- 2. Helper: encrypt — odczytuje klucz z GUC `app.settings.pesel_encryption_key`
CREATE OR REPLACE FUNCTION public.encrypt_pesel(plain TEXT)
RETURNS BYTEA AS $$
DECLARE
    key TEXT;
BEGIN
    IF plain IS NULL OR length(plain) = 0 THEN
        RETURN NULL;
    END IF;
    key := current_setting('app.settings.pesel_encryption_key', true);
    IF key IS NULL OR length(key) < 32 THEN
        RAISE EXCEPTION 'pesel_encryption_key not configured (min 32 chars)';
    END IF;
    RETURN pgp_sym_encrypt(plain, key);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Helper: decrypt — dostępny tylko dla service_role (RLS-bypass)
CREATE OR REPLACE FUNCTION public.decrypt_pesel(cipher BYTEA)
RETURNS TEXT AS $$
DECLARE
    key TEXT;
BEGIN
    IF cipher IS NULL THEN
        RETURN NULL;
    END IF;
    key := current_setting('app.settings.pesel_encryption_key', true);
    IF key IS NULL OR length(key) < 32 THEN
        RAISE EXCEPTION 'pesel_encryption_key not configured (min 32 chars)';
    END IF;
    RETURN pgp_sym_decrypt(cipher, key);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. Trigger: auto-szyfrowanie podczas INSERT/UPDATE z plaintext kolumny `pesel`
CREATE OR REPLACE FUNCTION public.trg_pesel_encrypt()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pesel IS NOT NULL AND NEW.pesel != '' THEN
        NEW.pesel_encrypted := public.encrypt_pesel(NEW.pesel);
        NEW.pesel := NULL; -- nigdy nie persistujemy plaintextu
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_encrypt_pesel
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.trg_pesel_encrypt();

COMMENT ON COLUMN public.profiles.pesel IS
    'DEPRECATED — write-only adapter. Trigger szyfruje wartość do pesel_encrypted i czyści to pole. Klient czyta przez decrypt_pesel(pesel_encrypted) tylko w server-only kontekstach.';
