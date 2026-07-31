import { Link } from "react-router-dom";
import type { SourceRecord } from "../../types/content";
import {
  SOURCE_TYPE_LABELS,
  SOURCE_STATUS_LABELS,
  TRUST_LEVEL_LABELS,
  VERIFICATION_METHOD_LABELS,
  HEALTH_STATUS_LABELS,
  AUTOMATION_STATUS_LABELS,
} from "../../types/content";
import { Badge } from "../ui/Badge";
import { ExternalLink } from "../ui/ExternalLink";
import { SourceHealthIndicator } from "./SourceHealthIndicator";

interface SourceDetailPanelProps {
  source: SourceRecord | null;
  onClose: () => void;
  open: boolean;
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-2 border-b border-border/30 last:border-b-0">
      <dt className="text-[11px] font-mono font-medium uppercase tracking-[0.08em] text-charcoal/45 sm:w-40 flex-shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-ink leading-relaxed">{children}</dd>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif text-lg font-semibold text-ink mt-6 mb-3 first:mt-0">
      {children}
    </h3>
  );
}

export function SourceDetailPanel({
  source,
  onClose,
  open,
}: SourceDetailPanelProps) {
  if (!open || !source) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label="Source detail panel">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg lg:max-w-xl bg-paper border-l border-border/60 overflow-y-auto shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur-sm border-b border-border/60 px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
              Source Detail
            </p>
            <h2 className="font-serif text-xl font-semibold text-ink leading-snug">
              {source.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-charcoal/50 hover:text-charcoal hover:bg-border/30 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 min-h-[44px] min-w-[44px] -mr-1"
            aria-label="Close detail panel"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* ── Basic metadata ── */}
          <SectionHeading>Basic Metadata</SectionHeading>
          <dl>
            <FieldRow label="Publisher">{source.publisher}</FieldRow>
            <FieldRow label="Source type">
              <Badge variant="neutral">{SOURCE_TYPE_LABELS[source.sourceType]}</Badge>
            </FieldRow>
            {source.documentType && (
              <FieldRow label="Document type">
                <span className="font-mono text-xs">{source.documentType}</span>
              </FieldRow>
            )}
            <FieldRow label="URL status">
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
            </FieldRow>
            <FieldRow label="Language">
              {source.language ? (
                <span className="font-mono text-xs uppercase">{source.language}</span>
              ) : (
                <span className="text-charcoal/30">—</span>
              )}
            </FieldRow>
            <FieldRow label="Jurisdiction">
              {source.jurisdiction || <span className="text-charcoal/30">—</span>}
            </FieldRow>
            {source.authors && source.authors.length > 0 && (
              <FieldRow label="Authors">
                {source.authors.join(", ")}
              </FieldRow>
            )}
            <FieldRow label="Official record">
              {source.official ? (
                <span className="font-mono text-[10px] uppercase text-green-700 font-medium">Yes</span>
              ) : (
                <span className="text-charcoal/30">No</span>
              )}
            </FieldRow>
            <FieldRow label="Publication date">
              {source.publicationDate || <span className="text-charcoal/30">—</span>}
            </FieldRow>
            <FieldRow label="Accessed at">{source.accessedAt}</FieldRow>
            {source.lastCheckedAt && (
              <FieldRow label="Last checked">{source.lastCheckedAt}</FieldRow>
            )}
          </dl>

          {/* ── Links ── */}
          <SectionHeading>Links</SectionHeading>
          <dl>
            <FieldRow label="Original URL">
              <ExternalLink href={source.url} showIcon>
                {source.url}
              </ExternalLink>
            </FieldRow>
            {source.archiveUrl && (
              <FieldRow label="Archive URL">
                <ExternalLink href={source.archiveUrl} showIcon>
                  {source.archiveUrl}
                </ExternalLink>
              </FieldRow>
            )}
            <FieldRow label="Detail page">
              <Link
                to={`/sources/${source.slug}`}
                className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200"
              >
                View full source page
              </Link>
            </FieldRow>
            <FieldRow label="Corrections">
              <Link
                to={source.correctionUrl}
                className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200"
              >
                Report an issue with this source
              </Link>
            </FieldRow>
          </dl>

          {/* ── Trust & Verification ── */}
          <SectionHeading>Trust &amp; Verification</SectionHeading>
          <dl>
            <FieldRow label="Trust level">
              <span className="inline-flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{source.trustLevel}/5</span>
                <span className="text-xs text-charcoal/60">
                  — {TRUST_LEVEL_LABELS[source.trustLevel]}
                </span>
              </span>
            </FieldRow>
            <FieldRow label="Verification method">
              {source.verificationMethod ? (
                <span className="text-sm">{VERIFICATION_METHOD_LABELS[source.verificationMethod]}</span>
              ) : (
                <span className="text-charcoal/30">—</span>
              )}
            </FieldRow>
          </dl>

          {/* ── Health & Monitoring ── */}
          <SectionHeading>Health &amp; Monitoring</SectionHeading>
          <dl>
            <FieldRow label="Health status">
              <SourceHealthIndicator healthStatus={source.healthStatus} />
            </FieldRow>
            <FieldRow label="Automation">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    source.automationStatus === "real-time"
                      ? "bg-green-500"
                      : source.automationStatus === "scheduled"
                        ? "bg-amber"
                        : "bg-charcoal/30"
                  }`}
                  aria-hidden="true"
                />
                {AUTOMATION_STATUS_LABELS[source.automationStatus]}
              </span>
            </FieldRow>
            <FieldRow label="Monitoring">
              {source.monitoringEnabled ? (
                <span className="text-green-700 text-xs font-mono font-medium">Enabled</span>
              ) : (
                <span className="text-charcoal/40 text-xs">Disabled</span>
              )}
            </FieldRow>
            {source.lastSuccessfulFetch && (
              <FieldRow label="Last success">
                <span className="text-xs text-green-700 font-mono">{source.lastSuccessfulFetch}</span>
              </FieldRow>
            )}
            {source.lastFailedFetch && (
              <FieldRow label="Last failure">
                <span className="text-xs text-clay font-mono">{source.lastFailedFetch}</span>
              </FieldRow>
            )}
            <FieldRow label="Failure count">
              <span
                className={`text-xs font-mono font-medium ${
                  source.failureCount > 0 ? "text-clay" : "text-charcoal/40"
                }`}
              >
                {source.failureCount}
              </span>
            </FieldRow>
          </dl>

          {/* ── API / RSS Configuration ── */}
          <SectionHeading>API / RSS Configuration</SectionHeading>
          <dl>
            <FieldRow label="API endpoint">
              {source.apiEndpoint ? (
                <span className="font-mono text-xs break-all">{source.apiEndpoint}</span>
              ) : (
                <span className="text-charcoal/30">—</span>
              )}
            </FieldRow>
            <FieldRow label="API key reference">
              {source.apiKeyRef ? (
                <span className="font-mono text-xs">{source.apiKeyRef}</span>
              ) : (
                <span className="text-charcoal/30">—</span>
              )}
            </FieldRow>
            <FieldRow label="RSS feed">
              {source.rssFeedUrl ? (
                <span className="font-mono text-xs break-all">{source.rssFeedUrl}</span>
              ) : (
                <span className="text-charcoal/30">—</span>
              )}
            </FieldRow>
            <FieldRow label="Feed config">
              {source.feedConfig ? (
                <span className="text-xs">
                  Poll every {source.feedConfig.pollingIntervalMinutes} min
                  {source.feedConfig.lastFetched
                    ? ` · Last fetched ${source.feedConfig.lastFetched}`
                    : ""}
                </span>
              ) : (
                <span className="text-charcoal/30">—</span>
              )}
            </FieldRow>
          </dl>

          {/* ── Licensing & Classification ── */}
          <SectionHeading>Licensing &amp; Classification</SectionHeading>
          <dl>
            <FieldRow label="License">
              {source.license ? (
                source.licenseUrl ? (
                  <ExternalLink href={source.licenseUrl} showIcon>
                    {source.license}
                  </ExternalLink>
                ) : (
                  source.license
                )
              ) : (
                <span className="text-charcoal/30">—</span>
              )}
            </FieldRow>
            <FieldRow label="Region">
              {source.region || <span className="text-charcoal/30">—</span>}
            </FieldRow>
            <FieldRow label="Category">
              {source.category || <span className="text-charcoal/30">—</span>}
            </FieldRow>
            <FieldRow label="Reliability notes">
              {source.reliabilityNotes || <span className="text-charcoal/30">—</span>}
            </FieldRow>
          </dl>

          {/* ── Notes ── */}
          {source.notes && (
            <>
              <SectionHeading>Editorial Notes</SectionHeading>
              <p className="text-sm text-charcoal/70 leading-relaxed bg-bone/50 rounded-lg p-3 border border-border/30">
                {source.notes}
              </p>
            </>
          )}

          {/* ── Record info ── */}
          <SectionHeading>Record Metadata</SectionHeading>
          <dl>
            <FieldRow label="Record ID">
              <span className="font-mono text-xs">{source.id}</span>
            </FieldRow>
            <FieldRow label="Slug">
              <span className="font-mono text-xs">{source.slug}</span>
            </FieldRow>
            <FieldRow label="Schema version">
              <span className="font-mono text-xs">v{source.version}</span>
            </FieldRow>
          </dl>
        </div>
      </div>
    </div>
  );
}
