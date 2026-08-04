import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { ExternalLink } from "../components/ui/ExternalLink";
import { LastUpdated } from "../components/pages/LastUpdated";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { PrintHeader, PrintFooter } from "../components/pages/PrintOnly";
import { getEvidenceBySlug, EVIDENCE_CATEGORY_LABELS } from "../data/evidenceItems";
import { sources } from "../data/sources";
import { legalCases } from "../data/legalCases";
import {
  CONTENT_STATUS_LABELS,
  VERIFICATION_LEVEL_LABELS,
  SOURCE_TYPE_LABELS,
  LEGAL_STATUS_LABELS,
  type VerificationLevel,
} from "../types/content";

// ── Citation control ──────────────────────────────────────────────────────

interface CitationControlProps {
  title: string;
  version: number;
  lastReviewedAt?: string;
  canonicalPath: string;
}

function CitationControl({ title, version, lastReviewedAt, canonicalPath }: CitationControlProps) {
  const [copied, setCopied] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const citation = [
    `Accountability Atlas, "${title}," version ${version}`,
    lastReviewedAt ? `, last reviewed ${lastReviewedAt}` : "",
    `, ${canonicalPath}`,
    `, accessed ${today}.`,
  ].join("");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API not available — silently fail; the text is still visible.
    }
  }, [citation]);

  return (
    <div className="bg-bone border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45">
          Citation
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-ink/20 bg-paper text-ink hover:bg-ink/5 active:scale-[0.98] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 min-h-[36px]"
          aria-label="Copy citation to clipboard"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="9" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3 12V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {copied ? "Copied" : "Copy citation"}
        </button>
      </div>
      <p className="font-mono text-xs text-charcoal/70 leading-relaxed break-all">
        {citation}
      </p>
      <p
        aria-live="polite"
        aria-atomic="true"
        className="font-mono text-[10px] text-charcoal/50 mt-2"
      >
        {copied ? "Citation copied to clipboard." : "Copy the citation above to reference this evidence record."}
      </p>
    </div>
  );
}

// ── Detail page ───────────────────────────────────────────────────────────

export default function EvidenceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? getEvidenceBySlug(slug) : undefined;

  if (!item) {
    return (
      <Container className="py-16 lg:py-20">
        <div className="text-center py-20">
          <p className="font-serif text-3xl font-semibold text-ink mb-4">
            Evidence record not found
          </p>
          <p className="text-charcoal/70 leading-relaxed mb-6 max-w-md mx-auto">
            The evidence record you are looking for does not exist in the
            library. It may not have been added yet, or the URL may be
            incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/evidence"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-ink/20 bg-paper text-ink hover:bg-ink/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 min-h-[44px]"
            >
              Browse all evidence
            </Link>
            <Link
              to="/corrections"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm min-h-[44px]"
            >
              Suggest a record
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const itemSources = item.sourceIds
    .map((sid) => sources.find((s) => s.id === sid))
    .filter(Boolean);

  const relatedCases = legalCases.filter((c) =>
    c.sourceIds.some((sid) => item.sourceIds.includes(sid)),
  );

  const canonicalPath = `https://accountabilityatlas.org/evidence/${item.slug}`;

  return (
    <Container className="py-16 lg:py-20 evidence-print">
      {/* ── Print header (visible only when printing) ────────────────── */}
      <PrintHeader
        title={item.title}
        version={item.version}
        status={`${CONTENT_STATUS_LABELS[item.contentStatus]} · ${VERIFICATION_LEVEL_LABELS[item.sourceQuality]}`}
        dates={[
          item.publicationDate ? `Source published: ${item.publicationDate}` : null,
          item.lastReviewedAt ? `Last reviewed: ${item.lastReviewedAt}` : null,
        ].filter(Boolean).join(" · ") || "Dates not recorded"}
      />

      {/* Back link */}
      <p className="mb-6">
        <Link
          to="/evidence"
          className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          ← Back to Evidence Library
        </Link>
      </p>

      {/* Status badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="neutral">
          {EVIDENCE_CATEGORY_LABELS[item.category]}
        </Badge>
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
      </div>

      {/* Title */}
      <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-6">
        {item.title}
      </h1>

      {/* Summary */}
      <div className="bg-bone border border-border rounded-lg p-6 mb-8">
        <p className="text-charcoal/80 leading-relaxed">{item.summary}</p>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {/* Source quality */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Source quality
          </p>
          <p className="text-sm text-charcoal/80">
            Level {item.sourceQuality} — {VERIFICATION_LEVEL_LABELS[item.sourceQuality]}
          </p>
          {item.sourceQuality >= 0 && (
            <p className="text-xs text-charcoal/50 mt-0.5">
              {([0, 1, 2, 3, 4, 5] as VerificationLevel[]).map((level) => (
                level === item.sourceQuality ? (
                  <span key={level}>
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
                  </span>
                ) : null
              ))}
            </p>
          )}
        </div>

        {/* Editorial status */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Editorial status
          </p>
          <p className="text-sm text-charcoal/80">
            {CONTENT_STATUS_LABELS[item.contentStatus]}
          </p>
          <p className="text-xs text-charcoal/50 mt-0.5">
            {item.contentStatus === "reviewed"
              ? "This summary has completed editorial review."
              : item.contentStatus === "review_pending"
                ? "This summary has not yet completed editorial review — even if the source quality is high."
                : item.contentStatus === "static_preview"
                  ? "This is a static preview record — not yet formally reviewed."
                  : ""}
          </p>
        </div>

        {/* Publication date */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Publication date
          </p>
          <p className="text-sm text-charcoal/80">
            {item.publicationDate ?? "Not recorded"}
          </p>
          <p className="text-xs text-charcoal/50 mt-0.5">
            Date the source document was published — not when it was added here.
          </p>
        </div>

        {/* Incident date */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Incident date
          </p>
          <p className="text-sm text-charcoal/80">
            {item.incidentDate ?? "Not recorded"}
          </p>
          {item.incidentDate && (
            <p className="text-xs text-charcoal/50 mt-0.5">
              Date of the incident or event, when known and safe to display.
            </p>
          )}
        </div>

        {/* Safe location */}
        {item.safeLocation && (
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
              Region
            </p>
            <p className="text-sm text-charcoal/80">{item.safeLocation}</p>
            <p className="text-xs text-charcoal/50 mt-0.5">
              General region only — exact locations are not displayed.
            </p>
          </div>
        )}

        {/* Source language */}
        {item.sourceLanguage && (
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
              Source language
            </p>
            <p className="text-sm text-charcoal/80">
              {item.sourceLanguage === "en" ? "English" : item.sourceLanguage}
            </p>
          </div>
        )}

        {/* Version */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Record version
          </p>
          <p className="text-sm text-charcoal/80">v{item.version}</p>
        </div>

        {/* Last reviewed */}
        {item.lastReviewedAt && (
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
              Last reviewed
            </p>
            <p className="text-sm text-charcoal/80">{item.lastReviewedAt}</p>
          </div>
        )}
      </div>

      {/* Reviewer */}
      {item.reviewedByRole && (
        <div className="mb-8 p-4 bg-bone border border-border rounded-lg">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
            Reviewer role
          </p>
          <p className="text-sm text-charcoal/75">{item.reviewedByRole}</p>
          <p className="text-xs text-charcoal/50 mt-1">
            Reviewers are identified by role, not by name. This role description
            is public and authorised for display.
          </p>
        </div>
      )}

      {/* Legal statuses */}
      {item.legalStatuses && item.legalStatuses.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Legal status
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {item.legalStatuses.map((ls) => (
              <Badge key={ls} variant="alert">
                {LEGAL_STATUS_LABELS[ls]}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-charcoal/50">
            Legal status labels describe the procedural posture of relevant
            proceedings. They are separate from editorial content status and
            source quality.
          </p>
        </div>
      )}

      {/* Source records */}
      {itemSources.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-4">
            Sources
          </h2>
          <ul className="space-y-4">
            {itemSources.map((src) => (
              <li
                key={src!.id}
                className="border border-border/60 rounded-lg p-4"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="neutral">
                    {SOURCE_TYPE_LABELS[src!.sourceType]}
                  </Badge>
                  {src!.language && (
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase">
                      {src!.language}
                    </span>
                  )}
                </div>
                <Link
                  to={`/sources/${src!.slug}`}
                  className="text-sm font-medium text-ink hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                >
                  {src!.title}
                </Link>
                <p className="text-sm text-charcoal/60 mt-1">{src!.publisher}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-charcoal/50">
                  {src!.publicationDate && (
                    <span>Published: {src!.publicationDate}</span>
                  )}
                  <span>Accessed: {src!.accessedAt}</span>
                  <ExternalLink href={src!.url} showIcon>
                    Original
                  </ExternalLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related records */}
      {(item.relatedRoutes.length > 0 || relatedCases.length > 0) && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-4">
            Related records
          </h2>

          {relatedCases.length > 0 && (
            <div className="mb-4">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
                Legal cases
              </p>
              <ul className="space-y-1.5">
                {relatedCases.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/legal-tracker"
                      className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.relatedRoutes.length > 0 && (
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
                Related pages
              </p>
              <ul className="space-y-1.5">
                {item.relatedRoutes.map((route) => (
                  <li key={route}>
                    <Link
                      to={route}
                      className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                    >
                      {route}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Tags
          </h2>
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

      {/* Source quality vs. editorial status */}
      <div className="bg-bone border border-border rounded-lg p-5 mb-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
          About this record
        </p>
        <p className="text-sm text-charcoal/75 leading-relaxed">
          Source quality (verification level) describes the authority and
          reliability of the underlying source. Editorial content status
          describes whether this platform&rsquo;s written summary has completed
          review. These dimensions are kept separate throughout the platform.{" "}
          {item.contentStatus !== "reviewed" &&
            "This record has not been editorially reviewed. Do not describe it as verified or reviewed content."}
        </p>
      </div>

      {/* Citation */}
      <div className="mb-8">
        <CitationControl
          title={item.title}
          version={item.version}
          lastReviewedAt={item.lastReviewedAt}
          canonicalPath={canonicalPath}
        />
      </div>

      {/* Methodology link */}
      <p className="text-sm text-charcoal/60 mb-2">
        For details on how evidence is categorised, verified, and reviewed, see the{" "}
        <Link
          to="/methodology"
          className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          Methodology
        </Link>
        .
      </p>

      {/* Correction route */}
      <div className="border-t border-border pt-6 mt-6">
        <p className="text-sm text-charcoal/60">
          <Link
            to={item.correctionUrl}
            className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Report an error in this summary
          </Link>
        </p>
      </div>

      <CorrectionLink />
      <LastUpdated date="2026-07-13" />

      {/* ── Print footer (visible only when printing) ────────────────── */}
      <PrintFooter
        canonicalPath={`/evidence/${item.slug}`}
        extraLines={[
          item.contentStatus !== "reviewed"
            ? "This record has not been editorially reviewed. Do not describe it as verified or reviewed content."
            : "",
        ].filter(Boolean)}
      />
    </Container>
  );
}
