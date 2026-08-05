import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { LastUpdated } from "../components/pages/LastUpdated";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { ContentStatusBadge } from "../components/pages/ContentStatusBadge";
import { SourceList } from "../components/pages/SourceList";
import { CopyTemplateButton } from "../components/actions/CopyTemplateButton";
import {
  ACTION_TYPE_LABELS,
  REVIEW_STATUS_LABELS,
  LANGUAGE_LABELS,
  type ActionTemplate,
} from "../data/actionTemplates";
import { TRANSLATION_STATUS_LABELS } from "../types/content";
import { sources } from "../data/sources";
import { useRepository } from "../hooks/useRepository";

export default function ActionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const repo = useRepository();
  const [template, setTemplate] = useState<ActionTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    repo.getActionBySlug(slug).then((result) => {
      if (cancelled) return;
      setTemplate(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, slug]);

  if (loading && slug) {
    return (
      <Container className="py-16 lg:py-20">
        <div
          className="flex items-center justify-center min-h-[40vh]"
          role="status"
          aria-label="Loading action template"
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-[2px] bg-amber rounded-full motion-safe:animate-pulse"
              aria-hidden="true"
            />
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-charcoal/50">
              Loading
            </p>
            <span className="sr-only" aria-live="polite">
              Action template is loading.
            </span>
          </div>
        </div>
      </Container>
    );
  }

  if (!template) {
    return (
      <Container className="py-16 lg:py-20">
        <div className="text-center py-20">
          <p className="font-serif text-3xl font-semibold text-ink mb-4">
            Action template not found
          </p>
          <p className="text-charcoal/70 leading-relaxed mb-6 max-w-md mx-auto">
            The action template you are looking for does not exist in the Action
            Hub. It may not have been added yet, or the URL may be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/take-action"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-ink/20 bg-paper text-ink hover:bg-ink/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 min-h-[44px]"
            >
              Browse all actions
            </Link>
            <Link
              to="/corrections"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm min-h-[44px]"
            >
              Suggest an action
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const templateSources = template.sourceIds
    .map((sid) => sources.find((s) => s.id === sid))
    .filter(Boolean) as typeof sources;

  const hasTemplate = !!template.templateBody;

  return (
    <Container className="py-16 lg:py-20">
      {/* Back link */}
      <p className="mb-6">
        <Link
          to="/take-action"
          className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          ← Back to Action Hub
        </Link>
      </p>

      {/* ── Status badges row ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="neutral">
          {ACTION_TYPE_LABELS[template.actionType]}
        </Badge>
        <ContentStatusBadge status={template.contentStatus} />
      </div>

      {/* ── 1. Action title ──────────────────────────────────────────────── */}
      <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-4">
        {template.title}
      </h1>

      {/* ── 2. Jurisdiction ───────────────────────────────────────────────── */}
      <p className="text-lg text-charcoal/70 mb-8">
        {template.jurisdiction}
      </p>

      {/* ── 3. Intended audience ──────────────────────────────────────────── */}
      <div className="bg-bone border border-border rounded-lg p-6 mb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1.5">
          Intended audience
        </p>
        <p className="text-charcoal/80 leading-relaxed">
          {template.intendedAudience}
        </p>
      </div>

      {/* ── 4. Purpose ────────────────────────────────────────────────────── */}
      <div className="bg-bone border border-border rounded-lg p-6 mb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1.5">
          Purpose
        </p>
        <p className="text-charcoal/80 leading-relaxed">
          {template.purpose}
        </p>
      </div>

      {/* ── 5. Policy ask — what the recipient can realistically do ──────── */}
      <div className="bg-bone border border-border rounded-lg p-6 mb-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1.5">
          What the recipient can do
        </p>
        <p className="text-charcoal/80 leading-relaxed">
          {template.policyAsk}
        </p>
      </div>

      {/* ── 6. Source basis ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-3">
          Legal and policy basis
        </h2>
        <div className="bg-bone border border-border rounded-lg p-5">
          <p className="text-sm text-charcoal/80 leading-relaxed">
            {template.sourceBasis}
          </p>
        </div>
      </div>

      {/* ── 7. Step-by-step instructions ──────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-3">
          How to complete this action safely
        </h2>
        <div className="bg-bone border border-border rounded-lg p-5">
          <div className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
            {template.instructions}
          </div>
        </div>
      </div>

      {/* ── 8. Template body + copy button ────────────────────────────────── */}
      {hasTemplate && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Template text
            </h2>
            {template.templateReviewStatus === "draft" && (
              <Badge variant="warning">Draft template</Badge>
            )}
            {template.templateReviewStatus === "reviewed" && (
              <Badge variant="info">Reviewed template</Badge>
            )}
            {template.templateReviewStatus === "not_applicable" && (
              <Badge variant="neutral">No template</Badge>
            )}
          </div>
          <pre className="bg-bone/80 border border-border rounded-md p-4 text-sm text-charcoal/75 leading-relaxed whitespace-pre-line font-sans overflow-x-auto max-h-96 overflow-y-auto">
            {template.templateBody}
          </pre>
          <div className="mt-3">
            <CopyTemplateButton
              text={template.templateBody ?? ""}
              label={`Copy "${template.title}" template to clipboard`}
            />
          </div>
        </div>
      )}

      {/* ── 9–11. Review status dimensions (separated) ───────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          Review status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Template review status */}
          <div className="bg-bone border border-border rounded-lg p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
              Template review
            </p>
            <Badge
              variant={
                template.templateReviewStatus === "reviewed"
                  ? "info"
                  : template.templateReviewStatus === "draft"
                    ? "warning"
                    : "neutral"
              }
            >
              {REVIEW_STATUS_LABELS[template.templateReviewStatus]}
            </Badge>
            <p className="text-xs text-charcoal/50 mt-1.5">
              {template.templateReviewStatus === "draft"
                ? "Template text has not yet been reviewed for safety, accuracy, or legality by a qualified reviewer. Adapt before using."
                : template.templateReviewStatus === "reviewed"
                  ? "Template text has been reviewed for safety and accuracy. Still adapt to your own words."
                  : "This action does not include a template body — template review is not applicable."}
            </p>
          </div>

          {/* Jurisdiction review status */}
          <div className="bg-bone border border-border rounded-lg p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
              Jurisdiction review
            </p>
            <Badge
              variant={
                template.jurisdictionReviewStatus === "reviewed"
                  ? "info"
                  : template.jurisdictionReviewStatus === "draft"
                    ? "warning"
                    : "neutral"
              }
            >
              {REVIEW_STATUS_LABELS[template.jurisdictionReviewStatus]}
            </Badge>
            <p className="text-xs text-charcoal/50 mt-1.5">
              {template.jurisdictionReviewStatus === "draft"
                ? "This template has not been reviewed for legal accuracy in its target jurisdiction. Verify that the action is lawful where you are before sending."
                : template.jurisdictionReviewStatus === "reviewed"
                  ? "This template has been reviewed for legal accuracy in its target jurisdiction."
                  : "This action is not jurisdiction-specific — jurisdiction review is not applicable."}
            </p>
          </div>

          {/* Language review status */}
          <div className="bg-bone border border-border rounded-lg p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
              Language review
            </p>
            <Badge
              variant={
                template.languageReviewStatus === "reviewed"
                  ? "info"
                  : template.languageReviewStatus === "draft"
                    ? "warning"
                    : "neutral"
              }
            >
              {REVIEW_STATUS_LABELS[template.languageReviewStatus]}
            </Badge>
            <p className="text-xs text-charcoal/50 mt-1.5">
              {template.languageReviewStatus === "draft"
                ? `Template text has not been reviewed by a competent speaker of the template language (${template.language === "en" ? "English" : template.language}).`
                : template.languageReviewStatus === "reviewed"
                  ? `Template text has been reviewed by a competent speaker of the template language (${template.language === "en" ? "English" : template.language}).`
                  : "Language review is not applicable for this action."}
            </p>
          </div>

          {/* Editorial content status */}
          <div className="bg-bone border border-border rounded-lg p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
              Editorial content status
            </p>
            <ContentStatusBadge status={template.contentStatus} />
            <p className="text-xs text-charcoal/50 mt-1.5">
              {template.contentStatus === "reviewed"
                ? "This action page has completed editorial review."
                : template.contentStatus === "review_pending"
                  ? "This action page has not yet completed editorial review — even if individual sections are well-sourced."
                  : template.contentStatus === "static_preview"
                    ? "This is a static preview — the action page structure and draft text are visible, but editorial review has not been completed."
                    : template.contentStatus === "draft"
                      ? "This page is a draft. Content may change significantly before review."
                      : ""}
            </p>
          </div>
        </div>

        {/* Important: dimensions are separate */}
        <div className="mt-4 p-4 bg-bone border border-border rounded-lg">
          <p className="text-xs text-charcoal/50 leading-relaxed">
            Template review, jurisdiction review, language review, and editorial
            content status are separate dimensions. Each is assessed
            independently. A template may have reviewed text but still be
            pending jurisdiction review — or vice versa. Do not collapse these
            into a single &ldquo;reviewed&rdquo; flag.
          </p>
        </div>
      </div>

      {/* ── 11. Language and translation status ────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-3">
          Language and translation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-bone border border-border rounded-lg p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
              Template language
            </p>
            <p className="text-sm text-charcoal/80 font-medium">
              {LANGUAGE_LABELS[template.language] || template.language}
            </p>
          </div>
          <div className="bg-bone border border-border rounded-lg p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
              Translation status
            </p>
            <Badge
              variant={
                template.translationStatus === "reviewed"
                  ? "info"
                  : template.translationStatus === "draft"
                    ? "warning"
                    : "neutral"
              }
            >
              {TRANSLATION_STATUS_LABELS[template.translationStatus]}
            </Badge>
          </div>
        </div>
        {template.translationOf && (
          <div className="mt-3 bg-bone border border-border rounded-lg p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
              Translation of
            </p>
            <Link
              to={`/take-action/${template.translationOf}`}
              className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              View the primary (English) version of this template
            </Link>
          </div>
        )}
        {template.language !== "en" && (
          <div className="mt-3 p-3 bg-amber/5 border border-amber/20 rounded-md">
            <p className="text-xs text-charcoal/70 leading-relaxed">
              <strong>Translation note:</strong> This template is a translation
              of the English original. The translation has not been reviewed by
              a competent speaker of{" "}
              {LANGUAGE_LABELS[template.language] || template.language}. It is
              published as a draft to support accessibility across Belgium&rsquo;s
              official languages, but should not be treated as reviewed content.
              If you find errors in the translation, please submit a correction.
            </p>
          </div>
        )}
        <p className="text-xs text-charcoal/50 mt-3">
          Action templates are drafted in English during the static beta.
          Dutch and French translations require human language review before
          being marked as reviewed. English originals remain review_pending
          until legal, jurisdiction, and editorial review are complete.
        </p>
      </div>

      {/* ── 12. Warnings ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-3">
          Important warnings
        </h2>
        <div className="bg-amber/5 border border-amber/20 rounded-lg p-5">
          <ul className="space-y-2">
            {template.warnings.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-charcoal/80"
              >
                <span
                  className="text-amber/60 mt-0.5 flex-shrink-0 font-bold"
                  aria-hidden="true"
                >
                  !
                </span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── 13. Related routes ────────────────────────────────────────────── */}
      {template.relatedRoutes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Related pages
          </h2>
          <div className="bg-bone border border-border rounded-lg p-5">
            <ul className="space-y-1.5">
              {template.relatedRoutes.map((route) => (
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
        </div>
      )}

      {/* ── 14. Source records ────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          Source records
        </h2>
        {templateSources.length > 0 ? (
          <SourceList
            sources={templateSources}
            title="Sources supporting this action"
            emptyMessage="No source records are linked to this action template."
          />
        ) : (
          <div className="bg-bone border border-border rounded-lg p-5">
            <p className="text-sm text-charcoal/75 leading-relaxed">
              This action template has not yet been linked to structured source
              records. The legal and policy basis is described in the section
              above. During the static beta, source records are being developed
              and linked incrementally.
            </p>
            <p className="text-xs text-charcoal/50 mt-2">
              Source records establish what an institution published or stated.
              They do not automatically establish every underlying factual claim
              within the source.
            </p>
          </div>
        )}
      </div>

      {/* ── 15. Version and review metadata ───────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-3">
          Version and review metadata
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-bone border border-border rounded-lg p-5">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
              Record version
            </p>
            <p className="text-sm text-charcoal/80">v{template.version}</p>
          </div>
          {template.lastReviewedAt && (
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                Last reviewed
              </p>
              <p className="text-sm text-charcoal/80">
                {template.lastReviewedAt}
              </p>
            </div>
          )}
          {template.reviewedByRole && (
            <div className="sm:col-span-2">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                Reviewer role
              </p>
              <p className="text-sm text-charcoal/75">
                {template.reviewedByRole}
              </p>
              <p className="text-xs text-charcoal/50 mt-1">
                Reviewers are identified by role, not by name. This role
                description is public and authorised for display.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Review dimensions explainer ───────────────────────────────────── */}
      <div className="bg-bone border border-border rounded-lg p-5 mb-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
          About this action record
        </p>
        <p className="text-sm text-charcoal/75 leading-relaxed">
          Action templates carry four independent review dimensions: template
          review (safety and accuracy of the template text), jurisdiction review
          (legal accuracy in the target jurisdiction), language review (review
          by a competent speaker), and editorial content status (whether the
          page has completed editorial review). These dimensions are kept
          separate throughout the platform.{" "}
          {template.contentStatus !== "reviewed" &&
            "This action page has not been editorially reviewed. Do not describe it as verified or reviewed content."}
        </p>
      </div>

      {/* ── 16. Correction link ───────────────────────────────────────────── */}
      <div className="border-t border-border pt-6 mt-6">
        <p className="text-sm text-charcoal/60">
          <Link
            to={template.correctionUrl}
            className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Report an error in this action template
          </Link>
        </p>
      </div>

      {/* ── 17. Lawful-use disclaimer ─────────────────────────────────────── */}
      <div className="bg-amber/5 border border-amber/20 rounded-lg p-5 mb-8 mt-8">
        <p className="font-serif text-base font-semibold text-ink mb-2">
          Lawful use only
        </p>
        <p className="text-sm text-charcoal/75 leading-relaxed">
          This action template is provided for lawful civic engagement only. It
          is not legal advice and does not constitute encouragement of any
          unlawful activity. Before using this template, verify that the action
          described is lawful in your jurisdiction. The platform does not send
          messages on your behalf, does not store your identity or message
          content, and does not track whether a recipient responded.
        </p>
        <ul className="space-y-1.5 mt-3 text-sm text-charcoal/75">
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Do not use this template to send threats, abuse, or harassing
            messages.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Do not impersonate another person or use false identity information.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Adapt the template to your own words. Personal, specific messages
            are more effective than identical form letters.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Reference public, verifiable sources where possible.
          </li>
        </ul>
      </div>

      {/* ── What the platform does not do ─────────────────────────────────── */}
      <div className="mb-8 p-5 bg-bone border border-border rounded-lg">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
          What this platform does not do
        </p>
        <ul className="space-y-1.5 text-sm text-charcoal/75">
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Send messages on your behalf.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Store your identity, messages, or contact details.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Track whether a recipient responded.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Provide a representative finder or lookup tool.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Automate or mass-send messages.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-0.5" aria-hidden="true">•</span>
            Provide legal advice or tell you what to say.
          </li>
        </ul>
      </div>

      {/* ── Methodology link ──────────────────────────────────────────────── */}
      <p className="text-sm text-charcoal/60 mb-2">
        For details on how action templates are created, reviewed, and
        maintained, see the{" "}
        <Link
          to="/methodology"
          className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          Methodology
        </Link>
        .
      </p>

      <CorrectionLink />
      <LastUpdated date="2026-07-24" />
    </Container>
  );
}
