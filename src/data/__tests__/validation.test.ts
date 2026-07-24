import { describe, it, expect } from "vitest";
import {
  checkDuplicateIds,
  checkDuplicateSlugs,
  checkInvalidUrls,
  checkInvalidDates,
  checkMissingSourceRefs,
  checkEmptySourcesOnReviewed,
  checkReviewedWithoutLastReviewedAt,
  checkReviewedWithoutReviewedByRole,
  checkReviewedWithoutVersion,
  checkInvalidLegalStatuses,
  checkInvalidVerificationLevels,
  checkRelationshipStatus,
  checkActionTemplateReview,
  checkEvidenceReviewedSourceSupport,
  checkMissingCorrectionRoute,
  checkRelatedRoutes,
  checkStaleReviews,
  checkSourceCompleteness,
  checkOrganizationReviewedSourceBasis,
  checkContentStatuses,
  checkVersions,
  checkInvalidSourceTypes,
  checkOrganizationDonationDomain,
  checkOrganizationLinkCheckDates,
  checkEvidenceEmptySources,
  checkOrganizationEmptySources,
  checkOrganizationDescriptionLength,
  checkEvidenceContentStatusSourceQualityConsistency,
  checkOrganizationSourceStatus,
  validateAll,
} from "../validation";
import { sources } from "../sources";
import { evidenceItems } from "../evidenceItems";
import { legalCases } from "../legalCases";
import { organizationRecords } from "../organizations";
import { actionTemplates } from "../actionTemplates";
import { belgiumSections } from "../countries";
import { euInstitutions } from "../institutions";
import { attributionRecords } from "../attributions";
import { dossiers } from "../dossiers";
import { routeMetadataMap } from "../routeMetadata";
import type { ValidationError } from "../validation";

function formatErrors(errors: ValidationError[]): string {
  return errors
    .map(
      (e) => `  [${e.collection}] ${e.recordId} — ${e.field}: ${e.message}`,
    )
    .join("\n");
}

const VALID_ROUTES = new Set(Object.keys(routeMetadataMap));
const SOURCE_IDS = new Set(sources.map((s) => s.id));

// ── Full integration test ──────────────────────────────────────────────────

describe("Static data validation (full integration)", () => {
  const report = validateAll();

  it("checks records across all collections", () => {
    expect(report.collectionsChecked).toBe(10);
    expect(report.recordsChecked).toBeGreaterThan(0);
  });

  it("produces zero validation errors", () => {
    if (report.errors.length > 0) {
      throw new Error(
        `${report.errors.length} validation errors across ${report.recordsChecked} records:\n${formatErrors(report.errors)}`,
      );
    }
  });
});

// ── Rule 1: Duplicate IDs ──────────────────────────────────────────────────

describe("Rule 1: Duplicate IDs", () => {
  it("passes with unique IDs", () => {
    const records = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(checkDuplicateIds("test", records)).toHaveLength(0);
  });

  it("detects duplicate IDs", () => {
    const records = [{ id: "a" }, { id: "b" }, { id: "a" }];
    const errors = checkDuplicateIds("test", records);
    expect(errors).toHaveLength(1);
    expect(errors[0].recordId).toBe("a");
    expect(errors[0].field).toBe("id");
  });

  it("passes on real collections", () => {
    expect(checkDuplicateIds("sources", sources)).toHaveLength(0);
    expect(checkDuplicateIds("evidenceItems", evidenceItems)).toHaveLength(0);
    expect(checkDuplicateIds("legalCases", legalCases)).toHaveLength(0);
    expect(checkDuplicateIds("organizations", organizationRecords)).toHaveLength(0);
    expect(checkDuplicateIds("actionTemplates", actionTemplates)).toHaveLength(0);
    expect(checkDuplicateIds("belgiumSections", belgiumSections)).toHaveLength(0);
    expect(checkDuplicateIds("euInstitutions", euInstitutions)).toHaveLength(0);
    expect(checkDuplicateIds("attributions", attributionRecords)).toHaveLength(0);
    expect(checkDuplicateIds("dossiers", dossiers)).toHaveLength(0);
  });
});

// ── Rule 2: Duplicate slugs ────────────────────────────────────────────────

describe("Rule 2: Duplicate slugs", () => {
  it("passes with unique slugs", () => {
    const records = [
      { id: "1", slug: "alpha" },
      { id: "2", slug: "beta" },
    ];
    expect(checkDuplicateSlugs("test", records)).toHaveLength(0);
  });

  it("detects duplicate slugs", () => {
    const records = [
      { id: "1", slug: "alpha" },
      { id: "2", slug: "alpha" },
    ];
    const errors = checkDuplicateSlugs("test", records);
    expect(errors).toHaveLength(1);
    expect(errors[0].recordId).toBe("2");
    expect(errors[0].field).toBe("slug");
  });

  it("passes on real collections with slugs", () => {
    expect(checkDuplicateSlugs("evidenceItems", evidenceItems)).toHaveLength(0);
    expect(checkDuplicateSlugs("legalCases", legalCases)).toHaveLength(0);
    expect(checkDuplicateSlugs("organizations", organizationRecords)).toHaveLength(0);
    expect(checkDuplicateSlugs("actionTemplates", actionTemplates)).toHaveLength(0);
  });
});

// ── Rule 3: Invalid URLs ───────────────────────────────────────────────────

describe("Rule 3: Invalid URLs", () => {
  it("passes with valid URLs", () => {
    const records = [{ id: "1", website: "https://example.com" }];
    expect(checkInvalidUrls("test", records, ["website"])).toHaveLength(0);
  });

  it("detects invalid URLs", () => {
    const records = [{ id: "1", website: "not-a-url" }];
    const errors = checkInvalidUrls("test", records, ["website"]);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("website");
  });

  it("skips empty optional URL fields by design", () => {
    // Empty strings represent "not provided" for optional URL fields.
    // Required URL fields (like officialWebsite) are checked via
    // checkOrganizationReviewedSourceBasis instead.
    const records = [{ id: "1", website: "" }];
    const errors = checkInvalidUrls("test", records, ["website"]);
    expect(errors).toHaveLength(0);
  });

  it("skips undefined/optional URL fields", () => {
    const records = [{ id: "1", website: undefined }];
    expect(checkInvalidUrls("test", records, ["website"])).toHaveLength(0);
  });

  it("passes on real sources", () => {
    expect(checkInvalidUrls("sources", sources, ["url"])).toHaveLength(0);
  });
});

// ── Rule 4: Invalid or ambiguous dates ─────────────────────────────────────

describe("Rule 4: Invalid or ambiguous dates", () => {
  it("passes with valid ISO dates", () => {
    const records = [{ id: "1", date: "2024-01-26" }];
    expect(checkInvalidDates("test", records, ["date"])).toHaveLength(0);
  });

  it("accepts year-only dates with warning", () => {
    const records = [{ id: "1", date: "2024" }];
    const issues = checkInvalidDates("test", records, ["date"]);
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
    expect(issues.filter((i) => i.severity === "warning")).toHaveLength(1);
  });

  it("rejects date ranges", () => {
    const records = [{ id: "1", date: "2024–2025" }];
    const errors = checkInvalidDates("test", records, ["date"]);
    expect(errors.filter((i) => i.severity === "error")).toHaveLength(1);
  });

  it("rejects completely invalid dates", () => {
    const records = [{ id: "1", date: "last Tuesday" }];
    const errors = checkInvalidDates("test", records, ["date"]);
    expect(errors.filter((i) => i.severity === "error")).toHaveLength(1);
  });

  it("no date range errors on real evidence items", () => {
    const errors = checkInvalidDates("evidenceItems", evidenceItems, ["publicationDate"]);
    expect(errors.filter((i) => i.severity === "error")).toHaveLength(0);
  });
});

// ── Rule 5: Missing referenced source IDs ──────────────────────────────────

describe("Rule 5: Missing referenced source IDs", () => {
  it("passes when all source IDs exist", () => {
    const records = [{ id: "1", sourceIds: ["icj-2024-01-26"] }];
    expect(checkMissingSourceRefs("test", records, SOURCE_IDS)).toHaveLength(0);
  });

  it("detects unreferenced source IDs", () => {
    const records = [{ id: "1", sourceIds: ["nonexistent-source"] }];
    const errors = checkMissingSourceRefs("test", records, SOURCE_IDS);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("not found");
  });

  it("passes on real collections", () => {
    expect(checkMissingSourceRefs("evidenceItems", evidenceItems, SOURCE_IDS)).toHaveLength(0);
    expect(checkMissingSourceRefs("legalCases", legalCases, SOURCE_IDS)).toHaveLength(0);
  });
});

// ── Rule 6: Empty sourceIds on reviewed records ────────────────────────────

describe("Rule 6: Empty sourceIds on reviewed records", () => {
  it("passes when reviewed records have sources", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, sourceIds: ["src-1"] },
    ];
    expect(checkEmptySourcesOnReviewed("test", records)).toHaveLength(0);
  });

  it("detects reviewed records with empty sources", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, sourceIds: [] },
    ];
    const errors = checkEmptySourcesOnReviewed("test", records);
    expect(errors).toHaveLength(1);
  });

  it("ignores non-reviewed records with empty sources", () => {
    const records = [
      { id: "1", contentStatus: "review_pending" as const, sourceIds: [] },
    ];
    expect(checkEmptySourcesOnReviewed("test", records)).toHaveLength(0);
  });

  it("no reviewed records with empty sources in real data", () => {
    const errors = [
      ...checkEmptySourcesOnReviewed("evidenceItems", evidenceItems),
      ...checkEmptySourcesOnReviewed("legalCases", legalCases),
      ...checkEmptySourcesOnReviewed("organizations", organizationRecords),
      ...checkEmptySourcesOnReviewed("actionTemplates", actionTemplates),
    ];
    expect(errors).toHaveLength(0);
  });
});

// ── Rule 7: Reviewed without lastReviewedAt ────────────────────────────────

describe("Rule 7: Reviewed without lastReviewedAt", () => {
  it("passes when reviewed record has lastReviewedAt", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, lastReviewedAt: "2026-07-01" },
    ];
    expect(checkReviewedWithoutLastReviewedAt("test", records)).toHaveLength(0);
  });

  it("detects reviewed records missing lastReviewedAt", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, lastReviewedAt: undefined },
    ];
    const errors = checkReviewedWithoutLastReviewedAt("test", records);
    expect(errors).toHaveLength(1);
  });

  it("passes on real collections", () => {
    expect(checkReviewedWithoutLastReviewedAt("evidenceItems", evidenceItems)).toHaveLength(0);
    expect(checkReviewedWithoutLastReviewedAt("organizations", organizationRecords)).toHaveLength(0);
  });
});

// ── Rule 8: Reviewed without reviewedByRole ────────────────────────────────

describe("Rule 8: Reviewed without reviewedByRole", () => {
  it("passes when reviewed record has reviewedByRole", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, reviewedByRole: "Editor" },
    ];
    expect(checkReviewedWithoutReviewedByRole("test", records)).toHaveLength(0);
  });

  it("detects reviewed records missing reviewedByRole", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, reviewedByRole: undefined },
    ];
    const errors = checkReviewedWithoutReviewedByRole("test", records);
    expect(errors).toHaveLength(1);
  });

  it("passes on real collections", () => {
    expect(checkReviewedWithoutReviewedByRole("evidenceItems", evidenceItems)).toHaveLength(0);
    expect(checkReviewedWithoutReviewedByRole("organizations", organizationRecords)).toHaveLength(0);
  });
});

// ── Rule 9: Reviewed without version ───────────────────────────────────────

describe("Rule 9: Reviewed without version", () => {
  it("passes when reviewed record has version ≥ 1", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, version: 1 },
    ];
    expect(checkReviewedWithoutVersion("test", records)).toHaveLength(0);
  });

  it("detects reviewed records with version < 1", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, version: 0 },
    ];
    const errors = checkReviewedWithoutVersion("test", records);
    expect(errors).toHaveLength(1);
  });
});

// ── Rule 10: Legal status values outside controlled vocabulary ─────────────

describe("Rule 10: Invalid legal statuses", () => {
  it("passes with valid legal statuses", () => {
    const records = [
      { id: "1", legalStatuses: ["court_proceeding_active" as const] },
    ];
    expect(checkInvalidLegalStatuses("test", records)).toHaveLength(0);
  });

  it("detects invalid legal statuses", () => {
    const records = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { id: "1", legalStatuses: ["not_a_real_status" as any] },
    ];
    const errors = checkInvalidLegalStatuses("test", records);
    expect(errors).toHaveLength(1);
  });

  it("passes on real collections", () => {
    expect(checkInvalidLegalStatuses("evidenceItems", evidenceItems)).toHaveLength(0);
    expect(checkInvalidLegalStatuses("legalCases", legalCases)).toHaveLength(0);
  });
});

// ── Rule 11: Verification levels outside 0–5 ───────────────────────────────

describe("Rule 11: Verification levels", () => {
  it("passes with valid levels 0–5", () => {
    for (const level of [0, 1, 2, 3, 4, 5]) {
      const records = [{ id: String(level), sourceQuality: level }];
      expect(checkInvalidVerificationLevels("test", records)).toHaveLength(0);
    }
  });

  it("detects level < 0", () => {
    const records = [{ id: "1", sourceQuality: -1 }];
    expect(checkInvalidVerificationLevels("test", records)).toHaveLength(1);
  });

  it("detects level > 5", () => {
    const records = [{ id: "1", sourceQuality: 6 }];
    expect(checkInvalidVerificationLevels("test", records)).toHaveLength(1);
  });

  it("detects non-integer levels", () => {
    const records = [{ id: "1", sourceQuality: 2.5 }];
    expect(checkInvalidVerificationLevels("test", records)).toHaveLength(1);
  });

  it("passes on real collections", () => {
    expect(checkInvalidVerificationLevels("evidenceItems", evidenceItems)).toHaveLength(0);
    expect(checkInvalidVerificationLevels("legalCases", legalCases)).toHaveLength(0);
  });
});

// ── Rule 12: Relationship status ───────────────────────────────────────────

describe("Rule 12: Relationship status", () => {
  it("passes with public_resource", () => {
    const records = [{ id: "1", relationshipStatus: "public_resource" }];
    expect(checkRelationshipStatus("test", records)).toHaveLength(0);
  });

  it("rejects stronger relationship statuses", () => {
    const records = [{ id: "1", relationshipStatus: "confirmed_relationship" }];
    const errors = checkRelationshipStatus("test", records);
    expect(errors).toHaveLength(1);
  });

  it("passes on real organizations", () => {
    expect(checkRelationshipStatus("organizations", organizationRecords)).toHaveLength(0);
  });
});

// ── Rule 13: Action template review ────────────────────────────────────────

describe("Rule 13: Action template review", () => {
  it("passes with non-reviewed templates", () => {
    expect(checkActionTemplateReview(actionTemplates)).toHaveLength(0);
  });

  it("detects reviewed template without sources", () => {
    const templates = [
      {
        id: "test",
        slug: "test",
        title: "Test",
        actionType: "contact_representative" as const,
        jurisdiction: "Any",
        intendedAudience: "Anyone",
        purpose: "Test",
        policyAsk: "Test",
        sourceBasis: "Test",
        instructions: "Test",
        language: "en",
        contentStatus: "reviewed" as const,
        sourceIds: [] as string[],
        version: 1,
        relatedRoutes: [] as string[],
        warnings: ["Warning"],
        active: true,
      },
    ];
    const errors = checkActionTemplateReview(templates);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("passes on real action templates (all static_preview)", () => {
    expect(checkActionTemplateReview(actionTemplates)).toHaveLength(0);
  });
});

// ── Rule 14: Evidence items reviewed without source support ────────────────

describe("Rule 14: Evidence reviewed source support", () => {
  it("passes when reviewed evidence has sources and quality ≥ 2", () => {
    const items = [
      {
        id: "test",
        slug: "test",
        title: "Test",
        summary: "Test summary",
        category: "court record" as const,
        sourceIds: ["src-1"],
        primarySourceType: "court" as const,
        sourceQuality: 5 as const,
        contentStatus: "reviewed" as const,
        version: 1,
        correctionUrl: "/corrections",
        tags: [],
        relatedRoutes: [],
      },
    ];
    const errors = checkEvidenceReviewedSourceSupport(items);
    expect(errors).toHaveLength(0);
  });

  it("detects reviewed evidence without source IDs", () => {
    const items = [
      {
        id: "test2",
        slug: "test2",
        title: "Test 2",
        summary: "Test summary",
        category: "court record" as const,
        sourceIds: [] as string[],
        primarySourceType: "court" as const,
        sourceQuality: 5 as const,
        contentStatus: "reviewed" as const,
        version: 1,
        correctionUrl: "/corrections",
        tags: [],
        relatedRoutes: [],
      },
    ];
    const errors = checkEvidenceReviewedSourceSupport(items);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("passes on real evidence items", () => {
    expect(checkEvidenceReviewedSourceSupport(evidenceItems)).toHaveLength(0);
  });
});

// ── Rule 15: Public records without correction route ───────────────────────

describe("Rule 15: Missing correction routes", () => {
  it("passes when publishable record has correctionUrl", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, correctionUrl: "/corrections" },
    ];
    expect(checkMissingCorrectionRoute("test", records)).toHaveLength(0);
  });

  it("detects publishable record without correctionUrl", () => {
    const records = [
      { id: "1", contentStatus: "review_pending" as const, correctionUrl: undefined },
    ];
    const errors = checkMissingCorrectionRoute("test", records);
    expect(errors).toHaveLength(1);
  });

  it("ignores draft records", () => {
    const records = [
      { id: "1", contentStatus: "draft" as const, correctionUrl: undefined },
    ];
    expect(checkMissingCorrectionRoute("test", records)).toHaveLength(0);
  });

  it("passes on real evidence items, organizations, and action templates", () => {
    expect(checkMissingCorrectionRoute("evidenceItems", evidenceItems)).toHaveLength(0);
    expect(checkMissingCorrectionRoute("organizations", organizationRecords)).toHaveLength(0);
    expect(checkMissingCorrectionRoute("actionTemplates", actionTemplates)).toHaveLength(0);
  });
});

// ── Rule 16: Missing route targets in relatedRoutes ────────────────────────

describe("Rule 16: Related routes", () => {
  it("passes when all routes exist", () => {
    const records = [
      { id: "1", relatedRoutes: ["/methodology", "/corrections"] },
    ];
    expect(checkRelatedRoutes("test", records, VALID_ROUTES)).toHaveLength(0);
  });

  it("detects nonexistent routes", () => {
    const records = [
      { id: "1", relatedRoutes: ["/nonexistent-page"] },
    ];
    const errors = checkRelatedRoutes("test", records, VALID_ROUTES);
    expect(errors).toHaveLength(1);
  });

  it("passes on real evidence items and action templates", () => {
    expect(checkRelatedRoutes("evidenceItems", evidenceItems, VALID_ROUTES)).toHaveLength(0);
    expect(checkRelatedRoutes("actionTemplates", actionTemplates, VALID_ROUTES)).toHaveLength(0);
  });
});

// ── Rule 17: Stale review dates ───────────────────────────────────────────

describe("Rule 17: Stale reviews", () => {
  it("passes for recently reviewed records", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, lastReviewedAt: "2026-07-01" },
    ];
    const errors = checkStaleReviews("test", records, "court record", "2026-07-13");
    expect(errors).toHaveLength(0);
  });

  it("detects stale reviews past cadence", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" as const, lastReviewedAt: "2025-06-01" },
    ];
    const errors = checkStaleReviews("test", records, "court record", "2026-07-13");
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("stale");
  });

  it("ignores non-reviewed records", () => {
    const records = [
      { id: "1", contentStatus: "review_pending" as const, lastReviewedAt: "2025-01-01" },
    ];
    expect(checkStaleReviews("test", records, "court record", "2026-07-13")).toHaveLength(0);
  });

  it("no stale reviews in real data", () => {
    const errors = [
      ...checkStaleReviews("evidenceItems", evidenceItems, "court record"),
      ...checkStaleReviews("organizations", organizationRecords, "organization"),
      ...checkStaleReviews("legalCases", legalCases, "legal case"),
    ];
    expect(errors).toHaveLength(0);
  });
});

// ── Rule 18: Source completeness ───────────────────────────────────────────

describe("Rule 18: Source completeness", () => {
  const baseSource = {
    slug: "test-source",
    status: "active" as const,
    version: 1,
    correctionUrl: "/corrections",
  };

  it("passes for complete sources", () => {
    const complete = [
      {
        ...baseSource,
        id: "test",
        title: "Test Title",
        publisher: "Test Publisher",
        sourceType: "court" as const,
        url: "https://example.com/doc",
        accessedAt: "2026-07-01",
      },
    ];
    expect(checkSourceCompleteness(complete)).toHaveLength(0);
  });

  it("detects missing publisher", () => {
    const incomplete = [
      {
        ...baseSource,
        id: "test",
        title: "Test",
        publisher: "",
        sourceType: "court" as const,
        url: "https://example.com",
        accessedAt: "2026-07-01",
      },
    ];
    const errors = checkSourceCompleteness(incomplete);
    expect(errors.some((e) => e.field === "publisher")).toBe(true);
  });

  it("detects missing title", () => {
    const incomplete = [
      {
        ...baseSource,
        id: "test",
        title: "",
        publisher: "Pub",
        sourceType: "court" as const,
        url: "https://example.com",
        accessedAt: "2026-07-01",
      },
    ];
    const errors = checkSourceCompleteness(incomplete);
    expect(errors.some((e) => e.field === "title")).toBe(true);
  });

  it("detects invalid URL", () => {
    const incomplete = [
      {
        ...baseSource,
        id: "test",
        title: "T",
        publisher: "P",
        sourceType: "court" as const,
        url: "not-a-url",
        accessedAt: "2026-07-01",
      },
    ];
    const errors = checkSourceCompleteness(incomplete);
    expect(errors.some((e) => e.field === "url")).toBe(true);
  });

  it("detects invalid source type", () => {
    const incomplete = [
      {
        ...baseSource,
        id: "test",
        title: "T",
        publisher: "P",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sourceType: "invalid" as any,
        url: "https://example.com",
        accessedAt: "2026-07-01",
      },
    ];
    const errors = checkSourceCompleteness(incomplete);
    expect(errors.some((e) => e.field === "sourceType")).toBe(true);
  });

  it("passes on real sources", () => {
    expect(checkSourceCompleteness(sources)).toHaveLength(0);
  });
});

// ── Organization-specific checks ───────────────────────────────────────────

describe("Organization reviewed source basis", () => {
  it("passes when org has website (even without sourceIds)", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test org",
        officialWebsite: "https://example.com",
        relationshipStatus: "public_resource" as const,
        contentStatus: "reviewed" as const,
        sourceIds: [] as string[],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    expect(checkOrganizationReviewedSourceBasis(orgs)).toHaveLength(0);
  });

  it("detects reviewed org without website or sources", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test org",
        officialWebsite: "",
        relationshipStatus: "public_resource" as const,
        contentStatus: "reviewed" as const,
        sourceIds: [] as string[],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    const errors = checkOrganizationReviewedSourceBasis(orgs);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("passes on real organizations", () => {
    expect(checkOrganizationReviewedSourceBasis(organizationRecords)).toHaveLength(0);
  });
});

// ── Content status validation ──────────────────────────────────────────────

describe("Content status validation", () => {
  it("passes for valid statuses", () => {
    const records = [
      { id: "1", contentStatus: "reviewed" },
      { id: "2", contentStatus: "review_pending" },
      { id: "3", status: "static_preview" },
    ];
    expect(checkContentStatuses("test", records)).toHaveLength(0);
  });

  it("detects invalid statuses", () => {
    const records = [{ id: "1", contentStatus: "not-a-status" }];
    expect(checkContentStatuses("test", records)).toHaveLength(1);
  });

  it("passes on all real collections", () => {
    expect(checkContentStatuses("evidenceItems", evidenceItems)).toHaveLength(0);
    expect(checkContentStatuses("legalCases", legalCases)).toHaveLength(0);
    expect(checkContentStatuses("organizations", organizationRecords)).toHaveLength(0);
    expect(checkContentStatuses("actionTemplates", actionTemplates)).toHaveLength(0);
    expect(checkContentStatuses("belgiumSections", belgiumSections)).toHaveLength(0);
    expect(checkContentStatuses("euInstitutions", euInstitutions)).toHaveLength(0);
    expect(checkContentStatuses("dossiers", dossiers)).toHaveLength(0);
  });
});

// ── Version validation ─────────────────────────────────────────────────────

describe("Version validation", () => {
  it("passes for version ≥ 1", () => {
    const records = [{ id: "1", version: 1 }];
    expect(checkVersions("test", records)).toHaveLength(0);
  });

  it("detects version < 1", () => {
    const records = [{ id: "1", version: 0 }];
    expect(checkVersions("test", records)).toHaveLength(1);
  });

  it("passes on all real collections with versions", () => {
    expect(checkVersions("evidenceItems", evidenceItems)).toHaveLength(0);
    expect(checkVersions("legalCases", legalCases)).toHaveLength(0);
    expect(checkVersions("organizations", organizationRecords)).toHaveLength(0);
    expect(checkVersions("actionTemplates", actionTemplates)).toHaveLength(0);
    expect(checkVersions("dossiers", dossiers)).toHaveLength(0);
  });
});

// ── Source type validation ─────────────────────────────────────────────────

describe("Source type validation", () => {
  it("passes for valid source types", () => {
    const records = [
      { id: "1", primarySourceType: "court" as const },
      { id: "2", primarySourceType: "ngo" as const },
    ];
    expect(checkInvalidSourceTypes("test", records)).toHaveLength(0);
  });

  it("detects invalid source types", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records = [{ id: "1", primarySourceType: "blog" as any }];
    expect(checkInvalidSourceTypes("test", records)).toHaveLength(1);
  });

  it("passes on real evidence items", () => {
    expect(checkInvalidSourceTypes("evidenceItems", evidenceItems)).toHaveLength(0);
  });
});

// ── Warnings are non-blocking ──────────────────────────────────────────────

describe("Warnings are non-blocking", () => {
  it("report has zero errors (warnings are OK)", () => {
    const report = validateAll();
    expect(report.errors).toHaveLength(0);
  });
});

// ── Rule 19: Organization donation domain ──────────────────────────────────

describe("Rule 19: Organization donation domain", () => {
  it("passes when donation URL is on same domain", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation for validating donation domain checks.",
        officialWebsite: "https://www.example.org/",
        officialDonationUrl: "https://www.example.org/donate",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    expect(checkOrganizationDonationDomain(orgs)).toHaveLength(0);
  });

  it("passes when donation URL is on donate.example.org subdomain", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation for validating donation domain checks with subdomains.",
        officialWebsite: "https://www.example.org/",
        officialDonationUrl: "https://donate.example.org/",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    expect(checkOrganizationDonationDomain(orgs)).toHaveLength(0);
  });

  it("warns when donation URL is on unrelated domain", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation for validating donation domain mismatch detection.",
        officialWebsite: "https://www.example.org/",
        officialDonationUrl: "https://unrelated-payment.com/donate",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    const issues = checkOrganizationDonationDomain(orgs);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((i: { severity: string }) => i.severity === "warning")).toBe(true);
  });

  it("passes on real organizations", () => {
    const issues = checkOrganizationDonationDomain(organizationRecords);
    // All donation URLs should be on the same domain as the official website
    const errors = issues.filter((i: { severity: string }) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });
});

// ── Rule 20: Organization link-check dates ─────────────────────────────────

describe("Rule 20: Organization link-check dates", () => {
  it("passes when all link-check dates are present", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation with complete link-check dates.",
        officialWebsite: "https://www.example.org/",
        officialWebsiteCheckedAt: "2026-07-24",
        officialDonationUrl: "https://www.example.org/donate",
        officialDonationUrlCheckedAt: "2026-07-24",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    expect(checkOrganizationLinkCheckDates(orgs)).toHaveLength(0);
  });

  it("detects missing website check date", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation missing its website link-check date.",
        officialWebsite: "https://www.example.org/",
        officialWebsiteCheckedAt: undefined,
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    const issues = checkOrganizationLinkCheckDates(orgs);
    expect(issues).toHaveLength(1);
    expect(issues[0].field).toBe("officialWebsiteCheckedAt");
  });

  it("detects missing donation-link check date", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation missing its donation-link check date.",
        officialWebsite: "https://www.example.org/",
        officialWebsiteCheckedAt: "2026-07-24",
        officialDonationUrl: "https://www.example.org/donate",
        officialDonationUrlCheckedAt: undefined,
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    const issues = checkOrganizationLinkCheckDates(orgs);
    expect(issues).toHaveLength(1);
    expect(issues[0].field).toBe("officialDonationUrlCheckedAt");
  });

  it("passes on real organizations", () => {
    expect(checkOrganizationLinkCheckDates(organizationRecords)).toHaveLength(0);
  });
});

// ── Rule 21: Evidence empty sources ─────────────────────────────────────────

describe("Rule 21: Evidence empty sources", () => {
  it("passes when publishable evidence has sources", () => {
    const items = [
      {
        id: "test",
        slug: "test",
        title: "Test",
        summary: "Test summary with adequate description for validation.",
        category: "court record" as const,
        sourceIds: ["src-1"],
        primarySourceType: "court" as const,
        sourceQuality: 5 as const,
        contentStatus: "review_pending" as const,
        version: 1,
        correctionUrl: "/corrections",
        tags: [],
        relatedRoutes: [],
      },
    ];
    expect(checkEvidenceEmptySources(items)).toHaveLength(0);
  });

  it("detects publishable evidence without sources", () => {
    const items = [
      {
        id: "test",
        slug: "test",
        title: "Test",
        summary: "An evidence item without any source references.",
        category: "court record" as const,
        sourceIds: [] as string[],
        primarySourceType: "court" as const,
        sourceQuality: 5 as const,
        contentStatus: "review_pending" as const,
        version: 1,
        correctionUrl: "/corrections",
        tags: [],
        relatedRoutes: [],
      },
    ];
    const issues = checkEvidenceEmptySources(items);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("passes on real evidence items", () => {
    expect(checkEvidenceEmptySources(evidenceItems)).toHaveLength(0);
  });
});

// ── Rule 22: Organization empty sources ─────────────────────────────────────

describe("Rule 22: Organization empty sources", () => {
  it("passes when org has sources or valid website", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation with source IDs and a valid website.",
        officialWebsite: "https://www.example.org/",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    expect(checkOrganizationEmptySources(orgs)).toHaveLength(0);
  });

  it("detects publishable org without sources or valid website", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation with no source basis whatsoever.",
        officialWebsite: "",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: [] as string[],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    const issues = checkOrganizationEmptySources(orgs);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("passes on real organizations", () => {
    expect(checkOrganizationEmptySources(organizationRecords)).toHaveLength(0);
  });
});

// ── Rule 23: Organization description length ────────────────────────────────

describe("Rule 23: Organization description length", () => {
  it("passes with adequate description", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A well-described organisation with a description that is sufficiently detailed to meet the minimum length requirement.",
        officialWebsite: "https://www.example.org/",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    expect(checkOrganizationDescriptionLength(orgs)).toHaveLength(0);
  });

  it("detects empty description", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "",
        officialWebsite: "https://www.example.org/",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    const issues = checkOrganizationDescriptionLength(orgs);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("detects too-short description", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "Too short.",
        officialWebsite: "https://www.example.org/",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["org-test"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    const issues = checkOrganizationDescriptionLength(orgs);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("passes on real organizations", () => {
    // All real orgs should have adequate descriptions
    const issues = checkOrganizationDescriptionLength(organizationRecords);
    const errors = issues.filter((i: { severity: string }) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });
});

// ── Rule 24: Evidence content-status vs source-quality consistency ──────────

describe("Rule 24: Evidence content-status / source-quality consistency", () => {
  it("passes when reviewed evidence has sourceQuality ≥ 2", () => {
    const items = [
      {
        id: "test",
        slug: "test",
        title: "Test",
        summary: "A properly reviewed evidence item with sufficient source quality.",
        category: "court record" as const,
        sourceIds: ["src-1"],
        primarySourceType: "court" as const,
        sourceQuality: 5 as const,
        contentStatus: "reviewed" as const,
        version: 1,
        correctionUrl: "/corrections",
        tags: [],
        relatedRoutes: [],
        lastReviewedAt: "2026-07-24",
        reviewedByRole: "Contributor",
      },
    ];
    expect(checkEvidenceContentStatusSourceQualityConsistency(items)).toHaveLength(0);
  });

  it("detects reviewed evidence with sourceQuality < 2", () => {
    const items = [
      {
        id: "test",
        slug: "test",
        title: "Test",
        summary: "An evidence item claiming review but relying on an unreviewed lead.",
        category: "court record" as const,
        sourceIds: ["src-1"],
        primarySourceType: "court" as const,
        sourceQuality: 0 as const,
        contentStatus: "reviewed" as const,
        version: 1,
        correctionUrl: "/corrections",
        tags: [],
        relatedRoutes: [],
        lastReviewedAt: "2026-07-24",
        reviewedByRole: "Contributor",
      },
    ];
    const issues = checkEvidenceContentStatusSourceQualityConsistency(items);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("passes on real evidence items", () => {
    expect(checkEvidenceContentStatusSourceQualityConsistency(evidenceItems)).toHaveLength(0);
  });
});

// ── Rule 25: Organization source status ─────────────────────────────────────

describe("Rule 25: Organization source status", () => {
  it("passes when all referenced sources are active", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation for source status validation.",
        officialWebsite: "https://www.example.org/",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["active-source"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    const sourceRecords = [
      { id: "active-source", status: "active" },
    ];
    expect(checkOrganizationSourceStatus(orgs, sourceRecords)).toHaveLength(0);
  });

  it("warns when referenced source is broken", () => {
    const orgs = [
      {
        id: "test",
        slug: "test",
        name: "Test Org",
        category: "medical" as const,
        regions: ["Global"],
        shortDescription: "A test organisation referencing a broken source record.",
        officialWebsite: "https://www.example.org/",
        relationshipStatus: "public_resource" as const,
        contentStatus: "review_pending" as const,
        sourceIds: ["broken-source"],
        version: 1,
        correctionUrl: "/corrections",
      },
    ];
    const sourceRecords = [
      { id: "broken-source", status: "broken", notes: "Link 404s" },
    ];
    const issues = checkOrganizationSourceStatus(orgs, sourceRecords);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((i: { severity: string }) => i.severity === "warning")).toBe(true);
  });

  it("passes on real organizations", () => {
    const issues = checkOrganizationSourceStatus(organizationRecords, sources);
    const errors = issues.filter((i: { severity: string }) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });
});
