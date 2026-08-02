import { useMemo } from "react";
import type { ReviewComment, StateTransition } from "../../lib/review/types";

interface ReviewHistoryProps {
  stateHistory: StateTransition[];
  comments: ReviewComment[];
}

type HistoryEvent =
  | { kind: "transition"; id: string; timestamp: string; transition: StateTransition }
  | { kind: "comment"; id: string; timestamp: string; comment: ReviewComment };

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

function dateKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return DATE_FORMATTER.format(date);
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return TIME_FORMATTER.format(date);
}

function actorLabel(actor?: string): string {
  if (!actor) return "Unknown";
  return actor === "system" ? "System" : actor;
}

function TransitionEntry({ transition }: { transition: StateTransition }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
      <span className="font-mono text-xs text-charcoal/50">
        {formatTime(transition.timestamp)}
      </span>
      <span className="text-charcoal/80">
        Status changed from{" "}
        <span className="font-mono text-charcoal">{transition.from}</span> to{" "}
        <span className="font-mono text-charcoal">{transition.to}</span>
      </span>
      <span className="text-xs text-charcoal/50">
        by {actorLabel(transition.actor)}
      </span>
      {transition.reason && (
        <p className="w-full text-xs text-charcoal/60 mt-0.5">
          {transition.reason}
        </p>
      )}
    </div>
  );
}

function CommentEntry({ comment }: { comment: ReviewComment }) {
  return (
    <div className="text-sm space-y-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono text-xs text-charcoal/50">
          {formatTime(comment.createdAt)}
        </span>
        <span className="font-mono text-xs text-trust">
          v{comment.version}
        </span>
        <span className="text-xs text-charcoal/50">
          by {actorLabel(comment.authorId)}
        </span>
      </div>
      <p className="text-charcoal/85 leading-relaxed whitespace-pre-wrap">
        {comment.body}
      </p>
    </div>
  );
}

function HistoryRow({ event }: { event: HistoryEvent }) {
  if (event.kind === "transition") {
    return <TransitionEntry transition={event.transition} />;
  }
  return <CommentEntry comment={event.comment} />;
}

/**
 * Vertical, date-grouped timeline of a review item's state transitions and
 * comments, newest first.
 */
export function ReviewHistory({
  stateHistory,
  comments,
}: ReviewHistoryProps) {
  const groups = useMemo(() => {
    const events: HistoryEvent[] = [
      ...stateHistory.map((transition, index) => ({
        kind: "transition" as const,
        id: `transition-${index}`,
        timestamp: transition.timestamp,
        transition,
      })),
      ...comments.map((comment) => ({
        kind: "comment" as const,
        id: comment.id,
        timestamp: comment.createdAt,
        comment,
      })),
    ];

    events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const grouped = new Map<string, HistoryEvent[]>();
    for (const event of events) {
      const key = dateKey(event.timestamp);
      const list = grouped.get(key) ?? [];
      list.push(event);
      grouped.set(key, list);
    }
    return Array.from(grouped.entries());
  }, [stateHistory, comments]);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-charcoal/60 italic">
        No review history yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-lg font-semibold text-ink">
        Review history
      </h3>

      {groups.map(([date, dateEvents]) => (
        <section key={date}>
          <h4 className="text-xs font-mono uppercase tracking-wide text-charcoal/50 mb-3">
            {formatDate(dateEvents[0].timestamp)}
          </h4>

          <div className="relative">
            <div
              className="absolute left-[7px] top-2 bottom-2 w-px bg-border"
              aria-hidden="true"
            />
            <ol className="space-y-5">
              {dateEvents.map((event) => (
                <li key={event.id} className="relative pl-7">
                  <div
                    className={`absolute left-0 top-1.5 w-[14px] h-[14px] rounded-full border-2 border-paper ring-1 ring-border/50 ${
                      event.kind === "comment"
                        ? "bg-trust"
                        : "bg-charcoal/30"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="border border-border/60 rounded-lg p-4 bg-paper">
                    <HistoryRow event={event} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}
    </div>
  );
}
