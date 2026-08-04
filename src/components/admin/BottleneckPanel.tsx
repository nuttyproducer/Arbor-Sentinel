// src/components/admin/BottleneckPanel.tsx
import type { Bottleneck } from "../../lib/admin/types";

const BOTTLENECK_ICONS: Record<string, string> = {
  stuck: "⏸",
  unassigned: "📋",
  overdue: "⏰",
  reviewer_at_capacity: "⚠",
};

export interface BottleneckPanelProps {
  bottlenecks: Bottleneck[];
}

export function BottleneckPanel({ bottlenecks }: BottleneckPanelProps) {
  if (bottlenecks.length === 0) {
    return (
      <section aria-labelledby="bottleneck-heading">
        <h3 id="bottleneck-heading" className="font-serif text-lg font-semibold text-ink mb-3">
          Bottlenecks
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-mono text-xs text-green-700">No bottlenecks detected.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="bottleneck-heading">
      <h3 id="bottleneck-heading" className="font-serif text-lg font-semibold text-ink mb-3">
        Bottlenecks
      </h3>
      <p className="font-mono text-[10px] text-charcoal/40 mb-2">
        Detected issues that may require attention.
      </p>
      <div className="space-y-2">
        {bottlenecks.map((b, i) => (
          <div
            key={`${b.type}-${i}`}
            className={`flex items-start gap-3 rounded-lg p-4 border ${
              b.type === "overdue" || b.type === "reviewer_at_capacity"
                ? "bg-clay/5 border-clay/20"
                : "bg-amber/5 border-amber/20"
            }`}
          >
            <span className="text-lg mt-0.5" aria-hidden="true">
              {BOTTLENECK_ICONS[b.type] ?? "•"}
            </span>
            <div>
              <p className="font-sans text-sm text-ink font-medium">{b.description}</p>
              <p className="font-mono text-[10px] text-charcoal/50 mt-1">
                Threshold: {b.threshold}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
