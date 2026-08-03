// src/components/admin/shared/AutoRefreshProvider.tsx
import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import type { AutoRefreshInterval } from "../../../lib/admin/types";

const MAX_REFRESH_RATE_MS = 30_000; // 30s minimum

interface AutoRefreshContextValue {
  interval: AutoRefreshInterval;
  setInterval: (i: AutoRefreshInterval) => void;
}

const AutoRefreshContext = createContext<AutoRefreshContextValue>({
  interval: null,
  setInterval: () => {},
});

export function useAutoRefreshContext() {
  return useContext(AutoRefreshContext);
}

export interface AutoRefreshProviderProps {
  children: ReactNode;
  defaultInterval?: AutoRefreshInterval;
}

export function AutoRefreshProvider({
  children,
  defaultInterval = null,
}: AutoRefreshProviderProps) {
  const [interval, setIntervalState] = useState<AutoRefreshInterval>(defaultInterval);

  const setInterval = useCallback((i: AutoRefreshInterval) => {
    setIntervalState(i);
  }, []);

  return (
    <AutoRefreshContext.Provider value={{ interval, setInterval }}>
      {children}
    </AutoRefreshContext.Provider>
  );
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

const INTERVAL_OPTIONS: Array<{ value: AutoRefreshInterval; label: string }> = [
  { value: null, label: "Off" },
  { value: 30_000, label: "30s" },
  { value: 60_000, label: "60s" },
  { value: 300_000, label: "5 min" },
];

export function AutoRefreshControls() {
  const { interval, setInterval } = useAutoRefreshContext();

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Auto-refresh interval">
      {INTERVAL_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => setInterval(opt.value)}
          className={`font-mono text-[10px] px-2 py-1 rounded border transition-colors min-h-[32px] ${
            interval === opt.value
              ? "bg-ink text-paper border-ink"
              : "bg-white text-charcoal/50 border-charcoal/10 hover:border-charcoal/30"
          }`}
          aria-pressed={interval === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
