/**
 * Content validation orchestrator.
 *
 * Runs all validation rules against all data collections and
 * produces a unified ValidationReport.
 */

import { sources } from "../../data/sources";
import { evidenceItems } from "../../data/evidenceItems";
import { legalCases } from "../../data/legalCases";
import { legalTimelineEvents } from "../../data/legalTimeline";
import { belgiumSections } from "../../data/countries";
import { euInstitutions } from "../../data/institutions";
import { organizationRecords } from "../../data/organizations";
import { actionTemplates } from "../../data/actionTemplates";
import { attributionRecords } from "../../data/attributions";
import { dossiers } from "../../data/dossiers";
import { routeMetadataMap } from "../../data/routeMetadata";
import type { ContentStatus } from "../../types/content";
import type { ValidationReport } from "./types";
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
} from "./rules";

// ── Build route set ───────────────────────────────────────────────────────

const VALID_ROUTES = new Set(Object.keys(routeMetadataMap));

// ── Build source ID set ───────────────────────────────────────────────────

const SOURCE_IDS = new Set(sources.map((s) => s.id));

// ── Run all validations ───────────────────────────────────────────────────

export function validateAll(): ValidationReport {
  const allIssues = [
    // ── Sources ──────────────────────────────────────────────────────────
    ...checkDuplicateIds("sources", sources),
    ...checkDuplicateSlugs("sources", sources),
    ...checkInvalidUrls("sources", sources, ["url"]),
    ...checkInvalidDates("sources", sources, ["publicationDate", "accessedAt", "lastCheckedAt"]),
    ...checkSourceCompleteness(sources),

    // ── Evidence items ──────────────────────────────────────────────────
    ...checkDuplicateIds("evidenceItems", evidenceItems),
    ...checkDuplicateSlugs("evidenceItems", evidenceItems),
    ...checkInvalidDates("evidenceItems", evidenceItems, ["publicationDate", "incidentDate", "lastReviewedAt"]),
    ...checkMissingSourceRefs("evidenceItems", evidenceItems, SOURCE_IDS),
    ...checkEmptySourcesOnReviewed("evidenceItems", evidenceItems),
    ...checkReviewedWithoutLastReviewedAt("evidenceItems", evidenceItems),
    ...checkReviewedWithoutReviewedByRole("evidenceItems", evidenceItems),
    ...checkReviewedWithoutVersion("evidenceItems", evidenceItems),
    ...checkInvalidLegalStatuses("evidenceItems", evidenceItems),
    ...checkInvalidVerificationLevels("evidenceItems", evidenceItems),
    ...checkInvalidSourceTypes("evidenceItems", evidenceItems),
    ...checkEvidenceReviewedSourceSupport(evidenceItems),
    ...checkEvidenceEmptySources(evidenceItems),
    ...checkEvidenceContentStatusSourceQualityConsistency(evidenceItems),
    ...checkMissingCorrectionRoute("evidenceItems", evidenceItems),
    ...checkRelatedRoutes("evidenceItems", evidenceItems, VALID_ROUTES),
    ...checkStaleReviews("evidenceItems", evidenceItems, "court record"),
    ...checkContentStatuses("evidenceItems", evidenceItems),
    ...checkVersions("evidenceItems", evidenceItems),

    // ── Legal cases ─────────────────────────────────────────────────────
    ...checkDuplicateIds("legalCases", legalCases),
    ...checkDuplicateSlugs("legalCases", legalCases),
    ...checkInvalidDates("legalCases", legalCases, ["openedDate", "latestVerifiedUpdateDate", "lastReviewedAt"]),
    ...checkMissingSourceRefs("legalCases", legalCases, SOURCE_IDS),
    ...checkEmptySourcesOnReviewed("legalCases", legalCases),
    ...checkReviewedWithoutLastReviewedAt("legalCases", legalCases),
    ...checkReviewedWithoutReviewedByRole("legalCases", legalCases),
    ...checkReviewedWithoutVersion("legalCases", legalCases),
    ...checkInvalidLegalStatuses("legalCases", legalCases),
    ...checkInvalidVerificationLevels("legalCases", legalCases),
    ...checkStaleReviews("legalCases", legalCases, "legal case"),
    ...checkContentStatuses("legalCases", legalCases),
    ...checkVersions("legalCases", legalCases),

    // ── Legal timeline events ────────────────────────────────────────────
    ...checkDuplicateIds("legalTimelineEvents", legalTimelineEvents),
    ...checkInvalidDates("legalTimelineEvents", legalTimelineEvents, ["date", "lastReviewedAt"]),
    ...checkMissingSourceRefs("legalTimelineEvents", legalTimelineEvents, SOURCE_IDS),
    ...checkEmptySourcesOnReviewed("legalTimelineEvents", legalTimelineEvents),
    ...checkReviewedWithoutLastReviewedAt("legalTimelineEvents", legalTimelineEvents),
    ...checkReviewedWithoutReviewedByRole("legalTimelineEvents", legalTimelineEvents),
    ...checkReviewedWithoutVersion("legalTimelineEvents", legalTimelineEvents),
    ...checkInvalidVerificationLevels("legalTimelineEvents", legalTimelineEvents),
    ...checkMissingCorrectionRoute("legalTimelineEvents", legalTimelineEvents),
    ...checkContentStatuses("legalTimelineEvents", legalTimelineEvents),
    ...checkVersions("legalTimelineEvents", legalTimelineEvents),

    // ── Organizations ───────────────────────────────────────────────────
    ...checkDuplicateIds("organizations", organizationRecords),
    ...checkDuplicateSlugs("organizations", organizationRecords),
    ...checkInvalidUrls("organizations", organizationRecords, ["officialWebsite", "officialDonationUrl"]),
    ...checkInvalidDates("organizations", organizationRecords, ["lastReviewedAt", "officialWebsiteCheckedAt", "officialDonationUrlCheckedAt"]),
    ...checkMissingSourceRefs("organizations", organizationRecords, SOURCE_IDS),
    ...checkEmptySourcesOnReviewed("organizations", organizationRecords),
    ...checkReviewedWithoutLastReviewedAt("organizations", organizationRecords),
    ...checkReviewedWithoutReviewedByRole("organizations", organizationRecords),
    ...checkReviewedWithoutVersion("organizations", organizationRecords),
    ...checkRelationshipStatus("organizations", organizationRecords),
    ...checkMissingCorrectionRoute("organizations", organizationRecords),
    ...checkStaleReviews("organizations", organizationRecords, "organization"),
    ...checkOrganizationReviewedSourceBasis(organizationRecords),
    ...checkOrganizationDonationDomain(organizationRecords),
    ...checkOrganizationLinkCheckDates(organizationRecords),
    ...checkOrganizationEmptySources(organizationRecords),
    ...checkOrganizationDescriptionLength(organizationRecords),
    ...checkOrganizationSourceStatus(organizationRecords, sources),
    ...checkContentStatuses("organizations", organizationRecords),
    ...checkVersions("organizations", organizationRecords),

    // ── Action templates ────────────────────────────────────────────────
    ...checkDuplicateIds("actionTemplates", actionTemplates),
    ...checkDuplicateSlugs("actionTemplates", actionTemplates),
    ...checkInvalidDates("actionTemplates", actionTemplates, ["lastReviewedAt"]),
    ...checkMissingSourceRefs("actionTemplates", actionTemplates, SOURCE_IDS),
    ...checkEmptySourcesOnReviewed("actionTemplates", actionTemplates),
    ...checkReviewedWithoutLastReviewedAt("actionTemplates", actionTemplates),
    ...checkReviewedWithoutReviewedByRole("actionTemplates", actionTemplates),
    ...checkReviewedWithoutVersion("actionTemplates", actionTemplates),
    ...checkActionTemplateReview(actionTemplates),
    ...checkRelatedRoutes("actionTemplates", actionTemplates, VALID_ROUTES),
    ...checkStaleReviews("actionTemplates", actionTemplates, "action template"),
    ...checkContentStatuses("actionTemplates", actionTemplates),
    ...checkVersions("actionTemplates", actionTemplates),

    // ── Country sections (Belgium) ──────────────────────────────────────
    ...checkDuplicateIds("belgiumSections", belgiumSections),
    ...checkContentStatuses("belgiumSections", belgiumSections),

    // ── EU institutions ─────────────────────────────────────────────────
    ...checkDuplicateIds("euInstitutions", euInstitutions),
    ...checkContentStatuses("euInstitutions", euInstitutions),

    // ── Attributions ────────────────────────────────────────────────────
    ...checkDuplicateIds("attributions", attributionRecords),
    ...checkInvalidUrls("attributions", attributionRecords, ["licenseUrl", "sourceUrl"]),
    ...checkInvalidDates("attributions", attributionRecords, ["dateAdded", "accessedAt"]),
    ...checkStaleReviews("attributions", attributionRecords.map((a) => ({ id: a.id, contentStatus: a.status as ContentStatus, lastReviewedAt: undefined })), "attribution"),

    // ── Dossiers ───────────────────────────────────────────────────────
    ...checkDuplicateIds("dossiers", dossiers),
    ...checkDuplicateSlugs("dossiers", dossiers),
    ...checkInvalidDates("dossiers", dossiers, ["createdAt", "lastReviewedAt"]),
    ...checkMissingSourceRefs("dossiers", dossiers, SOURCE_IDS),
    ...checkEmptySourcesOnReviewed("dossiers", dossiers),
    ...checkReviewedWithoutLastReviewedAt("dossiers", dossiers),
    ...checkReviewedWithoutReviewedByRole("dossiers", dossiers),
    ...checkReviewedWithoutVersion("dossiers", dossiers),
    ...checkMissingCorrectionRoute("dossiers", dossiers),
    ...checkContentStatuses("dossiers", dossiers),
    ...checkVersions("dossiers", dossiers),
  ];

  const errors = allIssues.filter((i) => i.severity === "error");
  const warnings = allIssues.filter((i) => i.severity === "warning");

  return {
    issues: allIssues,
    errors,
    warnings,
    collectionsChecked: 10,
    recordsChecked:
      sources.length +
      evidenceItems.length +
      legalCases.length +
      legalTimelineEvents.length +
      organizationRecords.length +
      actionTemplates.length +
      belgiumSections.length +
      euInstitutions.length +
      attributionRecords.length +
      dossiers.length,
    recordCounts: {
      sources: sources.length,
      evidenceItems: evidenceItems.length,
      legalCases: legalCases.length,
      legalTimelineEvents: legalTimelineEvents.length,
      organizations: organizationRecords.length,
      actionTemplates: actionTemplates.length,
      belgiumSections: belgiumSections.length,
      euInstitutions: euInstitutions.length,
      attributions: attributionRecords.length,
      dossiers: dossiers.length,
    },
    passed: errors.length === 0,
  };
}
