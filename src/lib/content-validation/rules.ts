/**
 * Content validation rules.
 *
 * Each rule receives the data collections and returns an array of
 * ValidationIssues (empty = no issues). Rules are designed to be
 * independently testable and composable.
 *
 * The 18 required validation checks:
 *  1. Duplicate IDs
 *  2. Duplicate slugs within a record type
 *  3. Invalid URLs
 *  4. Invalid or ambiguous dates
 *  5. Missing referenced source IDs
 *  6. Empty sourceIds on records that claim reviewed status
 *  7. Reviewed status without lastReviewedAt
 *  8. Reviewed status without reviewedByRole
 *  9. Reviewed status without version
 * 10. Legal status values outside the controlled vocabulary
 * 11. Verification levels outside 0–5
 * 12. Relationship status stronger than public_resource without written-confirmation metadata
 * 13. Action templates marked reviewed without jurisdiction and language review evidence
 * 14. Evidence items marked reviewed without source support
 * 15. Public records without correction route
 * 16. Missing route targets in relatedRoutes
 * 17. Records with stale review dates based on configured review cadence
 * 18. Source records missing publisher, title, URL, access date, or source type
 */

import type { ContentStatus, LegalStatus, SourceType } from "../../types/content";
import { CONTENT_STATUS_LABELS, LEGAL_STATUS_LABELS, SOURCE_TYPE_LABELS } from "../../types/content";
import type { SourceRecord } from "../../types/content";
import type { EvidenceItem } from "../../data/evidenceItems";
import type { OrganizationRecord } from "../../data/organizations";
import type { ActionTemplate } from "../../data/actionTemplates";
import type { ValidationIssue } from "./types";
import { issue, REVIEW_CADENCE } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────────

const VALID_CONTENT_STATUSES = new Set(Object.keys(CONTENT_STATUS_LABELS));
const VALID_LEGAL_STATUSES = new Set(Object.keys(LEGAL_STATUS_LABELS));
const VALID_SOURCE_TYPES = new Set(Object.keys(SOURCE_TYPE_LABELS));

function isValidUrl(url: string): boolean {
  if (!url || url.trim() === "") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Check if a date string is a range like "2024–2025". */
function isDateRange(val: string): boolean {
  return /^\d{4}\s*[–\-—]\s*\d{4}$/.test(val);
}

/** Check if a string is a valid ISO 8601 date (YYYY-MM-DD, YYYY-MM, or YYYY). */
function isIsoDate(val: string): boolean {
  return /^\d{4}(-\d{2}(-\d{2})?)?$/.test(val);
}

/** Calculate months between two date strings. */
function monthsBetween(from: string, to: string): number {
  const [y1, m1 = "01"] = from.split("-");
  const [y2, m2 = "01"] = to.split("-");
  return (Number(y2) - Number(y1)) * 12 + (Number(m2) - Number(m1));
}

// ── Rule 1: Duplicate IDs ────────────────────────────────────────────────

export function checkDuplicateIds<T extends { id: string }>(
  collection: string,
  records: T[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  for (const r of records) {
    if (seen.has(r.id)) {
      issues.push(issue(collection, r.id, "id", "Duplicate ID within collection."));
    }
    seen.add(r.id);
  }
  return issues;
}

// ── Rule 2: Duplicate slugs ──────────────────────────────────────────────

export function checkDuplicateSlugs<T extends { slug: string; id: string }>(
  collection: string,
  records: T[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, string>(); // slug → first record id
  for (const r of records) {
    if (seen.has(r.slug)) {
      issues.push(
        issue(collection, r.id, "slug", `Duplicate slug "${r.slug}" — already used by "${seen.get(r.slug)}".`),
      );
    } else {
      seen.set(r.slug, r.id);
    }
  }
  return issues;
}

// ── Rule 3: Invalid URLs ─────────────────────────────────────────────────

export function checkInvalidUrls(
  collection: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: readonly Record<string, any>[],
  urlFields: string[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    for (const field of urlFields) {
      const val = r[field];
      if (val !== undefined && val !== null && val !== "") {
        const strVal = String(val);
        if (!isValidUrl(strVal)) {
          issues.push(
            issue(collection, r.id as string, field, `Invalid or empty URL: "${strVal}".`),
          );
        }
      }
    }
  }
  return issues;
}

// ── Rule 4: Invalid or ambiguous dates ───────────────────────────────────

export function checkInvalidDates(
  collection: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: readonly Record<string, any>[],
  dateFields: string[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    for (const field of dateFields) {
      const val = r[field];
      if (val !== undefined && val !== null && val !== "") {
        const strVal = String(val);
        // Reject date ranges
        if (isDateRange(strVal)) {
          issues.push(
            issue(collection, r.id as string, field, `Date "${strVal}" is a range — must be a single ISO date (YYYY-MM-DD).`),
          );
        } else if (!isIsoDate(strVal)) {
          issues.push(
            issue(collection, r.id as string, field, `Date "${strVal}" is not a valid ISO 8601 date.`),
          );
        }
        // Warn on year-only dates (valid but imprecise)
        if (/^\d{4}$/.test(strVal)) {
          issues.push(
            issue(collection, r.id as string, field, `Date "${strVal}" is year-only — consider using YYYY-MM-DD if the exact date is known.`, "warning"),
          );
        }
      }
    }
  }
  return issues;
}

// ── Rule 5: Missing referenced source IDs ────────────────────────────────

export function checkMissingSourceRefs(
  collection: string,
  records: { id: string; sourceIds: string[] }[],
  sourceIds: Set<string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    for (const sid of r.sourceIds) {
      if (!sourceIds.has(sid)) {
        issues.push(
          issue(collection, r.id, "sourceIds", `Source "${sid}" not found in sources.ts.`),
        );
      }
    }
  }
  return issues;
}

// ── Rule 6: Empty sourceIds on reviewed records ──────────────────────────

export function checkEmptySourcesOnReviewed(
  collection: string,
  records: { id: string; contentStatus: ContentStatus; sourceIds: string[] }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (r.contentStatus === "reviewed" && r.sourceIds.length === 0) {
      issues.push(
        issue(collection, r.id, "sourceIds", "Record is reviewed but has empty sourceIds."),
      );
    }
  }
  return issues;
}

// ── Rule 7: Reviewed without lastReviewedAt ──────────────────────────────

export function checkReviewedWithoutLastReviewedAt(
  collection: string,
  records: { id: string; contentStatus: ContentStatus; lastReviewedAt?: string }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (r.contentStatus === "reviewed" && !r.lastReviewedAt) {
      issues.push(
        issue(collection, r.id, "lastReviewedAt", "Record is reviewed but lastReviewedAt is missing."),
      );
    }
  }
  return issues;
}

// ── Rule 8: Reviewed without reviewedByRole ──────────────────────────────

export function checkReviewedWithoutReviewedByRole(
  collection: string,
  records: { id: string; contentStatus: ContentStatus; reviewedByRole?: string }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (r.contentStatus === "reviewed" && !r.reviewedByRole) {
      issues.push(
        issue(collection, r.id, "reviewedByRole", "Record is reviewed but reviewedByRole is missing."),
      );
    }
  }
  return issues;
}

// ── Rule 9: Reviewed without version ─────────────────────────────────────

export function checkReviewedWithoutVersion(
  collection: string,
  records: { id: string; contentStatus: ContentStatus; version: number }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (r.contentStatus === "reviewed" && (!r.version || r.version < 1)) {
      issues.push(
        issue(collection, r.id, "version", `Record is reviewed but version is missing or invalid: ${r.version}.`),
      );
    }
  }
  return issues;
}

// ── Rule 10: Legal status values outside controlled vocabulary ───────────

export function checkInvalidLegalStatuses(
  collection: string,
  records: { id: string; legalStatuses?: LegalStatus[] }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (r.legalStatuses) {
      for (const ls of r.legalStatuses) {
        if (!VALID_LEGAL_STATUSES.has(ls)) {
          issues.push(
            issue(collection, r.id, "legalStatuses", `Invalid legal status: "${ls}".`),
          );
        }
      }
    }
  }
  return issues;
}

// ── Rule 11: Verification levels outside 0–5 ─────────────────────────────

export function checkInvalidVerificationLevels(
  collection: string,
  records: { id: string; sourceQuality: number }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (!Number.isInteger(r.sourceQuality) || r.sourceQuality < 0 || r.sourceQuality > 5) {
      issues.push(
        issue(collection, r.id, "sourceQuality", `Verification level must be 0–5, got: ${r.sourceQuality}.`),
      );
    }
  }
  return issues;
}

// ── Rule 12: Relationship status stronger than public_resource ───────────

export function checkRelationshipStatus(
  collection: string,
  records: { id: string; relationshipStatus: string }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (r.relationshipStatus !== "public_resource") {
      issues.push(
        issue(collection, r.id, "relationshipStatus",
          `Relationship status "${r.relationshipStatus}" is not valid in static beta. Only "public_resource" is supported without written confirmation.`),
      );
    }
  }
  return issues;
}

// ── Rule 13: Action templates reviewed without jurisdiction/language review ─

export function checkActionTemplateReview(
  records: ActionTemplate[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const t of records) {
    if (t.contentStatus === "reviewed") {
      // Reviewed action templates must have:
      // - sourceIds (jurisdiction/language evidence)
      // - reviewedByRole indicating legal review if template has legal implications
      // - templateReviewStatus, jurisdictionReviewStatus, and languageReviewStatus must be "reviewed" or "not_applicable"
      if (t.sourceIds.length === 0) {
        issues.push(
          issue("actionTemplates", t.id, "sourceIds",
            "Action template is reviewed but has no source IDs — jurisdiction and language review evidence is required."),
        );
      }
      if (t.templateReviewStatus !== "reviewed" && t.templateReviewStatus !== "not_applicable") {
        issues.push(
          issue("actionTemplates", t.id, "templateReviewStatus",
            `Action template is reviewed but templateReviewStatus is "${t.templateReviewStatus}" — must be "reviewed" or "not_applicable".`),
        );
      }
      if (t.jurisdictionReviewStatus !== "reviewed" && t.jurisdictionReviewStatus !== "not_applicable") {
        issues.push(
          issue("actionTemplates", t.id, "jurisdictionReviewStatus",
            `Action template is reviewed but jurisdictionReviewStatus is "${t.jurisdictionReviewStatus}" — must be "reviewed" or "not_applicable".`),
        );
      }
      if (t.languageReviewStatus !== "reviewed" && t.languageReviewStatus !== "not_applicable") {
        issues.push(
          issue("actionTemplates", t.id, "languageReviewStatus",
            `Action template is reviewed but languageReviewStatus is "${t.languageReviewStatus}" — must be "reviewed" or "not_applicable".`),
        );
      }
    }
  }
  return issues;
}

// ── Rule 14: Evidence items reviewed without source support ──────────────

export function checkEvidenceReviewedSourceSupport(
  records: EvidenceItem[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const item of records) {
    if (item.contentStatus === "reviewed") {
      if (item.sourceIds.length === 0) {
        issues.push(
          issue("evidenceItems", item.id, "sourceIds",
            "Evidence item is reviewed but has no source IDs — source support is required for reviewed evidence."),
        );
      }
      if (item.sourceQuality < 2) {
        issues.push(
          issue("evidenceItems", item.id, "sourceQuality",
            `Evidence item is reviewed but sourceQuality is ${item.sourceQuality} — reviewed evidence should be at least source-checked (level 2).`),
        );
      }
    }
  }
  return issues;
}

// ── Rule 15: Public records without correction route ─────────────────────

const PUBLISHABLE_STATUSES: Set<ContentStatus> = new Set([
  "static_preview",
  "review_pending",
  "reviewed",
  "disputed",
  "corrected",
]);

export function checkMissingCorrectionRoute(
  collection: string,
  records: { id: string; contentStatus: ContentStatus; correctionUrl?: string }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (PUBLISHABLE_STATUSES.has(r.contentStatus) && !r.correctionUrl) {
      issues.push(
        issue(collection, r.id, "correctionUrl", "Publishable record has no correction route."),
      );
    }
  }
  return issues;
}

// ── Rule 16: Missing route targets in relatedRoutes ──────────────────────

export function checkRelatedRoutes(
  collection: string,
  records: { id: string; relatedRoutes: string[] }[],
  validRoutes: Set<string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    for (const route of r.relatedRoutes) {
      if (!validRoutes.has(route)) {
        issues.push(
          issue(collection, r.id, "relatedRoutes", `Route "${route}" is not a valid platform route.`),
        );
      }
    }
  }
  return issues;
}

// ── Rule 17: Stale review dates ──────────────────────────────────────────

export function checkStaleReviews(
  collection: string,
  records: { id: string; contentStatus: ContentStatus; lastReviewedAt?: string }[],
  recordType: string,
  today: string = new Date().toISOString().slice(0, 10),
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const cadenceMonths = REVIEW_CADENCE[recordType];
  if (!cadenceMonths) return issues; // unknown type — skip

  for (const r of records) {
    if (r.contentStatus === "reviewed" && r.lastReviewedAt) {
      const months = monthsBetween(r.lastReviewedAt, today);
      if (months > cadenceMonths) {
        issues.push(
          issue(collection, r.id, "lastReviewedAt",
            `Record was reviewed ${months} months ago (cadence: ${cadenceMonths} months) — review is stale.`),
        );
      }
    }
  }
  return issues;
}

// ── Rule 18: Source records missing required fields ──────────────────────

const VALID_SOURCE_STATUSES = new Set(["active", "broken", "archived", "superseded"]);

export function checkSourceCompleteness(
  sourceRecords: SourceRecord[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const s of sourceRecords) {
    if (!s.publisher || s.publisher.trim() === "") {
      issues.push(issue("sources", s.id, "publisher", "Source record is missing publisher."));
    }
    if (!s.title || s.title.trim() === "") {
      issues.push(issue("sources", s.id, "title", "Source record is missing title."));
    }
    if (!s.url || !isValidUrl(s.url)) {
      issues.push(issue("sources", s.id, "url", `Source record has invalid or missing URL: "${s.url}".`));
    }
    if (!s.accessedAt || !isIsoDate(s.accessedAt)) {
      issues.push(issue("sources", s.id, "accessedAt", `Source record has invalid or missing access date: "${s.accessedAt}".`));
    }
    if (!s.sourceType || !VALID_SOURCE_TYPES.has(s.sourceType)) {
      issues.push(issue("sources", s.id, "sourceType", `Source record has invalid or missing source type: "${s.sourceType}".`));
    }
    if (!s.slug || s.slug.trim() === "") {
      issues.push(issue("sources", s.id, "slug", "Source record is missing slug."));
    }
    if (!s.status || !VALID_SOURCE_STATUSES.has(s.status)) {
      issues.push(issue("sources", s.id, "status", `Source record has invalid or missing status: "${s.status}".`));
    }
    if (!s.version || s.version < 1) {
      issues.push(issue("sources", s.id, "version", `Missing or invalid version: ${s.version}.`));
    }
    if (!s.correctionUrl || s.correctionUrl.trim() === "") {
      issues.push(issue("sources", s.id, "correctionUrl", "Source record is missing correction route."));
    }
  }
  return issues;
}

// ── Organization-specific: reviewed without source basis ─────────────────
// Per publication-acceptance-criteria.md, organizations can be reviewed
// with officialWebsite as the source (sourceIds may be empty). This check
// ensures reviewed orgs have at least a valid official website.

export function checkOrganizationReviewedSourceBasis(
  records: OrganizationRecord[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const org of records) {
    if (org.contentStatus === "reviewed") {
      const hasSourceIds = org.sourceIds.length > 0;
      const hasValidWebsite = isValidUrl(org.officialWebsite);
      if (!hasSourceIds && !hasValidWebsite) {
        issues.push(
          issue("organizations", org.id, "sourceIds",
            "Reviewed organization has no source IDs and no valid official website."),
        );
      }
    }
  }
  return issues;
}

// ── Generic content status check ─────────────────────────────────────────

export function checkContentStatuses(
  collection: string,
  records: { id: string; contentStatus?: string; status?: string }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    const cs = r.contentStatus ?? r.status;
    if (!cs || !VALID_CONTENT_STATUSES.has(cs)) {
      issues.push(
        issue(collection, r.id, "contentStatus", `Invalid content status: "${cs}".`),
      );
    }
  }
  return issues;
}

// ── Generic version check ────────────────────────────────────────────────

export function checkVersions(
  collection: string,
  records: { id: string; version: number }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (!r.version || r.version < 1) {
      issues.push(
        issue(collection, r.id, "version", `Missing or invalid version: ${r.version}.`),
      );
    }
  }
  return issues;
}

// ── Generic invalid source type check ────────────────────────────────────

export function checkInvalidSourceTypes(
  collection: string,
  records: { id: string; primarySourceType: SourceType }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of records) {
    if (!VALID_SOURCE_TYPES.has(r.primarySourceType)) {
      issues.push(
        issue(collection, r.id, "primarySourceType", `Invalid source type: "${r.primarySourceType}".`),
      );
    }
  }
  return issues;
}

// ── Rule 19: Organization donation URL domain check ─────────────────────

/**
 * Verify that any officialDonationUrl is on the same domain as the
 * officialWebsite, or on a known/official subdomain. This prevents
 * listing donation links that redirect to third-party payment
 * processors or unofficial mirrors.
 */
export function checkOrganizationDonationDomain(
  records: OrganizationRecord[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const org of records) {
    if (!org.officialDonationUrl) continue;

    try {
      const siteHost = new URL(org.officialWebsite).hostname.toLowerCase();
      const donationHost = new URL(org.officialDonationUrl).hostname.toLowerCase();

      // Same domain always OK
      if (siteHost === donationHost) continue;

      // Subdomain of same parent domain is OK
      const siteParts = siteHost.split(".");
      const donationParts = donationHost.split(".");
      if (siteParts.length >= 2 && donationParts.length >= 2) {
        const siteRoot = siteParts.slice(-2).join(".");
        const donationRoot = donationParts.slice(-2).join(".");
        if (siteRoot === donationRoot) continue;
      }

      // Special case: known official donation domains / platforms
      // Many organizations use donate.<domain> as a subdomain
      if (donationHost.startsWith("donate.") || donationHost.startsWith("donation.")) {
        const donationRoot = donationHost.replace(/^(donate|donation)\./, "");
        if (siteHost === donationRoot || siteHost.endsWith("." + donationRoot)) continue;
      }

      issues.push(
        issue("organizations", org.id, "officialDonationUrl",
          `Donation URL domain "${donationHost}" does not match official website domain "${siteHost}". Verify the donation link is official.`,
          "warning"),
      );
    } catch {
      // URL parse failure — covered by checkInvalidUrls
    }
  }
  return issues;
}

// ── Rule 20: Organization link-check date presence ──────────────────────

/**
 * Verify that every organization with a website has an
 * officialWebsiteCheckedAt date, and that every organization with a
 * donation URL has an officialDonationUrlCheckedAt date.
 */
export function checkOrganizationLinkCheckDates(
  records: OrganizationRecord[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const org of records) {
    if (org.officialWebsite && !org.officialWebsiteCheckedAt) {
      issues.push(
        issue("organizations", org.id, "officialWebsiteCheckedAt",
          "Organization has an official website but no link-check date."),
      );
    }
    if (org.officialDonationUrl && !org.officialDonationUrlCheckedAt) {
      issues.push(
        issue("organizations", org.id, "officialDonationUrlCheckedAt",
          "Organization has a donation URL but no donation-link-check date."),
      );
    }
  }
  return issues;
}

// ── Rule 21: Evidence item empty sourceIds ──────────────────────────────

/**
 * Every evidence item that is publicly visible (not draft) must have
 * at least one sourceId. A record with empty sourceIds cannot be
 * reviewed, source-checked, corroborated, or trusted-organization
 * verified in the public editorial sense.
 */
export function checkEvidenceEmptySources(
  records: EvidenceItem[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const item of records) {
    if (
      item.contentStatus !== "draft" &&
      item.sourceIds.length === 0
    ) {
      issues.push(
        issue("evidenceItems", item.id, "sourceIds",
          `Evidence item is ${item.contentStatus} but has empty sourceIds. Records without sources cannot be reviewed or verified.`),
      );
    }
  }
  return issues;
}

// ── Rule 22: Organization empty sourceIds ──────────────────────────────

/**
 * Every organization that is publicly visible (not draft) must have
 * at least one sourceId or a valid officialWebsite. The organization's
 * own website may serve as the primary source for directory listings.
 */
export function checkOrganizationEmptySources(
  records: OrganizationRecord[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const org of records) {
    if (
      org.contentStatus !== "draft" &&
      org.sourceIds.length === 0 &&
      !isValidUrl(org.officialWebsite)
    ) {
      issues.push(
        issue("organizations", org.id, "sourceIds",
          `Organization is ${org.contentStatus} but has empty sourceIds and no valid official website.`),
      );
    }
  }
  return issues;
}

// ── Rule 23: Organization description length ───────────────────────────

const MIN_DESCRIPTION_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Organizations must have a descriptive shortDescription of reasonable
 * length. Too-short descriptions suggest insufficient research; overly
 * long descriptions suggest editorial copy that may need splitting.
 */
export function checkOrganizationDescriptionLength(
  records: OrganizationRecord[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const org of records) {
    const len = (org.shortDescription || "").length;
    if (len === 0) {
      issues.push(
        issue("organizations", org.id, "shortDescription",
          "Organization has an empty description."),
      );
    } else if (len < MIN_DESCRIPTION_LENGTH) {
      issues.push(
        issue("organizations", org.id, "shortDescription",
          `Description is too short (${len} chars, minimum ${MIN_DESCRIPTION_LENGTH}). Broaden the summary using the organization's own public materials.`),
      );
    } else if (len > MAX_DESCRIPTION_LENGTH) {
      issues.push(
        issue("organizations", org.id, "shortDescription",
          `Description is too long (${len} chars, maximum ${MAX_DESCRIPTION_LENGTH}). Split editorial content into a separate detail section.`,
          "warning"),
      );
    }
  }
  return issues;
}

// ── Rule 24: Evidence item content-status vs source-quality consistency ─

/**
 * Evidence items marked as "reviewed" must have sourceQuality ≥ 2
 * (source-checked minimum). This prevents items that claim to be
 * reviewed but rely on unreviewed or preserved-only leads.
 */
export function checkEvidenceContentStatusSourceQualityConsistency(
  records: EvidenceItem[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const item of records) {
    if (item.contentStatus === "reviewed" && item.sourceQuality < 2) {
      issues.push(
        issue("evidenceItems", item.id, "sourceQuality",
          `Evidence item is "reviewed" but sourceQuality is ${item.sourceQuality} (${item.sourceQuality === 0 ? "Unreviewed lead" : "Preserved lead"}). Reviewed items must be at least source-checked (level 2).`),
      );
    }
  }
  return issues;
}

// ── Rule 25: Source status consistency with organization references ─────

/**
 * If an organization references a source record that has status "broken"
 * or "archived", that is a warning — the source may need updating or
 * the organization's information may be out of date.
 */
export function checkOrganizationSourceStatus(
  organizationRecords: OrganizationRecord[],
  sourceRecords: { id: string; status: string; notes?: string }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sourceStatusMap = new Map(sourceRecords.map((s) => [s.id, s.status]));

  for (const org of organizationRecords) {
    for (const sid of org.sourceIds) {
      const status = sourceStatusMap.get(sid);
      if (status === "broken") {
        issues.push(
          issue("organizations", org.id, "sourceIds",
            `Organization references source "${sid}" which is marked "broken". The organization's information may be out of date.`,
            "warning"),
        );
      }
      if (status === "archived") {
        issues.push(
          issue("organizations", org.id, "sourceIds",
            `Organization references source "${sid}" which is marked "archived". Consider updating to a current source.`,
            "warning"),
        );
      }
    }
  }
  return issues;
}
