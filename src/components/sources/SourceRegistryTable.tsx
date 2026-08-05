import { Link } from "react-router-dom";
import type { SourceRecord, SourceStatus } from "../../types/content";
import {
  SOURCE_TYPE_LABELS,
  SOURCE_STATUS_LABELS,
  TRUST_LEVEL_LABELS,
} from "../../types/content";
import { Badge } from "../ui/Badge";
import { SourceHealthIndicator } from "./SourceHealthIndicator";

interface SourceRegistryTableProps {
  sources: SourceRecord[];
  selectedId?: string;
  onSelect: (source: SourceRecord) => void;
}

const statusBadgeVariant = (status: SourceStatus) => {
  switch (status) {
    case "active":
      return "info" as const;
    case "broken":
      return "alert" as const;
    case "superseded":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
};

export function SourceRegistryTable({
  sources,
  selectedId,
  onSelect,
}: SourceRegistryTableProps) {
  if (sources.length === 0) {
    return (
      <div className="bg-bone border border-border rounded-lg p-10 text-center">
        <p className="font-serif text-xl font-semibold text-ink mb-3">
          No sources match these filters.
        </p>
        <p className="text-charcoal/70 leading-relaxed">
          Try adjusting or clearing the filter selections above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border/60 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bone border-b border-border/60">
            <th className="text-left px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/50">
              Source
            </th>
            <th className="text-left px-3 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/50 hidden md:table-cell">
              Type
            </th>
            <th className="text-center px-3 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/50 hidden lg:table-cell">
              Trust
            </th>
            <th className="text-center px-3 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/50">
              Health
            </th>
            <th className="text-center px-3 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/50 hidden sm:table-cell">
              Status
            </th>
            <th className="text-left px-3 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/50 hidden lg:table-cell">
              Region
            </th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => {
            const isSelected = source.id === selectedId;
            return (
              <tr
                key={source.id}
                onClick={() => onSelect(source)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(source);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-selected={isSelected}
                aria-label={`Select source: ${source.title}`}
                className={`
                  border-b border-border/40 cursor-pointer
                  transition-colors duration-150
                  hover:bg-trust/[0.04]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-trust/40
                  ${isSelected ? "bg-trust/[0.06] ring-1 ring-inset ring-trust/20" : ""}
                `.trim()}
              >
                {/* Source title + publisher */}
                <td className="px-4 py-3.5">
                  <Link
                    to={`/sources/${source.slug}`}
                    className="font-serif font-semibold text-ink hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 block text-[15px] leading-snug"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {source.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                    <span className="text-xs text-charcoal/60">
                      {source.publisher}
                    </span>
                    {source.language && (
                      <span className="text-[10px] font-mono text-charcoal/40 uppercase">
                        {source.language}
                      </span>
                    )}
                    {source.official && (
                      <span className="text-[10px] font-mono text-charcoal/40 uppercase">
                        Official
                      </span>
                    )}
                  </div>
                </td>

                {/* Type (md+) */}
                <td className="px-3 py-3.5 hidden md:table-cell">
                  <Badge variant="neutral">
                    {SOURCE_TYPE_LABELS[source.sourceType]}
                  </Badge>
                </td>

                {/* Trust level (lg+) */}
                <td className="px-3 py-3.5 text-center hidden lg:table-cell">
                  <span
                    className={`text-xs font-mono font-medium ${
                      source.trustLevel >= 4
                        ? "text-green-700"
                        : source.trustLevel >= 2
                          ? "text-charcoal/70"
                          : "text-charcoal/40"
                    }`}
                    title={`Trust level ${source.trustLevel}: ${TRUST_LEVEL_LABELS[source.trustLevel]}`}
                  >
                    {source.trustLevel}/5
                  </span>
                </td>

                {/* Health indicator */}
                <td className="px-3 py-3.5 text-center">
                  <SourceHealthIndicator
                    healthStatus={source.healthStatus}
                    size="sm"
                  />
                </td>

                {/* Status (sm+) */}
                <td className="px-3 py-3.5 text-center hidden sm:table-cell">
                  <Badge variant={statusBadgeVariant(source.status)}>
                    {SOURCE_STATUS_LABELS[source.status]}
                  </Badge>
                </td>

                {/* Region (lg+) */}
                <td className="px-3 py-3.5 text-xs text-charcoal/60 hidden lg:table-cell">
                  {source.region || (
                    <span className="text-charcoal/30">—</span>
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
