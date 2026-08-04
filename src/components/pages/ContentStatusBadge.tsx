import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";
import type { ContentStatus } from "../../types/content";

interface ContentStatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

const variantMap: Record<
  ContentStatus,
  "neutral" | "info" | "warning" | "alert"
> = {
  draft: "neutral",
  static_preview: "neutral",
  review_pending: "warning",
  reviewed: "info",
  disputed: "alert",
  corrected: "info",
  archived: "neutral",
};

export function ContentStatusBadge({
  status,
  className = "",
}: ContentStatusBadgeProps) {
  const { t } = useTranslation("statusLabels");
  return (
    <Badge variant={variantMap[status]} className={className}>
      {t(`contentStatus.${status}`)}
    </Badge>
  );
}
