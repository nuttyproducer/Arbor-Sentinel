import { type ReactNode } from "react";
import { Reveal } from "../ui/Reveal";

interface PolicySectionProps {
  title: string;
  id?: string;
  delay?: number;
  children: ReactNode;
}

export function PolicySection({
  title,
  id,
  delay = 0.15,
  children,
}: PolicySectionProps) {
  return (
    <Reveal delay={delay}>
      <section
        className="mb-10"
        aria-labelledby={id}
      >
        <h2
          id={id}
          className="font-serif text-2xl font-semibold text-ink mb-4"
        >
          {title}
        </h2>
        <div className="text-charcoal/80 leading-relaxed space-y-4">
          {children}
        </div>
      </section>
    </Reveal>
  );
}
