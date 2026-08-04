import type { ReactNode } from "react";
import { Badge } from "../ui/Badge";
import { Link } from "react-router-dom";

interface PreviewNoticeProps {
  title?: string;
  children: ReactNode;
  variant?: "default" | "warning";
  className?: string;
}

export function PreviewNotice({
  title,
  children,
  variant = "default",
  className = "",
}: PreviewNoticeProps) {
  const borderColor =
    variant === "warning" ? "border-amber/30" : "border-border";

  return (
    <div
      className={`border ${borderColor} rounded-lg p-5 ${className}`}
      role="note"
    >
      <div className="flex items-start gap-3 flex-wrap">
        <Badge variant={variant === "warning" ? "warning" : "neutral"}>
          Static preview
        </Badge>
        <div>
          {title && (
            <p className="font-serif text-base font-semibold text-ink mb-1">
              {title}
            </p>
          )}
          <div className="text-sm text-charcoal/75 leading-relaxed">
            {children}
          </div>
          <p className="text-sm text-charcoal/60 mt-2">
            <Link
              to="/methodology"
              className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              Read the methodology
            </Link>
            {" — "}
            <Link
              to="/corrections"
              className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              corrections welcome
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
