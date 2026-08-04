import { Link } from "react-router-dom";
import { Reveal } from "../ui/Reveal";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { CONTENT_STATUS_LABELS } from "../../types/content";
import type { CountryEntry } from "../../data/countries";

interface CountryIndexCardProps {
  country: CountryEntry;
  index: number;
}

/** Reusable card for the country index page. No score, no ranking. */
export function CountryIndexCard({ country, index }: CountryIndexCardProps) {
  return (
    <Reveal delay={0.18 + index * 0.06}>
      <Card
        title={country.name}
        accent={
          country.contentStatus === "reviewed"
            ? "blue"
            : country.contentStatus === "review_pending"
              ? "amber"
              : "clay"
        }
      >
        {/* Region */}
        <p className="font-mono text-[11px] text-charcoal/50 mb-3">
          {country.region}
        </p>

        {/* Summary */}
        <p className="text-charcoal/80 leading-relaxed mb-4">
          {country.summary}
        </p>

        {/* Content status */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge
            variant={
              country.contentStatus === "reviewed"
                ? "info"
                : country.contentStatus === "review_pending"
                  ? "warning"
                  : "neutral"
            }
          >
            {CONTENT_STATUS_LABELS[country.contentStatus]}
          </Badge>
          {country.lastReviewedAt && (
            <span className="font-mono text-[11px] text-charcoal/45">
              Last reviewed: {country.lastReviewedAt}
            </span>
          )}
        </div>

        {/* Link to detail page */}
        <div className="pt-3 border-t border-border">
          <Link
            to={country.route}
            className="inline-flex items-center gap-1 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            View country page
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
