import { useDisplayPreference, type DisplayDensity } from "../../contexts/DisplayPreference";

/**
 * Accessible toggle for display density preference.
 *
 * - "Standard": full content as authored (default).
 * - "Low-graphic": replaces contextual documentary images with calm surfaces.
 * - Privacy-safe: stored only in localStorage, no account required.
 * - The name "low-graphic" describes the display mode, not the images.
 */
export function DisplayDensityToggle() {
  const { density, setDensity } = useDisplayPreference();

  const nextDensity: DisplayDensity =
    density === "standard" ? "low-graphic" : "standard";

  const label =
    density === "standard"
      ? "Switch to low-graphic display"
      : "Switch to standard display";

  return (
    <button
      type="button"
      onClick={() => setDensity(nextDensity)}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-charcoal hover:text-ink rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50"
      aria-label={label}
      title={label}
    >
      {/* Eye icon — simple, neutral, does not imply images are graphic */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        {density === "standard" ? (
          <>
            <path
              d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="8"
              cy="8"
              r="2.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </>
        ) : (
          <>
            <path
              d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 1.5"
            />
            <line
              x1="2"
              y1="2"
              x2="14"
              y2="14"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      <span className="hidden lg:inline">
        {density === "standard" ? "Display" : "Low-graphic"}
      </span>
    </button>
  );
}
