import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";
import type { VerificationLevel } from "../../types/content";

interface VerificationBadgeProps {
  level: VerificationLevel;
  showPrefix?: boolean;
  className?: string;
}

const variantMap: Record<VerificationLevel, "neutral" | "info" | "warning" | "alert"> = {
  0: "warning",
  1: "warning",
  2: "neutral",
  3: "info",
  4: "info",
  5: "info",
};

export function VerificationBadge({
  level,
  showPrefix = true,
  className = "",
}: VerificationBadgeProps) {
  const { t } = useTranslation("statusLabels");
  const label = t(`verificationLevel.${level}`);
  const display = showPrefix
    ? t("verificationLevelShort.levelLabel", { level, label })
    : label;

  return (
    <Badge variant={variantMap[level]} className={className}>
      {display}
    </Badge>
  );
}
