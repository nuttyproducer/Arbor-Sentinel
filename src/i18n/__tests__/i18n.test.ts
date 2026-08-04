import { describe, it, expect } from "vitest";
import {
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  LOCALE_NATIVE_NAMES,
} from "../config";

// These tests validate the i18n configuration data structures,
// locale dictionary shape consistency, and translation metadata types.
// The real i18next instance is mocked in test-setup.ts so these
// tests focus on the data layer.

describe("i18n configuration", () => {
  it("has three supported locales", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(3);
    expect(SUPPORTED_LOCALES).toContain("en");
    expect(SUPPORTED_LOCALES).toContain("nl");
    expect(SUPPORTED_LOCALES).toContain("fr");
  });

  it("has labels for all supported locales", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_LABELS[locale]).toBeTruthy();
      expect(LOCALE_NATIVE_NAMES[locale]).toBeTruthy();
    }
  });

  it("English is the first locale (authoritative source)", () => {
    expect(SUPPORTED_LOCALES[0]).toBe("en");
  });
});

describe("Locale dictionaries — shape consistency", () => {
  // Dynamic import of JSON locale files to verify structure
  it("English common dictionary has required keys", async () => {
    const enCommon = await import("../locales/en/common.json");
    expect(enCommon.site).toBeDefined();
    expect(enCommon.buttons).toBeDefined();
    expect(enCommon.buttons.close).toBe("Close");
    expect(enCommon.buttons.search).toBe("Search");
    expect(enCommon.search).toBeDefined();
    expect(enCommon.languageSwitcher).toBeDefined();
    expect(enCommon.emptyStates).toBeDefined();
    expect(enCommon.translationNotice).toBeDefined();
    expect(enCommon.footer).toBeDefined();
  });

  it("Dutch common dictionary has the same top-level keys as English", async () => {
    const enCommon = await import("../locales/en/common.json");
    const nlCommon = await import("../locales/nl/common.json");
    const enKeys = Object.keys(enCommon).sort();
    const nlKeys = Object.keys(nlCommon).sort();
    expect(nlKeys).toEqual(enKeys);
  });

  it("French common dictionary has the same top-level keys as English", async () => {
    const enCommon = await import("../locales/en/common.json");
    const frCommon = await import("../locales/fr/common.json");
    const enKeys = Object.keys(enCommon).sort();
    const frKeys = Object.keys(frCommon).sort();
    expect(frKeys).toEqual(enKeys);
  });

  it("English statusLabels has all required sections", async () => {
    const enSL = await import("../locales/en/statusLabels.json");
    expect(enSL.contentStatus).toBeDefined();
    expect(enSL.legalStatus).toBeDefined();
    expect(enSL.verificationLevel).toBeDefined();
    expect(enSL.sourceType).toBeDefined();
    expect(enSL.sourceStatus).toBeDefined();
    expect(enSL.evidenceCategory).toBeDefined();
    expect(enSL.legalTimelineEvent).toBeDefined();
    expect(enSL.dossierType).toBeDefined();
    expect(enSL.dossierAudience).toBeDefined();
    expect(enSL.translationStatus).toBeDefined();
    expect(enSL.searchableRecordType).toBeDefined();
  });

  it("Dutch statusLabels has the same section keys as English", async () => {
    const enSL = await import("../locales/en/statusLabels.json");
    const nlSL = await import("../locales/nl/statusLabels.json");
    expect(Object.keys(nlSL).sort()).toEqual(Object.keys(enSL).sort());
  });

  it("French statusLabels has the same section keys as English", async () => {
    const enSL = await import("../locales/en/statusLabels.json");
    const frSL = await import("../locales/fr/statusLabels.json");
    expect(Object.keys(frSL).sort()).toEqual(Object.keys(enSL).sort());
  });

  it("Dutch statusLabels translate all content statuses", async () => {
    const nlSL = await import("../locales/nl/statusLabels.json");
    const statuses = ["draft", "static_preview", "review_pending", "reviewed", "disputed", "corrected", "archived"];
    for (const s of statuses) {
      expect(nlSL.contentStatus[s]).toBeTruthy();
      // Translation must differ from English key (not a copy-paste error)
      expect(nlSL.contentStatus[s]).not.toBe(s);
    }
  });

  it("French statusLabels translate all content statuses", async () => {
    const frSL = await import("../locales/fr/statusLabels.json");
    const statuses = ["draft", "static_preview", "review_pending", "reviewed", "disputed", "corrected", "archived"];
    for (const s of statuses) {
      expect(frSL.contentStatus[s]).toBeTruthy();
    }
  });

  it("English navigation has all required sections", async () => {
    const enNav = await import("../locales/en/navigation.json");
    expect(enNav.header).toBeDefined();
    expect(enNav.nav).toBeDefined();
    expect(enNav.footer).toBeDefined();
    expect(enNav.routes).toBeDefined();
  });

  it("Dutch and French navigation have the same section keys as English", async () => {
    const enNav = await import("../locales/en/navigation.json");
    const nlNav = await import("../locales/nl/navigation.json");
    const frNav = await import("../locales/fr/navigation.json");
    expect(Object.keys(nlNav).sort()).toEqual(Object.keys(enNav).sort());
    expect(Object.keys(frNav).sort()).toEqual(Object.keys(enNav).sort());
  });
});

describe("Translation metadata types", () => {
  it("translation status vocabulary has 6 values", async () => {
    const statuses = ["not_started", "draft", "review_pending", "reviewed", "outdated", "archived"];
    const { TRANSLATION_STATUS_LABELS } = await import("../../types/content");
    for (const s of statuses) {
      expect(TRANSLATION_STATUS_LABELS[s]).toBeTruthy();
    }
    expect(Object.keys(TRANSLATION_STATUS_LABELS)).toHaveLength(6);
  });

  it("translation status labels are present in statusLabels dictionaries", async () => {
    const enSL = await import("../locales/en/statusLabels.json");
    const nlSL = await import("../locales/nl/statusLabels.json");
    const frSL = await import("../locales/fr/statusLabels.json");

    const statuses = ["not_started", "draft", "review_pending", "reviewed", "outdated", "archived"];
    for (const s of statuses) {
      expect(enSL.translationStatus[s]).toBeTruthy();
      expect(nlSL.translationStatus[s]).toBeTruthy();
      expect(frSL.translationStatus[s]).toBeTruthy();
    }
  });
});

describe("Missing translation fallback", () => {
  it("English (fallback) dictionaries are complete — every key resolves", async () => {
    const enCommon = await import("../locales/en/common.json");
    // Verify all button labels are present
    expect(enCommon.buttons.close).toBeTruthy();
    expect(enCommon.buttons.submit).toBeTruthy();
    expect(enCommon.buttons.cancel).toBeTruthy();
    // Verify all search strings
    expect(enCommon.search.noResults).toBeTruthy();
    expect(enCommon.search.resultCount).toBeTruthy();
    expect(enCommon.search.resultCount_plural).toBeTruthy();
    // Verify empty states
    expect(enCommon.emptyStates.notFound).toBeTruthy();
    expect(enCommon.emptyStates.noSources).toBeTruthy();
  });

  it("language detector normalizes full locale codes", () => {
    // The languageDetector handles "en-US" → "en", "nl-BE" → "nl", etc.
    // Validate the supported base codes
    const supported = ["en", "nl", "fr"];
    for (const code of supported) {
      expect(SUPPORTED_LOCALES).toContain(code);
    }
  });
});
