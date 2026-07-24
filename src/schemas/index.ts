/**
 * Zod schemas for all static-content record types.
 *
 * These schemas provide runtime validation that complements the
 * TypeScript type system. Every schema mirrors the corresponding
 * type in src/types/content.ts and the data-file interfaces.
 *
 * Schemas are used by the content-validation library and the
 * validate:content script.
 */

import { z } from "zod";

// ── Shared primitives ─────────────────────────────────────────────────────

/** ISO 8601 date: YYYY-MM-DD, YYYY-MM, or YYYY. */
const isoDatePattern = /^\d{4}(-\d{2}(-\d{2})?)?$/;

/** Date string schema — accepts YYYY-MM-DD, YYYY-MM, or YYYY. */
export const dateString = z
  .string()
  .regex(isoDatePattern, "Date must be ISO 8601 (YYYY-MM-DD, YYYY-MM, or YYYY)");

/** Date range strings like "2024–2025" are NOT valid dates. */
const dateRangePattern = /^\d{4}\s*[–\-—]\s*\d{4}$/;

/** A date that is NOT a range. Ranges like "2024–2025" are rejected. */
export const nonRangeDate = z.string().refine(
  (val) => !dateRangePattern.test(val),
  { message: "Date must be a single date, not a range like '2024–2025'" },
);

/** Full date validation: matches ISO pattern AND is not a range. */
export const validDate = z.string().refine(
  (val) => isoDatePattern.test(val) && !dateRangePattern.test(val),
  { message: "Date must be a valid ISO date (YYYY-MM-DD, YYYY-MM, or YYYY), not a range" },
);

/** A valid URL (http or https only). */
export const validUrl = z
  .string()
  .url()
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL must use http or https protocol" },
  );

/** Non-empty trimmed string. */
export const nonEmptyString = z.string().trim().min(1);

/** Slug pattern: lowercase alphanumeric with hyphens. */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const slugString = z.string().regex(slugPattern, "Slug must be lowercase alphanumeric with hyphens");

// ── Controlled vocabularies ───────────────────────────────────────────────

export const contentStatusSchema = z.enum([
  "draft",
  "static_preview",
  "review_pending",
  "reviewed",
  "disputed",
  "corrected",
  "archived",
]);

export const legalStatusSchema = z.enum([
  "court_proceeding_active",
  "provisional_measures_issued",
  "arrest_warrant_issued",
  "allegation_under_investigation",
  "un_finding",
  "ngo_legal_determination",
  "not_judicially_determined",
  "contested_claim",
  "requires_further_verification",
]);

export const verificationLevelSchema = z
  .number()
  .int()
  .min(0)
  .max(5)
  .refine((v): v is 0 | 1 | 2 | 3 | 4 | 5 => [0, 1, 2, 3, 4, 5].includes(v), {
    message: "Verification level must be an integer 0–5",
  });

export const sourceTypeSchema = z.enum([
  "court",
  "un",
  "government",
  "humanitarian",
  "ngo",
  "academic",
  "journalism",
  "osint",
]);

export const trustLevelSchema = z
  .number()
  .int()
  .min(0)
  .max(5)
  .default(0);

export const verificationMethodSchema = z
  .enum(["official", "ngo", "journalism", "academic", "osint"])
  .optional();

export const healthStatusSchema = z
  .enum(["unknown", "active", "degraded", "failed"])
  .default("unknown");

export const automationStatusSchema = z
  .enum(["manual", "scheduled", "real-time"])
  .default("manual");

export const feedConfigSchema = z.object({
  pollingIntervalMinutes: z.number().int().min(1),
  lastFetched: validDate.optional(),
}).optional();

// ── SourceRecord ──────────────────────────────────────────────────────────

export const sourceStatusSchema = z.enum([
  "active",
  "broken",
  "archived",
  "superseded",
]);

export const sourceRecordSchema = z.object({
  // ── Existing fields ──
  id: nonEmptyString,
  slug: slugString,
  title: nonEmptyString,
  publisher: nonEmptyString,
  sourceType: sourceTypeSchema,
  documentType: z.string().optional(),
  url: validUrl,
  publicationDate: z.string().optional(),
  accessedAt: validDate,
  archiveUrl: z.string().optional(),
  language: z.string().optional(),
  jurisdiction: z.string().optional(),
  authors: z.array(z.string()).optional(),
  official: z.boolean().optional(),
  status: sourceStatusSchema,
  notes: z.string().optional(),
  version: z.number().int().min(1),
  lastCheckedAt: validDate.optional(),
  correctionUrl: nonEmptyString,

  // ── Trust & Verification (new) ──
  trustLevel: trustLevelSchema,
  verificationMethod: verificationMethodSchema,

  // ── API / RSS Automation Config (new) ──
  apiEndpoint: validUrl.optional(),
  apiKeyRef: z.string().min(1).optional(),
  rssFeedUrl: validUrl.optional(),
  feedConfig: feedConfigSchema,

  // ── Licensing & Classification (new) ──
  license: z.string().optional(),
  licenseUrl: validUrl.optional(),
  region: z.string().optional(),
  category: z.string().optional(),
  reliabilityNotes: z.string().optional(),

  // ── Health & Monitoring (new) ──
  healthStatus: healthStatusSchema,
  automationStatus: automationStatusSchema,
  lastSuccessfulFetch: validDate.optional(),
  lastFailedFetch: validDate.optional(),
  failureCount: z.number().int().min(0).default(0),
  monitoringEnabled: z.boolean().default(false),
});

// ── ReviewMetadata (shared review fields) ─────────────────────────────────

export const reviewMetadataSchema = z.object({
  contentStatus: contentStatusSchema,
  sourceQuality: verificationLevelSchema.optional(),
  sourceIds: z.array(z.string()),
  legalStatuses: z.array(legalStatusSchema).optional(),
  lastReviewedAt: validDate.optional(),
  reviewedByRole: z.string().optional(),
  version: z.number().int().min(1),
  methodologyUrl: z.string().optional(),
  correctionUrl: z.string().optional(),
  reviewNotes: z.string().optional(),
});

// ── EvidenceItem ──────────────────────────────────────────────────────────

export const evidenceCategorySchema = z.enum([
  "court record",
  "official UN document",
  "humanitarian update",
  "human-rights report",
  "parliamentary document",
  "verified investigative report",
]);

export const evidenceItemSchema = z.object({
  id: nonEmptyString,
  slug: slugString,
  title: nonEmptyString,
  summary: nonEmptyString,
  category: evidenceCategorySchema,
  sourceIds: z.array(z.string()),
  primarySourceType: sourceTypeSchema,
  sourceQuality: verificationLevelSchema,
  contentStatus: contentStatusSchema,
  legalStatuses: z.array(legalStatusSchema).optional(),
  publicationDate: z.string().optional(),
  incidentDate: z.string().optional(),
  safeLocation: z.string().optional(),
  sourceLanguage: z.string().optional(),
  lastReviewedAt: validDate.optional(),
  reviewedByRole: z.string().optional(),
  version: z.number().int().min(1),
  correctionUrl: nonEmptyString,
  tags: z.array(z.string()),
  relatedRoutes: z.array(z.string()),
});

// ── LegalCaseEntry ────────────────────────────────────────────────────────

export const legalCaseEntrySchema = z.object({
  id: nonEmptyString,
  slug: slugString,
  title: nonEmptyString,
  institution: nonEmptyString,
  jurisdiction: nonEmptyString,
  parties: z.array(nonEmptyString),
  summary: nonEmptyString,
  legalStatuses: z.array(legalStatusSchema),
  openedDate: validDate.optional(),
  latestVerifiedUpdateDate: z.string().optional(),
  nextMilestone: z.string().optional(),
  legalBasisOrAllegedCrimes: z.string().optional(),
  actionRelevance: z.string().optional(),
  sourceIds: z.array(z.string()),
  sourceQuality: verificationLevelSchema,
  contentStatus: contentStatusSchema,
  lastReviewedAt: validDate.optional(),
  reviewedByRole: z.string().optional(),
  version: z.number().int().min(1),
  proceduralNote: z.string().optional(),
});

// ── OrganizationRecord ────────────────────────────────────────────────────

export const organizationCategorySchema = z.enum([
  "UN and humanitarian",
  "Red Cross / Red Crescent",
  "medical",
  "legal and human rights",
  "documentation and data",
  "journalism and press freedom",
  "academic and research",
]);

export const relationshipStatusSchema = z.enum(["public_resource"]);

export const organizationRecordSchema = z.object({
  id: nonEmptyString,
  slug: slugString,
  name: nonEmptyString,
  category: organizationCategorySchema,
  regions: z.array(nonEmptyString),
  shortDescription: nonEmptyString,
  officialWebsite: validUrl,
  officialDonationUrl: validUrl.optional().or(z.literal("")),
  services: z.array(z.string()).optional(),
  relationshipStatus: relationshipStatusSchema,
  contentStatus: contentStatusSchema,
  sourceIds: z.array(z.string()),
  lastReviewedAt: validDate.optional(),
  reviewedByRole: z.string().optional(),
  version: z.number().int().min(1),
  correctionUrl: nonEmptyString,
  reviewNotes: z.string().optional(),
});

// ── ActionTemplate ────────────────────────────────────────────────────────

export const actionTypeSchema = z.enum([
  "contact_representative",
  "arms_transfer_review",
  "humanitarian_access",
  "send_dossier",
  "submit_correction",
  "volunteer",
]);

export const actionTemplateSchema = z.object({
  id: nonEmptyString,
  slug: slugString,
  title: nonEmptyString,
  actionType: actionTypeSchema,
  jurisdiction: nonEmptyString,
  intendedAudience: nonEmptyString,
  purpose: nonEmptyString,
  policyAsk: nonEmptyString,
  sourceBasis: nonEmptyString,
  instructions: nonEmptyString,
  templateBody: z.string().optional(),
  templateReviewStatus: z.enum(["draft", "reviewed"]).optional(),
  language: nonEmptyString,
  contentStatus: contentStatusSchema,
  sourceIds: z.array(z.string()),
  lastReviewedAt: validDate.optional(),
  reviewedByRole: z.string().optional(),
  version: z.number().int().min(1),
  relatedRoutes: z.array(z.string()),
  warnings: z.array(nonEmptyString),
  active: z.boolean(),
});

// ── CountrySection ────────────────────────────────────────────────────────

export const countrySectionSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  description: nonEmptyString,
  status: contentStatusSchema,
  statusLabel: z.string().optional(),
});

// ── InstitutionEntry ──────────────────────────────────────────────────────

export const institutionEntrySchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  acronym: z.string().optional(),
  role: nonEmptyString,
  competency: nonEmptyString,
  trackingNote: nonEmptyString,
  status: contentStatusSchema,
});

// ── AttributionRecord ─────────────────────────────────────────────────────

export const attributionStatusSchema = z.enum([
  "complete",
  "review_pending",
  "disputed",
  "removed",
]);

export const attributionRecordSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  author: nonEmptyString,
  sourceName: nonEmptyString,
  sourceUrl: z.string(),
  licenseName: nonEmptyString,
  licenseUrl: validUrl,
  whereUsed: nonEmptyString,
  filePath: nonEmptyString,
  modifications: nonEmptyString,
  dateAdded: validDate,
  accessedAt: validDate,
  status: attributionStatusSchema,
  statusNote: z.string().optional(),
});

// ── Inferred types (re-export for convenience) ────────────────────────────

export type SourceRecordSchema = z.infer<typeof sourceRecordSchema>;
export type EvidenceItemSchema = z.infer<typeof evidenceItemSchema>;
export type LegalCaseEntrySchema = z.infer<typeof legalCaseEntrySchema>;
export type OrganizationRecordSchema = z.infer<typeof organizationRecordSchema>;
export type ActionTemplateSchema = z.infer<typeof actionTemplateSchema>;
export type CountrySectionSchema = z.infer<typeof countrySectionSchema>;
export type InstitutionEntrySchema = z.infer<typeof institutionEntrySchema>;
export type AttributionRecordSchema = z.infer<typeof attributionRecordSchema>;
