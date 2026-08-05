// src/components/admin/shared/AutoRefreshProvider.tsx
import { useState, useCallback, type ReactNode } from "react";
import type { AutoRefreshInterval } from "../../../lib/admin/types";
import {
  AutoRefreshContext,
  useAutoRefreshContext,
  INTERVAL_OPTIONS,
} from "./useAutoRefresh";

export interface AutoRefreshProviderProps {
  children: ReactNode;
  defaultInterval?: AutoRefreshInterval;
}

export function AutoRefreshProvider({
  children,
  defaultInterval = null,
}: AutoRefreshProviderProps) {
  const [interval, setIntervalState] = useState<AutoRefreshInterval>(defaultInterval);
  const [prevDefaultInterval, setPrevDefaultInterval] = useState(defaultInterval);

  // Keep state in sync when the `defaultInterval` prop changes (e.g. a
  // dashboard switches auto-refresh off by re-rendering with `null`).
  if (prevDefaultInterval !== defaultInterval) {
    setPrevDefaultInterval(defaultInterval);
    setIntervalState(defaultInterval);
  }

  const setInterval = useCallback((i: AutoRefreshInterval) => {
    setIntervalState(i);
  }, []);

  return (
    <AutoRefreshContext.Provider value={{ interval, setInterval }}>
      {children}
    </AutoRefreshContext.Provider>
  );
}

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
