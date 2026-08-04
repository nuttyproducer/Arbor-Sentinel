import { type ReactNode } from "react";

interface CardProps {
  accent?: "amber" | "clay" | "blue";
  label?: string;
  title: string;
  children: ReactNode;
  className?: string;
}

const accentColors: Record<string, string> = {
  amber: "bg-amber",
  clay: "bg-clay",
  blue: "bg-trust",
};

export function Card({
  accent,
  label,
  title,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        relative bg-bone border border-charcoal/15 rounded-lg
        p-7 lg:p-9
        transition duration-300
        hover:shadow-soft hover:-translate-y-0.5 hover:border-charcoal/30
        ${className}
      `.trim()}
    >
      {accent && (
        <div
          className={`absolute top-0 left-0 w-1 h-8 rounded-br-sm ${accentColors[accent]}`}
          aria-hidden="true"
        />
      )}
      <div className={accent ? "pl-1" : ""}>
        {label && (
          <p className="font-mono text-[11px] font-medium text-charcoal/50 mb-3 uppercase tracking-[0.12em]">
            {label}
          </p>
        )}
        <h3 className="font-serif text-2xl lg:text-3xl font-bold text-ink mb-3">
          {title}
        </h3>
        <p className="text-base lg:text-lg text-charcoal/80 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
