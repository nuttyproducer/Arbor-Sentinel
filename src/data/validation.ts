/**
 * Static-data validation for the seed-content framework.
 *
 * Every data collection is validated at test time (runs in CI).
 * Uses the content-validation library (src/lib/content-validation/)
 * which provides 18 validation rules with Zod-backed schemas.
 *
 * Run via: npx vitest run src/data/__tests__/validation.test.ts
 *
 * This file is a backward-compatible wrapper. New code should
 * import directly from src/lib/content-validation.
 */

import { validateAll as runAllValidations } from "../lib/content-validation/validate";
import type { ValidationIssue } from "../lib/content-validation/types";

// Re-export types
export type { ValidationIssue as ValidationError } from "../lib/content-validation/types";

// Re-export individual rule functions for testing
export {
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
} from "../lib/content-validation/rules";

export interface ValidationReport {
  errors: ValidationIssue[];
  collectionsChecked: number;
  recordsChecked: number;
}

/**
 * Run all validation rules across all data collections.
 * Returns a report with errors, collection count, and record count.
 * Zero errors = valid.
 */
export function validateAll(): ValidationReport {
  const report = runAllValidations();

  // Map to backward-compatible shape
  return {
    errors: report.errors,
    collectionsChecked: report.collectionsChecked,
    recordsChecked: report.recordsChecked,
  };
}
