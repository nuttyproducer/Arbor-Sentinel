import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";

interface ChangelogEntry {
  date: string;
  category: "feature" | "improvement" | "fix";
  title: string;
  description: string;
}

const categoryBadge: Record<string, { label: string; className: string }> = {
  feature: {
    label: "New",
    className: "bg-trust/10 text-trust border-trust/30",
  },
  improvement: {
    label: "Improved",
    className: "bg-amber/10 text-[#8B6914] border-amber/30",
  },
  fix: {
    label: "Fixed",
    className: "bg-clay/10 text-clay border-clay/30",
  },
};

const entries: ChangelogEntry[] = [
  {
    date: "2026-07-10",
    category: "improvement",
    title: "Hero section redesigned as editorial evidence room",
    description:
      "The landing page hero now uses a left-aligned editorial layout with a multi-layer gradient overlay system. Text sits directly on a strong readability gradient — no floating cards. A desktop-only evidence-record preview card introduces the platform concept without fake data. Staggered fade-up animations replace the old centered poster layout.",
  },
  {
    date: "2026-07-10",
    category: "feature",
    title: "Starting Focus section added with full-width documentary treatment",
    description:
      "A new full-width photographic section anchors the Gaza starting focus. The image spans the entire viewport width with right-aligned text sitting directly on gradient overlays — no card container. Scroll-triggered reveal animations keep the section serious and editorial.",
  },
  {
    date: "2026-07-10",
    category: "improvement",
    title: "Mission section spacing tightened",
    description:
      "Reduced top padding on the Why This Exists section for better vertical balance and less wasted whitespace.",
  },
  {
    date: "2026-07-10",
    category: "fix",
    title: "Project status notice removed from landing page",
    description:
      "The early-stage status disclaimer has been removed from the homepage. Attribution information is preserved in the dedicated attributions document and footer links.",
  },
  {
    date: "2026-07-09",
    category: "improvement",
    title: "Design polish pass across the landing page",
    description:
      "Larger buttons and text throughout for readability. Stronger card borders and section headings. Hero evidence-record preview card added. Mission section now uses a left-border quote treatment. Safety principles numbered for presence. Roadmap redesigned as vertical timeline. Footer restructured into a three-column grid with larger links and clearer legal information. Map-grid texture made more subtle.",
  },
  {
    date: "2026-07-09",
    category: "fix",
    title: "Accessibility review: landmarks, contrast, focus, and touch targets",
    description:
      "All sections now have proper aria-labelledby references. Warning badge text contrast improved to meet WCAG AA. Mobile navigation links now meet the 44px minimum touch target. Visible focus-visible rings added to mobile nav and interactive elements.",
  },
  {
    date: "2026-07-09",
    category: "fix",
    title: "Grid texture and button background fixes",
    description:
      "Fixed an issue where transparent button backgrounds allowed the map-grid background texture to show through buttons. All buttons now have solid fills. Content layering corrected so the grid pattern renders behind all interactive elements.",
  },
  {
    date: "2026-07-09",
    category: "fix",
    title: "Card hover transitions smoothed",
    description:
      "Fixed card hover effects so shadows and transform animate together smoothly instead of jumping between states.",
  },
  {
    date: "2026-07-08",
    category: "feature",
    title: "Methodology and Contribute pages published",
    description:
      "Two new interior pages with real content. The Methodology page explains the platform approach. The Contribute page lists contributor roles, prerequisite reading, and links to good first issues.",
  },
  {
    date: "2026-07-08",
    category: "feature",
    title: "Landing page sections completed",
    description:
      "Homepage now includes all planned sections: Hero, Mission, Starting Focus, Module Grid, Safety Principles, Not This Project, Roadmap Preview, and Contributor CTA. Each section has its own copy, styling, and animation treatment.",
  },
  {
    date: "2026-07-07",
    category: "feature",
    title: "Layout system and navigation built",
    description:
      "Added the site header with logo, wordmark, desktop navigation, and mobile menu. Built the institutional footer with project links, resource links, license information, and disclaimers. Created the PageShell layout wrapper for consistent page structure.",
  },
  {
    date: "2026-07-07",
    category: "feature",
    title: "UI component library established",
    description:
      "Built the foundational component set: Button (primary, secondary, ghost variants), Badge (neutral, info, warning, alert), Card, Container, Reveal (Framer Motion scroll animations), and SectionHeading. All components support the brand design tokens.",
  },
  {
    date: "2026-07-07",
    category: "feature",
    title: "Brand system and project scaffolding",
    description:
      "Set up the Vite + React + TypeScript project. Configured Tailwind CSS with brand theme tokens: ink (#101828), paper (#F7F1E8), bone (#FAFAF7), clay (#B95C50), amber (#D99A2B), trust (#3B6EA8). Added Google Fonts: IBM Plex Serif, IBM Plex Mono, and Inter. Created SVG assets, favicon, social preview image, and landing page data files.",
  },
];

export function ChangelogPage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="font-mono text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-4">
              Changelog
            </p>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-ink mb-4">
              What's New
            </h1>
            <div className="w-10 h-px bg-border mb-4" aria-hidden="true" />
            <p className="text-lg text-charcoal/70 leading-relaxed mb-12">
              A record of features, improvements, and fixes on the
              Accountability Atlas platform.
            </p>
          </Reveal>

          {/* Timeline */}
          <div className="space-y-0">
            {entries.map((entry, i) => (
              <Reveal key={i} delay={i * 0.04} duration={0.45}>
                <div className="relative pl-8 pb-12 border-l-2 border-border last:border-l-0 last:pb-0">
                  {/* Timeline dot */}
                  <span
                    className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-paper border-2 border-border"
                    aria-hidden="true"
                  />

                  {/* Date */}
                  <p className="font-mono text-xs text-charcoal/45 mb-2">
                    {entry.date}
                  </p>

                  {/* Category badge + title */}
                  <div className="flex items-start gap-3 flex-wrap mb-2">
                    <span
                      className={`inline-block font-mono text-[11px] font-medium px-2 py-0.5 rounded-sm border ${
                        categoryBadge[entry.category].className
                      }`}
                    >
                      {categoryBadge[entry.category].label}
                    </span>
                    <h2 className="font-serif text-xl font-semibold text-ink leading-snug">
                      {entry.title}
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-base text-charcoal/75 leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Bottom note */}
          <Reveal delay={0.2}>
            <p className="mt-12 pt-6 border-t border-border font-mono text-xs text-charcoal/40 leading-relaxed">
              This changelog is maintained by the Accountability Atlas
              contributors. For the full commit history, see the{" "}
              <a
                href="https://github.com/nuttyproducer/accountability-atlas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                GitHub repository
              </a>
              .
            </p>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
