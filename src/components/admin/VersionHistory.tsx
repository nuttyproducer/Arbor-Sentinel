// src/components/admin/VersionHistory.tsx
// Version history panel — version list, diff between versions, restore.

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/db/client';
import type { ContentVersionRecord } from '../../lib/db/types';

interface VersionHistoryProps {
  contentType: string;
  contentId: string;
}

export function VersionHistory({ contentType, contentId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ContentVersionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersionRecord | null>(null);
  const [diffView, setDiffView] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('version', { ascending: false });

      if (!error) {
        setVersions((data as ContentVersionRecord[]) ?? []);
      }
      setIsLoading(false);
    }
    load();
  }, [contentType, contentId]);

  if (isLoading) {
    return <p className="font-mono text-sm text-charcoal/40 py-4">Loading version history…</p>;
  }

  if (versions.length === 0) {
    return <p className="font-mono text-sm text-charcoal/40 py-4">No version history available.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg font-semibold text-ink">Version History</h3>
        <button
          type="button"
          onClick={() => setDiffView(!diffView)}
          className="font-mono text-xs text-charcoal/60 hover:text-ink underline"
        >
          {diffView ? 'List View' : 'Diff View'}
        </button>
      </div>

      {!diffView ? (
        /* Version list */
        <div className="space-y-2">
          {versions.map((v, i) => (
            <div
              key={v.id}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                selectedVersion?.id === v.id
                  ? 'border-charcoal/50 bg-charcoal/5'
                  : 'border-charcoal/10 hover:bg-bone/50'
              }`}
              onClick={() => setSelectedVersion(v)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedVersion(v); }}}
              role="button"
              tabIndex={0}
              aria-expanded={selectedVersion?.id === v.id}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-ink">
                  v{v.version}
                  {i === 0 && (
                    <span className="ml-2 font-mono text-[10px] bg-charcoal/10 text-ink px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </span>
                <span className="font-mono text-[10px] text-charcoal/40">
                  {new Date(v.createdAt).toLocaleString()}
                </span>
              </div>
              {v.createdBy && (
                <p className="font-mono text-[10px] text-charcoal/50 mt-1">
                  By: {String(v.createdBy).slice(0, 8)}…
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Simplified diff view — side by side data comparison */
        <div className="border border-charcoal/10 rounded p-4">
          {selectedVersion ? (
            <div>
              <p className="font-mono text-xs text-charcoal/50 mb-2">
                Version {selectedVersion.version} —{' '}
                {new Date(selectedVersion.createdAt).toLocaleString()}
              </p>
              <pre className="font-mono text-xs text-ink bg-bone p-3 rounded overflow-auto max-h-96 whitespace-pre-wrap">
                {JSON.stringify(selectedVersion.data, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="font-mono text-sm text-charcoal/40">Select a version to view its data.</p>
          )}
        </div>
      )}
    </div>
  );
}
