// src/components/admin/ReviewerPerformanceTable.tsx
import type { ReviewerMetric } from "../../lib/admin/types";

export interface ReviewerPerformanceTableProps {
  data: ReviewerMetric[];
}

export function ReviewerPerformanceTable({ data }: ReviewerPerformanceTableProps) {
  if (data.length === 0) {
    return (
      <section aria-labelledby="reviewer-perf-heading">
        <h3 id="reviewer-perf-heading" className="font-serif text-lg font-semibold text-ink mb-3">
          Reviewer Performance
        </h3>
        <div className="bg-bone rounded-lg p-6 text-center">
          <p className="font-mono text-xs text-charcoal/40">No reviewer data available</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="reviewer-perf-heading">
      <h3 id="reviewer-perf-heading" className="font-serif text-lg font-semibold text-ink mb-3">
        Reviewer Performance
      </h3>
      <p className="font-mono text-[10px] text-charcoal/40 mb-2">
        Reviewer IDs are internal only. Sorted by SLA compliance (lowest first).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs" aria-label="Reviewer performance metrics">
          <thead>
            <tr className="border-b border-charcoal/20">
              <th className="text-left py-2 text-charcoal/60 font-medium">Reviewer</th>
              <th className="text-right py-2 text-charcoal/60 font-medium">Completed</th>
              <th className="text-right py-2 text-charcoal/60 font-medium">Avg Time</th>
              <th className="text-right py-2 text-charcoal/60 font-medium">SLA %</th>
              <th className="text-right py-2 text-charcoal/60 font-medium">Workload</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-charcoal/5 hover:bg-bone/50 transition-colors">
                <td className="py-2 text-charcoal/80">{row.id}</td>
                <td className="py-2 text-right text-charcoal/70">{row.completed}</td>
                <td className="py-2 text-right text-charcoal/70">{row.avgTimeMinutes}m</td>
                <td className={`py-2 text-right font-medium ${row.slaCompliancePercent >= 90 ? "text-green-700" : row.slaCompliancePercent >= 75 ? "text-[#8B6914]" : "text-clay"}`}>
                  {row.slaCompliancePercent}%
                </td>
                <td className="py-2 text-right text-charcoal/70">
                  {row.workload}/{row.maxWorkload}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
