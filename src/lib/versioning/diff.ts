// src/lib/versioning/diff.ts
// Diff engine — compare two content versions and produce structured diff.

import type { VersionDiff, DiffResult } from './types';

/**
 * Compute a field-level diff between two version data objects.
 */
export function computeDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): VersionDiff {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  const added: Record<string, unknown> = {};
  const removed: Record<string, unknown> = {};
  const changed: Record<string, { from: unknown; to: unknown }> = {};

  for (const key of allKeys) {
    // Skip internal/timestamp fields
    if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'version') continue;

    const beforeVal = before[key];
    const afterVal = after[key];

    if (beforeVal === undefined && afterVal !== undefined) {
      added[key] = afterVal;
    } else if (beforeVal !== undefined && afterVal === undefined) {
      removed[key] = beforeVal;
    } else if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      changed[key] = { from: beforeVal, to: afterVal };
    }
  }

  return { added, removed, changed };
}

/**
 * Compare two versions and produce a list of human-readable diff results.
 */
export function compareVersions(
  older: Record<string, unknown>,
  newer: Record<string, unknown>,
): DiffResult[] {
  const results: DiffResult[] = [];
  const diff = computeDiff(older, newer);

  for (const [key, value] of Object.entries(diff.added)) {
    results.push({ field: key, type: 'added', before: null, after: value });
  }

  for (const [key, value] of Object.entries(diff.removed)) {
    results.push({ field: key, type: 'removed', before: value, after: null });
  }

  for (const [key, change] of Object.entries(diff.changed)) {
    results.push({ field: key, type: 'changed', before: change.from, after: change.to });
  }

  return results;
}

/**
 * Generate a human-readable change summary from a diff.
 */
export function generateChangeSummary(diff: VersionDiff): string {
  const parts: string[] = [];
  const addedFields = Object.keys(diff.added);
  const removedFields = Object.keys(diff.removed);
  const changedFields = Object.keys(diff.changed);

  if (addedFields.length > 0) {
    parts.push(`Added: ${addedFields.slice(0, 3).join(', ')}${addedFields.length > 3 ? ` +${addedFields.length - 3} more` : ''}`);
  }

  if (changedFields.length > 0) {
    parts.push(`Updated: ${changedFields.slice(0, 3).join(', ')}${changedFields.length > 3 ? ` +${changedFields.length - 3} more` : ''}`);
  }

  if (removedFields.length > 0) {
    parts.push(`Removed: ${removedFields.slice(0, 3).join(', ')}`);
  }

  return parts.join('; ') || 'No significant changes';
}
