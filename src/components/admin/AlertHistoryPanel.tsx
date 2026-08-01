import type { AlertEvent, AlertStatus } from "../../lib/collectors/monitoring/types";

interface AlertHistoryPanelProps {
  alerts: AlertEvent[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}

const severityStyles: Record<string, string> = {
  critical: "border-clay/30 bg-clay/[0.04]",
  warning: "border-amber/30 bg-amber/[0.04]",
  info: "border-charcoal/10 bg-charcoal/[0.02]",
};

const severityBadgeStyles: Record<string, string> = {
  critical: "bg-clay/10 text-clay",
  warning: "bg-amber/10 text-[#8B6914]",
  info: "bg-charcoal/10 text-charcoal/60",
};

const statusLabel: Record<AlertStatus, string> = {
  active: "Active",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function AlertHistoryPanel({
  alerts,
  onAcknowledge,
  onResolve,
}: AlertHistoryPanelProps) {
  if (alerts.length === 0) {
    return (
      <section aria-labelledby="alert-history-heading">
        <h2
          id="alert-history-heading"
          className="font-serif text-xl font-semibold text-ink mb-4"
        >
          Alerts
        </h2>
        <div className="border border-charcoal/10 rounded-lg p-6 text-center">
          <p className="text-charcoal/40 font-mono text-sm">
            No alerts have been triggered.
          </p>
          <p className="text-charcoal/30 font-mono text-xs mt-1">
            Alerts appear when collectors exceed configured thresholds for
            failures, stale data, or error rates.
          </p>
        </div>
      </section>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  return (
    <section aria-labelledby="alert-history-heading">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="alert-history-heading"
          className="font-serif text-xl font-semibold text-ink"
        >
          Alerts
        </h2>
        {activeAlerts.length > 0 && (
          <span className="font-mono text-xs text-clay font-medium bg-clay/10 px-2 py-0.5 rounded-full">
            {activeAlerts.length} active
          </span>
        )}
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${severityStyles[alert.severity]} ${
              alert.status === "resolved" ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold uppercase ${
                      severityBadgeStyles[alert.severity]
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">
                    {alert.type.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-[10px] text-charcoal/50">
                    {statusLabel[alert.status]}
                  </span>
                </div>

                <p className="font-mono text-xs font-medium text-ink mb-1">
                  {alert.collectorName.replace(/Collector$/, "")}
                </p>
                <p className="font-sans text-sm text-charcoal/70">
                  {alert.message}
                </p>

                <p className="font-mono text-[10px] text-charcoal/40 mt-2">
                  Fired: {formatDate(alert.firedAt)}
                  {alert.acknowledgedAt &&
                    ` · Ack: ${formatDate(alert.acknowledgedAt)}`}
                  {alert.resolvedAt &&
                    ` · Resolved: ${formatDate(alert.resolvedAt)}`}
                </p>
              </div>

              {alert.status === "active" && onAcknowledge && (
                <button
                  type="button"
                  onClick={() => onAcknowledge(alert.id)}
                  className="font-mono text-[10px] text-charcoal/50 hover:text-ink underline underline-offset-2 flex-shrink-0 min-h-[44px] flex items-center"
                >
                  Ack
                </button>
              )}
              {(alert.status === "active" || alert.status === "acknowledged") &&
                onResolve && (
                  <button
                    type="button"
                    onClick={() => onResolve(alert.id)}
                    className="font-mono text-[10px] text-charcoal/50 hover:text-green-700 underline underline-offset-2 flex-shrink-0 min-h-[44px] flex items-center"
                  >
                    Resolve
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
