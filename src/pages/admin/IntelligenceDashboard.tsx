// src/pages/admin/IntelligenceDashboard.tsx
// Unified intelligence overview — combines collector health, pipeline metrics,
// data quality, and coverage gaps into a single operational view.

import { useEffect, useState } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { SystemHealthPanel } from "../../components/admin/SystemHealthPanel";
import { CollectorStatusGrid } from "../../components/admin/CollectorStatusGrid";
import { IngestionChart } from "../../components/admin/IngestionChart";
import { ConfidenceDistribution } from "../../components/admin/ConfidenceDistribution";
import { DataFreshnessPanel } from "../../components/admin/DataFreshnessPanel";
import { AutoRefreshProvider } from "../../components/admin/shared/AutoRefreshProvider";
import { useAutoRefresh } from "../../components/admin/shared/useAutoRefresh";
import {
  MonitoringProvider,
  useMonitoring,
} from "../../lib/collectors/monitoring/MonitoringContext";
import { supabase } from "../../lib/db/client";

interface QuickStats {
  totalFeeds: number;
  enabledFeeds: number;
  totalIncidents: number;
  pendingReview: number;
  recentRuns: number;
  failedRuns: number;
}

function IntelligenceDashboardContent() {
  const { report, alerts, activeAlertCount, refresh } = useMonitoring();
  const autoRefresh = useAutoRefresh();
  const [stats, setStats] = useState<QuickStats>({
    totalFeeds: 0,
    enabledFeeds: 0,
    totalIncidents: 0,
    pendingReview: 0,
    recentRuns: 0,
    failedRuns: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        // Feeds
        const { count: totalFeeds } = await supabase
          .from("feeds")
          .select("*", { count: "exact", head: true });
        const { count: enabledFeeds } = await supabase
          .from("feeds")
          .select("*", { count: "exact", head: true })
          .eq("enabled", true);

        // Incidents
        const { count: totalIncidents } = await supabase
          .from("incident_records")
          .select("*", { count: "exact", head: true });
        const { count: pendingReview } = await supabase
          .from("incident_records")
          .select("*", { count: "exact", head: true })
          .eq("review_status", "new");

        // Recent collector runs
        const { count: recentRuns } = await supabase
          .from("collector_runs")
          .select("*", { count: "exact", head: true });
        const { count: failedRuns } = await supabase
          .from("collector_runs")
          .select("*", { count: "exact", head: true })
          .eq("status", "failed");

        setStats({
          totalFeeds: totalFeeds ?? 0,
          enabledFeeds: enabledFeeds ?? 0,
          totalIncidents: totalIncidents ?? 0,
          pendingReview: pendingReview ?? 0,
          recentRuns: recentRuns ?? 0,
          failedRuns: failedRuns ?? 0,
        });
      } catch {
        // Stats are best-effort
      }
    }

    loadStats();
  }, []);

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <PageIntro
          title="Intelligence Dashboard"
          description="Unified operational view of collectors, AI pipeline, and data quality."
        />
        <button
          onClick={refresh}
          className="px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-charcoal/60 hover:bg-charcoal/5 transition-colors"
        >
          {autoRefresh.enabled ? "Auto-refreshing" : "Refresh"}
        </button>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total Feeds", value: stats.totalFeeds },
          { label: "Enabled", value: stats.enabledFeeds },
          { label: "Incidents", value: stats.totalIncidents },
          { label: "Pending Review", value: stats.pendingReview },
          { label: "Runs", value: stats.recentRuns },
          { label: "Failed", value: stats.failedRuns },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-charcoal/10 rounded-lg p-3 text-center"
          >
            <div className="text-xl font-serif font-semibold text-ink">{stat.value}</div>
            <div className="text-[10px] font-mono text-charcoal/40 mt-0.5 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts banner */}
      {activeAlertCount > 0 && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="font-mono text-sm text-red-700">
            {activeAlertCount} active alert{activeAlertCount !== 1 ? "s" : ""}
          </div>
          <div className="mt-1 text-xs text-red-600 font-mono">
            {alerts
              .filter((a) => a.status === "active")
              .slice(0, 3)
              .map((a) => a.message)
              .join(" · ")}
          </div>
        </div>
      )}

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-charcoal/10 rounded-lg p-4">
          <h3 className="font-serif text-sm font-semibold text-ink mb-3">Collector Health</h3>
          <SystemHealthPanel
            report={
              report ?? {
                generatedAt: new Date().toISOString(),
                collectors: [],
                summary: {
                  totalCollectors: 0,
                  activeCount: 0,
                  degradedCount: 0,
                  failedCount: 0,
                  unknownCount: 0,
                  staleCount: 0,
                  overallErrorRate: 0,
                  coverageGaps: [],
                },
              }
            }
          />
        </div>

        <div className="bg-white border border-charcoal/10 rounded-lg p-4">
          <h3 className="font-serif text-sm font-semibold text-ink mb-3">Collector Status</h3>
          <CollectorStatusGrid collectors={report?.collectors ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-charcoal/10 rounded-lg p-4">
          <h3 className="font-serif text-sm font-semibold text-ink mb-3">Ingestion Overview</h3>
          <IngestionChart window="24h" />
        </div>

        <div className="bg-white border border-charcoal/10 rounded-lg p-4">
          <h3 className="font-serif text-sm font-semibold text-ink mb-3">Data Freshness</h3>
          <DataFreshnessPanel sources={[]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-charcoal/10 rounded-lg p-4">
          <h3 className="font-serif text-sm font-semibold text-ink mb-3">Confidence Distribution</h3>
          <ConfidenceDistribution />
        </div>

        <div className="bg-white border border-charcoal/10 rounded-lg p-4">
          <h3 className="font-serif text-sm font-semibold text-ink mb-3">Coverage Gaps</h3>
          {report?.summary?.coverageGaps?.length ? (
            <ul className="space-y-1">
              {report.summary.coverageGaps.map((gap) => (
                <li
                  key={gap}
                  className="text-sm font-mono text-charcoal/60 bg-amber-50 px-3 py-1.5 rounded"
                >
                  No collector registered for: <span className="font-semibold">{gap}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-mono text-charcoal/40">All source types have collector coverage.</p>
          )}
        </div>
      </div>
    </Container>
  );
}

export function IntelligenceDashboard() {
  return (
    <AutoRefreshProvider defaultIntervalMs={60_000}>
      <MonitoringProvider>
        <IntelligenceDashboardContent />
      </MonitoringProvider>
    </AutoRefreshProvider>
  );
}
