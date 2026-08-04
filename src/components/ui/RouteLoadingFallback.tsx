import { useEffect, useState } from "react";

/**
 * Calm, accessible loading fallback for route-level code splitting.
 *
 * - Avoids layout shift with a stable min-height matching typical page content.
 * - Respects reduced-motion preference.
 * - Announces loading state to screen readers via aria-live.
 * - Uses a subtle pulse on the accent bar — no spinning or bouncing.
 * - Delays appearance by 200ms to avoid flash on fast connections.
 */
export function RouteLoadingFallback() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    // Render a zero-height sentinel to avoid layout shift while waiting
    return <div className="min-h-[60vh]" aria-hidden="true" />;
  }

  return (
    <div
      className="flex items-center justify-center min-h-[60vh]"
      role="status"
      aria-label="Loading page content"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Calm accent bar with reduced-motion-aware pulse */}
        <div
          className="w-16 h-[2px] bg-amber rounded-full motion-safe:animate-pulse"
          aria-hidden="true"
        />
        <p className="font-mono text-xs tracking-[0.15em] uppercase text-charcoal/50">
          Loading
        </p>
        {/* Screen-reader-only live region */}
        <span className="sr-only" aria-live="polite">
          Page content is loading.
        </span>
      </div>
    </div>
  );
}
