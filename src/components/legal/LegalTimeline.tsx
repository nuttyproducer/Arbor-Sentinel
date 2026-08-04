import { Link } from "react-router-dom";
import { Reveal } from "../ui/Reveal";
import { Badge } from "../ui/Badge";
import { SourceList } from "../pages/SourceList";
import { ContentStatusBadge } from "../pages/ContentStatusBadge";
import { VerificationBadge } from "../pages/VerificationBadge";
import { sources } from "../../data/sources";
import type { LegalTimelineEvent } from "../../types/content";
import { LEGAL_TIMELINE_EVENT_LABELS } from "../../types/content";

interface LegalTimelineProps {
  events: LegalTimelineEvent[];
  /** Message to show when no timeline events exist. */
  emptyMessage?: string;
}

/** Event-type accent colours for the timeline dot. */
const EVENT_ACCENT: Partial<Record<string, string>> = {
  filing: "bg-charcoal/30",
  provisional_measure: "bg-amber",
  arrest_warrant_issued: "bg-amber",
  arrest_warrant_application: "bg-clay",
  hearing: "bg-trust",
  jurisdiction_decision: "bg-trust",
  order: "bg-trust",
  judgment: "bg-ink",
  intervention: "bg-clay",
  investigation_opened: "bg-trust",
  official_report_update: "bg-charcoal/40",
};

export function LegalTimeline({ events, emptyMessage }: LegalTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-charcoal/60 italic">
        {emptyMessage ?? "No timeline events are available for this case."}
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        className="absolute left-[7px] top-2 bottom-2 w-px bg-border"
        aria-hidden="true"
      />

      <ol className="space-y-8">
        {events.map((event, i) => {
          const resolvedSources = event.sourceIds
            .map((sid) => sources.find((s) => s.id === sid))
            .filter(Boolean) as typeof sources;

          const dotColour =
            EVENT_ACCENT[event.eventType] ?? "bg-charcoal/30";

          return (
            <li key={event.id} className="relative pl-7">
              {/* Timeline dot */}
              <div
                className={`absolute left-0 top-1.5 w-[14px] h-[14px] rounded-full border-2 border-paper ${dotColour} ring-1 ring-border/50`}
                aria-hidden="true"
              />

              <Reveal delay={0.05 * i}>
                <div className="border border-border/60 rounded-lg p-5 bg-paper">
                  {/* Date + event type */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-charcoal/50">
                      {event.date}
                    </span>
                    <Badge variant="neutral">
                      {LEGAL_TIMELINE_EVENT_LABELS[event.eventType]}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-base font-semibold text-ink mb-2">
                    {event.title}
                  </h3>

                  {/* Procedural summary */}
                  <p className="text-sm text-charcoal/75 leading-relaxed mb-4">
                    {event.proceduralSummary}
                  </p>

                  {/* Review metadata */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-charcoal/50 font-mono">
                    <VerificationBadge
                      level={event.sourceQuality}
                      showPrefix
                    />
                    <ContentStatusBadge status={event.contentStatus} />
                    {event.lastReviewedAt && (
                      <span>Checked: {event.lastReviewedAt}</span>
                    )}
                    {event.version > 0 && (
                      <span>v{event.version}</span>
                    )}
                    {event.reviewedByRole && (
                      <span>{event.reviewedByRole}</span>
                    )}
                  </div>

                  {/* Source links */}
                  {resolvedSources.length > 0 && (
                    <SourceList
                      sources={resolvedSources}
                      title="Sources for this event"
                      emptyMessage="Source documents not yet linked."
                    />
                  )}

                  {/* Correction link */}
                  <p className="text-xs text-charcoal/50 mt-3 pt-3 border-t border-border/50">
                    <Link
                      to={event.correctionUrl}
                      className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                    >
                      Report an error in this timeline entry
                    </Link>
                  </p>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
