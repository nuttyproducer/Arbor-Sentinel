import { useParams, Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { LastUpdated } from "../components/pages/LastUpdated";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { PrintHeader, PrintFooter } from "../components/pages/PrintOnly";
import { LegalStatusBadge } from "../components/pages/LegalStatusBadge";
import { ContentStatusBadge } from "../components/pages/ContentStatusBadge";
import { SourceList } from "../components/pages/SourceList";
import { LegalTimeline } from "../components/legal/LegalTimeline";
import { getLegalCaseBySlug } from "../data/legalCases";
import { getTimelineEventsForCase } from "../data/legalTimeline";
import { sources } from "../data/sources";
import {
  VERIFICATION_LEVEL_LABELS,
  type VerificationLevel,
} from "../types/content";

export default function LegalCaseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const legalCase = slug ? getLegalCaseBySlug(slug) : undefined;

  if (!legalCase) {
    return (
      <Container className="py-16 lg:py-20">
        <div className="text-center py-20">
          <p className="font-serif text-3xl font-semibold text-ink mb-4">
            Legal case not found
          </p>
          <p className="text-charcoal/70 leading-relaxed mb-6 max-w-md mx-auto">
            The legal case you are looking for does not exist in the tracker.
            It may not have been added yet, or the URL may be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/legal-tracker"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-ink/20 bg-paper text-ink hover:bg-ink/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 min-h-[44px]"
            >
              Browse all legal cases
            </Link>
            <Link
              to="/corrections"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm min-h-[44px]"
            >
              Suggest a case
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const caseSources = legalCase.sourceIds
    .map((sid) => sources.find((s) => s.id === sid))
    .filter(Boolean) as typeof sources;

  const timelineEvents = getTimelineEventsForCase(legalCase.id);

  return (
    <Container className="py-16 lg:py-20 legal-print">
      {/* ── Print header (visible only when printing) ────────────────── */}
      <PrintHeader
        title={legalCase.title}
        version={legalCase.version}
        status={`${legalCase.contentStatus} · ${VERIFICATION_LEVEL_LABELS[legalCase.sourceQuality]}`}
        dates={[
          legalCase.openedDate ? `Opened: ${legalCase.openedDate}` : null,
          legalCase.latestVerifiedUpdateDate ? `Last verified update: ${legalCase.latestVerifiedUpdateDate}` : null,
          legalCase.lastReviewedAt ? `Last reviewed: ${legalCase.lastReviewedAt}` : null,
        ].filter(Boolean).join(" · ") || "Dates not recorded"}
        extraLines={[
          `Institution: ${legalCase.institution}`,
          `Parties: ${legalCase.parties.join(", ")}`,
        ]}
      />

      {/* Back link */}
      <p className="mb-6">
        <Link
          to="/legal-tracker"
          className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          ← Back to Legal Tracker
        </Link>
      </p>

      {/* ── 4. Legal/procedural statuses badge row ────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {legalCase.legalStatuses.map((ls) => (
          <LegalStatusBadge key={ls} status={ls} />
        ))}
      </div>

      {/* ── 1. Case title ─────────────────────────────────────────────────── */}
      <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-4">
        {legalCase.title}
      </h1>

      {/* ── 2. Institution and jurisdiction ────────────────────────────────── */}
      <p className="text-lg text-charcoal/70 mb-8">
        {legalCase.institution}
        <span className="text-charcoal/50">
          {" — "}{legalCase.jurisdiction}
        </span>
      </p>

      {/* ── 10. Procedural summary ────────────────────────────────────────── */}
      <div className="bg-bone border border-border rounded-lg p-6 mb-8">
        <p className="text-charcoal/80 leading-relaxed">{legalCase.summary}</p>
        {legalCase.proceduralNote && (
          <p className="text-sm text-charcoal/60 italic mt-3 pt-3 border-t border-border/50">
            {legalCase.proceduralNote}
          </p>
        )}
      </div>

      {/* ── Metadata grid (3, 5, 6, 7, 8, 9, 12) ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {/* 3. Parties */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Parties
          </p>
          <p className="text-sm text-charcoal/80">
            {legalCase.parties.length > 0
              ? legalCase.parties.join("; ")
              : "Not recorded"}
          </p>
        </div>

        {/* 5. Editorial status */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Editorial status
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <ContentStatusBadge status={legalCase.contentStatus} />
          </div>
          <p className="text-xs text-charcoal/50 mt-0.5">
            {legalCase.contentStatus === "reviewed"
              ? "This case summary has completed editorial review."
              : legalCase.contentStatus === "review_pending"
                ? "This case summary has not yet completed editorial review — even if the source quality is high."
                : legalCase.contentStatus === "static_preview"
                  ? "This is a static preview record — not yet formally reviewed."
                  : ""}
          </p>
        </div>

        {/* 6. Source quality */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Source quality
          </p>
          <p className="text-sm text-charcoal/80">
            Level {legalCase.sourceQuality} —{" "}
            {VERIFICATION_LEVEL_LABELS[legalCase.sourceQuality]}
          </p>
          {([0, 1, 2, 3, 4, 5] as VerificationLevel[]).map((level) =>
            level === legalCase.sourceQuality ? (
              <p key={level} className="text-xs text-charcoal/50 mt-0.5">
                {level === 0
                  ? "Raw information not yet reviewed."
                  : level === 1
                    ? "Saved for review but not yet checked against sources."
                    : level === 2
                      ? "Verified against at least one documented public source."
                      : level === 3
                        ? "Confirmed by multiple independent sources."
                        : level === 4
                          ? "Verified by an established trusted organisation."
                          : "Official court record, UN document, or formal institutional finding."}
              </p>
            ) : null,
          )}
        </div>

        {/* 7. Opened date */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Opened date
          </p>
          <p className="text-sm text-charcoal/80">
            {legalCase.openedDate ?? "Not recorded"}
          </p>
        </div>

        {/* 8. Latest verified update */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Latest verified update
          </p>
          <p className="text-sm text-charcoal/80">
            {legalCase.latestVerifiedUpdateDate ?? "review_pending"}
          </p>
          {!legalCase.latestVerifiedUpdateDate && (
            <p className="text-xs text-charcoal/50 mt-0.5">
              Online verification was not available at implementation time.
            </p>
          )}
        </div>

        {/* 9. Legal basis or alleged crimes */}
        {legalCase.legalBasisOrAllegedCrimes && (
          <div className="sm:col-span-2">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
              Legal basis or alleged crimes
            </p>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              {legalCase.legalBasisOrAllegedCrimes}
            </p>
          </div>
        )}

        {/* 15. Version and review metadata */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Record version
          </p>
          <p className="text-sm text-charcoal/80">v{legalCase.version}</p>
        </div>

        {legalCase.lastReviewedAt && (
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
              Last reviewed
            </p>
            <p className="text-sm text-charcoal/80">
              {legalCase.lastReviewedAt}
            </p>
          </div>
        )}
      </div>

      {/* Reviewer role */}
      {legalCase.reviewedByRole && (
        <div className="mb-8 p-4 bg-bone border border-border rounded-lg">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
            Reviewer role
          </p>
          <p className="text-sm text-charcoal/75">
            {legalCase.reviewedByRole}
          </p>
          <p className="text-xs text-charcoal/50 mt-1">
            Reviewers are identified by role, not by name. This role description
            is public and authorised for display.
          </p>
        </div>
      )}

      {/* ── 12. Next milestone ────────────────────────────────────────────── */}
      <div className="mb-8 p-5 bg-bone border border-border rounded-lg">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
          Next milestone
        </p>
        <p className="text-sm text-charcoal/80 leading-relaxed">
          {legalCase.nextMilestone
            ? legalCase.nextMilestone
            : "No verified next milestone is available at this time. This may be because the information has not been publicly confirmed, or the procedural calendar has not been published."}
        </p>
        {!legalCase.nextMilestone && (
          <p className="text-xs text-charcoal/50 mt-1">
            Next milestones are only listed when sourced or clearly described as unknown.
          </p>
        )}
      </div>

      {/* ── 13. Action relevance ──────────────────────────────────────────── */}
      {legalCase.actionRelevance && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Action relevance
          </h2>
          <div className="p-5 bg-bone border border-border rounded-lg">
            <p className="text-sm text-charcoal/80 leading-relaxed">
              {legalCase.actionRelevance}
            </p>
            <p className="text-xs text-charcoal/50 mt-2">
              This section identifies ways citizens can engage with this legal
              process through lawful, documented routes. It does not constitute
              legal advice and does not advocate any particular outcome.
            </p>
          </div>
        </div>
      )}

      {/* ── 11. Timeline ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          Procedural timeline
        </h2>
        <LegalTimeline
          events={timelineEvents}
          emptyMessage="No timeline events have been added for this case yet. Timeline entries require source-linked procedural events."
        />
        {timelineEvents.length > 0 && (
          <p className="text-xs text-charcoal/50 mt-3">
            Every timeline entry requires linked source documents. Event types
            use a controlled procedural vocabulary. Summaries distinguish
            allegations, applications, provisional measures, warrants, findings,
            and judgments.
          </p>
        )}
      </div>

      {/* ── 14. Source documents ──────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          Source documents
        </h2>
        {caseSources.length > 0 ? (
          <SourceList
            sources={caseSources}
            title="Case sources"
            emptyMessage="Source documents not yet linked."
          />
        ) : (
          <p className="text-sm text-charcoal/60 italic">
            No source documents are linked to this case entry yet.
          </p>
        )}
      </div>

      {/* ── Source quality vs. editorial status explainer ─────────────────── */}
      <div className="bg-bone border border-border rounded-lg p-5 mb-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
          About this case record
        </p>
        <p className="text-sm text-charcoal/75 leading-relaxed">
          Source quality (verification level) describes the authority and
          reliability of the underlying source documents. Editorial content
          status describes whether this platform&rsquo;s written summary has
          completed editorial review. These dimensions are kept separate
          throughout the platform.{" "}
          {legalCase.contentStatus !== "reviewed" &&
            "This case summary has not been editorially reviewed. Do not describe it as verified or reviewed content."}
        </p>
      </div>

      {/* ── 17. Not-legal-advice disclaimer ────────────────────────────────── */}
      <div className="bg-amber/5 border border-amber/20 rounded-lg p-5 mb-8">
        <p className="font-serif text-base font-semibold text-ink mb-2">
          Not legal advice
        </p>
        <p className="text-sm text-charcoal/75 leading-relaxed">
          This page provides publicly available information about legal
          proceedings for informational purposes only. It does not constitute
          legal advice, legal representation, or legal opinion. Case summaries
          and timeline entries are based on publicly reported procedural
          information and should not be relied upon for legal decisions.
          Consult a qualified legal professional for advice about specific
          legal matters.
        </p>
      </div>

      {/* ── Methodology link ──────────────────────────────────────────────── */}
      <p className="text-sm text-charcoal/60 mb-2">
        For details on how legal cases are categorised, sourced, and reviewed,
        see the{" "}
        <Link
          to="/methodology"
          className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          Methodology
        </Link>
        .
      </p>

      {/* ── 16. Correction route ──────────────────────────────────────────── */}
      <div className="border-t border-border pt-6 mt-6">
        <p className="text-sm text-charcoal/60">
          <Link
            to={legalCase.correctionUrl}
            className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Report an error in this case summary
          </Link>
        </p>
      </div>

      <CorrectionLink />
      <LastUpdated date="2026-07-13" />

      {/* ── Print footer (visible only when printing) ────────────────── */}
      <PrintFooter
        canonicalPath={`/legal-tracker/${legalCase.slug}`}
        extraLines={[
          "Not legal advice. This page provides publicly available information about legal proceedings for informational purposes only.",
        ]}
      />
    </Container>
  );
}
