import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ExternalLink } from "../ui/ExternalLink";
import type { EvidenceItem } from "../../data/evidenceItems";
import { EVIDENCE_CATEGORY_LABELS } from "../../data/evidenceItems";
import { sources } from "../../data/sources";
import {
  CONTENT_STATUS_LABELS,
  VERIFICATION_LEVEL_LABELS,
  SOURCE_TYPE_LABELS,
  LEGAL_STATUS_LABELS,
} from "../../types/content";

/** Resolve the accent colour for a given evidence category. */
export function categoryAccent(category: string): "clay" | "blue" | "amber" {
  if (category === "court record" || category === "human-rights report") return "clay";
  if (category === "official UN document" || category === "parliamentary document") return "blue";
  return "amber";
}

interface EvidenceItemCardProps {
  item: EvidenceItem;
}

export function EvidenceItemCard({ item }: EvidenceItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  const itemSources = item.sourceIds
    .map((sid) => sources.find((s) => s.id === sid))
    .filter(Boolean);

  const hasDetail =
    item.legalStatuses ||
    item.incidentDate ||
    item.safeLocation ||
    item.sourceLanguage ||
    item.reviewedByRole ||
    itemSources.length > 0;

  return (
    <Card
      title={item.title}
      accent={categoryAccent(item.category)}
    >
      {/* Category + source-quality row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="neutral">
          {EVIDENCE_CATEGORY_LABELS[item.category]}
        </Badge>
        <span className="font-mono text-[11px] text-charcoal/50">
          Source quality: Level {item.sourceQuality}
        </span>
      </div>

      {/* Summary */}
      <p className="text-charcoal/80 leading-relaxed mb-3">{item.summary}</p>

      {/* Source type + status badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="info">
          {SOURCE_TYPE_LABELS[item.primarySourceType]}
        </Badge>
        <Badge
          variant={
            item.contentStatus === "reviewed"
              ? "info"
              : item.contentStatus === "review_pending"
                ? "warning"
                : "neutral"
          }
        >
          {CONTENT_STATUS_LABELS[item.contentStatus]}
        </Badge>
        {item.publicationDate && (
          <span className="font-mono text-[11px] text-charcoal/45">
            Published: {item.publicationDate}
          </span>
        )}
      </div>

      {/* Legal statuses */}
      {item.legalStatuses && item.legalStatuses.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.legalStatuses.map((ls) => (
            <Badge key={ls} variant="alert">
              {LEGAL_STATUS_LABELS[ls]}
            </Badge>
          ))}
        </div>
      )}

      {/* Verification level explanation */}
      <p className="text-xs text-charcoal/50 leading-relaxed mb-3">
        <span className="font-medium text-charcoal/60">
          Verification level {item.sourceQuality}:{" "}
        </span>
        {VERIFICATION_LEVEL_LABELS[item.sourceQuality]}.
        {item.contentStatus === "review_pending" &&
          " This summary has not yet completed editorial review, even though the source quality is known."}
      </p>

      {/* Expandable detail */}
      {hasDetail && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm min-h-[44px]"
            aria-expanded={expanded}
          >
            {expanded ? "Hide details" : "View details"}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            >
              <path
                d="M4.5 2.5L8 6L4.5 9.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {item.incidentDate && (
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                    Incident date
                  </p>
                  <p className="text-sm text-charcoal/70">{item.incidentDate}</p>
                </div>
              )}

              {item.safeLocation && (
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                    Region
                  </p>
                  <p className="text-sm text-charcoal/70">{item.safeLocation}</p>
                </div>
              )}

              {item.sourceLanguage && (
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                    Source language
                  </p>
                  <p className="text-sm text-charcoal/70">
                    {item.sourceLanguage === "en" ? "English" : item.sourceLanguage}
                  </p>
                </div>
              )}

              {item.reviewedByRole && (
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                    Last reviewed by
                  </p>
                  <p className="text-sm text-charcoal/70">{item.reviewedByRole}</p>
                </div>
              )}

              {itemSources.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1.5">
                    Sources
                  </p>
                  <ul className="space-y-2">
                    {itemSources.map((src) => (
                      <li key={src!.id} className="text-sm">
                        <ExternalLink href={src!.url} showIcon>
                          {src!.title.length > 100
                            ? src!.title.slice(0, 100) + "…"
                            : src!.title}
                        </ExternalLink>
                        <span className="block font-mono text-[11px] text-charcoal/40 mt-0.5">
                          {src!.publisher}
                          {src!.publicationDate ? ` — ${src!.publicationDate}` : ""}
                          {src!.accessedAt ? ` (accessed ${src!.accessedAt})` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.tags.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1.5">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-bone border border-border text-charcoal/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.relatedRoutes.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1.5">
                    Related pages
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {item.relatedRoutes.map((route) => (
                      <Link
                        key={route}
                        to={route}
                        className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                      >
                        {route}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* View full record + correction */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-x-5 gap-y-1">
        <Link
          to={`/evidence/${item.slug}`}
          className="text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          View full record
        </Link>
        <Link
          to={item.correctionUrl}
          className="text-sm text-charcoal/50 hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          Report an error
        </Link>
      </div>
    </Card>
  );
}
