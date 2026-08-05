// src/pages/admin/IncidentManager.tsx
// Admin page for managing incident intelligence records.
// Supports: list, filter, review, merge duplicates, verification workflow.

import { useState, useEffect, useCallback } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { supabase } from "../../lib/db/client";

interface IncidentRow {
  id: string;
  title: string;
  incident_type: string;
  incident_date: string | null;
  country_or_territory: string | null;
  verification_status: string;
  review_status: string;
  confidence: number;
  source_count: number;
  created_at: string;
}

const INCIDENT_TYPES: Record<string, string> = {
  civilian_harm: "Civilian Harm",
  healthcare: "Healthcare",
  displacement: "Displacement",
  aid_access: "Aid Access",
  infrastructure: "Infrastructure",
  legal: "Legal",
  political: "Political",
  other: "Other",
};

const VERIFICATION_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  single_source: { bg: "bg-amber-50", text: "text-amber-700", label: "Single Source" },
  multi_source: { bg: "bg-sky-50", text: "text-sky-700", label: "Multi Source" },
  official: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Official" },
  reviewed: { bg: "bg-purple-50", text: "text-purple-700", label: "Reviewed" },
};

const REVIEW_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-charcoal/5", text: "text-charcoal/60", label: "New" },
  processing: { bg: "bg-sky-50", text: "text-sky-700", label: "Processing" },
  failed: { bg: "bg-red-50", text: "text-red-700", label: "Failed" },
  review: { bg: "bg-amber-50", text: "text-amber-700", label: "In Review" },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Approved" },
  merged: { bg: "bg-purple-50", text: "text-purple-700", label: "Merged" },
  archived: { bg: "bg-charcoal/5", text: "text-charcoal/40", label: "Archived" },
};

function Badge({
  status,
  badges,
}: {
  status: string;
  badges: Record<string, { bg: string; text: string; label: string }>;
}) {
  const b = badges[status] ?? { bg: "bg-charcoal/5", text: "text-charcoal/50", label: status };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-mono ${b.bg} ${b.text}`}>
      {b.label}
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-sky-500" : value >= 25 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-mono text-charcoal/50">{value}%</span>
    </div>
  );
}

export function IncidentManager() {
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("incident_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filter !== "all") {
        if (filter.startsWith("type:")) {
          query = query.eq("incident_type", filter.slice(5));
        } else if (filter.startsWith("status:")) {
          query = query.eq("review_status", filter.slice(7));
        } else if (filter.startsWith("verification:")) {
          query = query.eq("verification_status", filter.slice(13));
        }
      }

      const { data, error } = await query;
      if (error) {
        setMessage({ type: "error", text: `Failed to load incidents: ${error.message}` });
      } else {
        setIncidents((data as IncidentRow[]) ?? []);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  async function handleUpdateStatus(incidentId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("incident_records")
        .update({ review_status: newStatus })
        .eq("id", incidentId);

      if (error) {
        setMessage({ type: "error", text: `Update failed: ${error.message}` });
      } else {
        setIncidents((prev) =>
          prev.map((i) => (i.id === incidentId ? { ...i, review_status: newStatus } : i)),
        );
        setMessage({ type: "success", text: `Incident → ${newStatus}` });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const typeCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  for (const i of incidents) {
    typeCounts[i.incident_type] = (typeCounts[i.incident_type] ?? 0) + 1;
    statusCounts[i.review_status] = (statusCounts[i.review_status] ?? 0) + 1;
  }

  return (
    <Container>
      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded text-sm font-mono ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-3 text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <PageIntro
          title="Incident Intelligence"
          description="Manage incident records, verify sources, and review intelligence."
        />
        <button
          onClick={loadIncidents}
          className="px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-charcoal/60 hover:bg-charcoal/5 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-charcoal/10 rounded-lg p-4">
          <div className="text-2xl font-serif font-semibold text-ink">{incidents.length}</div>
          <div className="text-xs font-mono text-charcoal/50 mt-1">Total Incidents</div>
        </div>
        {Object.entries(statusCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([status, count]) => (
            <div key={status} className="bg-white border border-charcoal/10 rounded-lg p-4">
              <div className="text-2xl font-serif font-semibold text-ink">{count}</div>
              <div className="text-xs font-mono text-charcoal/50 mt-1">
                {REVIEW_BADGES[status]?.label ?? status}
              </div>
            </div>
          ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
            filter === "all"
              ? "bg-ink text-white"
              : "bg-white border border-charcoal/20 text-charcoal/60 hover:bg-charcoal/5"
          }`}
        >
          All
        </button>
        <span className="text-xs font-mono text-charcoal/30 self-center mx-1">Type:</span>
        {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(`type:${key}`)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              filter === `type:${key}`
                ? "bg-ink text-white"
                : "bg-white border border-charcoal/20 text-charcoal/60 hover:bg-charcoal/5"
            }`}
          >
            {label} ({typeCounts[key] ?? 0})
          </button>
        ))}
        <span className="text-xs font-mono text-charcoal/30 self-center mx-1">Status:</span>
        {["new", "review", "approved"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(`status:${status}`)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              filter === `status:${status}`
                ? "bg-ink text-white"
                : "bg-white border border-charcoal/20 text-charcoal/60 hover:bg-charcoal/5"
            }`}
          >
            {REVIEW_BADGES[status]?.label ?? status}
          </button>
        ))}
      </div>

      {/* Incident table */}
      <div className="bg-white border border-charcoal/10 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 font-mono text-sm text-charcoal/40">Loading incidents…</div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12 font-mono text-sm text-charcoal/40">
            No incident records found. Incidents will appear here as collectors run.
          </div>
        ) : (
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-charcoal/50 text-xs uppercase tracking-widest">
                <th className="py-3 px-3 font-normal">Title</th>
                <th className="py-3 px-3 font-normal">Type</th>
                <th className="py-3 px-3 font-normal">Date</th>
                <th className="py-3 px-3 font-normal">Location</th>
                <th className="py-3 px-3 font-normal">Verification</th>
                <th className="py-3 px-3 font-normal">Confidence</th>
                <th className="py-3 px-3 font-normal">Sources</th>
                <th className="py-3 px-3 font-normal">Status</th>
                <th className="py-3 px-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b border-charcoal/5 hover:bg-bone/50 transition-colors"
                >
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-medium text-ink truncate" title={incident.title}>
                      {incident.title}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-charcoal/60">
                      {INCIDENT_TYPES[incident.incident_type] ?? incident.incident_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-charcoal/50 text-xs">
                    {formatDate(incident.incident_date)}
                  </td>
                  <td className="py-3 px-3 text-charcoal/50">
                    {incident.country_or_territory ?? "—"}
                  </td>
                  <td className="py-3 px-3">
                    <Badge status={incident.verification_status} badges={VERIFICATION_BADGES} />
                  </td>
                  <td className="py-3 px-3">
                    <ConfidenceBar value={incident.confidence} />
                  </td>
                  <td className="py-3 px-3 text-center text-charcoal/50">
                    {incident.source_count}
                  </td>
                  <td className="py-3 px-3">
                    <Badge status={incident.review_status} badges={REVIEW_BADGES} />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      {incident.review_status === "new" && (
                        <button
                          onClick={() => handleUpdateStatus(incident.id, "review")}
                          className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-mono transition-colors"
                        >
                          Review
                        </button>
                      )}
                      {incident.review_status === "review" && (
                        <button
                          onClick={() => handleUpdateStatus(incident.id, "approved")}
                          className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-mono transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {incident.review_status !== "archived" && (
                        <button
                          onClick={() => handleUpdateStatus(incident.id, "archived")}
                          className="text-xs px-2 py-1 rounded border border-charcoal/10 text-charcoal/40 hover:text-red-600 font-mono transition-colors"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Type breakdown */}
      <div className="mt-6 bg-white border border-charcoal/10 rounded-lg p-6">
        <h3 className="font-serif text-base font-semibold text-ink mb-3">Incident Type Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-mono text-charcoal/60">{label}</span>
              <span className="text-sm font-mono font-semibold text-ink">{typeCounts[key] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
