-- ============================================================================
-- Arbor Sentinel — Storage Buckets
-- Supabase Storage configuration for document and export storage
-- ============================================================================

-- Evidence documents bucket (private by default — public access via signed URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-documents',
  'evidence-documents',
  false, -- private: access controlled via RLS
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/zip',
    'application/gzip',
    'text/plain',
    'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Dossier exports bucket (public — generated dossiers for download)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dossier-exports',
  'dossier-exports',
  true, -- public: generated content for download
  104857600, -- 100MB
  ARRAY[
    'application/pdf',
    'text/html',
    'application/epub+zip'
  ]
) ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS policies ─────────────────────────────────────────────────────

-- Evidence documents: admin upload, authenticated read if content is published
CREATE POLICY "evidence_documents_admin_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'evidence-documents'
    AND (is_admin() OR has_role('researcher'))
  );

CREATE POLICY "evidence_documents_public_read"
  ON storage.objects FOR SELECT TO anon
  USING (
    bucket_id = 'evidence-documents'
    -- In production, verify the parent evidence item is published
  );

CREATE POLICY "evidence_documents_auth_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'evidence-documents');

-- Dossier exports: public read, admin write
CREATE POLICY "dossier_exports_admin_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dossier-exports' AND is_admin());

CREATE POLICY "dossier_exports_public_read"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'dossier-exports');
