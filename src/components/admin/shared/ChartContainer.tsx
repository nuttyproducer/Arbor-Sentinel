// src/components/admin/shared/ChartContainer.tsx
import type { ReactNode } from "react";

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  error?: string;
  children: ReactNode;
}

export function ChartContainer({
  title,
  subtitle,
  isLoading = false,
  isEmpty = false,
  error,
  children,
}: ChartContainerProps) {
  return (
    <section aria-labelledby={`chart-${title.replace(/\s+/g, "-").toLowerCase()}`} role="region" className="bg-white border border-charcoal/10 rounded-lg p-5">
      <h3
        id={`chart-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="font-serif text-lg font-semibold text-ink mb-1"
      >
        {title}
      </h3>
      {subtitle && (
        <p className="font-mono text-xs text-charcoal/50 mb-4">{subtitle}</p>
      )}

      {isLoading && (
        <div className="h-48 bg-bone animate-pulse rounded flex items-center justify-center" aria-busy="true">
          <span className="font-mono text-xs text-charcoal/40">Loading chart data…</span>
        </div>
      )}

      {!isLoading && isEmpty && (
        <div className="h-48 bg-bone rounded flex items-center justify-center">
          <span className="font-mono text-xs text-charcoal/40">No data for this period</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="h-48 bg-clay/5 border border-clay/20 rounded flex items-center justify-center">
          <span className="font-mono text-xs text-clay">{error}</span>
        </div>
      )}

      {!isLoading && !isEmpty && !error && (
        <div className="mt-2">{children}</div>
      )}
    </section>
  );
}
