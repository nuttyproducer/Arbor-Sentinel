import { useEffect, useState, useCallback } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import { useMapContext } from "./MapContext";

interface PopupData {
  title: string;
  description?: string;
  date?: string;
  category?: string;
  sourceIds?: string[];
  confidence?: number;
  safePrecision?: string;
  lngLat: { lng: number; lat: number };
}

interface MapPopupProps {
  className?: string;
}

export function MapPopup({ className = "" }: MapPopupProps) {
  const { map } = useMapContext();
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const close = useCallback(() => {
    setPopup(null);
    setPosition(null);
  }, []);

  // Listen for clicks on feature layers
  useEffect(() => {
    if (!map) return;

    const handleClick = (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length === 0) {
        close();
        return;
      }

      const feature = features[0];
      const props = feature.properties;
      if (!props) return;

      setPopup({
        title: (props.title as string) ?? "",
        description: (props.description as string) ?? "",
        date: (props.date as string) ?? "",
        category: (props.category as string) ?? "",
        sourceIds: (props.sourceIds as string[]) ?? [],
        confidence: (props.confidence as number) ?? 0,
        safePrecision: (props.safePrecision as string) ?? "",
        lngLat: e.lngLat,
      });
      // e.point is the click's pixel position, equivalent to map.project(e.lngLat).
      // Set it here (not in an effect) so the popup renders positioned on the
      // first pass — no intermediate popup-without-position state.
      setPosition({ x: e.point.x, y: e.point.y });
    };

    map.on("click", handleClick);

    // Close on escape
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      map.off("click", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [map, close]);

  if (!popup || !position) return null;

  return (
    <div
      role="dialog"
      aria-label="Feature details"
      className={`absolute z-30 bg-bone border border-charcoal/20 rounded-lg p-4 shadow-soft max-w-[280px] text-sm ${className}`}
      style={{ left: position.x + 12, top: position.y - 10 }}
    >
      <button
        onClick={close}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-charcoal/50 hover:text-charcoal font-mono text-xs"
        aria-label="Close popup"
      >
        ×
      </button>
      <h3 className="font-serif text-base font-bold text-ink mb-1 pr-4">
        {popup.title}
      </h3>
      {popup.date && (
        <p className="font-mono text-[11px] text-charcoal/60 mb-1">
          {popup.date}
          {popup.safePrecision && (
            <span className="ml-1">· {popup.safePrecision} precision</span>
          )}
        </p>
      )}
      {popup.category && (
        <p className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50 mb-2">
          {popup.category}
        </p>
      )}
      {popup.description && (
        <p className="text-charcoal/80 leading-relaxed mb-2">
          {popup.description}
        </p>
      )}
      {popup.sourceIds && popup.sourceIds.length > 0 && (
        <p className="font-mono text-[10px] text-charcoal/50">
          Sources: {popup.sourceIds.join(", ")}
        </p>
      )}
    </div>
  );
}
