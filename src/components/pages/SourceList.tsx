import { Link } from "react-router-dom";
import type { SourceRecord } from "../../types/content";
import { SOURCE_TYPE_LABELS } from "../../types/content";
import { ExternalLink } from "../ui/ExternalLink";
import { Badge } from "../ui/Badge";

interface SourceListProps {
  sources: SourceRecord[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function SourceList({
  sources,
  title = "Sources",
  emptyMessage = "No sources available.",
  className = "",
}: SourceListProps) {
  if (sources.length === 0) {
    return (
      <div className={`text-sm text-charcoal/60 italic ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/50 mb-3">
        {title}
      </h4>
      <ul className="space-y-3">
        {sources.map((source) => (
          <li
            key={source.id}
            className="border border-border/60 rounded-md p-4 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant="neutral">
                {SOURCE_TYPE_LABELS[source.sourceType]}
              </Badge>
              {source.language && (
                <span className="font-mono text-[10px] text-charcoal/50 uppercase">
                  {source.language}
                </span>
              )}
            </div>
            <Link
              to={`/sources/${source.slug}`}
              className="text-sm font-medium text-ink hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              {source.title}
            </Link>
            <p className="text-charcoal/60 mt-1">{source.publisher}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-charcoal/50">
              {source.publicationDate && (
                <span>Published: {source.publicationDate}</span>
              )}
              <span>Accessed: {source.accessedAt}</span>
              <ExternalLink href={source.url} showIcon>
                Original
              </ExternalLink>
              {source.archiveUrl && (
                <ExternalLink href={source.archiveUrl} showIcon>
                  Archived version
                </ExternalLink>
              )}
            </div>
            {source.notes && (
              <p className="text-xs text-charcoal/60 mt-1.5 italic">
                {source.notes}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
