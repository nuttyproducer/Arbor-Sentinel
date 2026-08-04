import { useParams, Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { LastUpdated } from "../components/pages/LastUpdated";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { ExternalLink } from "../components/ui/ExternalLink";
import { getSourceBySlug } from "../data/sources";
import { evidenceItems } from "../data/evidenceItems";
import { legalCases } from "../data/legalCases";
import { actionTemplates } from "../data/actionTemplates";
import { organizationRecords } from "../data/organizations";
import {
  SOURCE_TYPE_LABELS,
  SOURCE_STATUS_LABELS,
} from "../types/content";

/** Find evidence, legal, and action records that reference a source ID. */
function findRelatedRecords(sourceId: string) {
  const evidence = evidenceItems.filter((e) => e.sourceIds.includes(sourceId));
  const legal = legalCases.filter((c) => c.sourceIds.includes(sourceId));
  const actions = actionTemplates.filter((t) => t.sourceIds.includes(sourceId));
  const orgs = organizationRecords.filter((o) => o.sourceIds.includes(sourceId));
  return { evidence, legal, actions, orgs };
}

export default function SourceDetailPage() {
  const { sourceId } = useParams<{ sourceId: string }>();
  const source = sourceId ? getSourceBySlug(sourceId) : undefined;

  if (!source) {
    return (
      <Container className="py-16 lg:py-20">
        <div className="text-center py-20">
          <p className="font-serif text-3xl font-semibold text-ink mb-4">
            Source not found
          </p>
          <p className="text-charcoal/70 leading-relaxed mb-6 max-w-md mx-auto">
            The source record you are looking for does not exist in the
            registry. It may not have been added yet, or the URL may be
            incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sources"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-ink/20 bg-paper text-ink hover:bg-ink/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 min-h-[44px]"
            >
              Browse all sources
            </Link>
            <Link
              to="/corrections"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm min-h-[44px]"
            >
              Suggest a source
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const related = findRelatedRecords(source.id);
  const hasRelated =
    related.evidence.length > 0 ||
    related.legal.length > 0 ||
    related.actions.length > 0 ||
    related.orgs.length > 0;

  return (
    <Container className="py-16 lg:py-20">
      {/* Status badge row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Badge variant="neutral">
          {SOURCE_TYPE_LABELS[source.sourceType]}
        </Badge>
        {source.documentType && (
          <span className="font-mono text-[11px] text-charcoal/50">
            {source.documentType}
          </span>
        )}
        <Badge
          variant={
            source.status === "active"
              ? "info"
              : source.status === "broken"
                ? "alert"
                : source.status === "superseded"
                  ? "warning"
                  : "neutral"
          }
        >
          {SOURCE_STATUS_LABELS[source.status]}
        </Badge>
        {source.official && (
          <Badge variant="info">Official record</Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-4">
        {source.title}
      </h1>

      {/* Publisher + jurisdiction */}
      <p className="text-lg text-charcoal/70 mb-8">
        {source.publisher}
        {source.jurisdiction && (
          <span className="text-charcoal/50">
            {" — "}{source.jurisdiction}
          </span>
        )}
      </p>

      {/* Metadata grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 p-6 bg-bone border border-border rounded-lg">
        {/* Publication date */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Publication date
          </p>
          <p className="text-sm text-charcoal/80">
            {source.publicationDate ?? "Not recorded"}
          </p>
        </div>

        {/* Access / last checked */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Accessed
          </p>
          <p className="text-sm text-charcoal/80">{source.accessedAt}</p>
        </div>

        {/* Language */}
        {source.language && (
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
              Language
            </p>
            <p className="text-sm text-charcoal/80 uppercase">
              {source.language}
            </p>
          </div>
        )}

        {/* Last checked */}
        {source.lastCheckedAt && (
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
              Last checked
            </p>
            <p className="text-sm text-charcoal/80">{source.lastCheckedAt}</p>
          </div>
        )}

        {/* Authors */}
        {source.authors && source.authors.length > 0 && (
          <div className="sm:col-span-2">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
              {source.authors.length === 1 ? "Author" : "Authors"}
            </p>
            <p className="text-sm text-charcoal/80">
              {source.authors.join("; ")}
            </p>
          </div>
        )}

        {/* Version */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Record version
          </p>
          <p className="text-sm text-charcoal/80">v{source.version}</p>
        </div>
      </div>

      {/* Source-role explanation */}
      <div className="bg-bone border border-border rounded-lg p-5 mb-10">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
          What this source establishes
        </p>
        <p className="text-sm text-charcoal/75 leading-relaxed">
          This source record documents that{" "}
          <strong>{source.publisher}</strong> published this{" "}
          {source.documentType?.toLowerCase() ?? "document"} on{" "}
          {source.publicationDate ?? "the date recorded above"}. The source
          establishes what the publisher stated or found at that time. It does
          not automatically establish every underlying factual claim within the
          document. Where this source is cited by evidence records on this
          platform, those records carry their own verification level and
          editorial content status — separate from the source&rsquo;s own
          authority.
        </p>
      </div>

      {/* URLs */}
      <div className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          Access the source
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-clay mt-1 flex-shrink-0" aria-hidden="true">→</span>
            <div>
              <ExternalLink href={source.url} showIcon>
                Original source at {new URL(source.url).hostname}
              </ExternalLink>
              {source.status !== "active" && (
                <p className="text-xs text-amber/70 mt-0.5">
                  This link may no longer resolve. Status:{" "}
                  {SOURCE_STATUS_LABELS[source.status].toLowerCase()}.
                </p>
              )}
            </div>
          </div>
          {source.archiveUrl && (
            <div className="flex items-start gap-2">
              <span className="text-clay mt-1 flex-shrink-0" aria-hidden="true">→</span>
              <ExternalLink href={source.archiveUrl} showIcon>
                Archived version
              </ExternalLink>
            </div>
          )}
        </div>
      </div>

      {/* Public notes */}
      {source.notes && (
        <div className="mb-10">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Notes
          </h2>
          <p className="text-sm text-charcoal/75 leading-relaxed bg-bone border border-border rounded-lg p-4">
            {source.notes}
          </p>
        </div>
      )}

      {/* Related records */}
      {hasRelated && (
        <div className="mb-10">
          <h2 className="font-serif text-xl font-semibold text-ink mb-4">
            Records that reference this source
          </h2>

          <div className="space-y-4">
            {related.evidence.length > 0 && (
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
                  Evidence records ({related.evidence.length})
                </p>
                <ul className="space-y-2">
                  {related.evidence.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/evidence`}
                        className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {related.legal.length > 0 && (
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
                  Legal cases ({related.legal.length})
                </p>
                <ul className="space-y-2">
                  {related.legal.map((c) => (
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

            {related.actions.length > 0 && (
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
                  Action templates ({related.actions.length})
                </p>
                <ul className="space-y-2">
                  {related.actions.map((t) => (
                    <li key={t.id}>
                      <Link
                        to="/take-action"
                        className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                      >
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {related.orgs.length > 0 && (
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
                  Organizations ({related.orgs.length})
                </p>
                <ul className="space-y-2">
                  {related.orgs.map((o) => (
                    <li key={o.id}>
                      <Link
                        to="/organizations"
                        className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                      >
                        {o.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Correction route */}
      <div className="border-t border-border pt-6 mt-6">
        <p className="text-sm text-charcoal/60">
          <Link
            to={source.correctionUrl}
            className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Report an error or suggest a correction
          </Link>
          {" — "}
          <Link
            to="/sources"
            className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Back to source registry
          </Link>
        </p>
      </div>

      <CorrectionLink />
      <LastUpdated date="2026-07-13" />
    </Container>
  );
}
