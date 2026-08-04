import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { ContextualImage } from "../../contexts/DisplayPreference";
import focusImage from "../../assets/images/Destruction_of_Gaza_1.jpg";

export function StartingFocus() {
  return (
    <section
      className="relative isolate overflow-hidden bg-ink min-h-[620px] md:min-h-[680px] lg:min-h-[760px]"
      aria-labelledby="focus-title"
    >
      {/* Full-width background image — below fold, lazy-loaded.
           Explicit width/height (3522×2348) reserve aspect ratio to prevent CLS.
           In low-graphic mode, replaced with a calm non-graphic surface. */}
      <ContextualImage className="absolute inset-0 z-0">
        <img
          src={focusImage}
          alt="A child stands near damaged buildings in Gaza, overlooking destruction in a residential area."
          width={3522}
          height={2348}
          className="absolute inset-0 h-full w-full object-cover object-center lg:object-[58%_center]"
          loading="lazy"
          decoding="async"
        />
      </ContextualImage>

      {/* Overlay 1: Base dark veil */}
      <div
        className="absolute inset-0 bg-ink/35"
        aria-hidden="true"
      />

      {/* Overlay 2: Right-side text readability — strong gradient so copy sits directly on it */}
      <div
        className="absolute inset-0 bg-gradient-to-l from-ink/95 via-ink/70 to-ink/10"
        aria-hidden="true"
      />

      {/* Overlay 3: Bottom grounding */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Overlay 4: Subtle paper warmth */}
      <div
        className="absolute inset-0 bg-paper/5 [mix-blend-mode:soft-light]"
        aria-hidden="true"
      />

      {/* Content — right-aligned on desktop, no card container */}
      <Container className="relative z-10 flex items-end pb-10 lg:items-center lg:justify-end lg:pb-0 min-h-[620px] md:min-h-[680px] lg:min-h-[760px]">
        <div className="max-w-2xl text-left lg:text-right">
          {/* Eyebrow + divider */}
          <Reveal delay={0} duration={0.55} amount={0.35}>
            <p className="font-mono text-xs tracking-[0.22em] uppercase text-bone/70">
              Starting Focus
            </p>
            <div
              className="w-12 h-px bg-amber mt-4 lg:ml-auto"
              aria-hidden="true"
            />
          </Reveal>

          {/* Heading */}
          <Reveal delay={0.1} duration={0.55} amount={0.35}>
            <h2
              id="focus-title"
              className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.03] tracking-tight text-bone mt-8"
            >
              Gaza and the wider regional humanitarian crisis.
            </h2>
          </Reveal>

          {/* Lead statement — right border on desktop, left border on mobile */}
          <Reveal delay={0.2} duration={0.55} amount={0.35}>
            <p className="mt-8 border-r-0 border-l-2 border-amber/70 pl-5 lg:border-l-0 lg:border-r-2 lg:pl-0 lg:pr-6 text-lg md:text-xl leading-8 font-medium text-bone/90">
              The first focus of Accountability Atlas is Gaza and the wider
              regional humanitarian crisis.
            </p>
          </Reveal>

          {/* Body copy */}
          <Reveal delay={0.3} duration={0.55} amount={0.35}>
            <div className="mt-8 space-y-5 text-base md:text-lg leading-8 text-bone">
              <p>
                The platform will be built to track public evidence, legal
                proceedings, humanitarian obstruction, country responses,
                institutional failures, and lawful civic action routes.
              </p>
              <p>
                The structure is intended to be reusable for other atrocity and
                humanitarian-crisis contexts, including places where documentation
                is scattered, accountability is delayed, and public pressure needs
                better infrastructure.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
