import type { SystemHealthSummary } from "../../lib/collectors/monitoring/types";
import { SOURCE_TYPE_LABELS } from "../../types/content";
import type { SourceType } from "../../types/content";

interface SystemHealthPanelProps {
  summary: SystemHealthSummary;
}

function StatTile({
  label,
  value,
  subtitle,
  colorClass = "text-ink",
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-white border border-charcoal/10 rounded-lg p-4">
      <dt className="font-mono text-[11px] uppercase tracking-wider text-charcoal/50 mb-1">
        {label}
      </dt>
      <dd className={`font-serif text-2xl font-semibold ${colorClass}`}>
        {value}
      </dd>
      {subtitle && (
        <p className="font-mono text-[10px] text-charcoal/40 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export function SystemHealthPanel({ summary }: SystemHealthPanelProps) {
  const okRate =
    summary.totalCollectors > 0
      ? Math.round((summary.activeCount / summary.totalCollectors) * 100)
      : 0;

  return (
    <section aria-labelledby="system-health-heading">
      <h2
        id="system-health-heading"
        className="font-serif text-xl font-semibold text-ink mb-4"
      >
        System Health
      </h2>

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatTile
          label="Operational"
          value={`${okRate}%`}
          subtitle={`${summary.activeCount} of ${summary.totalCollectors} collectors`}
          colorClass={okRate >= 80 ? "text-green-700" : okRate >= 50 ? "text-[#8B6914]" : "text-clay"}
        />
        <StatTile
          label="Active"
          value={summary.activeCount}
          colorClass="text-green-700"
        />
        <StatTile
          label="Failed"
          value={summary.failedCount}
          colorClass={summary.failedCount > 0 ? "text-clay" : "text-ink"}
        />
        <StatTile
          label="Stale"
          value={summary.staleCount}
          colorClass={summary.staleCount > 0 ? "text-[#8B6914]" : "text-ink"}
        />
      </dl>

      <dl className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatTile
          label="Error Rate"
          value={`${(summary.overallErrorRate * 100).toFixed(0)}%`}
          colorClass={
            summary.overallErrorRate > 0.3
              ? "text-clay"
              : summary.overallErrorRate > 0.1
                ? "text-[#8B6914]"
                : "text-ink"
          }
        />
        <StatTile
          label="Degraded"
          value={summary.degradedCount}
          colorClass={summary.degradedCount > 0 ? "text-[#8B6914]" : "text-ink"}
        />
        <StatTile
          label="Unknown"
          value={summary.unknownCount}
          subtitle="Never run"
          colorClass="text-charcoal/50"
        />
      </dl>

      {summary.coverageGaps.length > 0 && (
        <div className="bg-amber/5 border border-amber/20 rounded-lg p-4">
          <h3 className="font-mono text-xs font-semibold text-[#8B6914] uppercase tracking-wider mb-2">
            Coverage Gaps
          </h3>
          <p className="font-sans text-sm text-charcoal/70 mb-2">
            These source types have no registered collector:
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.coverageGaps.map((gap) => (
              <span
                key={gap}
                className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] bg-amber/10 text-[#8B6914]"
              >
                {SOURCE_TYPE_LABELS[gap as SourceType] ?? gap}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.coverageGaps.length === 0 && summary.totalCollectors > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-mono text-xs text-green-700">
            All source types have collector coverage.
          </p>
        </div>
      )}
    </section>
  );
}
