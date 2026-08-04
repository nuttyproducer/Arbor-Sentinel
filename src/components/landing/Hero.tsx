import { Link } from "react-router-dom";
import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { ContextualImage } from "../../contexts/DisplayPreference";
import heroBgJpg from "../../assets/images/hero-gaza-displacement.jpg";
import heroBgWebp from "../../assets/images/hero-gaza-displacement.webp";

export function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-ink text-bone min-h-[620px] md:min-h-[680px] lg:min-h-[720px]"
      aria-labelledby="hero-title"
    >
      {/* Background image — contextual, not purely decorative.
           fetchpriority="high" signals this as the LCP candidate.
           Explicit width/height (4032×2268) reserve aspect ratio to prevent CLS.
           In low-graphic mode, replaced with a calm non-graphic surface. */}
      <ContextualImage className="absolute inset-0 z-0">
        <picture className="absolute inset-0" aria-hidden="true">
          <source srcSet={heroBgWebp} type="image/webp" />
          <img
            src={heroBgJpg}
            alt="People walking through a destroyed urban area in Gaza during forced displacement."
            width={4032}
            height={2268}
            className="w-full h-full object-cover object-center lg:object-[center_55%]"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </ContextualImage>

      {/* Overlay 1: Dark navy readability base */}
      <div
        className="absolute inset-0 bg-ink/45 z-0"
        aria-hidden="true"
      />

      {/* Overlay 2: Left-side gradient — anchors content readability */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/15 z-0"
        aria-hidden="true"
      />

      {/* Overlay 3: Bottom grounding gradient — keeps image from floating at edges */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent z-0"
        aria-hidden="true"
      />

      {/* Overlay 4: Subtle warm paper tint for institutional tone */}
      <div
        className="absolute inset-0 bg-paper/5 [mix-blend-mode:soft-light] z-0"
        aria-hidden="true"
      />

      {/* Content — left-aligned, never centered */}
      <Container className="relative z-10 flex items-center min-h-[620px] md:min-h-[680px] lg:min-h-[720px]">
        <div className="max-w-3xl py-24">
          {/* Eyebrow */}
          <Reveal delay={0} duration={0.6}>
            <p className="font-mono text-xs tracking-[0.22em] uppercase text-bone/75 mb-6">
              Open Civic Accountability Platform
            </p>
          </Reveal>

          {/* Pre-headline */}
          <Reveal delay={0.08} duration={0.6}>
            <p className="font-sans text-base md:text-lg font-semibold text-bone/90 max-w-2xl mb-4">
              Building public infrastructure against genocide and mass atrocities.
            </p>
          </Reveal>

          {/* H1 */}
          <Reveal delay={0.14} duration={0.6}>
            <h1
              id="hero-title"
              className="font-serif font-bold text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-bone"
            >
              Accountability Atlas
            </h1>
          </Reveal>

          {/* Tagline */}
          <Reveal delay={0.22} duration={0.6}>
            <p className="font-serif text-2xl md:text-3xl leading-tight text-bone/95 mt-6">
              Evidence for protection.
              <br />
              Action for accountability.
            </p>
          </Reveal>

          {/* Accent line — coordinate marker motif */}
          <Reveal delay={0.28} duration={0.5}>
            <div
              className="w-10 h-[2px] bg-amber mt-6 mb-8"
              aria-hidden="true"
            />
          </Reveal>

          {/* Description */}
          <Reveal delay={0.32} duration={0.5}>
            <div className="text-base md:text-lg leading-8 text-bone/85 max-w-2xl space-y-6">
              <p>
                Accountability Atlas is an open-source platform for organizing
                verified public evidence, tracking legal and political
                responsibility, and helping people take lawful action in response
                to genocide allegations, mass civilian harm, humanitarian
                obstruction, and atrocity crises.
              </p>
              <p>
                Starting with Gaza and the wider regional crisis, the platform is
                being designed as a reusable framework for other urgent contexts
                where documentation, accountability, and public pressure are
                needed.
              </p>
            </div>
          </Reveal>

          {/* CTA buttons */}
          <Reveal delay={0.38} duration={0.5}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-10">
              {/* Primary CTA */}
              <Link
                to="/contribute"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base lg:text-lg font-medium rounded-md transition-colors duration-200 bg-bone text-ink hover:bg-paper border border-bone shadow-soft min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bone/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Help Build the Platform
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              {/* Secondary CTA */}
              <Link
                to="/methodology"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base lg:text-lg font-medium rounded-md transition-colors duration-200 bg-transparent text-bone border border-bone/60 hover:bg-bone/10 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bone/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Read the Methodology
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* Tertiary text link */}
            <div className="mt-4">
              <a
                href="https://github.com/nuttyproducer/accountability-atlas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-xs text-bone/45 hover:text-bone/75 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bone/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-sm"
                aria-label="View GitHub Repository (opens in new tab)"
              >
                View GitHub Repository
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M10.5 8.5V11.5C10.5 11.7652 10.3946 12.0196 10.2071 12.2071C10.0196 12.3946 9.76522 12.5 9.5 12.5H2.5C2.23478 12.5 1.98043 12.3946 1.79289 12.2071C1.60536 12.0196 1.5 11.7652 1.5 11.5V4.5C1.5 4.23478 1.60536 3.98043 1.79289 3.79289C1.98043 3.60536 2.23478 3.5 2.5 3.5H5.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 1.5H12.5V5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.5 8.5L12.5 1.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Evidence-card preview — desktop only, positioned right */}
      <Reveal delay={0.55} duration={0.6}>
        <div className="hidden lg:block absolute right-8 bottom-12 w-[320px] rounded-lg border border-bone/20 bg-ink/55 backdrop-blur-md p-5 text-bone/80 shadow-soft z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-bone/50">
              Source Record Preview
            </span>
            <span className="inline-block font-mono text-[10px] font-medium px-2 py-0.5 rounded-sm border border-bone/20 text-bone/60">
              Prototype
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <span className="font-mono text-[10px] text-bone/40 uppercase tracking-wider block mb-0.5">
                Source Status
              </span>
              <span className="font-mono text-xs text-bone/80">
                Public evidence lead
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-bone/40 uppercase tracking-wider block mb-0.5">
                Focus
              </span>
              <span className="font-mono text-xs text-bone/80">
                Gaza regional crisis
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-bone/40 uppercase tracking-wider block mb-0.5">
                Platform Phase
              </span>
              <span className="font-mono text-xs text-bone/80">
                Public foundation
              </span>
            </div>
          </div>
          {/* Amber coordinate accent */}
          <div className="mt-4 pt-3 border-t border-bone/15 flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0"
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] text-bone/35 uppercase tracking-wider">
              Structured evidence framework
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
