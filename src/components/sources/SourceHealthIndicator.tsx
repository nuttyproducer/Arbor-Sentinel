import type { HealthStatus } from "../../types/content";
import { HEALTH_STATUS_LABELS } from "../../types/content";

interface SourceHealthIndicatorProps {
  healthStatus: HealthStatus;
  size?: "sm" | "md";
}

const colorMap: Record<HealthStatus, { dot: string; text: string }> = {
  active: { dot: "bg-green-500", text: "text-green-700" },
  degraded: { dot: "bg-amber", text: "text-[#8B6914]" },
  failed: { dot: "bg-clay", text: "text-clay" },
  unknown: { dot: "bg-charcoal/30", text: "text-charcoal/50" },
};

export function SourceHealthIndicator({
  healthStatus,
  size = "md",
}: SourceHealthIndicatorProps) {
  const colors = colorMap[healthStatus];
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  const textSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${textSize} font-mono font-medium ${colors.text}`}
      aria-label={`Source health: ${HEALTH_STATUS_LABELS[healthStatus]}`}
    >
      <span
        className={`${dotSize} rounded-full ${colors.dot} flex-shrink-0`}
        aria-hidden="true"
      />
      {HEALTH_STATUS_LABELS[healthStatus]}
    </span>
  );
}
