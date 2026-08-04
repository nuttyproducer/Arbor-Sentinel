// src/lib/versioning/types.ts
// Version management types — content versions, diffs, and metadata.

export interface ContentVersion {
  id: string;
  contentType: string;
  contentId: string;
  versionNumber: number;
  data: Record<string, unknown>;
  diffFromPrevious: VersionDiff | null;
  createdBy: string | null;
  createdAt: string;
  changeSummary: string;
  stateAtVersion: string;
}

export interface VersionDiff {
  added: Record<string, unknown>;
  removed: Record<string, unknown>;
  changed: Record<string, { from: unknown; to: unknown }>;
}

export interface VersionMetadata {
  versionNumber: number;
  createdAt: string;
  createdBy: string | null;
  changeSummary: string;
  stateAtVersion: string;
  isCurrent: boolean;
}

export interface DiffResult {
  field: string;
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  before: unknown;
  after: unknown;
}
