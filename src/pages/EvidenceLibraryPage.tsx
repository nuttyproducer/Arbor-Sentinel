import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { PreviewNotice } from "../components/pages/PreviewNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import {
  EVIDENCE_CATEGORIES,
  getAvailableSourceTypes,
  getAvailableVerificationLevels,
  getAvailableContentStatuses,
  type EvidenceItem,
} from "../data/evidenceItems";
import { useRepository } from "../hooks/useRepository";
import { VERIFICATION_LEVEL_LABELS, type VerificationLevel } from "../types/content";
import { EvidenceFilters } from "../components/evidence/EvidenceFilters";
import { EvidenceItemCard } from "../components/evidence/EvidenceItemCard";
import { EvidenceEmptyState } from "../components/evidence/EvidenceEmptyState";
import {
  filterItems,
  defaultFilters,
  type ActiveFilters,
  type FilterKey,
} from "../components/evidence/filters";

const availableSourceTypes = getAvailableSourceTypes();
const availableVerificationLevels = getAvailableVerificationLevels();
const availableContentStatuses = getAvailableContentStatuses();

export default function EvidenceLibraryPage() {
  const repo = useRepository();
  const [filters, setFilters] = useState<ActiveFilters>(defaultFilters);
  const [allItems, setAllItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    repo.getEvidenceList().then((items) => {
      if (cancelled) return;
      setAllItems(items);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const setFilter = useCallback(
    <K extends FilterKey>(key: K, value: ActiveFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilter = useCallback((key: FilterKey) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredItems = useMemo(
    () => filterItems(allItems, filters),
    [allItems, filters],
  );

  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Evidence Library"
        title="Evidence Library"
        description="A static preview of how evidence records will be structured, categorised, sourced, and displayed when the platform moves beyond the public static beta."
      />

      <PageStatusNotice title="Static preview — no live database" variant="info">
        <p>
          Every record on this page is a public source-summary — not raw
          testimony, user-submitted evidence, or live incident reporting.
          Records reference publicly available sources only. This library
          validates information architecture, source display, verification
          labels, and evidence-item presentation before a database exists.
        </p>
      </PageStatusNotice>

      {/* Evidence versus lead */}
      <PolicySection title="Evidence and leads" id="evidence-vs-lead" delay={0.15}>
        <p>
          The platform distinguishes between evidence and leads.
        </p>
        <ul className="space-y-3 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>A lead</strong> is raw information that has not yet been
              reviewed — a URL, a report, a social-media post, a document
              reference, or a tip. Leads are preserved for review but not
              presented as evidence. Verification levels 0 (unreviewed) and 1
              (preserved) describe leads, not evidence records.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>An evidence record</strong> has been checked against at
              least one documented public source (verification level 2+) and
              has an editorial content status. It may still be under review
              (review_pending), but the source basis is documented.
            </span>
          </li>
        </ul>
        <p className="mt-4">
          This page displays evidence records only — verification levels 2 and
          above. Leads are not displayed publicly. Social media is never
          treated as verified proof without corroboration and safety review.
        </p>
      </PolicySection>

      {/* Filters + records — rendered once the repository has loaded */}
      {loading ? (
        <div
          className="flex items-center justify-center min-h-[40vh]"
          role="status"
          aria-label="Loading evidence records"
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
              Evidence records are loading.
            </span>
          </div>
        </div>
      ) : (
        <>
          <EvidenceFilters
            filters={filters}
            setFilter={setFilter}
            clearFilter={clearFilter}
            clearAllFilters={clearAllFilters}
            availableSourceTypes={availableSourceTypes}
            availableVerificationLevels={availableVerificationLevels}
            availableContentStatuses={availableContentStatuses}
            filteredCount={filteredItems.length}
            totalCount={allItems.length}
          />

          {/* Evidence item cards / empty state */}
          {filteredItems.length === 0 ? (
            <EvidenceEmptyState
              totalCount={allItems.length}
              categoryCount={EVIDENCE_CATEGORIES.length}
              onClearFilters={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {filteredItems.map((item) => (
                <EvidenceItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Source and verification explanation */}
      <PolicySection title="Source quality and editorial status" id="source-explanation" delay={0.55}>
        <p>
          Source quality and editorial status are separate dimensions. A
          record may reference a high-quality source (such as a court order or
          UN report) while the editorial summary itself is still under review
          or pending expert input.
        </p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45">
                  Verification level
                </th>
                <th className="py-2 pr-4 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45">
                  Label
                </th>
                <th className="py-2 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-charcoal/70">
              {([0, 1, 2, 3, 4, 5] as VerificationLevel[]).map((level) => (
                <tr key={level} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-xs text-charcoal/50">
                    Level {level}
                  </td>
                  <td className="py-2 pr-4 font-medium text-charcoal/80">
                    {VERIFICATION_LEVEL_LABELS[level]}
                  </td>
                  <td className="py-2 text-charcoal/60">
                    {level === 0
                      ? "Raw information not yet reviewed by the platform."
                      : level === 1
                        ? "Saved for review but not yet checked against sources."
                        : level === 2
                          ? "Verified against at least one documented public source."
                          : level === 3
                            ? "Confirmed by multiple independent sources."
                            : level === 4
                              ? "Verified by an established trusted organisation."
                              : "Official court record, UN document, or formal institutional finding."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-charcoal/60">
          Source quality = verification level. Content status = editorial
          review state. An item at verification level 5 may still be
          review_pending if the summary text has not completed editorial
          review. Do not describe a record as verified unless both the source
          quality and the content status support that word.
        </p>
      </PolicySection>

      {/* Citation guidance */}
      <PolicySection title="Citation guidance" id="citation" delay={0.58}>
        <p>
          Evidence records displayed on this page are summaries of public
          sources. When citing, go to the original source — not this platform.
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>For court records:</strong> Cite the official court
              document using the court&rsquo;s own citation format. The ICJ
              and ICC publish official citations on their websites.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>For UN documents:</strong> Use the official UN document
              symbol and the UN&rsquo;s published citation. This platform
              provides links to help you find the original.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>For humanitarian and human-rights reports:</strong> Cite
              the publishing organisation, report title, publication date, and
              URL. Do not cite this platform as the source.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>For parliamentary records:</strong> Cite the official
              record — Hansard, parliamentary website, or official gazette —
              not this platform&rsquo;s summary.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>For investigative reports:</strong> Cite the original
              publication with its own date, publisher, and URL.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* Methodology link */}
      <PolicySection title="How this library works" id="how-it-works" delay={0.61}>
        <p>
          The Evidence Library is built on the{" "}
          <Link
            to="/methodology"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            platform methodology
          </Link>
          . Every record separates source quality from editorial review
          status. Verification levels describe the source, not the platform.
          Content status describes this platform&rsquo;s editorial confidence
          in the summary.
        </p>
        <p>
          During the static beta, the evidence library does not include:
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>Raw witness testimony or user-submitted evidence</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>Exact sensitive locations or identifying information about vulnerable people</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>Graphic media or imagery of casualties</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>Unreviewed social-media posts presented as facts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>Live incident reporting or real-time tracking</span>
          </li>
        </ul>
      </PolicySection>

      <PreviewNotice title="The Evidence Library is a static preview">
        These records validate the information architecture for evidence
        display — categories, source-quality levels, content statuses, legal
        labels, and filter controls. The library will expand when a database
        and review workflow exist. Corrections and source suggestions are
        welcome.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-24" />
    </Container>
  );
}
