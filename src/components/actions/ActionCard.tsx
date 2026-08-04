import { Link } from "react-router-dom";
import { Reveal } from "../ui/Reveal";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import {
  ACTION_TYPE_LABELS,
  LANGUAGE_LABELS,
  type ActionTemplate,
} from "../../data/actionTemplates";
import { CONTENT_STATUS_LABELS, TRANSLATION_STATUS_LABELS } from "../../types/content";
import { CopyTemplateButton } from "./CopyTemplateButton";

interface ActionCardProps {
  template: ActionTemplate;
  index: number;
}

export function ActionCard({ template, index }: ActionCardProps) {
  const hasTemplate = !!template.templateBody;
  const isTranslation = !!template.translationOf;
  const langLabel = LANGUAGE_LABELS[template.language] || template.language;

  return (
    <Reveal delay={0.18 + index * 0.06}>
      <Card
        title={template.title}
        accent={
          template.contentStatus === "reviewed"
            ? "blue"
            : template.contentStatus === "review_pending"
              ? "amber"
              : "clay"
        }
      >
        {/* Type + jurisdiction + language */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="neutral">
            {ACTION_TYPE_LABELS[template.actionType]}
          </Badge>
          <Badge variant="neutral">{langLabel}</Badge>
          {isTranslation && (
            <Badge variant="warning">
              {TRANSLATION_STATUS_LABELS[template.translationStatus]}
            </Badge>
          )}
          <span className="font-mono text-[11px] text-charcoal/50">
            {template.jurisdiction}
          </span>
        </div>

        {/* Purpose */}
        <p className="text-charcoal/80 leading-relaxed mb-3">
          {template.purpose}
        </p>

        {/* What the recipient can do */}
        <div className="bg-bone/70 border border-border/50 rounded-md p-4 mb-4">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1.5">
            What the recipient can do
          </p>
          <p className="text-sm text-charcoal/75 leading-relaxed">
            {template.policyAsk}
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1.5">
            How to do this safely
          </p>
          <div className="text-sm text-charcoal/70 leading-relaxed whitespace-pre-line">
            {template.instructions}
          </div>
        </div>

        {/* Template body + copy button */}
        {hasTemplate && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45">
                Template text
              </p>
              {template.templateReviewStatus === "draft" && (
                <Badge variant="warning">Draft</Badge>
              )}
              {template.templateReviewStatus === "reviewed" && (
                <Badge variant="info">Reviewed</Badge>
              )}
            </div>
            <pre className="bg-bone/80 border border-border rounded-md p-4 text-sm text-charcoal/75 leading-relaxed whitespace-pre-line font-sans overflow-x-auto max-h-80 overflow-y-auto">
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

        {/* Source basis */}
        <p className="text-sm text-charcoal/60 leading-relaxed mb-4">
          <span className="font-medium text-charcoal/70">Legal and policy basis: </span>
          {template.sourceBasis}
        </p>

        {/* Warnings */}
        <div className="bg-amber/5 border border-amber/20 rounded-md p-4 mb-4">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-amber/80 mb-1.5">
            Important warnings
          </p>
          <ul className="space-y-1.5">
            {template.warnings.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-sm text-charcoal/70"
              >
                <span className="text-amber/60 mt-0.5 flex-shrink-0" aria-hidden="true">
                  !
                </span>
                {w}
              </li>
            ))}
          </ul>
        </div>

        {/* Status + review dimensions */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant={
              template.contentStatus === "reviewed"
                ? "info"
                : template.contentStatus === "review_pending"
                  ? "warning"
                  : "neutral"
            }
          >
            {CONTENT_STATUS_LABELS[template.contentStatus]}
          </Badge>
          {template.templateReviewStatus === "draft" && (
            <Badge variant="warning">Template: draft</Badge>
          )}
          {template.jurisdictionReviewStatus === "draft" && (
            <Badge variant="warning">Jurisdiction: draft</Badge>
          )}
          {isTranslation && template.languageReviewStatus === "draft" && (
            <Badge variant="warning">Language: draft</Badge>
          )}
          {template.lastReviewedAt && (
            <span className="font-mono text-[11px] text-charcoal/45">
              Last reviewed: {template.lastReviewedAt}
            </span>
          )}
          {isTranslation && template.translationStatus !== "reviewed" && (
            <span className="font-mono text-[11px] text-amber/70">
              Translation: {TRANSLATION_STATUS_LABELS[template.translationStatus].toLowerCase()}
            </span>
          )}
        </div>

        {/* Related routes */}
        {template.relatedRoutes.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 border-t border-border">
            <span className="font-mono text-[11px] text-charcoal/45">
              Related pages:
            </span>
            {template.relatedRoutes.map((route) => (
              <Link
                key={route}
                to={route}
                className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
              >
                {route}
              </Link>
            ))}
          </div>
        )}

        {/* Detail page link */}
        <div className="pt-3 border-t border-border mt-3">
          <Link
            to={`/take-action/${template.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            View full action details
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
