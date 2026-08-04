import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Badge } from "../components/ui/Badge";
import { Button, ArrowIcon } from "../components/ui/Button";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { ExternalLink } from "../components/ui/ExternalLink";
import { attributionRecords, type AttributionStatus } from "../data/attributions";

const statusBadge: Record<
  AttributionStatus,
  { label: string; variant: "info" | "warning" | "neutral" }
> = {
  complete: { label: "Attribution complete", variant: "info" },
  review_pending: { label: "Needs verification", variant: "warning" },
  disputed: { label: "Under review", variant: "warning" },
  removed: { label: "Removed", variant: "neutral" },
};

const visibleRecords = attributionRecords.filter((r) => r.status !== "removed");

export function AttributionsPage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <PageIntro
            eyebrow="Attributions"
            title="Attributions and image credits."
            description="Accountability Atlas uses open-licensed or permission-cleared visual materials only when they support public understanding without sensationalism. This page records image credits, licenses, modifications, and where materials are used."
          />

          <PageStatusNotice label="Active" variant="info">
            <p>
              This page is actively maintained. If an attribution is incomplete
              or inaccurate, please submit a correction through the{" "}
              <Link
                to="/corrections"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                correction process
              </Link>
              .
            </p>
          </PageStatusNotice>

          {/* Image credits */}
          <PolicySection title="Current image credits" id="image-credits" delay={0.15}>
            <p>
              Every image used on the site is listed below with its source,
              license, and modification history.
            </p>
          </PolicySection>

          {visibleRecords.map((record, i) => (
            <Reveal key={record.id} delay={0.18 + i * 0.06}>
              <div className="bg-bone border border-border rounded-lg p-6 lg:p-8 mb-6">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                  <h3 className="font-serif text-xl font-semibold text-ink">
                    {record.title}
                  </h3>
                  <Badge variant={statusBadge[record.status].variant}>
                    {statusBadge[record.status].label}
                  </Badge>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                      Author
                    </dt>
                    <dd className="text-charcoal/80">{record.author}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                      Source
                    </dt>
                    <dd className="text-charcoal/80">
                      {record.sourceUrl ? (
                        <ExternalLink href={record.sourceUrl} showIcon={false}>
                          {record.sourceName}
                        </ExternalLink>
                      ) : (
                        record.sourceName
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                      License
                    </dt>
                    <dd className="text-charcoal/80">
                      {record.licenseUrl ? (
                        <ExternalLink href={record.licenseUrl} showIcon={false}>
                          {record.licenseName}
                        </ExternalLink>
                      ) : (
                        record.licenseName
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                      Where used
                    </dt>
                    <dd className="text-charcoal/80">{record.whereUsed}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                      Modifications
                    </dt>
                    <dd className="text-charcoal/80">{record.modifications}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
                      Date added
                    </dt>
                    <dd className="text-charcoal/80">{record.dateAdded}</dd>
                  </div>
                </dl>

                {record.statusNote && (
                  <div className="mt-4 pt-4 border-t border-amber/20">
                    <p className="text-sm text-charcoal/60 leading-relaxed">
                      <span className="font-medium text-charcoal/70">Note: </span>
                      {record.statusNote}
                    </p>
                  </div>
                )}

                {record.sourceUrl && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <ExternalLink href={record.sourceUrl}>
                      View source
                    </ExternalLink>
                  </div>
                )}
              </div>
            </Reveal>
          ))}

          {/* Additional assets */}
          <PolicySection title="Other assets" id="other-assets" delay={0.30}>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>Logo and wordmark</strong> — original work created for
                  Accountability Atlas. Licensed under CC BY-SA 4.0.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>Grid pattern texture</strong> — original SVG created for
                  Accountability Atlas. Licensed under CC BY-SA 4.0.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>Typography</strong> — IBM Plex Serif, IBM Plex Mono, and
                  Inter are open-source fonts available via Google Fonts under the
                  SIL Open Font License.
                </span>
              </li>
            </ul>
          </PolicySection>

          {/* Report issues */}
          <PolicySection title="Report an attribution issue" id="report" delay={0.33}>
            <p>
              If an attribution is incomplete, incorrect, or missing, please let
              us know through the{" "}
              <Link
                to="/corrections"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                corrections process
              </Link>{" "}
              or open an issue on{" "}
              <ExternalLink href="https://github.com/nuttyproducer/accountability-atlas/issues">
                GitHub
              </ExternalLink>
              .
            </p>

            <div className="bg-bone border border-border rounded-md p-5 mt-5">
              <h3 className="font-serif text-lg font-semibold text-ink mb-2">
                Attribution disputes
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                If you are a rights holder and believe your work is misattributed,
                incorrectly licensed, or should not appear on this platform, you
                can submit a dispute through the same correction route. Please
                include the specific record, the nature of the concern, and any
                supporting information. Disputes are reviewed carefully and the
                record status will be updated while the review is underway.
              </p>
              <p className="text-sm text-charcoal/70 leading-relaxed mt-3">
                During a dispute review, the relevant image may be temporarily
                replaced with a placeholder while the attribution concern is
                investigated. Every effort will be made to respond promptly.
              </p>
            </div>
          </PolicySection>

          {/* Links */}
          <Reveal delay={0.36}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border mt-10">
              <Button to="/" variant="ghost" icon={<ArrowIcon />}>
                Back home
              </Button>
            </div>
          </Reveal>

          <LastUpdated date="2026-07-10" />
        </div>
      </Container>
    </div>
  );
}
