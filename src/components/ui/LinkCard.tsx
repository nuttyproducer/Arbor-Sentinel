import { type ReactNode } from "react";
import { Link } from "react-router-dom";

interface LinkCardProps {
  label?: string;
  title: string;
  children: ReactNode;
  to?: string;
  disabled?: boolean;
  disabledLabel?: string;
  accent?: "amber" | "clay" | "blue";
}

const accentColors: Record<string, string> = {
  amber: "bg-amber",
  clay: "bg-clay",
  blue: "bg-trust",
};

export function LinkCard({
  label,
  title,
  children,
  to,
  disabled = false,
  disabledLabel = "Next sprint",
  accent = "amber",
}: LinkCardProps) {
  const cardContent = (
    <div
      className={`
        relative bg-bone border rounded-lg
        p-7 lg:p-9 h-full
        ${disabled
          ? "border-charcoal/10 opacity-70 cursor-not-allowed"
          : "border-charcoal/15 transition duration-300 hover:shadow-soft hover:-translate-y-0.5 hover:border-charcoal/30 cursor-pointer"
        }
      `.trim()}
    >
      {/* Accent line */}
      <div
        className={`absolute top-0 left-0 w-1 h-8 rounded-br-sm ${accentColors[accent]}`}
        aria-hidden="true"
      />

      <div className="pl-1">
        {/* Label row */}
        <div className="flex items-center justify-between mb-3">
          {label && (
            <p className="font-mono text-[11px] font-medium text-charcoal/50 uppercase tracking-[0.12em]">
              {label}
            </p>
          )}
          {disabled && (
            <span className="inline-block font-mono text-[10px] font-medium px-2 py-0.5 rounded-sm border border-amber/30 bg-amber/5 text-amber/80">
              {disabledLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl lg:text-3xl font-bold text-ink mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-base lg:text-lg text-charcoal/80 leading-relaxed">
          {children}
        </p>

        {/* Arrow indicator for active cards */}
        {!disabled && (
          <div className="mt-5 flex items-center gap-2 text-charcoal/40 group-hover:text-charcoal/60 transition-colors">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
              View
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 3L9 7L5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (disabled || !to) {
    return cardContent;
  }

  return (
    <Link to={to} className="block h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm">
      {cardContent}
    </Link>
  );
}
