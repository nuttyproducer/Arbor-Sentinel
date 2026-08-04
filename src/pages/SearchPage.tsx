import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { LastUpdated } from "../components/pages/LastUpdated";
import { SearchResultCard } from "../components/search/SearchResultCard";
import { search as runSearch } from "../lib/search/search";
import { getIndexedCount } from "../lib/search/buildIndex";
import { RECORD_TYPE_LABELS } from "../lib/search/types";
import type { SearchableRecordType, SearchResponse } from "../lib/search/types";

// ── Type filter options ─────────────────────────────────────────────────────

const FILTERABLE_TYPES: SearchableRecordType[] = [
  "source",
  "evidence",
  "legal_case",
  "organization",
  "action",
  "country",
  "institution",
  "dossier",
  "trust_page",
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialTypes = searchParams.get("type")?.split(",").filter(Boolean) as SearchableRecordType[] | undefined;

  const [query, setQuery] = useState(initialQuery);
  const [activeTypes, setActiveTypes] = useState<SearchableRecordType[]>(initialTypes ?? []);

  // Run search
  const response: SearchResponse = useMemo(() => {
    if (!initialQuery.trim()) {
      return { query: "", results: [], totalIndexed: getIndexedCount(), tookMs: 0 };
    }
    return runSearch({
      query: initialQuery,
      typeFilter: activeTypes.length > 0 ? activeTypes : undefined,
    });
  }, [initialQuery, activeTypes]);

  const totalIndexed = getIndexedCount();

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) {
        setSearchParams({});
        return;
      }
      const params: Record<string, string> = { q: trimmed };
      if (activeTypes.length > 0) {
        params.type = activeTypes.join(",");
      }
      setSearchParams(params);
    },
    [query, activeTypes, setSearchParams],
  );

  const handleTypeToggle = useCallback(
    (type: SearchableRecordType) => {
      setActiveTypes((prev) => {
        const next = prev.includes(type)
          ? prev.filter((t) => t !== type)
          : [...prev, type];
        // Update URL params immediately
        const trimmed = query.trim();
        const params: Record<string, string> = {};
        if (trimmed) params.q = trimmed;
        if (next.length > 0) params.type = next.join(",");
        setSearchParams(params);
        return next;
      });
    },
    [query, setSearchParams],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setActiveTypes([]);
    setSearchParams({});
  }, [setSearchParams]);

  const hasSearched = initialQuery.trim().length > 0;

  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Search"
        title="Search Platform Records"
        description={`Search across ${totalIndexed} public records — sources, evidence, legal cases, organizations, actions, countries, institutions, dossiers, and trust pages. Client-side only. No queries are logged or stored.`}
      />

      <PageStatusNotice title="Local search only" variant="info">
        <p>
          This search covers the current platform records only — not all public
          atrocity documentation. It runs entirely in your browser. No queries
          are sent to a server, logged, or analysed. No user profile is built.
        </p>
      </PageStatusNotice>

      {/* ── Search form ──────────────────────────────────────────────── */}
      <Reveal>
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Search platform records"
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <label htmlFor="search-query" className="sr-only">
                Search records
              </label>
              <input
                id="search-query"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sources, evidence, legal cases, organizations…"
                className="w-full px-4 py-3 text-base text-ink bg-bone border border-border rounded-md placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-trust/50 focus:border-trust/50"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium text-bone bg-ink hover:bg-ink/90 rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2"
              >
                Search
              </button>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-3 text-sm font-medium text-charcoal bg-bone border border-border rounded-md hover:bg-border/20 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Type filters ───────────────────────────────────────── */}
          <fieldset className="mt-4">
            <legend className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/50 mb-2">
              Filter by type
            </legend>
            <div className="flex flex-wrap gap-2">
              {FILTERABLE_TYPES.map((type) => (
                <label
                  key={type}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm border cursor-pointer transition-colors duration-200 focus-within:ring-2 focus-within:ring-trust/50 ${
                    activeTypes.includes(type)
                      ? "bg-trust/10 border-trust/30 text-trust"
                      : "bg-bone border-border text-charcoal/70 hover:border-trust/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={activeTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="sr-only"
                  />
                  {RECORD_TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </fieldset>
        </form>
      </Reveal>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {hasSearched && (
        <Reveal>
          <div className="mb-6">
            <p className="text-sm text-charcoal/60" aria-live="polite" aria-atomic="true">
              {response.results.length === 0
                ? "No results found"
                : `${response.results.length} result${response.results.length === 1 ? "" : "s"} for "${initialQuery}"`}
              {activeTypes.length > 0 && (
                <span>
                  {" "}· filtered to {activeTypes.map((t) => RECORD_TYPE_LABELS[t].toLowerCase()).join(", ")}
                </span>
              )}
              <span className="text-charcoal/40">
                {" "}· searched {totalIndexed} records in {response.tookMs}ms
              </span>
            </p>
          </div>

          {response.results.length === 0 ? (
            <EmptyState
              query={initialQuery}
              hasTypeFilter={activeTypes.length > 0}
              onClearFilters={handleClear}
            />
          ) : (
            <ul className="space-y-3">
              {response.results.map((result) => (
                <SearchResultCard key={result.record.id} result={result} />
              ))}
            </ul>
          )}
        </Reveal>
      )}

      {/* ── No query yet ─────────────────────────────────────────────── */}
      {!hasSearched && (
        <Reveal delay={0.1}>
          <div className="border border-dashed border-border rounded-lg p-8 text-center">
            <p className="text-charcoal/60 mb-2">
              Enter a search term above to search across all platform records.
            </p>
            <p className="text-xs text-charcoal/40">
              Try: "ICJ", "Gaza", "Belgium", "humanitarian access", "arrest warrant",
              "arms transfer", or "provisional measures".
            </p>
          </div>
        </Reveal>
      )}

      <CorrectionLink />
      <LastUpdated date="2026-07-14" />
    </Container>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  query,
  hasTypeFilter,
  onClearFilters,
}: {
  query: string;
  hasTypeFilter: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div
      className="border border-dashed border-border rounded-lg p-8 text-center"
      role="status"
    >
      <p className="text-charcoal/70 mb-2">
        No records match "{query}".
      </p>
      {hasTypeFilter && (
        <p className="text-sm text-charcoal/50 mb-3">
          You have type filters active. Try clearing them to broaden your search.
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2 text-xs text-charcoal/50">
        <span>Suggestions:</span>
        <span>Check spelling</span>
        <span>·</span>
        <span>Try fewer or different keywords</span>
        {hasTypeFilter && (
          <>
            <span>·</span>
            <button
              type="button"
              onClick={onClearFilters}
              className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 rounded-sm"
            >
              Clear filters
            </button>
          </>
        )}
      </div>
    </div>
  );
}
