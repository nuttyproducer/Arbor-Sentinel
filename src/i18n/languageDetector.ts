/**
 * Minimal language detector for i18next.
 *
 * Detection order:
 *  1. localStorage key "accountability-atlas-lang"
 *  2. navigator.language (browser preference)
 *  3. Fallback to "en"
 *
 * No external dependency — avoids pulling in the full
 * i18next-browser-languagedetector package.
 */

import type { LanguageDetectorModule } from "i18next";

const STORAGE_KEY = "accountability-atlas-lang";
const SUPPORTED = ["en", "nl", "fr"];

function normalize(lang: string): string | undefined {
  // Handle full locale codes like "en-US" → "en", "nl-BE" → "nl"
  const base = lang.split("-")[0].toLowerCase();
  if (SUPPORTED.includes(base)) return base;
  return undefined;
}

const detector: LanguageDetectorModule = {
  type: "languageDetector",
  name: "accountabilityAtlasDetector",

  detect(): string | undefined {
    // 1. localStorage (persisted preference)
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const normalized = normalize(stored);
        if (normalized) return normalized;
      }
    } catch {
      // localStorage unavailable — proceed to next detection
    }

    // 2. navigator.language (browser preference)
    if (typeof navigator !== "undefined" && navigator.language) {
      const normalized = normalize(navigator.language);
      if (normalized) return normalized;
    }

    // 3. Fallback
    return "en";
  },

  cacheUserLanguage(lng: string): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, lng);
    } catch {
      // localStorage unavailable — silently continue
    }
  },
};

export default detector;
