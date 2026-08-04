// src/components/admin/CollectorStatusGrid.tsx
import type { CollectorGridItem } from "../../lib/admin/types";

const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  degraded: "bg-amber",
  failed: "bg-clay",
  unknown: "bg-charcoal/30",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  degraded: "Degraded",
  failed: "Failed",
  unknown: "Unknown",
};

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export interface CollectorStatusGridProps {
  items: CollectorGridItem[];
}

export function CollectorStatusGrid({ items }: CollectorStatusGridProps) {
  if (items.length === 0) {
    return (
      <section aria-labelledby="collector-grid-heading">
        <h3 id="collector-grid-heading" className="font-serif text-lg font-semibold text-ink mb-3">
          Collector Status
        </h3>
        <div className="bg-bone rounded-lg p-6 text-center">
          <p className="font-mono text-xs text-charcoal/40">No collectors registered</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="collector-grid-heading">
      <h3 id="collector-grid-heading" className="font-serif text-lg font-semibold text-ink mb-3">
        Collector Status
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="bg-white border border-charcoal/10 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-medium text-ink truncate" title={item.name}>
                {item.name}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-charcoal/50">
                <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[item.status] ?? "bg-charcoal/30"}`} aria-hidden="true" />
                {STATUS_LABEL[item.status] ?? item.status}
              </span>
            </div>
            <p className="font-mono text-[11px] text-charcoal/50 mb-1">
              Type: <span className="text-charcoal/70">{item.sourceType}</span>
            </p>
            <p className="font-mono text-[11px] text-charcoal/50 mb-1">
              Last fetch: <span className="text-charcoal/70">{relativeTime(item.lastFetch)}</span>
            </p>
            <p className="font-mono text-[11px] text-charcoal/50 mb-1">
              Items: <span className="text-charcoal/70">{item.itemsCollected}</span>
              {item.errorCount > 0 && (
                <span className="text-clay ml-2">({item.errorCount} errors)</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
