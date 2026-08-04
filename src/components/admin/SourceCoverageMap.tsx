import type { CoverageCell, CoverageStatus } from "../../lib/admin/types";

const STATUS_COLORS: Record<CoverageStatus, string> = {
  covered: "bg-green-100 text-green-800 border-green-300",
  partial: "bg-amber/10 text-[#8B6914] border-amber/30",
  gap: "bg-clay/10 text-clay border-clay/30",
  na: "bg-charcoal/5 text-charcoal/30 border-charcoal/10",
};

const STATUS_LABELS: Record<CoverageStatus, string> = {
  covered: "Covered",
  partial: "Partial",
  gap: "Gap",
  na: "N/A",
};

export function SourceCoverageMap({ cells }: { cells: CoverageCell[] }) {
  const countries = [...new Set(cells.map((c) => c.country))];
  const sourceTypes = [...new Set(cells.map((c) => c.sourceType))];

  if (cells.length === 0) {
    return (
      <section aria-labelledby="coverage-heading"><h3 id="coverage-heading" className="font-serif text-lg font-semibold text-ink mb-3">Source Coverage</h3>
        <div className="bg-bone rounded-lg p-6 text-center"><p className="font-mono text-xs text-charcoal/40">No coverage data available</p></div>
      </section>
    );
  }

  return (
    <section aria-labelledby="coverage-heading">
      <h3 id="coverage-heading" className="font-serif text-lg font-semibold text-ink mb-3">Source Coverage</h3>
      <p className="font-mono text-[10px] text-charcoal/40 mb-2">Coverage matrix: countries × source types. Hover for source counts.</p>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs border-collapse" aria-label="Source coverage by country and source type">
          <thead><tr><th className="text-left py-2 px-3 text-charcoal/60 font-medium border-b border-charcoal/20">Country</th>
            {sourceTypes.map((st) => (<th key={st} className="text-center py-2 px-3 text-charcoal/60 font-medium border-b border-charcoal/20">{st}</th>))}</tr></thead>
          <tbody>
            {countries.map((country) => (
              <tr key={country} className="border-b border-charcoal/5 hover:bg-bone/50 transition-colors">
                <td className="py-2 px-3 text-charcoal/80 font-medium">{country}</td>
                {sourceTypes.map((st) => {
                  const cell = cells.find((c) => c.country === country && c.sourceType === st);
                  return (<td key={st} className="py-2 px-3 text-center"><span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-medium ${STATUS_COLORS[cell?.status ?? "na"]}`} title={`${STATUS_LABELS[cell?.status ?? "na"]} (${cell?.sourceCount ?? 0} sources)`}>{STATUS_LABELS[cell?.status ?? "na"]}</span></td>);
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-3">
        {(["covered", "partial", "gap", "na"] as CoverageStatus[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1 font-mono text-[10px] text-charcoal/50"><span className={`inline-block w-3 h-3 rounded ${STATUS_COLORS[s].split(" ")[0]}`} aria-hidden="true" />{STATUS_LABELS[s]}</span>
        ))}
      </div>
    </section>
  );
}
