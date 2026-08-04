/**
 * i18next configuration for Accountability Atlas.
 *
 * Architecture decision:
 * - react-i18next is used as the i18n framework. It is the most
 *   maintained React i18n library, supports namespace splitting,
 *   fallback languages, pluralization, and date/number formatting.
 * - During the static beta, language preference is stored in
 *   localStorage only — no URL prefix or subdomain routing.
 *   This avoids silently creating duplicate canonical URLs and
 *   keeps SEO behaviour deliberate. URL-based locale routing
 *   (e.g. /nl/gaza-dossier) will be evaluated for the functional MVP.
 * - English is the authoritative source language. All content
 *   (legal summaries, evidence, country positions, action bodies,
 *   organization descriptions) remains English until translated
 *   and reviewed. The i18n layer currently handles UI chrome only.
 *
 * Namespaces:
 * - common:     Buttons, labels, accessibility text, page chrome
 * - statusLabels: Content status, legal status, verification levels,
 *                 source types, evidence categories, dossier types
 * - navigation:  Header nav, footer links, route labels
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "./languageDetector";

// ── English (source / authoritative) ────────────────────────────────────────
import enCommon from "./locales/en/common.json";
import enStatusLabels from "./locales/en/statusLabels.json";
import enNavigation from "./locales/en/navigation.json";

// ── Dutch ───────────────────────────────────────────────────────────────────
import nlCommon from "./locales/nl/common.json";
import nlStatusLabels from "./locales/nl/statusLabels.json";
import nlNavigation from "./locales/nl/navigation.json";

// ── French ─────────────────────────────────────────────────────────────────
import frCommon from "./locales/fr/common.json";
import frStatusLabels from "./locales/fr/statusLabels.json";
import frNavigation from "./locales/fr/navigation.json";

// ── Supported locales ──────────────────────────────────────────────────────

export const SUPPORTED_LOCALES = ["en", "nl", "fr"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  nl: "Nederlands",
  fr: "Français",
};

/** Locale names in their own language, for the language switcher. */
export const LOCALE_NATIVE_NAMES: Record<SupportedLocale, string> = {
  en: "English",
  nl: "Nederlands",
  fr: "Français",
};

// ── Resources ───────────────────────────────────────────────────────────────

const resources = {
  en: {
    common: enCommon,
    statusLabels: enStatusLabels,
    navigation: enNavigation,
  },
  nl: {
    common: nlCommon,
    statusLabels: nlStatusLabels,
    navigation: nlNavigation,
  },
  fr: {
    common: frCommon,
    statusLabels: frStatusLabels,
    navigation: frNavigation,
  },
};

// ── Initialize ──────────────────────────────────────────────────────────────

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "statusLabels", "navigation"],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    returnObjects: false,
    returnNull: false,
    // When a key is missing in a non-English locale, fall back to English
    // rather than showing the key name. During static beta with partial
    // translations, this ensures UI strings always display something
    // readable rather than raw keys.
    parseMissingKeyHandler: (_key: string) => {
      // Return empty string — i18next will then fall back to English
      return "";
    },
    // Always save missing keys during development
    saveMissing: false,
    detection: {
      // Language detection order:
      // 1. localStorage (user preference, persisted across visits)
      // 2. navigator.language (browser preference, for first visit)
      // 3. fallback to 'en'
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "accountability-atlas-lang",
    },
  });

export default i18n;
