import { SourceHealthIndicator } from "../sources/SourceHealthIndicator";
import type { CollectorHealthSnapshot } from "../../lib/collectors/monitoring/types";
import { SOURCE_TYPE_LABELS } from "../../types/content";
import type { SourceType } from "../../types/content";

interface CollectorStatusTableProps {
  collectors: CollectorHealthSnapshot[];
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function formatMs(ms: number): string {
  if (ms === 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function CollectorStatusTable({ collectors }: CollectorStatusTableProps) {
  if (collectors.length === 0) {
    return (
      <div className="border border-charcoal/10 rounded-lg p-8 text-center">
        <p className="text-charcoal/50 font-mono text-sm">
          No collectors registered. Sync the CollectorRegistry to populate this table.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-charcoal/10 rounded-lg">
      <table className="w-full text-left" aria-label="Collector status table">
        <thead>
          <tr className="border-b border-charcoal/10 bg-charcoal/[0.03]">
            <th className="px-4 py-3 font-mono text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
              Collector
            </th>
            <th className="px-4 py-3 font-mono text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 font-mono text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 font-mono text-xs font-semibold text-charcoal/70 uppercase tracking-wider hidden md:table-cell">
              Last Fetch
            </th>
            <th className="px-4 py-3 font-mono text-xs font-semibold text-charcoal/70 uppercase tracking-wider hidden md:table-cell">
              Success Rate
            </th>
            <th className="px-4 py-3 font-mono text-xs font-semibold text-charcoal/70 uppercase tracking-wider hidden lg:table-cell">
              Response
            </th>
            <th className="px-4 py-3 font-mono text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
              Errors
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal/5">
          {collectors.map((c) => {
            const successRate =
              c.totalFetches > 0
                ? (c.successfulFetches / c.totalFetches) * 100
                : 0;
            const statusColor =
              c.status === "active"
                ? "text-green-700"
                : c.status === "degraded"
                  ? "text-[#8B6914]"
                  : c.status === "failed"
                    ? "text-clay"
                    : "text-charcoal/50";

            return (
              <tr
                key={c.collectorName}
                className="hover:bg-charcoal/[0.02] transition-colors duration-150"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-ink">
                    {c.collectorName.replace(/Collector$/, "")}
                  </span>
                  {c.isStale && (
                    <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" title="Stale data" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-charcoal/60">
                    {SOURCE_TYPE_LABELS[c.sourceType as SourceType] ?? c.sourceType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <SourceHealthIndicator healthStatus={c.status} size="sm" />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="font-mono text-xs text-charcoal/60">
                    {formatDate(c.lastFetchAt)}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`font-mono text-xs ${statusColor}`}>
                    {c.totalFetches > 0 ? `${successRate.toFixed(0)}%` : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-mono text-xs text-charcoal/60">
                    {formatMs(c.avgResponseTimeMs)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.consecutiveFailures > 0 ? (
                    <span className="font-mono text-xs text-clay font-medium">
                      {c.consecutiveFailures}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-green-700">0</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
