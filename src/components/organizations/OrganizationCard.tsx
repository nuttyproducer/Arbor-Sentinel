import { Link } from "react-router-dom";
import { Reveal } from "../ui/Reveal";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ExternalLink } from "../ui/ExternalLink";
import { CONTENT_STATUS_LABELS } from "../../types/content";
import type { OrganizationRecord } from "../../data/organizations";

interface OrganizationCardProps {
  org: OrganizationRecord;
  category: string;
  index: number;
}

export function OrganizationCard({ org, category, index }: OrganizationCardProps) {
  return (
    <Reveal delay={0.2 + index * 0.05}>
      <Card
        title={org.name}
        accent={
          org.contentStatus === "reviewed"
            ? "blue"
            : org.contentStatus === "review_pending"
              ? "amber"
              : "clay"
        }
      >
        {/* Category + regions */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="neutral">{category}</Badge>
          {org.regions.slice(0, 2).map((r) => (
            <span
              key={r}
              className="font-mono text-[11px] text-charcoal/50"
            >
              {r}
            </span>
          ))}
          {org.regions.length > 2 && (
            <span className="font-mono text-[11px] text-charcoal/40">
              +{org.regions.length - 2}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-charcoal/80 leading-relaxed mb-3">
          {org.shortDescription}
        </p>

        {/* Services */}
        {org.services && org.services.length > 0 && (
          <div className="mb-3">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1.5">
              Services
            </p>
            <ul className="space-y-1">
              {org.services.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-1.5 text-sm text-charcoal/70"
                >
                  <span
                    className="text-charcoal/30 mt-1 flex-shrink-0"
                    aria-hidden="true"
                  >
                    •
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-4 pt-4 border-t border-border">
          <ExternalLink href={org.officialWebsite}>
            Official website
          </ExternalLink>
          {org.officialDonationUrl && (
            <ExternalLink href={org.officialDonationUrl}>
              Official donation page
            </ExternalLink>
          )}
        </div>

        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Badge variant="neutral">Public resource</Badge>
          <Badge
            variant={
              org.contentStatus === "reviewed"
                ? "info"
                : org.contentStatus === "review_pending"
                  ? "warning"
                  : "neutral"
            }
          >
            {CONTENT_STATUS_LABELS[org.contentStatus]}
          </Badge>
          {org.lastReviewedAt && (
            <span className="font-mono text-[11px] text-charcoal/45">
              Last reviewed: {org.lastReviewedAt}
            </span>
          )}
        </div>

        {/* Detail page link */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <Link
            to={`/organizations/${org.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            View listing details
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

        {/* Correction link */}
        <p className="mt-3 text-sm text-charcoal/50">
          <Link
            to="/corrections"
            className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Is this listing inaccurate or out of date?
          </Link>
        </p>
      </Card>
    </Reveal>
  );
}
