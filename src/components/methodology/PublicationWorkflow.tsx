const workflowSteps = [
  {
    step: "1",
    title: "Lead identification",
    desc: "Information is identified from public sources, contributor suggestions, or open-source research. Assigned verification level 0 (unreviewed). Not published.",
  },
  {
    step: "2",
    title: "Lead preservation",
    desc: "The lead is logged with its provenance, date, and any available metadata. Assigned verification level 1 (preserved). Not published.",
  },
  {
    step: "3",
    title: "Source checking",
    desc: "At least one contributor checks the information against a documented public source with a URL, publisher, publication date, and access date. Assigned verification level 2 (source checked). May be published with content status review_pending if the editorial summary has not yet been reviewed.",
  },
  {
    step: "4",
    title: "Corroboration (where applicable)",
    desc: "Where possible, information is checked against multiple independent sources or documentation types. Assigned verification level 3 (corroborated).",
  },
  {
    step: "5",
    title: "Editorial review",
    desc: "A contributor with relevant subject-matter knowledge reviews the platform's written summary for accuracy, clarity, safety, and consistency with the source. Content status updated to reviewed or static_preview depending on the review depth.",
  },
  {
    step: "6",
    title: "Publication",
    desc: "The evidence record is published with its verification level, content status, legal status labels (if applicable), source list, last-reviewed date, reviewer role, and correction route.",
  },
  {
    step: "7",
    title: "Ongoing review",
    desc: "Published records are re-reviewed when new sources become available, when corrections are submitted, or when the underlying legal or factual context changes. Version numbers are incremented with each substantive update.",
  },
];

export function PublicationWorkflow() {
  return (
    <div className="bg-bone border border-border rounded-lg p-6">
      <ol className="space-y-5">
        {workflowSteps.map((s) => (
          <li key={s.step} className="flex gap-4">
            <span
              className="flex-shrink-0 w-8 h-8 rounded-full bg-ink text-bone font-mono text-sm font-medium flex items-center justify-center"
              aria-hidden="true"
            >
              {s.step}
            </span>
            <div>
              <p className="font-serif text-base font-semibold text-ink">
                {s.title}
              </p>
              <p className="text-sm text-charcoal/70 leading-relaxed mt-0.5">
                {s.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
