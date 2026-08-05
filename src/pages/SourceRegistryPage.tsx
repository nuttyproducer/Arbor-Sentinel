import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { SourceFilterControls } from "../components/sources/SourceFilterControls";
import { SourceRegistryTable } from "../components/sources/SourceRegistryTable";
import { SourceDetailPanel } from "../components/sources/SourceDetailPanel";
import type { SourceRecord } from "../types/content";
import { useRepository } from "../hooks/useRepository";
import type { SourceFilters } from "../components/sources/SourceFilterControls";
import { DEFAULT_SOURCE_FILTERS } from "../components/sources/SourceFilterControls";

function filterSources(
  items: SourceRecord[],
  filters: SourceFilters,
): SourceRecord[] {
  return items.filter((s) => {
    if (filters.sourceType && s.sourceType !== filters.sourceType) return false;
    if (filters.status && s.status !== filters.status) return false;
    if (filters.healthStatus && s.healthStatus !== filters.healthStatus) return false;
    if (filters.region && s.region !== filters.region) return false;
    if (filters.language && s.language !== filters.language) return false;
    if (filters.trustLevel !== null && s.trustLevel !== filters.trustLevel) return false;
    return true;
  });
}

export default function SourceRegistryPage() {
  const repo = useRepository();
  const [allSources, setAllSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SourceFilters>(DEFAULT_SOURCE_FILTERS);
  const [selectedSource, setSelectedSource] = useState<SourceRecord | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    repo.getSources().then((sources) => {
      if (cancelled) return;
      setAllSources(sources);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const availableRegions = useMemo(
    () =>
      [...new Set(allSources.map((s) => s.region).filter(Boolean) as string[])].sort(),
    [allSources],
  );

  const availableLanguages = useMemo(
    () =>
      [...new Set(allSources.map((s) => s.language).filter(Boolean) as string[])].sort(),
    [allSources],
  );

  const setFilter = useCallback(
    <K extends keyof SourceFilters>(key: K, value: SourceFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilter = useCallback((key: keyof SourceFilters) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_SOURCE_FILTERS);
  }, []);

  const handleSelect = useCallback((source: SourceRecord) => {
    setSelectedSource(source);
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    // Allow exit animation before clearing
    setTimeout(() => setSelectedSource(null), 300);
  }, []);

  const filteredSources = useMemo(
    () => filterSources(allSources, filters),
    [filters],
  );

  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Source Registry"
        title="Public Source Registry"
        description="Every source referenced on this platform is listed here with its publisher, type, trust level, health status, and current URL status. A source record establishes what an institution published or stated — it does not automatically establish every underlying factual claim."
      />

      <PageStatusNotice title="Static preview" variant="info">
        <p>
          The source registry contains a representative set of source records for
          structural demonstration during the static beta. Sources are factual
          references — they do not carry a content review status. Trust levels
          default to 0 (unreviewed) and must be assigned through human review.
          Every source links to its original URL. If a link is broken, the source
          status is updated and an archive URL is provided where available.
        </p>
      </PageStatusNotice>

      {/* What a source record proves */}
      <PolicySection title="What a source record proves" id="what-sources-prove" delay={0.15}>
        <p>
          A source record documents that a specific institution or organisation
          published a specific document or record at a specific time. It proves
          what was published — not that every factual claim within the document
          is independently verified.
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>An official source</strong> may establish what an
              institution published or stated. It does not automatically
              establish every underlying factual claim.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>A court record</strong> proves what the court ordered or
              found. It does not automatically prove every factual claim
              recited in the filing.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>A UN document</strong> carries the institutional weight
              of the issuing body. It may reflect political compromise as well
              as factual investigation.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>A humanitarian or NGO report</strong> reflects the
              organisation&rsquo;s findings based on its published methodology.
              Organisational findings are distinct from judicial
              determinations.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* Filters */}
      {loading ? (
        <div
          className="flex items-center justify-center min-h-[40vh]"
          role="status"
          aria-label="Loading sources"
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
              Source records are loading.
            </span>
          </div>
        </div>
      ) : (
        <>
          <SourceFilterControls
            filters={filters}
            setFilter={setFilter}
            clearFilter={clearFilter}
            clearAllFilters={clearAllFilters}
            availableRegions={availableRegions}
            availableLanguages={availableLanguages}
            filteredCount={filteredSources.length}
            totalCount={allSources.length}
          />

          {/* Source Registry Table */}
          <SourceRegistryTable
            sources={filteredSources}
            selectedId={selectedSource?.id}
            onSelect={handleSelect}
          />

          {/* Source Detail Panel */}
          <SourceDetailPanel
            source={selectedSource}
            open={panelOpen}
            onClose={handleClosePanel}
          />
        </>
      )}

      {/* Broken/archived/superseded explanation */}
      <PolicySection title="Source statuses" id="source-statuses" delay={0.50}>
        <p>
          Every source record has a status indicating whether the original URL
          is accessible and whether the source has been superseded.
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Active:</strong> The original URL resolves and the source
              is current. Checked on the access date shown.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Broken link:</strong> The original URL no longer
              resolves. An archive URL is provided where available. Report
              broken links through the corrections process.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Archived:</strong> The source is accessible only through
              an archive. The original may have been removed or relocated.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Superseded:</strong> The source has been replaced by a
              newer version, official record, or corrected document. The
              superseding source is linked where available.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* Health status explanation */}
      <PolicySection title="Health statuses" id="health-statuses" delay={0.52}>
        <p>
          Health status tracks the operational state of automated source
          ingestion — separate from the URL currency status above.
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Active:</strong> Automated ingestion is functioning
              normally. The last fetch succeeded.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Degraded:</strong> Recent fetches have had intermittent
              failures. Monitoring continues but data may be incomplete.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Failed:</strong> Repeated fetch failures. Automated
              ingestion is stopped until the issue is resolved.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Unknown:</strong> Health has not been assessed yet —
              this is the default for all sources until monitoring is enabled.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* Trust level explanation */}
      <PolicySection title="Trust levels" id="trust-levels" delay={0.54}>
        <p>
          Trust levels are assigned through human review and must never be
          auto-assigned from source type alone. All sources default to 0
          (unreviewed).
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-charcoal/30 mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>0 — Unreviewed:</strong> No trust assessment has been
              performed. All sources start here.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-charcoal/50 mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>3 — High confidence:</strong> The source has been
              reviewed and found reliable with corroborating evidence.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>5 — Authoritative:</strong> The source is a definitive
              institutional record with a clear chain of provenance.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* Methodology and corrections links */}
      <PolicySection title="How sources are used" id="how-sources-are-used" delay={0.53}>
        <p>
          Sources listed in this registry are referenced by evidence records,
          legal case entries, country accountability pages, and action
          templates throughout the platform. When a source is cited on another
          page, it links back to its entry in this registry.
        </p>
        <p>
          For details on how sources are evaluated, categorised, and assigned
          verification levels, see the{" "}
          <Link
            to="/methodology"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Methodology
          </Link>
          .
        </p>
        <p>
          To report a broken link, suggest an additional source, or correct
          source metadata, use the{" "}
          <Link
            to="/corrections"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            corrections process
          </Link>
          .
        </p>
      </PolicySection>

      <CorrectionLink />
      <LastUpdated date="2026-07-31" />
    </Container>
  );
}
