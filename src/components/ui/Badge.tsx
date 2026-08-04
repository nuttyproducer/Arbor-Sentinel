import { type ReactNode } from "react";

interface BadgeProps {
  variant?: "neutral" | "info" | "warning" | "alert";
  children: ReactNode;
  className?: string;
}

const badgeVariants: Record<string, string> = {
  neutral: "bg-border/30 text-charcoal border-border",
  info: "bg-trust/10 text-trust border-trust/30",
  warning: "bg-amber/10 text-[#8B6914] border-amber/30",
  alert: "bg-clay/10 text-clay border-clay/30",
};

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-block font-mono text-xs font-medium
        px-2.5 py-0.5 rounded-sm border
        ${badgeVariants[variant]}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  );
}
