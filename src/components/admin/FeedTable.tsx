// src/components/admin/FeedTable.tsx
// Table component for the Feed Manager — lists all feeds with status, health, and actions.

import { useState } from "react";

export interface FeedRow {
  id: string;
  name: string;
  url: string;
  source_type: string;
  category: string;
  parser: string;
  language: string;
  enabled: boolean;
  poll_interval_minutes: number;
  trust_level: number;
  health_status: string;
  last_fetched_at: string | null;
  last_success_at: string | null;
  failure_count: number;
  last_error: string | null;
}

interface FeedTableProps {
  feeds: FeedRow[];
  onToggle: (feedId: string, enabled: boolean) => Promise<void>;
  onSync: (feedId: string) => Promise<void>;
  onEdit: (feed: FeedRow) => void;
  onDelete: (feedId: string) => Promise<void>;
  loading: boolean;
}

const HEALTH_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  unknown: { bg: "bg-charcoal/5", text: "text-charcoal/60", label: "Unknown" },
  active: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" },
  degraded: { bg: "bg-amber-50", text: "text-amber-700", label: "Degraded" },
  failed: { bg: "bg-red-50", text: "text-red-700", label: "Failed" },
};

function HealthBadge({ status }: { status: string }) {
  const badge = HEALTH_BADGES[status] ?? HEALTH_BADGES.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono ${badge.bg} ${badge.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "active"
            ? "bg-emerald-500"
            : status === "degraded"
              ? "bg-amber-500"
              : status === "failed"
                ? "bg-red-500"
                : "bg-charcoal/30"
        }`}
      />
      {badge.label}
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedTable({
  feeds,
  onToggle,
  onSync,
  onEdit,
  onDelete,
  loading,
}: FeedTableProps) {
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function handleSync(feedId: string) {
    setSyncing((prev) => new Set(prev).add(feedId));
    try {
      await onSync(feedId);
    } finally {
      setSyncing((prev) => {
        const next = new Set(prev);
        next.delete(feedId);
        return next;
      });
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 font-mono text-sm text-charcoal/40">
        Loading feeds…
      </div>
    );
  }

  if (feeds.length === 0) {
    return (
      <div className="text-center py-12 font-mono text-sm text-charcoal/40">
        No feeds configured. Add one to start collecting.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-charcoal/10 text-left text-charcoal/50 text-xs uppercase tracking-widest">
            <th className="py-3 px-3 font-normal">Feed</th>
            <th className="py-3 px-3 font-normal">Source Type</th>
            <th className="py-3 px-3 font-normal">Parser</th>
            <th className="py-3 px-3 font-normal">Interval</th>
            <th className="py-3 px-3 font-normal">Health</th>
            <th className="py-3 px-3 font-normal">Last Fetch</th>
            <th className="py-3 px-3 font-normal">Failures</th>
            <th className="py-3 px-3 font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {feeds.map((feed) => (
            <tr
              key={feed.id}
              className={`border-b border-charcoal/5 hover:bg-bone/50 transition-colors ${
                !feed.enabled ? "opacity-50" : ""
              }`}
            >
              <td className="py-3 px-3">
                <div className="font-medium text-ink">{feed.name}</div>
                <div className="text-xs text-charcoal/40 truncate max-w-xs" title={feed.url}>
                  {feed.url}
                </div>
              </td>
              <td className="py-3 px-3 text-charcoal/60">{feed.source_type}</td>
              <td className="py-3 px-3 text-charcoal/60">{feed.parser}</td>
              <td className="py-3 px-3 text-charcoal/60">{feed.poll_interval_minutes}m</td>
              <td className="py-3 px-3">
                <HealthBadge status={feed.health_status} />
              </td>
              <td className="py-3 px-3 text-charcoal/50 text-xs">
                {formatDate(feed.last_fetched_at)}
              </td>
              <td className="py-3 px-3">
                {feed.failure_count > 0 && (
                  <span className="text-red-600 font-medium">{feed.failure_count}</span>
                )}
                {feed.failure_count === 0 && (
                  <span className="text-charcoal/30">0</span>
                )}
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  {/* Enable/Disable Toggle */}
                  <button
                    onClick={() => onToggle(feed.id, !feed.enabled)}
                    className={`text-xs px-2 py-1 rounded border font-mono transition-colors ${
                      feed.enabled
                        ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        : "border-charcoal/20 text-charcoal/50 hover:bg-charcoal/5"
                    }`}
                    title={feed.enabled ? "Disable feed" : "Enable feed"}
                  >
                    {feed.enabled ? "On" : "Off"}
                  </button>

                  {/* Sync Now */}
                  <button
                    onClick={() => handleSync(feed.id)}
                    disabled={syncing.has(feed.id)}
                    className="text-xs px-2 py-1 rounded border border-sky-200 text-sky-700 hover:bg-sky-50 font-mono transition-colors disabled:opacity-50 disabled:cursor-wait"
                    title="Manual sync"
                  >
                    {syncing.has(feed.id) ? "⋯" : "Sync"}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEdit(feed)}
                    className="text-xs px-2 py-1 rounded border border-charcoal/20 text-charcoal/60 hover:bg-charcoal/5 font-mono transition-colors"
                    title="Edit feed"
                  >
                    Edit
                  </button>

                  {/* Delete with confirmation */}
                  {confirmDelete === feed.id ? (
                    <span className="flex items-center gap-1">
                      <button
                        onClick={async () => {
                          await onDelete(feed.id);
                          setConfirmDelete(null);
                        }}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 font-mono transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-1 py-1 text-charcoal/40 hover:text-ink"
                      >
                        ✕
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(feed.id)}
                      className="text-xs px-2 py-1 rounded border border-transparent text-charcoal/30 hover:text-red-600 font-mono transition-colors"
                      title="Delete feed"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
