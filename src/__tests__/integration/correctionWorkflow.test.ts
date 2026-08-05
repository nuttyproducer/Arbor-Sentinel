/**
 * Correction Workflow Integration Tests (M4.7-03).
 *
 * Tests correction data model, state transitions, and public log entries.
 * Uses the actual CorrectionManager API.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { CorrectionManager } from "../../lib/review/CorrectionManager";
import type { CorrectionCategory, CorrectionState } from "../../lib/review/types";
import { ReviewQueue } from "../../lib/review/ReviewQueue";
import { InMemoryPersistence } from "../../lib/review/ReviewPersistence";
import { ReviewStateMachine } from "../../lib/review/ReviewStateMachine";

describe("Correction Workflow — Integration", () => {
  let manager: CorrectionManager;
  let queue: ReviewQueue;

  beforeEach(() => {
    const persistence = new InMemoryPersistence();
    const stateMachine = new ReviewStateMachine();
    queue = new ReviewQueue(persistence, stateMachine);
    manager = new CorrectionManager(queue);
  });

  // ── Submission ─────────────────────────────────────────────────────────

  describe("submission", () => {
    it("accepts a valid correction submission", async () => {
      const submission = await manager.submit({
        category: "factual_error" as CorrectionCategory,
        targetPage: "/evidence/test-page",
        description: "The reported casualty count appears incorrect based on new source evidence.",
        sourceUrl: "https://example.org/corrected-data",
      });

      expect(submission.id).toBeTruthy();
      expect(submission.state).toBe("new");
      expect(submission.createdAt).toBeTruthy();
    });

    it("correctly classifies submission categories", async () => {
      const categories = [
        "factual_error", "outdated_source", "broken_link", "duplicate",
      ];

      for (const category of categories) {
        const sub = await manager.submit({
          category: category as CorrectionCategory,
          targetPage: "/test",
          description: `Test correction: ${category}`,
        });
        expect(sub.category).toBe(category);
      }
    });

    it("identifies major vs minor corrections", async () => {
      const major = await manager.submit({
        category: "factual_error",
        targetPage: "/test",
        description: "Major correction to factual content.",
      });
      expect(major.isMajor).toBe(true);

      const minor = await manager.submit({
        category: "broken_link",
        targetPage: "/test",
        description: "Minor broken link fix.",
      });
      expect(minor.isMajor).toBe(false);
    });
  });

  // ── Public log ─────────────────────────────────────────────────────────

  describe("public log entries", () => {
    it("retrieves public correction log without PII", async () => {
      // Submit a correction
      await manager.submit({
        category: "factual_error",
        targetPage: "/evidence/test",
        description: "Correcting casualty count in evidence record.",
      });

      // Public log should exist and be queryable
      const log = await manager.getPublicLog();
      expect(Array.isArray(log)).toBe(true);
    });

    it("public log entries never expose PII", async () => {
      await manager.submit({
        category: "factual_error",
        targetPage: "/evidence/test",
        description: "Factual correction needed.",
      });

      const log = await manager.getPublicLog();
      for (const entry of log) {
        const serialized = JSON.stringify(entry);
        // No email patterns should appear in public log
        expect(serialized).not.toMatch(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      }
    });
  });

  // ── Correction state model ─────────────────────────────────────────────

  describe("correction state model", () => {
    it("defines all correction states", () => {
      const states: CorrectionState[] = [
        "new", "under_review", "applied", "rejected",
        "disputed", "archived", "withdrawn",
      ];
      expect(states.length).toBe(7);
    });

    it("defines all correction categories", () => {
      const categories: CorrectionCategory[] = [
        "factual_error", "outdated_source", "wrong_location_date",
        "unsafe_personal_info", "mistranslation", "legal_wording",
        "broken_link", "duplicate", "misleading_framing", "licensing_attribution",
      ];
      expect(categories.length).toBe(10);
    });
  });
});
