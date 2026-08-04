import { useEffect, useMemo } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { PageStatusNotice } from "../../components/pages/PageStatusNotice";
import { CollectorStatusTable } from "../../components/admin/CollectorStatusTable";
import { SystemHealthPanel } from "../../components/admin/SystemHealthPanel";
import { AlertHistoryPanel } from "../../components/admin/AlertHistoryPanel";
import {
  MonitoringProvider,
  useMonitoring,
} from "../../lib/collectors/monitoring/MonitoringContext";
import type { CollectorRegistration } from "../../lib/collectors/types";

/**
 * Inner component that consumes the monitoring context.
 * Separated so the provider can wrap just this page.
 */
function MonitoringDashboardContent() {
  const {
    report,
    alerts,
    activeAlertCount,
    syncRegistrations,
    acknowledgeAlert,
    resolveAlert,
    refresh,
  } = useMonitoring();

  // Build collector registrations from source data
  // In the static beta, this builds a registration list from the source registry
  useEffect(() => {
    // Import sources dynamically to avoid circular deps
    import("../../data/sources").then(({ sources }) => {
      const registrations: CollectorRegistration[] = [];

      for (const source of sources) {
        // Map each source to its collector registration
        registrations.push({
          name: `${source.sourceType}Collector`,
          supportedSourceTypes: [source.sourceType],
          description: `Collector for ${source.title}`,
          healthStatus: source.healthStatus,
          consecutiveFailures: source.failureCount,
        });
      }

      // Deduplicate by name
      const unique = registrations.filter(
        (r, i, arr) => arr.findIndex((x) => x.name === r.name) === i,
      );

      syncRegistrations(unique);
    }).catch(() => {
      // Sources module not available — dashboard shows empty state
    });
  }, [syncRegistrations]);

  const sortedCollectors = useMemo(
    () =>
      [...report.collectors].sort((a, b) => {
        // Failed first, then degraded, then active, then unknown
        const order = { failed: 0, degraded: 1, unknown: 2, active: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      }),
    [report.collectors],
  );

  return (
    <Container className="py-12">
      <PageIntro
        title="Monitoring Dashboard"
        subtitle="Collector health, system metrics, and alert history."
      />

      <PageStatusNotice status="static-preview">
        This dashboard shows in-memory monitoring state. Data resets on page
        reload. Collectors are triggered manually during the static beta —
        auto-scheduling is planned for a future milestone.
      </PageStatusNotice>

      {/* System health summary */}
      <div className="mb-10">
        <SystemHealthPanel summary={report.summary} />
      </div>

      {/* Alerts — show above the table when active */}
      {activeAlertCount > 0 && (
        <div className="mb-10">
          <AlertHistoryPanel
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            onResolve={resolveAlert}
          />
        </div>
      )}

      {/* Collector status table */}
      <div className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          Collectors
        </h2>
        <CollectorStatusTable collectors={sortedCollectors} />
        <p className="font-mono text-[10px] text-charcoal/40 mt-2">
          {report.collectors.length} collectors · Sorted by severity (failed
          first)
        </p>
      </div>

      {/* Alert history (all, when no active alerts shown above) */}
      {activeAlertCount === 0 && alerts.length > 0 && (
        <div className="mb-10">
          <AlertHistoryPanel
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            onResolve={resolveAlert}
          />
        </div>
      )}

      {/* Refresh */}
      <div className="border-t border-charcoal/10 pt-6 flex items-center justify-between">
        <p className="font-mono text-xs text-charcoal/40">
          Report generated: {new Date(report.generatedAt).toLocaleString()}
        </p>
        <button
          type="button"
          onClick={refresh}
          className="font-mono text-xs text-trust hover:text-trust/80 underline underline-offset-2 transition-colors min-h-[44px] flex items-center"
        >
          Refresh report
        </button>
      </div>
    </Container>
  );
}

/**
 * Monitoring dashboard page — admin access only.
 *
 * Route: /admin/monitoring
 *
 * Guardrail: This page is NOT linked from public navigation.
 * Monitoring data is admin-access only per the monitoring guardrails.
 */
export default function MonitoringDashboard() {
  return (
    <MonitoringProvider>
      <MonitoringDashboardContent />
    </MonitoringProvider>
  );
}
