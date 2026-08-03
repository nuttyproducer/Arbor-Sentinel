// src/components/admin/shared/useAutoRefresh.ts
// Context, hooks, and config for auto-refresh. Separated from components
// to satisfy React Fast Refresh (only components in .tsx files).
import { createContext, useContext, useEffect, useRef } from "react";
import type { AutoRefreshInterval } from "../../../lib/admin/types";

export const MAX_REFRESH_RATE_MS = 30_000; // 30s minimum

interface AutoRefreshContextValue {
  interval: AutoRefreshInterval;
  setInterval: (i: AutoRefreshInterval) => void;
}

export const AutoRefreshContext = createContext<AutoRefreshContextValue>({
  interval: null,
  setInterval: () => {},
});

export function useAutoRefreshContext() {
  return useContext(AutoRefreshContext);
}

export function useAutoRefresh(
  callback: () => void,
  intervalMs: AutoRefreshInterval,
) {
  const callbackRef = useRef(callback);

  // Keep the ref in sync with the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (intervalMs === null) return;

    // Enforce max refresh rate
    const effectiveInterval = Math.max(intervalMs, MAX_REFRESH_RATE_MS);

    const id = setInterval(() => {
      callbackRef.current();
    }, effectiveInterval);

    return () => clearInterval(id);
  }, [intervalMs]);
}

export const INTERVAL_OPTIONS: Array<{ value: AutoRefreshInterval; label: string }> = [
  { value: null, label: "Off" },
  { value: 30_000, label: "30s" },
  { value: 60_000, label: "60s" },
  { value: 300_000, label: "5 min" },
];
