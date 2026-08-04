import { Reveal } from "../ui/Reveal";
import { Card } from "../ui/Card";
import { Link } from "react-router-dom";
import { LegalStatusBadge } from "../pages/LegalStatusBadge";
import { VerificationBadge } from "../pages/VerificationBadge";
import { ContentStatusBadge } from "../pages/ContentStatusBadge";
import { SourceList } from "../pages/SourceList";
import { sources } from "../../data/sources";
import type { LegalCaseEntry } from "../../data/legalCases";

/** Resolve a source ID to its record. */
export function getSourceById(id: string) {
  return sources.find((s) => s.id === id);
}

interface LegalCaseCardProps {
  entry: LegalCaseEntry;
  index: number;
}

export function LegalCaseCard({ entry, index }: LegalCaseCardProps) {
  const entrySources = entry.sourceIds
    .map(getSourceById)
    .filter(Boolean) as typeof sources;

  const accent = index === 0 ? "amber" as const : index === 1 ? "clay" as const : "blue" as const;

  return (
    <Reveal delay={0.2 + index * 0.08}>
      <Card
        accent={accent}
        title={entry.title}
        label={entry.institution}
      >
        <p className="text-charcoal/80 leading-relaxed mb-4">
          {entry.summary}
        </p>

        {entry.proceduralNote && (
          <p className="text-sm text-charcoal/60 italic mb-4">
            {entry.proceduralNote}
          </p>
        )}

        {/* Legal status */}
        <div className="mb-4">
          <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/50 mb-2">
            Legal status
          </h4>
          <div className="flex flex-wrap gap-2">
            {entry.legalStatuses.map((ls) => (
              <LegalStatusBadge key={ls} status={ls} />
            ))}
          </div>
        </div>

        {/* Source quality */}
        <div className="mb-4">
          <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/50 mb-2">
            Source quality
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge level={entry.sourceQuality} showPrefix />
          </div>
        </div>

        {/* Editorial status */}
        <div className="mb-4">
          <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/50 mb-2">
            Editorial status
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <ContentStatusBadge status={entry.contentStatus} />
            {entry.lastReviewedAt && (
              <span className="text-xs text-charcoal/50 font-mono">
                Checked: {entry.lastReviewedAt}
              </span>
            )}
            {entry.version > 0 && (
              <span className="text-xs text-charcoal/50 font-mono">
                v{entry.version}
              </span>
            )}
            {entry.reviewedByRole && (
              <span className="text-xs text-charcoal/50">
                {entry.reviewedByRole}
              </span>
            )}
          </div>
        </div>

        {/* Sources */}
        {entrySources.length > 0 && (
          <SourceList
            sources={entrySources}
            title="Linked sources"
            emptyMessage="Source documents not yet linked."
          />
        )}

        {/* Detail page link */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <Link
            to={`/legal-tracker/${entry.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            View case details
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 8.5L7 5.5L4 2.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </Card>
    </Reveal>
  );
}
