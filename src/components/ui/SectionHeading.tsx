interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: SectionHeadingProps) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-16">
      {eyebrow && (
        <p className="font-mono text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-4">
          {eyebrow}
        </p>
      )}
      <div className="w-10 h-px bg-border mx-auto mb-6" aria-hidden="true" />
      <h2 id={id} className="font-serif text-3xl lg:text-4xl font-bold text-ink mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-xl text-charcoal/80 leading-relaxed max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
