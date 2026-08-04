// src/components/admin/shared/StatTile.tsx
// Generalized stat tile extracted from SystemHealthPanel.
// Used across all M4.4 dashboards for KPI displays.

export interface StatTileProps {
  label: string;
  value: number | string;
  subtitle?: string;
  /** Optional trend indicator. */
  trend?: "up" | "down" | "neutral";
  /** Tailwind text color class applied to the value. */
  colorClass?: string;
}

export function StatTile({
  label,
  value,
  subtitle,
  trend,
  colorClass = "text-ink",
}: StatTileProps) {
  const trendLabel =
    trend === "up" ? "↑ Increasing" :
    trend === "down" ? "↓ Decreasing" : undefined;

  return (
    <div className="bg-white border border-charcoal/10 rounded-lg p-4">
      <dt className="font-mono text-[11px] uppercase tracking-wider text-charcoal/50 mb-1">
        {label}
      </dt>
      <dd className={`font-serif text-2xl font-semibold ${colorClass}`}>
        {value}
        {trend && trend !== "neutral" && (
          <span
            className="ml-1 font-mono text-xs align-middle"
            aria-label={trendLabel}
          >
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </dd>
      {subtitle && (
        <p className="font-mono text-[10px] text-charcoal/40 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
