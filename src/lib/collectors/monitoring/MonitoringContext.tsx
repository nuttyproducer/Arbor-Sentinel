import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { HealthMonitor } from "./HealthMonitor";
import { AlertSystem } from "./AlertSystem";
import { MetricsCollector } from "./MetricsCollector";
import type { HealthReport, AlertEvent, SystemMetrics, MetricsWindow } from "./types";
import type { CollectResult } from "../types";
import type { CollectorRegistration } from "../types";

// ── Context Shape ────────────────────────────────────────────────────────

interface MonitoringContextValue {
  healthMonitor: HealthMonitor;
  alertSystem: AlertSystem;
  metricsCollector: MetricsCollector;

  // Derived state (triggers re-renders)
  report: HealthReport;
  alerts: AlertEvent[];
  activeAlertCount: number;

  // Actions
  syncRegistrations: (registrations: CollectorRegistration[]) => void;
  recordRun: (
    collectorName: string,
    sourceType: string,
    result: CollectResult,
  ) => void;
  recordError: (
    collectorName: string,
    sourceType: string,
    error: Error,
  ) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  getMetrics: (window: MetricsWindow) => SystemMetrics;
  refresh: () => void;
}

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────

export function MonitoringProvider({ children }: { children: ReactNode }) {
  // Monitors are created once and kept stable for the provider's lifetime.
  // Held in state (not refs) so consumers may read them during render.
  const [monitors] = useState(() => ({
    healthMonitor: new HealthMonitor(),
    alertSystem: new AlertSystem(),
    metricsCollector: new MetricsCollector(),
  }));

  const [report, setReport] = useState<HealthReport>(
    monitors.healthMonitor.generateReport(),
  );
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  const refresh = useCallback(() => {
    const r = monitors.healthMonitor.generateReport();
    setReport(r);
    setAlerts(monitors.alertSystem.getAllEvents());
    setActiveAlertCount(monitors.alertSystem.getActiveCount());
  }, [monitors]);

  const syncRegistrations = useCallback(
    (registrations: CollectorRegistration[]) => {
      monitors.healthMonitor.syncRegistrations(registrations);
      refresh();
    },
    [monitors, refresh],
  );

  const recordRun = useCallback(
    (
      collectorName: string,
      sourceType: string,
      result: CollectResult,
    ) => {
      monitors.healthMonitor.recordRun(collectorName, sourceType, result);
      monitors.metricsCollector.recordRun(
        result.sourceId,
        collectorName,
        sourceType,
        result,
      );

      // Evaluate alerts
      const snapshot = monitors.healthMonitor.getSnapshot(collectorName);
      if (snapshot) {
        // Auto-resolve if recovered
        monitors.alertSystem.autoResolve(collectorName, snapshot);
        // Check for new alerts
        monitors.alertSystem.evaluate([snapshot]);
      }

      refresh();
    },
    [monitors, refresh],
  );

  const recordError = useCallback(
    (collectorName: string, sourceType: string, error: Error) => {
      monitors.healthMonitor.recordError(collectorName, sourceType, error);

      const snapshot = monitors.healthMonitor.getSnapshot(collectorName);
      if (snapshot) {
        monitors.alertSystem.evaluate([snapshot]);
      }

      refresh();
    },
    [monitors, refresh],
  );

  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      monitors.alertSystem.acknowledge(alertId);
      refresh();
    },
    [monitors, refresh],
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      monitors.alertSystem.resolve(alertId);
      refresh();
    },
    [monitors, refresh],
  );

  const getMetrics = useCallback(
    (window: MetricsWindow): SystemMetrics => {
      return monitors.metricsCollector.getSystemMetrics(window);
    },
    [monitors],
  );

  return (
    <MonitoringContext.Provider
      value={{
        healthMonitor: monitors.healthMonitor,
        alertSystem: monitors.alertSystem,
        metricsCollector: monitors.metricsCollector,
        report,
        alerts,
        activeAlertCount,
        syncRegistrations,
        recordRun,
        recordError,
        acknowledgeAlert,
        resolveAlert,
        getMetrics,
        refresh,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useMonitoring(): MonitoringContextValue {
  const ctx = useContext(MonitoringContext);
  if (!ctx) {
    throw new Error(
      "useMonitoring must be used within a <MonitoringProvider>",
    );
  }
  return ctx;
}
