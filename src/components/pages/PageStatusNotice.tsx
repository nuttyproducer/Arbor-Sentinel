import { type ReactNode } from "react";
import { Reveal } from "../ui/Reveal";
import { Badge } from "../ui/Badge";

type StatusVariant = "neutral" | "info" | "warning" | "alert";

interface PageStatusNoticeProps {
  label?: string;
  title?: string;
  variant?: StatusVariant;
  children: ReactNode;
}

export function PageStatusNotice({
  label = "Public Static Beta",
  title,
  variant = "info",
  children,
}: PageStatusNoticeProps) {
  return (
    <Reveal delay={0.12}>
      <div
        className="bg-bone border border-border rounded-lg p-6 lg:p-8 mb-10"
        role="status"
      >
        <div className="flex items-start gap-4 flex-wrap">
          <Badge variant={variant}>{label}</Badge>
          <div>
            {title && (
              <p className="font-serif text-lg font-semibold text-ink mb-2">
                {title}
              </p>
            )}
            <div className="text-base text-charcoal/75 leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
