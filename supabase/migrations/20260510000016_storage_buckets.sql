-- Migration 016: Storage buckets + RLS na storage.objects
-- Source: knowledge base chunk T07_db_schema_010_011 (sekcja 3.2)
--
-- 4 buckety:
--   uploads     — pliki użytkowników (mandat/wezwanie/nakaz), private, 10MB, PDF/JPG/PNG
--   documents   — wygenerowane PDF-y, private, signed URLs (TTL 1h)
--   avatars     — opcjonalne zdjęcia profilowe, public, 2MB
--   public      — assety statyczne (logo, OG images), public

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('uploads', 'uploads', false, 10485760,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/webp']),
    ('documents', 'documents', false, 10485760,
        ARRAY['application/pdf']),
    ('avatars', 'avatars', true, 2097152,
        ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('public', 'public', true, 5242880, NULL)
ON CONFLICT (id) DO UPDATE
    SET file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types,
        public = EXCLUDED.public;

-- Konwencja ścieżek: <bucket>/<auth.uid()>/<random>-<filename>
-- RLS sprawdza pierwszy segment ścieżki — musi być = auth.uid().

-- Uploads: tylko właściciel
CREATE POLICY "uploads_owner_select" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]
    );
CREATE POLICY "uploads_owner_insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]
    );
CREATE POLICY "uploads_owner_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Documents: tylko właściciel czyta (signed URL); zapis wyłącznie service_role
CREATE POLICY "documents_owner_select" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Avatars: właściciel zarządza, każdy widzi (bucket public)
CREATE POLICY "avatars_owner_write" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
    );
CREATE POLICY "avatars_owner_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
    );
CREATE POLICY "avatars_owner_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
    );
CREATE POLICY "avatars_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Public: read-only dla wszystkich, zapis tylko service_role
CREATE POLICY "public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'public');
