import type { FreshnessItem } from "../../lib/admin/types";

const STATUS_COLOR: Record<string, string> = {
  fresh: "text-green-700",
  stale: "text-[#8B6914]",
  critical: "text-clay",
};

export function DataFreshnessPanel({ items }: { items: FreshnessItem[] }) {
  if (items.length === 0) {
    return (
      <section aria-labelledby="freshness-heading"><h3 id="freshness-heading" className="font-serif text-lg font-semibold text-ink mb-3">Data Freshness</h3>
        <div className="bg-bone rounded-lg p-6 text-center"><p className="font-mono text-xs text-charcoal/40">No freshness data available</p></div></section>
    );
  }

  return (
    <section aria-labelledby="freshness-heading">
      <h3 id="freshness-heading" className="font-serif text-lg font-semibold text-ink mb-3">Data Freshness</h3>
      <p className="font-mono text-[10px] text-charcoal/40 mb-2">Age of last update per content category. Sorted oldest first.</p>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs" aria-label="Data freshness by category">
          <thead><tr className="border-b border-charcoal/20">
            <th className="text-left py-2 text-charcoal/60 font-medium">Category</th>
            <th className="text-right py-2 text-charcoal/60 font-medium">Last Updated</th>
            <th className="text-right py-2 text-charcoal/60 font-medium">Age (days)</th>
            <th className="text-right py-2 text-charcoal/60 font-medium">Status</th>
            <th className="text-right py-2 text-charcoal/60 font-medium">Threshold</th>
          </tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.category} className="border-b border-charcoal/5">
                <td className="py-2 text-charcoal/80">{item.category}</td>
                <td className="py-2 text-right text-charcoal/70">{new Date(item.lastUpdated).toLocaleDateString("en-US")}</td>
                <td className="py-2 text-right text-charcoal/70">{item.ageDays}d</td>
                <td className={`py-2 text-right font-medium ${STATUS_COLOR[item.status]}`}>{item.status}</td>
                <td className="py-2 text-right text-charcoal/50">{item.thresholdDays}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
