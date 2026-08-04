import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { RECORD_TYPE_LABELS } from "../../lib/search/types";
import { getRelationships } from "../../lib/search/relationships";
import type { RelatedRecord } from "../../lib/search/types";

interface RelatedRecordsProps {
  /** Scoped record ID, e.g. "source:icj-2024-01-26" */
  recordId: string;
  /** Max related records to show per section (default 5). */
  maxItems?: number;
  className?: string;
}

export function RelatedRecords({
  recordId,
  maxItems = 5,
  className = "",
}: RelatedRecordsProps) {
  const rels = getRelationships(recordId);

  if (rels.references.length === 0 && rels.referencedBy.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {rels.references.length > 0 && (
        <RelatedSection
          title="References"
          items={rels.references.slice(0, maxItems)}
          emptyMessage=""
        />
      )}
      {rels.referencedBy.length > 0 && (
        <RelatedSection
          title="Referenced By"
          items={rels.referencedBy.slice(0, maxItems)}
          emptyMessage=""
        />
      )}
    </div>
  );
}

// ── Related section ─────────────────────────────────────────────────────────

function RelatedSection({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: RelatedRecord[];
  emptyMessage: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/50 mb-3">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-charcoal/60 italic">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.route}
                className="flex items-start gap-2 text-sm group hover:text-trust/80 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
              >
                <Badge variant="neutral" className="flex-shrink-0 mt-0.5">
                  {RECORD_TYPE_LABELS[item.type]}
                </Badge>
                <span className="text-charcoal/80 group-hover:text-ink transition-colors duration-200">
                  {item.title}
                </span>
              </Link>
              <p className="text-[10px] text-charcoal/40 ml-0 mt-0.5 font-mono">
                {item.relationship}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
