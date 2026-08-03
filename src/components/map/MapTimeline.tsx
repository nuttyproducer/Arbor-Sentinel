// src/components/map/MapTimeline.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { MapFeature } from "../../lib/map/types";
import { getDateRange } from "../../lib/map/utils/timeline";

interface MapTimelineProps {
  features: MapFeature[];
  onRangeChange: (start: string, end: string) => void;
}

type Speed = 1 | 2 | 5;

const SPEEDS: Speed[] = [1, 2, 5];
const SLIDER_MAX = 100;

/**
 * Playable date-range slider. The visible range always starts at the earliest
 * feature date; the slider (and play button) selects how far into the timeline
 * the range extends. Playing advances the end date in animation frames,
 * respecting `prefers-reduced-motion`.
 */
export function MapTimeline({ features, onRangeChange }: MapTimelineProps) {
  const { min, max } = useMemo(() => getDateRange(features), [features]);
  const minMs = useMemo(() => new Date(min).getTime(), [min]);
  const maxMs = useMemo(() => new Date(max).getTime(), [max]);
  const rangeMs = maxMs - minMs;

  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const dateAtValue = (v: number): string => {
    const ms = minMs + (rangeMs * v) / SLIDER_MAX;
    return new Date(ms).toISOString().slice(0, 10);
  };

  const currentEnd = dateAtValue(value);

  // Subscribe to prefers-reduced-motion changes.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Notify the parent whenever the visible end date changes.
  useEffect(() => {
    onRangeChange(min, currentEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    valueRef.current = next;
    setValue(next);
  };

  // Advance the range while playing.
  useEffect(() => {
    if (!playing || reducedMotion) return;
    let raf = 0;
    const tick = () => {
      const next = valueRef.current + speed;
      if (next >= SLIDER_MAX) {
        valueRef.current = SLIDER_MAX;
        setValue(SLIDER_MAX);
        setPlaying(false);
        return;
      }
      valueRef.current = next;
      setValue(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, reducedMotion]);

  const togglePlay = () => {
    if (reducedMotion) return;
    setPlaying((p) => !p);
  };

  return (
    <div
      className="absolute bottom-3 left-3 right-3 z-20 bg-bone/95 border border-charcoal/20 rounded-lg p-3 shadow-soft"
      aria-label="Map timeline"
    >
      <div className="flex items-center gap-2 font-mono text-[10px] text-charcoal/70">
        <span aria-label="Earliest date" className="flex-shrink-0">
          {min}
        </span>
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          value={value}
          onChange={handleSliderChange}
          aria-label="Timeline slider"
          className="flex-1 accent-amber"
        />
        <span aria-label="Latest date" className="flex-shrink-0">
          {max}
        </span>
      </div>
      <div
        aria-label="Current date range"
        className="font-mono text-[10px] text-charcoal/60 mt-1"
      >
        <span aria-label="Range start">{min}</span>
        {" – "}
        <span aria-label="Range end">{currentEnd}</span>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <button
          onClick={togglePlay}
          className="w-8 h-8 flex items-center justify-center bg-bone border border-charcoal/20 rounded text-charcoal hover:bg-paper transition-colors font-mono text-sm leading-none"
          aria-label={playing ? "Pause timeline" : "Play timeline"}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶"}
        </button>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 h-8 flex items-center justify-center rounded border font-mono text-[11px] transition-colors ${
              speed === s
                ? "bg-charcoal text-bone border-charcoal"
                : "bg-bone text-charcoal/70 border-charcoal/20 hover:bg-paper"
            }`}
            aria-label={`Speed ${s}x`}
            aria-pressed={speed === s}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
