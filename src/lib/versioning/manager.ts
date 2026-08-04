// src/lib/versioning/manager.ts
// Version manager — create, list, get, and rollback versions.

import { supabase } from '../db/client';
import { computeDiff, generateChangeSummary } from './diff';
import type { ContentVersion, VersionMetadata } from './types';

/**
 * Create a new version for a content record.
 */
export async function createVersion(
  contentType: string,
  contentId: string,
  data: Record<string, unknown>,
  createdBy?: string,
): Promise<string | null> {
  // Get the previous version for diffing
  const { data: prevVersions } = await supabase
    .from('content_versions')
    .select('version, data')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .order('version', { ascending: false })
    .limit(1);

  const prevVersion = prevVersions?.[0];
  const newVersionNumber = (prevVersion?.version ?? 0) + 1;

  // Compute diff from previous
  const diff = prevVersion
    ? computeDiff(prevVersion.data as Record<string, unknown>, data)
    : null;

  const changeSummary = diff ? generateChangeSummary(diff) : 'Initial version';

  const { data: created, error } = await supabase
    .from('content_versions')
    .insert({
      content_type: contentType,
      content_id: contentId,
      version: newVersionNumber,
      data,
      created_by: createdBy ?? null,
      change_summary: changeSummary,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Version creation failed:', error.message);
    return null;
  }

  return created.id;
}

/**
 * List all versions for a content item.
 */
export async function listVersions(
  contentType: string,
  contentId: string,
): Promise<VersionMetadata[]> {
  const { data, error } = await supabase
    .from('content_versions')
    .select('version, created_at, created_by, change_summary, data')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .order('version', { ascending: false });

  if (error || !data) return [];

  const versions = data as Array<{
    version: number;
    created_at: string;
    created_by: string | null;
    change_summary: string;
    data: Record<string, unknown>;
  }>;

  return versions.map((v, i) => ({
    versionNumber: v.version,
    createdAt: v.created_at,
    createdBy: v.created_by,
    changeSummary: v.change_summary ?? '',
    stateAtVersion: String(v.data?.review_status ?? 'draft'),
    isCurrent: i === 0,
  }));
}

/**
 * Get a specific version's full data.
 */
export async function getVersion(
  contentType: string,
  contentId: string,
  versionNumber: number,
): Promise<ContentVersion | null> {
  const { data, error } = await supabase
    .from('content_versions')
    .select('*')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .eq('version', versionNumber)
    .single();

  if (error || !data) return null;

  return data as ContentVersion;
}

/**
 * Get the two most recent versions for comparison.
 */
export async function getLatestDiff(
  contentType: string,
  contentId: string,
): Promise<{ current: ContentVersion | null; previous: ContentVersion | null }> {
  const { data } = await supabase
    .from('content_versions')
    .select('*')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .order('version', { ascending: false })
    .limit(2);

  const versions = (data as ContentVersion[]) ?? [];
  return {
    current: versions[0] ?? null,
    previous: versions[1] ?? null,
  };
}
