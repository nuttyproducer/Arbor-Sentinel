import { useMemo } from "react";
import type { ReviewChecklistResult } from "../../lib/review/types";

interface ReviewSummaryProps {
  /** Checklist results keyed by checklist/category label. */
  checklistResults: Record<string, ReviewChecklistResult[]>;
  reviewerNotes: string;
  recommendation?: string;
}

interface ResultCounts {
  pass: number;
  fail: number;
  na: number;
  total: number;
}

interface CategorySummary {
  label: string;
  counts: ResultCounts;
}

interface SummaryData {
  categories: CategorySummary[];
  totals: ResultCounts;
  blocked: boolean;
}

function countResults(results: ReviewChecklistResult[]): ResultCounts {
  const counts: ResultCounts = { pass: 0, fail: 0, na: 0, total: results.length };
  for (const result of results) {
    if (result.result === "pass") counts.pass += 1;
    else if (result.result === "fail") counts.fail += 1;
    else counts.na += 1;
  }
  return counts;
}

function buildSummary(checklistResults: Record<string, ReviewChecklistResult[]>): SummaryData {
  const categories = Object.entries(checklistResults).map(([label, results]) => ({
    label,
    counts: countResults(results),
  }));

  const totals = categories.reduce<ResultCounts>(
    (acc, category) => ({
      pass: acc.pass + category.counts.pass,
      fail: acc.fail + category.counts.fail,
      na: acc.na + category.counts.na,
      total: acc.total + category.counts.total,
    }),
    { pass: 0, fail: 0, na: 0, total: 0 },
  );

  return { categories, totals, blocked: totals.fail > 0 };
}

/**
 * Internal-only aggregate of checklist results across review types.
 * Shows per-category pass/fail/N-A counts, an overall ready/blocked status,
 * reviewer notes, and an optional recommendation. Never shown publicly.
 */
export function ReviewSummary({
  checklistResults,
  reviewerNotes,
  recommendation,
}: ReviewSummaryProps) {
  const { categories, totals, blocked } = useMemo(
    () => buildSummary(checklistResults),
    [checklistResults],
  );

  const empty = categories.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-ink">
          Review summary
        </h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-amber/10 text-[#8B6914] border border-amber/30">
          Internal only
        </span>
      </div>

      {empty ? (
        <p className="text-sm text-charcoal/60 italic">
          No checklist results recorded for this review.
        </p>
      ) : (
        <>
          <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border ${
              blocked
                ? "bg-clay/10 text-clay border-clay/40"
                : "bg-trust/10 text-trust border-trust/40"
            }`}
          >
            <span aria-hidden="true">{blocked ? "●" : "✓"}</span>
            {blocked ? "Blocked" : "Ready"}
          </div>

          <div className="border border-border/60 rounded-lg bg-paper divide-y divide-border/60 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 bg-ink/5">
              <span className="text-xs font-mono uppercase tracking-wide text-charcoal/60">
                Checklist
              </span>
              <span className="flex gap-4 text-xs font-mono uppercase tracking-wide text-charcoal/60">
                <span>Pass</span>
                <span>Fail</span>
                <span>N/A</span>
              </span>
            </div>

            {categories.map((category) => (
              <div
                key={category.label}
                className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2.5"
              >
                <span className="text-sm text-ink">{category.label}</span>
                <span className="flex gap-4 font-mono text-sm tabular-nums">
                  <span
                    aria-label={`${category.label} passed`}
                    className="w-10 text-right text-trust"
                  >
                    {category.counts.pass}
                  </span>
                  <span
                    aria-label={`${category.label} failed`}
                    className="w-10 text-right text-clay"
                  >
                    {category.counts.fail}
                  </span>
                  <span
                    aria-label={`${category.label} not applicable`}
                    className="w-10 text-right text-charcoal/60"
                  >
                    {category.counts.na}
                  </span>
                </span>
              </div>
            ))}

            <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2.5 bg-ink/5">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="flex gap-4 font-mono text-sm font-semibold tabular-nums">
                <span aria-label="Total passed" className="w-10 text-right text-trust">
                  {totals.pass}
                </span>
                <span aria-label="Total failed" className="w-10 text-right text-clay">
                  {totals.fail}
                </span>
                <span
                  aria-label="Total not applicable"
                  className="w-10 text-right text-charcoal/60"
                >
                  {totals.na}
                </span>
              </span>
            </div>
          </div>
        </>
      )}

      <section className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wide text-charcoal/50">
          Reviewer notes
        </h4>
        {reviewerNotes.trim() ? (
          <p className="text-sm text-charcoal/80 whitespace-pre-wrap bg-paper border border-border/60 rounded-lg px-4 py-3">
            {reviewerNotes}
          </p>
        ) : (
          <p className="text-sm text-charcoal/50 italic">No notes provided.</p>
        )}
      </section>

      {recommendation && (
        <section className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wide text-charcoal/50">
            Recommendation
          </h4>
          <p className="text-sm text-charcoal/80 whitespace-pre-wrap bg-paper border border-border/60 rounded-lg px-4 py-3">
            {recommendation}
          </p>
        </section>
      )}
    </div>
  );
}
