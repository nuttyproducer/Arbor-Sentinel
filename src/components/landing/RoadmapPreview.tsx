import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { roadmap, type PhaseStatus } from "../../data/roadmap";

// ── Status badge ──────────────────────────────────────────────────────────

const statusLabels: Record<PhaseStatus, string> = {
  current: "Current",
  next: "Next",
  planned: "Planned",
  "reviewed-later": "Reviewed later",
};

const statusStyles: Record<PhaseStatus, string> = {
  current: "bg-amber/10 text-amber border-amber/25",
  next: "bg-trust/10 text-trust border-trust/25",
  planned: "bg-charcoal/5 text-charcoal/60 border-border",
  "reviewed-later": "bg-charcoal/3 text-charcoal/45 border-border",
};

function StatusBadge({ status }: { status: PhaseStatus }) {
  return (
    <span
      className={`inline-block font-mono text-[10px] font-medium uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

// ── Phase card ────────────────────────────────────────────────────────────

function PhaseCard({
  phase,
  index,
  isCurrent,
  reducedMotion,
  customDelay,
}: {
  phase: (typeof roadmap)[number];
  index: number;
  isCurrent: boolean;
  reducedMotion: boolean;
  customDelay: number;
}) {
  const markerNumber = String(index + 1).padStart(2, "0");

  const cardContent = (
    <div
      className={`
        relative bg-bone border rounded-lg
        transition duration-300
        hover:shadow-soft hover:-translate-y-0.5 hover:border-charcoal/30
        ${isCurrent
          ? "border-amber/40 shadow-sm"
          : "border-charcoal/15"
        }
      `.trim()}
    >
      {/* Amber accent line for current phase */}
      {isCurrent && (
        <div
          className="absolute top-0 left-0 w-1 h-8 rounded-br-sm bg-amber"
          aria-hidden="true"
        />
      )}

      <div className="p-5 lg:p-6">
        {/* Phase label + status row */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-charcoal/50">
            Phase {markerNumber}
          </span>
          <StatusBadge status={phase.status} />
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg lg:text-xl font-bold text-ink mb-2 leading-tight">
          {phase.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-charcoal/70 leading-relaxed">
          {phase.description}
        </p>
      </div>
    </div>
  );

  if (reducedMotion) {
    return (
      <div className="relative pt-9">
        {/* Static marker */}
        <div
          className={`
            absolute top-0 left-1/2 -translate-x-1/2 z-10
            w-8 h-8 rounded-full border-2 flex items-center justify-center
            font-mono text-[11px] font-medium bg-paper
            ${isCurrent
              ? "border-amber bg-amber/10 text-amber"
              : "border-trust/30 text-charcoal/50"
            }
          `.trim()}
          aria-hidden="true"
        >
          {markerNumber}
        </div>
        {cardContent}
      </div>
    );
  }

  return (
    <motion.div
      className="relative pt-9"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay: customDelay,
        ease: "easeOut",
      }}
    >
      {/* Marker circle */}
      <motion.div
        className={`
          absolute top-0 left-1/2 -translate-x-1/2 z-10
          w-8 h-8 rounded-full border-2 flex items-center justify-center
          font-mono text-[11px] font-medium bg-paper
          ${isCurrent
            ? "border-amber bg-amber/10 text-amber"
            : "border-trust/30 text-charcoal/50"
          }
        `.trim()}
        aria-hidden="true"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.35,
          delay: customDelay + 0.15,
          ease: "easeOut",
        }}
      >
        {markerNumber}
      </motion.div>

      {cardContent}
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────

export function RoadmapPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 }) ?? false;
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32"
      aria-labelledby="roadmap-title"
    >
      <Container>
        {/* Heading — uses existing Reveal pattern via SectionHeading wrapper */}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={
            reducedMotion
              ? {}
              : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <SectionHeading
            eyebrow="Where We're Going"
            title="Roadmap"
            id="roadmap-title"
            description="A phased plan to build accountability infrastructure — each stage lays the foundation for the next."
          />
        </motion.div>

        {/* ── Desktop: horizontal rail ────────────────────────────────── */}
        <div className="hidden lg:block">
          <div className="relative max-w-6xl mx-auto">
            {/* Connecting rail line */}
            <motion.div
              className="absolute top-4 left-[calc(10%+16px)] right-[calc(10%+16px)] h-px bg-trust/20"
              aria-hidden="true"
              initial={reducedMotion ? {} : { scaleX: 0 }}
              animate={
                reducedMotion
                  ? {}
                  : isInView
                    ? { scaleX: 1 }
                    : { scaleX: 0 }
              }
              transition={{ duration: 0.7, delay: 0.25, ease: "easeInOut" }}
              style={{ transformOrigin: "left center" }}
            />

            {/* Phase cards */}
            <div className="grid grid-cols-5 gap-4 lg:gap-5 relative">
              {roadmap.map((phase, i) => (
                <PhaseCard
                  key={i}
                  phase={phase}
                  index={i}
                  isCurrent={phase.status === "current"}
                  reducedMotion={reducedMotion}
                  customDelay={0.15 + i * 0.1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile: horizontal scroll-snap ──────────────────────────── */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Connecting line hint — short span visible in scroll area */}
            <div
              className="absolute top-4 left-4 right-4 h-px bg-trust/15"
              aria-hidden="true"
            />

            <div
              className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-none"
              style={{ scrollbarWidth: "none" }}
              role="list"
              aria-label="Roadmap phases"
            >
              {roadmap.map((phase, i) => (
                <div
                  key={i}
                  className="min-w-[82vw] sm:min-w-[60vw] snap-center flex-shrink-0"
                  role="listitem"
                >
                  <div className="relative pt-9">
                    {/* Marker */}
                    <div
                      className={`
                        absolute top-0 left-1/2 -translate-x-1/2 z-10
                        w-8 h-8 rounded-full border-2 flex items-center justify-center
                        font-mono text-[11px] font-medium bg-paper
                        ${phase.status === "current"
                          ? "border-amber bg-amber/10 text-amber"
                          : "border-trust/30 text-charcoal/50"
                        }
                      `.trim()}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    {/* Card */}
                    <div
                      className={`
                        relative bg-bone border rounded-lg
                        ${phase.status === "current"
                          ? "border-amber/40 shadow-sm"
                          : "border-charcoal/15"
                        }
                      `.trim()}
                    >
                      {phase.status === "current" && (
                        <div
                          className="absolute top-0 left-0 w-1 h-8 rounded-br-sm bg-amber"
                          aria-hidden="true"
                        />
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-charcoal/50">
                            Phase {String(i + 1).padStart(2, "0")}
                          </span>
                          <StatusBadge status={phase.status} />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-ink mb-2 leading-tight">
                          {phase.title}
                        </h3>
                        <p className="text-sm text-charcoal/70 leading-relaxed">
                          {phase.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <p
            className="text-center font-mono text-[11px] text-charcoal/35 uppercase tracking-[0.12em] mt-2 lg:hidden"
            aria-hidden="true"
          >
            Swipe to view roadmap phases →
          </p>
        </div>
      </Container>
    </section>
  );
}
