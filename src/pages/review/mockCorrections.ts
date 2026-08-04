// src/pages/review/mockCorrections.ts

import type { CorrectionSubmission } from "../../lib/review/types";
import { CorrectionManager } from "../../lib/review/CorrectionManager";
import { ReviewQueue } from "../../lib/review/ReviewQueue";
import { InMemoryPersistence } from "../../lib/review/ReviewPersistence";
import { ReviewStateMachine } from "../../lib/review/ReviewStateMachine";

let mockCounter = 0;

/**
 * Build a CorrectionSubmission with sensible defaults for the correction UI.
 * Overrides win; the default mirrors a submitted factual-error correction.
 */
export function makeCorrection(
  overrides: Partial<CorrectionSubmission> = {},
): CorrectionSubmission {
  mockCounter += 1;
  return {
    id: `corr-mock-${mockCounter}`,
    category: "factual_error",
    targetPage: "/evidence/icj-2024-01-26",
    description:
      "The ruling date is listed as 27 January 2024; the ICJ issued provisional measures on 26 January 2024.",
    state: "new",
    isMajor: true,
    version: 1,
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
    ...overrides,
  };
}

/**
 * Representative corrections for the CorrectionReviewPage default render.
 * Four are pending (new / under_review) and one is already applied — the page
 * filters to pending for the queue, so the applied entry demonstrates that
 * resolved corrections drop out of the list.
 */
export const MOCK_CORRECTIONS: CorrectionSubmission[] = [
  makeCorrection({
    id: "corr-factual-001",
    category: "factual_error",
    targetPage: "/evidence/icj-2024-01-26",
    targetSection: "Ruling date",
    description:
      "The ruling date is listed as 27 January 2024; the ICJ issued provisional measures on 26 January 2024.",
    sourceUrl: "https://www.icj-cij.org/case/192",
  }),
  makeCorrection({
    id: "corr-broken-link-001",
    category: "broken_link",
    targetPage: "/evidence/icj-2024-01-26",
    description: "The citation link to the ICJ press release returns 404.",
    isMajor: false,
  }),
  makeCorrection({
    id: "corr-legal-001",
    category: "legal_wording",
    targetPage: "/legal/icj-gaza",
    description: "The page describes the ICJ order as a final judgment; it is provisional measures.",
    state: "under_review",
    resolution: "update",
    resolutionNote: "Awaiting content edit.",
    assignedReviewer: "reviewer-admin",
    createdAt: "2026-07-30T14:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z",
  }),
  makeCorrection({
    id: "corr-outdated-001",
    category: "outdated_source",
    targetPage: "/evidence/icj-2024-01-26",
    description: "The source is from 2023 and no longer reflects the current ICJ status.",
    state: "under_review",
    resolution: "update",
    resolutionNote: "Awaiting content edit.",
    assignedReviewer: "reviewer-admin",
    isMajor: false,
    createdAt: "2026-07-29T10:00:00.000Z",
    updatedAt: "2026-08-01T08:30:00.000Z",
  }),
  makeCorrection({
    id: "corr-duplicate-001",
    category: "duplicate",
    targetPage: "/evidence/icj-2024-01-26",
    description: "This record duplicates another evidence entry.",
    state: "applied",
    resolution: "update",
    resolvedAt: "2026-07-28T12:00:00.000Z",
    isMajor: false,
    version: 2,
    createdAt: "2026-07-27T09:00:00.000Z",
    updatedAt: "2026-07-28T12:00:00.000Z",
  }),
];

/**
 * Build a CorrectionManager seeded with the given corrections via the public
 * submit/review/apply API, so page tests exercise the real manager.
 */
export async function createSeededCorrectionManager(
  corrections: CorrectionSubmission[] = MOCK_CORRECTIONS,
): Promise<CorrectionManager> {
  const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
  const manager = new CorrectionManager(queue);
  for (const c of corrections) {
    const submitted = await manager.submit({
      category: c.category,
      targetPage: c.targetPage,
      targetSection: c.targetSection,
      description: c.description,
      sourceUrl: c.sourceUrl,
      contactInfo: c.contactInfo,
    });
    if (c.state === "under_review" && c.resolution) {
      await manager.review(
        submitted.id,
        c.resolution,
        c.resolutionNote ?? "Awaiting review.",
        "reviewer-admin",
      );
    } else if (c.state === "applied" && c.resolution) {
      await manager.review(
        submitted.id,
        c.resolution,
        c.resolutionNote ?? "Reviewed.",
        "reviewer-admin",
      );
      await manager.apply(submitted.id, "reviewer-admin");
    }
  }
  return manager;
}
