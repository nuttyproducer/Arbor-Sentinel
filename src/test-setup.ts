import "@testing-library/jest-dom/vitest";

// jsdom does not implement ResizeObserver, which Recharts' ResponsiveContainer
// requires. Provide a stub that fires an initial resize with a realistic content
// rect so charts render at a measurable size inside tests.
class ResizeObserverMock {
  callback: ResizeObserverCallback | null = null;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe() {
    // Fire an initial resize so Recharts renders bars rather than a 0x0 chart.
    if (this.callback) {
      this.callback(
        [
          {
            contentRect: { width: 500, height: 300 },
          },
        ] as ResizeObserverEntry[],
        this as unknown as ResizeObserver,
      );
    }
  }

  unobserve() {}

  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock the i18n config module to prevent real i18next initialization.
// The config runs i18n.use().init() at module level which requires
// real plugins — not available in jsdom test environment.
vi.mock("./i18n/config", () => ({
  default: {
    language: "en",
    changeLanguage: () => Promise.resolve(),
    use: () => ({ use: () => ({ init: () => {} }) }),
  },
  SUPPORTED_LOCALES: ["en", "nl", "fr"],
  LOCALE_LABELS: { en: "English", nl: "Nederlands", fr: "Français" },
  LOCALE_NATIVE_NAMES: { en: "English", nl: "Nederlands", fr: "Français" },
}));

// Mock react-i18next for all tests.
// Components use useTranslation() which requires i18n context.
// This mock returns English labels (authoritative source language)
// so existing tests continue to work without I18nextProvider wrapping.
vi.mock("react-i18next", () => {
  // Real label data for English (source language)
  const enStatusLabels: Record<string, Record<string, string>> = {
    contentStatus: {
      draft: "Draft",
      static_preview: "Static preview",
      review_pending: "Review pending",
      reviewed: "Reviewed",
      disputed: "Disputed",
      corrected: "Corrected",
      archived: "Archived",
    },
    legalStatus: {
      court_proceeding_active: "Court proceeding active",
      provisional_measures_issued: "Provisional measures issued",
      arrest_warrant_issued: "Arrest warrant issued",
      allegation_under_investigation: "Allegation under investigation",
      un_finding: "UN finding",
      ngo_legal_determination: "NGO legal determination",
      not_judicially_determined: "Not yet judicially determined",
      contested_claim: "Contested claim",
      requires_further_verification: "Requires further verification",
    },
    verificationLevel: {
      "0": "Unreviewed lead",
      "1": "Preserved lead",
      "2": "Source checked",
      "3": "Corroborated",
      "4": "Trusted organization verified",
      "5": "Legal/institutional record",
    },
    verificationLevelShort: {
      level: "Level {{level}}",
      levelLabel: "Level {{level}} — {{label}}",
    },
    sourceType: {
      court: "Court / legal record",
      un: "UN / international body",
      government: "Government / parliamentary record",
      humanitarian: "Humanitarian organization",
      ngo: "Human-rights organization",
      academic: "Academic research",
      journalism: "Investigative journalism",
      osint: "OSINT / documentation group",
    },
    sourceStatus: {
      active: "Active",
      broken: "Broken link",
      archived: "Archived",
      superseded: "Superseded",
    },
    evidenceCategory: {
      "court record": "Court record",
      "official UN document": "Official UN document",
      "humanitarian update": "Humanitarian update",
      "human-rights report": "Human-rights report",
      "parliamentary document": "Parliamentary document",
      "verified investigative report": "Verified investigative report",
    },
    legalTimelineEvent: {
      filing: "Filing",
      jurisdiction_decision: "Jurisdiction decision",
      investigation_opened: "Investigation opened",
      provisional_measure: "Provisional measure",
      arrest_warrant_application: "Arrest warrant application",
      arrest_warrant_issued: "Arrest warrant issued",
      hearing: "Hearing",
      order: "Order",
      judgment: "Judgment",
      intervention: "Intervention",
      official_report_update: "Official report / update",
    },
    dossierType: {
      one_page_brief: "One-page executive brief",
      five_page_memo: "Five-page policy memo",
      full_dossier: "Full evidence dossier",
      journalist_briefing: "Journalist briefing",
      council_motion_pack: "Local council motion pack",
      mp_contact_pack: "MP/MEP contact pack",
      humanitarian_access_brief: "Humanitarian access brief",
      arms_transfer_brief: "Arms-transfer review brief",
      legal_accountability_brief: "Legal accountability brief",
    },
    dossierAudience: {
      citizen: "Concerned citizens",
      journalist: "Journalists and researchers",
      researcher: "Academic researchers",
      policymaker: "Policymakers and staffers",
      ngo: "NGOs and humanitarian organizations",
      legal_professional: "Legal workers and human-rights defenders",
    },
    dossierGenerationStatus: {
      manual_static_preview: "Static preview — manually constructed",
      generation_inactive: "Automated generation not yet active",
    },
    actionType: {
      contact_representative: "Contact a representative",
      arms_transfer_review: "Ask for arms-transfer review",
      humanitarian_access: "Support humanitarian access",
      send_dossier: "Send a dossier to a journalist",
      submit_correction: "Submit a correction or public source",
      volunteer: "Volunteer for the project",
    },
    reviewStatus: {
      draft: "Draft — not yet reviewed",
      reviewed: "Reviewed",
      not_applicable: "Not applicable",
    },
    organizationCategory: {
      "UN and humanitarian": "UN and humanitarian",
      "Red Cross / Red Crescent": "Red Cross / Red Crescent",
      medical: "Medical",
      "legal and human rights": "Legal and human rights",
      "documentation and data": "Documentation and data",
      "journalism and press freedom": "Journalism and press freedom",
      "academic and research": "Academic and research",
    },
    relationshipStatus: {
      public_resource: "Public resource",
    },
    translationStatus: {
      not_started: "Not started",
      draft: "Draft translation",
      review_pending: "Translation review pending",
      reviewed: "Translation reviewed",
      outdated: "Translation outdated",
      archived: "Translation archived",
    },
    searchableRecordType: {
      source: "Source",
      evidence: "Evidence record",
      legal_case: "Legal case",
      organization: "Organization",
      action: "Action template",
      country: "Country",
      institution: "Institution",
      dossier: "Dossier",
      trust_page: "Trust / methodology page",
    },
  };

  const enCommon: Record<string, unknown> = {
    buttons: { close: "Close", menu: "Menu", search: "Search", clear: "Clear", print: "Print / Save as PDF" },
    labels: { lastUpdated: "Page structure last updated", staticPreview: "Static preview", version: "Version" },
    languageSwitcher: { label: "Select language", currentLanguage: "Current language: {{language}}" },
    search: { placeholder: "Search…", noResults: "No results found", filterByType: "Filter by type", matched: "Matched" },
    emptyStates: { notFound: "Page not found.", noResults: "No results found." },
    related: { references: "References", referencedBy: "Referenced By" },
    site: { name: "Arbor Sentinel", tagline: "Civic Accountability Platform" },
  };

  const enNavigation: Record<string, unknown> = {
    nav: {
      gazaDossier: "Gaza Dossier",
      legalTracker: "Legal Tracker",
      countries: "Countries",
      methodology: "Methodology",
      contribute: "Contribute",
      search: "Search platform records",
    },
  };

  // Build a flat lookup for t() calls like "contentStatus.reviewed"
  function resolveNested(obj: Record<string, unknown>, path: string): string {
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return path; // fallback: return the key
      }
    }
    return typeof current === "string" ? current : path;
  }

  function t(ns: string, key: string, options?: Record<string, unknown>): string {
    let nsObj: Record<string, unknown> = {};
    if (ns === "statusLabels") nsObj = enStatusLabels as unknown as Record<string, unknown>;
    else if (ns === "common") nsObj = enCommon;
    else if (ns === "navigation") nsObj = enNavigation;

    let result = resolveNested(nsObj, key);
    // Simple interpolation for {{key}}
    if (options) {
      for (const [k, v] of Object.entries(options)) {
        result = result.replace(`{{${k}}}`, String(v));
      }
    }
    return result;
  }

  return {
    useTranslation: (ns?: string) => ({
      t: (key: string, options?: Record<string, unknown>) => t(ns ?? "common", key, options),
      i18n: {
        language: "en",
        changeLanguage: () => Promise.resolve(),
      },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: {},
  };
});
