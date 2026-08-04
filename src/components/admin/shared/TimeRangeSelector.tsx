// src/components/admin/shared/TimeRangeSelector.tsx
import { useCallback } from "react";
import type { DashboardTimeRange, TimeRangePreset } from "../../../lib/admin/types";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const PRESETS: Array<{ preset: TimeRangePreset; label: string; getRange: () => DashboardTimeRange }> = [
  { preset: "1h", label: "1 hour", getRange: () => ({ start: new Date(Date.now() - HOUR_MS).toISOString(), end: new Date().toISOString() }) },
  { preset: "24h", label: "24 hours", getRange: () => ({ start: new Date(Date.now() - 24 * HOUR_MS).toISOString(), end: new Date().toISOString() }) },
  { preset: "7d", label: "7 days", getRange: () => ({ start: new Date(Date.now() - 7 * DAY_MS).toISOString(), end: new Date().toISOString() }) },
  { preset: "30d", label: "30 days", getRange: () => ({ start: new Date(Date.now() - 30 * DAY_MS).toISOString(), end: new Date().toISOString() }) },
];

export interface TimeRangeChange {
  preset: TimeRangePreset;
  range: DashboardTimeRange;
}

export interface TimeRangeSelectorProps {
  value: TimeRangePreset;
  onChange: (change: TimeRangeChange) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const handleClick = useCallback(
    (entry: (typeof PRESETS)[number]) => {
      onChange({ preset: entry.preset, range: entry.getRange() });
    },
    [onChange],
  );

  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Time range selector">
      {PRESETS.map((entry) => (
        <button
          key={entry.preset}
          type="button"
          onClick={() => handleClick(entry)}
          className={`font-mono text-xs px-3 py-1.5 rounded-md border transition-colors min-h-[44px] ${
            value === entry.preset
              ? "bg-ink text-paper border-ink"
              : "bg-white text-charcoal/70 border-charcoal/20 hover:border-charcoal/40 hover:text-charcoal"
          }`}
          aria-pressed={value === entry.preset}
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
}
