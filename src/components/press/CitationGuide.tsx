interface CitationGuideProps {
  /** Optional example page title for the citation example. */
  exampleTitle?: string;
  /** Optional example review date for the citation example. */
  exampleDate?: string;
  /** Optional example URL for the citation example. */
  exampleUrl?: string;
}

/**
 * Reusable citation-format display used on the Methodology and Press pages.
 * Shows the standard citation format with an example.
 */
export function CitationGuide({
  exampleTitle = "Methodology",
  exampleDate = "2026-07-12",
  exampleUrl = "https://accountabilityatlas.org/methodology",
}: CitationGuideProps) {
  return (
    <>
      <div className="bg-bone border border-border rounded-md p-5 mt-4">
        <p className="font-mono text-sm text-charcoal/80 leading-relaxed">
          Accountability Atlas, &ldquo;[Page title],&rdquo; version [x],
          last reviewed [date], [canonical URL], accessed [date].
        </p>
      </div>
      <p className="mt-4 text-sm text-charcoal/60">
        Example: Accountability Atlas, &ldquo;{exampleTitle},&rdquo; version
        1, last reviewed {exampleDate},{" "}
        {exampleUrl}, accessed {exampleDate}.
      </p>
    </>
  );
}
