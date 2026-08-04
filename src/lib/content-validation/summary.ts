/**
 * Summary generator for content validation.
 *
 * Produces a machine-readable and human-readable summary of
 * content records: counts by type, by status, source-reference
 * failures, stale records, and review state.
 */

import { sources } from "../../data/sources";
import { evidenceItems } from "../../data/evidenceItems";
import { legalCases } from "../../data/legalCases";
import { belgiumSections } from "../../data/countries";
import { euInstitutions } from "../../data/institutions";
import { organizationRecords } from "../../data/organizations";
import { actionTemplates } from "../../data/actionTemplates";
import { attributionRecords } from "../../data/attributions";
import type { ContentSummary } from "./types";
import type { ValidationReport } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────────

interface RecordLike {
  id: string;
  contentStatus?: string;
  status?: string;
  sourceIds?: string[];
  lastReviewedAt?: string;
}

function getStatus(r: RecordLike): string {
  return r.contentStatus ?? r.status ?? "unknown";
}

function isReviewed(r: RecordLike): boolean {
  return getStatus(r) === "reviewed";
}

function isReviewPending(r: RecordLike): boolean {
  return getStatus(r) === "review_pending";
}

// ── Summary generator ────────────────────────────────────────────────────

export function generateSummary(report: ValidationReport): ContentSummary {
  // Records by type
  const recordsByType: Record<string, number> = {
    sources: sources.length,
    evidenceItems: evidenceItems.length,
    legalCases: legalCases.length,
    organizations: organizationRecords.length,
    actionTemplates: actionTemplates.length,
    countrySections: belgiumSections.length,
    institutionEntries: euInstitutions.length,
    attributions: attributionRecords.length,
  };

  // All records with content status
  const allRecords: { collection: string; record: RecordLike }[] = [
    ...evidenceItems.map((r) => ({ collection: "evidenceItems", record: r as RecordLike })),
    ...legalCases.map((r) => ({ collection: "legalCases", record: r as RecordLike })),
    ...organizationRecords.map((r) => ({ collection: "organizations", record: r as RecordLike })),
    ...actionTemplates.map((r) => ({ collection: "actionTemplates", record: r as RecordLike })),
    ...belgiumSections.map((r) => ({ collection: "belgiumSections", record: { ...r, contentStatus: r.status } as RecordLike })),
    ...euInstitutions.map((r) => ({ collection: "euInstitutions", record: { ...r, contentStatus: r.status } as RecordLike })),
    ...attributionRecords.map((r) => ({ collection: "attributions", record: { ...r, contentStatus: r.status } as RecordLike })),
  ];

  // Records by status
  const recordsByStatus: Record<string, number> = {};
  for (const { record } of allRecords) {
    const s = getStatus(record);
    recordsByStatus[s] = (recordsByStatus[s] ?? 0) + 1;
  }

  // Source reference failures
  const sourceReferenceFailures = report.errors.filter(
    (e) => e.field === "sourceIds" && (e.message.includes("not found") || e.message.includes("empty") || e.message.includes("no source")),
  ).length;

  // Stale records
  const staleRecords = report.issues.filter(
    (i) => i.field === "lastReviewedAt" && i.message.includes("stale"),
  ).length;

  // Reviewed and review-pending counts
  const reviewedRecords = allRecords.filter(({ record }) => isReviewed(record)).length;
  const reviewPendingRecords = allRecords.filter(({ record }) => isReviewPending(record)).length;

  // Per-collection breakdown
  const byCollection: ContentSummary["byCollection"] = {};
  const collections = new Set(allRecords.map((r) => r.collection));
  for (const col of collections) {
    const colRecords = allRecords.filter((r) => r.collection === col);
    byCollection[col] = {
      total: colRecords.length,
      reviewed: colRecords.filter(({ record }) => isReviewed(record)).length,
      reviewPending: colRecords.filter(({ record }) => isReviewPending(record)).length,
      stale: report.issues.filter(
        (i) => i.collection === col && i.field === "lastReviewedAt" && i.message.includes("stale"),
      ).length,
      sourceRefFailures: report.errors.filter(
        (i) => i.collection === col && i.field === "sourceIds" && i.message.includes("not found"),
      ).length,
    };
  }

  return {
    recordsByType,
    recordsByStatus,
    sourceReferenceFailures,
    staleRecords,
    reviewedRecords,
    reviewPendingRecords,
    byCollection,
  };
}

/** Format a summary as a human-readable string. */
export function formatSummary(summary: ContentSummary, report: ValidationReport): string {
  const lines: string[] = [];

  lines.push("═══════════════════════════════════════════════════════");
  lines.push("  CONTENT VALIDATION SUMMARY");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push("");
  lines.push(`  Records checked:  ${report.recordsChecked}`);
  lines.push(`  Collections:      ${report.collectionsChecked}`);
  lines.push(`  Errors:           ${report.errors.length}`);
  lines.push(`  Warnings:         ${report.warnings.length}`);
  lines.push(`  Status:           ${report.passed ? "✅ PASSED" : "❌ FAILED"}`);
  lines.push("");

  lines.push("── Records by type ───────────────────────────────────");
  for (const [type, count] of Object.entries(summary.recordsByType)) {
    lines.push(`  ${type.padEnd(24)} ${count}`);
  }

  lines.push("");
  lines.push("── Records by content status ─────────────────────────");
  for (const [status, count] of Object.entries(summary.recordsByStatus).sort()) {
    lines.push(`  ${status.padEnd(24)} ${count}`);
  }

  lines.push("");
  lines.push("── Review state ──────────────────────────────────────");
  lines.push(`  Reviewed:         ${summary.reviewedRecords}`);
  lines.push(`  Review pending:   ${summary.reviewPendingRecords}`);
  lines.push(`  Stale reviews:    ${summary.staleRecords}`);
  lines.push(`  Source-ref fails: ${summary.sourceReferenceFailures}`);
  lines.push("");

  lines.push("── Per-collection breakdown ──────────────────────────");
  for (const [col, breakdown] of Object.entries(summary.byCollection)) {
    lines.push(`  ${col}:`);
    lines.push(`    Total: ${breakdown.total}  Reviewed: ${breakdown.reviewed}  Review-pending: ${breakdown.reviewPending}  Stale: ${breakdown.stale}  Src-fails: ${breakdown.sourceRefFailures}`);
  }

  if (report.errors.length > 0) {
    lines.push("");
    lines.push("── Errors ────────────────────────────────────────────");
    for (const e of report.errors) {
      lines.push(`  [${e.collection}] ${e.recordId} — ${e.field}: ${e.message}`);
    }
  }

  if (report.warnings.length > 0) {
    lines.push("");
    lines.push("── Warnings ──────────────────────────────────────────");
    for (const w of report.warnings) {
      lines.push(`  [${w.collection}] ${w.recordId} — ${w.field}: ${w.message}`);
    }
  }

  lines.push("");
  lines.push("═══════════════════════════════════════════════════════");

  return lines.join("\n");
}
