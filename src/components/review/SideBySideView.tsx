import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

export interface HighlightRange {
  start: number;
  end: number;
  side: "left" | "right";
}

interface SideBySideViewProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  leftLabel: string;
  rightLabel: string;
  /** Character ranges to highlight within plain-string content. */
  highlights?: HighlightRange[];
}

const MIN_RATIO = 0.15;
const MAX_RATIO = 0.85;
const HANDLE_WIDTH = 8;

/**
 * Tracks the `prefers-reduced-motion` media query. Falls back to `false`
 * when `window.matchMedia` is unavailable (e.g. jsdom / SSR).
 */
function usePrefersReducedMotion(): boolean {
  // Read the initial value once at render time — matchMedia may be
  // unavailable in jsdom/SSR, in which case we default to no reduction.
  const [reduced, setReduced] = useState(() => {
    if (typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };
    query.addEventListener?.("change", handleChange);
    return () => query.removeEventListener?.("change", handleChange);
  }, []);

  return reduced;
}

/**
 * Wraps the highlighted character ranges of a plain string in <mark>.
 * Overlapping or out-of-bounds ranges are skipped safely.
 */
function highlightText(text: string, ranges: HighlightRange[]): ReactNode {
  if (ranges.length === 0) return text;

  const sorted = ranges
    .filter((r) => r.start >= 0 && r.end > r.start)
    .sort((a, b) => a.start - b.start);

  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const range of sorted) {
    const end = Math.min(range.end, text.length);
    if (range.start >= end || range.start < cursor) continue;

    if (range.start > cursor) {
      nodes.push(text.slice(cursor, range.start));
    }
    nodes.push(
      <mark
        key={`${range.start}-${end}`}
        className="bg-amber/30 text-ink rounded-sm px-0.5"
      >
        {text.slice(range.start, end)}
      </mark>,
    );
    cursor = end;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function renderPanelContent(
  content: ReactNode,
  side: "left" | "right",
  highlights: HighlightRange[],
): ReactNode {
  if (typeof content === "string") {
    return highlightText(content, highlights.filter((h) => h.side === side));
  }
  return content;
}

/**
 * Two-panel comparison view used by all review page types.
 *
 * Renders left/right content side by side in a CSS grid, keeps the panels'
 * vertical/horizontal scroll positions in sync, and exposes a draggable
 * (and keyboard-accessible) resize handle between the panels. Scroll
 * behaviour respects `prefers-reduced-motion`.
 */
export function SideBySideView({
  leftContent,
  rightContent,
  leftLabel,
  rightLabel,
  highlights = [],
}: SideBySideViewProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [leftRatio, setLeftRatio] = useState(0.5);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const scrollBehavior: CSSProperties = {
    scrollBehavior: prefersReducedMotion ? "auto" : "smooth",
  };

  const clampRatio = (value: number) =>
    Math.min(MAX_RATIO, Math.max(MIN_RATIO, value));

  const syncScrollLeft = () => {
    if (!leftPanelRef.current || !rightPanelRef.current) return;
    rightPanelRef.current.scrollTop = leftPanelRef.current.scrollTop;
    rightPanelRef.current.scrollLeft = leftPanelRef.current.scrollLeft;
  };

  const syncScrollRight = () => {
    if (!leftPanelRef.current || !rightPanelRef.current) return;
    leftPanelRef.current.scrollTop = rightPanelRef.current.scrollTop;
    leftPanelRef.current.scrollLeft = rightPanelRef.current.scrollLeft;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    // Guarded for environments without Pointer Capture (e.g. jsdom tests).
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    setLeftRatio(clampRatio(ratio));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // Guarded for environments without Pointer Capture (e.g. jsdom tests).
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setLeftRatio((ratio) => clampRatio(ratio - 0.05));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setLeftRatio((ratio) => clampRatio(ratio + 0.05));
    }
  };

  return (
    <div
      ref={containerRef}
      className="grid w-full items-stretch"
      style={{
        gridTemplateColumns: `${leftRatio}fr ${HANDLE_WIDTH}px ${1 - leftRatio}fr`,
      }}
    >
      <section className="min-w-0 border border-border/60 rounded-l-lg bg-paper">
        <h3 className="px-4 py-2 text-xs font-mono uppercase tracking-wide text-charcoal/60 border-b border-border/60">
          {leftLabel}
        </h3>
        <div
          ref={leftPanelRef}
          onScroll={syncScrollLeft}
          data-testid="side-by-side-left"
          className="max-h-[600px] overflow-auto p-4 text-sm leading-relaxed text-charcoal"
          style={scrollBehavior}
        >
          {renderPanelContent(leftContent, "left", highlights)}
        </div>
      </section>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize comparison panels"
        aria-valuemin={MIN_RATIO}
        aria-valuemax={MAX_RATIO}
        aria-valuenow={Math.round(leftRatio * 100)}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        data-testid="side-by-side-handle"
        className="cursor-col-resize touch-none select-none rounded-full bg-border hover:bg-trust/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50"
      />

      <section className="min-w-0 border border-border/60 rounded-r-lg bg-paper">
        <h3 className="px-4 py-2 text-xs font-mono uppercase tracking-wide text-charcoal/60 border-b border-border/60">
          {rightLabel}
        </h3>
        <div
          ref={rightPanelRef}
          onScroll={syncScrollRight}
          data-testid="side-by-side-right"
          className="max-h-[600px] overflow-auto p-4 text-sm leading-relaxed text-charcoal"
          style={scrollBehavior}
        >
          {renderPanelContent(rightContent, "right", highlights)}
        </div>
      </section>
    </div>
  );
}
