import { type ReactNode } from "react";
import { Reveal } from "../ui/Reveal";

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: PageIntroProps) {
  return (
    <>
      <Reveal>
        {eyebrow && (
          <p className="font-mono text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-4">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-ink mb-4">
          {title}
        </h1>
        <div className="w-10 h-px bg-border mb-8" aria-hidden="true" />
      </Reveal>

      {(description || children) && (
        <Reveal delay={0.1}>
          {description && (
            <p className="text-lg text-charcoal/80 leading-relaxed mb-10">
              {description}
            </p>
          )}
          {children}
        </Reveal>
      )}
    </>
  );
}
