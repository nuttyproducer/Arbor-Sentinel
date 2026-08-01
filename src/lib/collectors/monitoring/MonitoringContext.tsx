import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
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
  const healthRef = useRef(new HealthMonitor());
  const alertRef = useRef(new AlertSystem());
  const metricsRef = useRef(new MetricsCollector());

  const [report, setReport] = useState<HealthReport>(
    healthRef.current.generateReport(),
  );
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  const refresh = useCallback(() => {
    const r = healthRef.current.generateReport();
    setReport(r);
    setAlerts(alertRef.current.getAllEvents());
    setActiveAlertCount(alertRef.current.getActiveCount());
  }, []);

  const syncRegistrations = useCallback(
    (registrations: CollectorRegistration[]) => {
      healthRef.current.syncRegistrations(registrations);
      refresh();
    },
    [refresh],
  );

  const recordRun = useCallback(
    (
      collectorName: string,
      sourceType: string,
      result: CollectResult,
    ) => {
      healthRef.current.recordRun(collectorName, sourceType, result);
      metricsRef.current.recordRun(
        result.sourceId,
        collectorName,
        sourceType,
        result,
      );

      // Evaluate alerts
      const snapshot = healthRef.current.getSnapshot(collectorName);
      if (snapshot) {
        // Auto-resolve if recovered
        alertRef.current.autoResolve(collectorName, snapshot);
        // Check for new alerts
        alertRef.current.evaluate([snapshot]);
      }

      refresh();
    },
    [refresh],
  );

  const recordError = useCallback(
    (collectorName: string, sourceType: string, error: Error) => {
      healthRef.current.recordError(collectorName, sourceType, error);

      const snapshot = healthRef.current.getSnapshot(collectorName);
      if (snapshot) {
        alertRef.current.evaluate([snapshot]);
      }

      refresh();
    },
    [refresh],
  );

  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      alertRef.current.acknowledge(alertId);
      refresh();
    },
    [refresh],
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      alertRef.current.resolve(alertId);
      refresh();
    },
    [refresh],
  );

  const getMetrics = useCallback(
    (window: MetricsWindow): SystemMetrics => {
      return metricsRef.current.getSystemMetrics(window);
    },
    [],
  );

  return (
    <MonitoringContext.Provider
      value={{
        healthMonitor: healthRef.current,
        alertSystem: alertRef.current,
        metricsCollector: metricsRef.current,
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
