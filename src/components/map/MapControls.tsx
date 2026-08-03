import { useMapContext } from "./MapContext";

interface MapControlsProps {
  className?: string;
}

export function MapControls({ className = "" }: MapControlsProps) {
  const { map } = useMapContext();

  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();
  const handleReset = () => map?.flyTo({ center: [0, 0], zoom: 2 });

  return (
    <div
      className={`absolute top-3 right-3 z-20 flex flex-col gap-1 ${className}`}
      role="toolbar"
      aria-label="Map controls"
    >
      <button
        onClick={handleZoomIn}
        className="w-9 h-9 flex items-center justify-center bg-bone border border-charcoal/20 rounded text-charcoal hover:bg-paper transition-colors font-mono text-lg leading-none"
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        className="w-9 h-9 flex items-center justify-center bg-bone border border-charcoal/20 rounded text-charcoal hover:bg-paper transition-colors font-mono text-lg leading-none"
        aria-label="Zoom out"
        title="Zoom out"
      >
        −
      </button>
      <button
        onClick={handleReset}
        className="w-9 h-9 flex items-center justify-center bg-bone border border-charcoal/20 rounded text-charcoal hover:bg-paper transition-colors text-[10px] font-mono"
        aria-label="Reset map view"
        title="Reset view"
      >
        ⌂
      </button>
    </div>
  );
}
