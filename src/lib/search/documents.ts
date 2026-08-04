// src/lib/search/documents.ts
// Document upload/download client using Supabase Storage.

import { supabase } from '../db/client';

// ── Upload ────────────────────────────────────────────────────────────────────

export interface UploadOptions {
  bucket: 'evidence-documents' | 'dossier-exports';
  path: string;
  file: File | Blob;
  contentType?: string;
}

export async function uploadDocument(options: UploadOptions): Promise<string | null> {
  const { bucket, path, file, contentType } = options;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error(`Upload failed to ${bucket}/${path}:`, error.message);
    return null;
  }

  return data.path;
}

// ── Download URL ──────────────────────────────────────────────────────────────

export async function getDocumentUrl(
  bucket: 'evidence-documents' | 'dossier-exports',
  path: string,
): Promise<string | null> {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

// ── Signed URL (for private buckets) ──────────────────────────────────────────

export async function getSignedDocumentUrl(
  bucket: 'evidence-documents' | 'dossier-exports',
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.error(`Failed to create signed URL for ${bucket}/${path}:`, error.message);
    return null;
  }

  return data.signedUrl;
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteDocument(
  bucket: 'evidence-documents' | 'dossier-exports',
  paths: string[],
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) {
    console.error(`Failed to delete from ${bucket}:`, error.message);
    return false;
  }

  return true;
}

// ── List ──────────────────────────────────────────────────────────────────────

export async function listDocuments(
  bucket: 'evidence-documents' | 'dossier-exports',
  prefix?: string,
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix ?? '', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error(`Failed to list ${bucket}:`, error.message);
    return [];
  }

  return data;
}
