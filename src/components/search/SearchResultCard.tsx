import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { ContentStatusBadge } from "../pages/ContentStatusBadge";
import type { SearchResult } from "../../lib/search/types";
import { RECORD_TYPE_LABELS } from "../../lib/search/types";

interface SearchResultCardProps {
  result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const { record, matchedFields } = result;

  return (
    <li>
      <Link
        to={record.route}
        className="block group rounded-lg border border-border hover:border-trust/30 bg-bone/60 hover:bg-bone transition-colors duration-200 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2"
      >
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="neutral">{RECORD_TYPE_LABELS[record.type]}</Badge>
          {record.contentStatus && (
            <ContentStatusBadge status={record.contentStatus} />
          )}
          {record.language && (
            <span className="font-mono text-[10px] text-charcoal/50 uppercase">
              {record.language}
            </span>
          )}
        </div>

        <h3 className="font-serif text-base font-semibold text-ink group-hover:text-trust/80 transition-colors duration-200 mb-1">
          {record.title}
        </h3>

        <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-2 mb-2">
          {record.description}
        </p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-charcoal/50">
          {record.publisher && <span>{record.publisher}</span>}
          {record.jurisdiction && <span>{record.jurisdiction}</span>}
          {record.category && <span>{record.category}</span>}
        </div>

        {/* Matched fields hint — for debugging/transparency */}
        {matchedFields.length > 0 && (
          <p className="text-[10px] text-charcoal/40 mt-1.5 font-mono">
            Matched: {matchedFields.join(", ")}
          </p>
        )}
      </Link>
    </li>
  );
}
