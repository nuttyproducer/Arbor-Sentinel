// src/components/admin/SourceOverviewPanel.tsx
import { StatTile } from "./shared/StatTile";
import type { SourceOverview } from "../../lib/admin/types";

export interface SourceOverviewPanelProps {
  data: SourceOverview;
}

export function SourceOverviewPanel({ data }: SourceOverviewPanelProps) {
  return (
    <section aria-labelledby="source-overview-heading">
      <h3 id="source-overview-heading" className="font-serif text-lg font-semibold text-ink mb-3">
        Source Overview
      </h3>
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Total Sources" value={data.total} />
        <StatTile label="Active" value={data.active} colorClass="text-green-700" />
        <StatTile label="Degraded" value={data.degraded} colorClass={data.degraded > 0 ? "text-[#8B6914]" : "text-ink"} />
        <StatTile label="Failed" value={data.failed} colorClass={data.failed > 0 ? "text-clay" : "text-ink"} />
      </dl>
    </section>
  );
}
