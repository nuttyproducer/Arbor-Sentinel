// src/pages/review/reviewPageComponents.tsx

import { useMemo, useState, type ReactNode } from "react";
import type { PriorityLevel, ReviewItem } from "../../lib/review/types";
import { getSLAStatus, type SLAStatus } from "../../lib/review/ReviewPriority";
import { Badge } from "../../components/ui/Badge";

// ── Label and variant maps ──────────────────────────────────────────────────

const CONTENT_TYPE_LABELS: Record<string, string> = {
  evidence: "Evidence",
  legal_case: "Legal case",
  source: "Source",
  organization: "Organization",
  action_template: "Action template",
  country: "Country",
  institution: "Institution",
};

const REVIEW_TYPE_LABELS: Record<string, string> = {
  legal: "Legal review",
  translation: "Translation review",
  source: "Source review",
  editorial: "Editorial review",
  competency: "Competency review",
  safety: "Safety review",
  accessibility: "Accessibility review",
  licensing: "Licensing review",
};

const PRIORITY_VARIANTS: Record<PriorityLevel, "neutral" | "info" | "warning" | "alert"> = {
  critical: "alert",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const SLA_VARIANTS: Record<SLAStatus, "neutral" | "info" | "warning" | "alert"> = {
  on_track: "neutral",
  warning: "warning",
  overdue: "alert",
  breached: "alert",
};

const SLA_LABELS: Record<SLAStatus, string> = {
  on_track: "SLA on track",
  warning: "SLA warning",
  overdue: "SLA overdue",
  breached: "SLA breached",
};

// ── Small formatters ────────────────────────────────────────────────────────

/** Slug -> display title, e.g. "icj-provisional-measures-gaza" -> "ICJ Provisional Measures Gaza". */
function formatSlugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) =>
      part.length <= 3 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1),
    )
    .join(" ");
}

function formatDueDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Page header ─────────────────────────────────────────────────────────────

interface ReviewHeaderProps {
  item: ReviewItem;
}

/**
 * Shared header for review pages: item title, review/content type, priority
 * badge, and SLA status. Uses the project's Tailwind design tokens.
 */
export function ReviewHeader({ item }: ReviewHeaderProps) {
  const slaStatus = useMemo(() => getSLAStatus(item), [item]);
  const title = formatSlugToTitle(item.sourceContentRef.slug);
  const contentType =
    CONTENT_TYPE_LABELS[item.sourceContentRef.type] ?? item.sourceContentRef.type;
  const reviewTypeLabel = REVIEW_TYPE_LABELS[item.reviewType] ?? item.reviewType;

  return (
    <header className="space-y-4 pb-6 border-b border-border/60" data-testid="review-header">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-wide text-charcoal/50">
            {reviewTypeLabel}
          </p>
          <h1 className="font-serif text-2xl font-semibold text-ink leading-tight">{title}</h1>
        </div>
        <Badge variant={PRIORITY_VARIANTS[item.priority]} className="uppercase">
          {item.priority} priority
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">{contentType}</Badge>
        <Badge variant="neutral">Score {item.priorityScore}</Badge>
        <Badge variant={SLA_VARIANTS[slaStatus]}>{SLA_LABELS[slaStatus]}</Badge>
        {item.dueBy && (
          <span className="font-mono text-xs text-charcoal/50">Due {formatDueDate(item.dueBy)}</span>
        )}
      </div>
    </header>
  );
}

// ── Collapsible section ─────────────────────────────────────────────────────

interface CollapsibleSectionProps {
  title: string;
  /** Whether the section starts expanded. Defaults to collapsed. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Accessible disclosure-style wrapper used to collapse the notes editor and
 * the history timeline on every review page.
 */
export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border border-border/60 rounded-lg bg-paper">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 rounded-lg"
      >
        <span className="font-serif text-lg font-semibold text-ink">{title}</span>
        <span
          aria-hidden="true"
          className={`text-charcoal/50 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}
