import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

/**
 * Privacy-safe local display preference.
 *
 * - Stored only in localStorage — no account, no server, no tracking.
 * - "standard" (default): all content rendered as authored.
 * - "low-graphic": contextual documentary images are replaced with calm
 *   non-graphic surfaces; all text and functionality preserved.
 *
 * The name "low-graphic" describes the display mode, not the images.
 * It does not imply that any image is graphic or disturbing.
 */

export type DisplayDensity = "standard" | "low-graphic";

const STORAGE_KEY = "accountability-atlas:display-density";

interface DisplayPreferenceContextValue {
  density: DisplayDensity;
  setDensity: (d: DisplayDensity) => void;
}

const DisplayPreferenceContext = createContext<DisplayPreferenceContextValue>({
  density: "standard",
  setDensity: () => {},
});

function readStoredDensity(): DisplayDensity {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "low-graphic") return "low-graphic";
    return "standard";
  } catch {
    // localStorage unavailable (e.g. SSR, privacy mode) — fall back to standard
    return "standard";
  }
}

function writeStoredDensity(d: DisplayDensity) {
  try {
    localStorage.setItem(STORAGE_KEY, d);
  } catch {
    // Silently fail — preference still works for the session
  }
}

export function DisplayPreferenceProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<DisplayDensity>(readStoredDensity);

  const setDensity = useCallback((d: DisplayDensity) => {
    setDensityState(d);
    writeStoredDensity(d);
  }, []);

  // Sync across tabs (user changes preference in one tab, others reflect it)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (e.newValue === "low-graphic") {
          setDensityState("low-graphic");
        } else {
          setDensityState("standard");
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <DisplayPreferenceContext.Provider value={{ density, setDensity }}>
      {children}
    </DisplayPreferenceContext.Provider>
  );
}

export function useDisplayPreference() {
  return useContext(DisplayPreferenceContext);
}

/**
 * Component that wraps a contextual documentary image.
 * In "low-graphic" mode, replaces the image with a calm non-graphic surface
 * while preserving all surrounding text, layout, and functionality.
 */
export function ContextualImage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { density } = useDisplayPreference();

  if (density === "low-graphic") {
    return (
      <div
        className={className}
        aria-label="Contextual image replaced with calm surface in low-graphic mode"
        role="img"
      >
        {/* Calm non-graphic surface: subtle geometric texture over muted tone */}
        <div className="absolute inset-0 bg-charcoal/90" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(217,154,43,0.3) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(217,154,43,0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px, 60px 60px",
            backgroundPosition: "0 0, 20px 20px",
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  return <>{children}</>;
}
