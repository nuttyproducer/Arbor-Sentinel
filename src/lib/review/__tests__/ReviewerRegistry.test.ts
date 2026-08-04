// src/lib/review/__tests__/ReviewerRegistry.test.ts

import { describe, it, expect } from "vitest";
import { ReviewerRegistry, ReviewerNotFoundError } from "../ReviewerRegistry";
import type { ReviewerProfile } from "../types";

// ── Fixtures ────────────────────────────────────────────────────────────────

function makeReviewer(overrides: Partial<ReviewerProfile> = {}): ReviewerProfile {
  return {
    id: "reviewer-1",
    role: "Content Reviewer",
    expertiseAreas: ["source", "editorial"],
    contentSkills: [
      { contentType: "evidence", proficiency: 4 },
      { contentType: "source", proficiency: 3 },
    ],
    maxWorkload: 5,
    currentWorkload: 0,
    availability: "available",
    activeAssignments: [],
    completedToday: 0,
    averageReviewTimeMinutes: 90,
    languages: ["en", "fr"],
    countries: ["US", "FR"],
    institutions: [],
    ...overrides,
  };
}

function ids(reviewers: ReviewerProfile[]): string[] {
  return reviewers.map((reviewer) => reviewer.id);
}

// ── register / unregister / getById ─────────────────────────────────────────

describe("registration", () => {
  it("register adds a reviewer to the registry", () => {
    const registry = new ReviewerRegistry();
    const reviewer = makeReviewer();

    registry.register(reviewer);

    expect(registry.getById(reviewer.id)).toBe(reviewer);
  });

  it("register replaces a profile when the id is already present", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "reviewer-1", role: "Initial role" }));
    const replacement = makeReviewer({ id: "reviewer-1", role: "Replacement role" });

    registry.register(replacement);

    expect(registry.getById("reviewer-1")).toBe(replacement);
    expect(registry.getById("reviewer-1")?.role).toBe("Replacement role");
  });

  it("unregister removes the reviewer from the registry", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "reviewer-1" }));
    registry.register(makeReviewer({ id: "reviewer-2" }));

    registry.unregister("reviewer-1");

    expect(registry.getById("reviewer-1")).toBeUndefined();
    expect(registry.getById("reviewer-2")).toBeDefined();
  });

  it("unregister is a no-op for an unknown id", () => {
    const registry = new ReviewerRegistry();
    expect(() => registry.unregister("missing")).not.toThrow();
  });

  it("getById returns undefined for an unknown id", () => {
    const registry = new ReviewerRegistry();
    expect(registry.getById("missing")).toBeUndefined();
  });
});

// ── getAvailable ────────────────────────────────────────────────────────────

describe("getAvailable", () => {
  it("filters by review type", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "legal-reviewer", expertiseAreas: ["legal"] }));
    registry.register(makeReviewer({ id: "source-reviewer", expertiseAreas: ["source"] }));

    expect(ids(registry.getAvailable({ reviewType: "legal" }))).toEqual(["legal-reviewer"]);
  });

  it("filters by content type", () => {
    const registry = new ReviewerRegistry();
    registry.register(
      makeReviewer({
        id: "evidence-reviewer",
        contentSkills: [{ contentType: "evidence", proficiency: 4 }],
      }),
    );
    registry.register(
      makeReviewer({
        id: "org-reviewer",
        contentSkills: [{ contentType: "organization", proficiency: 5 }],
      }),
    );

    expect(ids(registry.getAvailable({ contentType: "evidence" }))).toEqual(["evidence-reviewer"]);
  });

  it("filters by language", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "en-reviewer", languages: ["en"] }));
    registry.register(makeReviewer({ id: "fr-reviewer", languages: ["fr", "de"] }));

    expect(ids(registry.getAvailable({ language: "fr" }))).toEqual(["fr-reviewer"]);
  });

  it("filters by country", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "us-reviewer", countries: ["US"] }));
    registry.register(makeReviewer({ id: "ke-reviewer", countries: ["KE"] }));

    expect(ids(registry.getAvailable({ country: "KE" }))).toEqual(["ke-reviewer"]);
  });

  it("excludes unavailable reviewers", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "free", availability: "available" }));
    registry.register(makeReviewer({ id: "busy", availability: "busy" }));
    registry.register(makeReviewer({ id: "away", availability: "unavailable" }));

    expect(ids(registry.getAvailable())).toEqual(["free"]);
  });

  it("excludes reviewers at or above max workload", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "full", currentWorkload: 5, maxWorkload: 5 }));
    registry.register(makeReviewer({ id: "under", currentWorkload: 4, maxWorkload: 5 }));

    expect(ids(registry.getAvailable())).toEqual(["under"]);
  });

  it("applies multiple filters together", () => {
    const registry = new ReviewerRegistry();
    registry.register(
      makeReviewer({
        id: "match",
        expertiseAreas: ["legal"],
        contentSkills: [{ contentType: "legal_case", proficiency: 5 }],
        languages: ["ar"],
        countries: ["IQ"],
      }),
    );
    registry.register(
      makeReviewer({
        id: "wrong-expertise",
        expertiseAreas: ["source"],
        contentSkills: [{ contentType: "legal_case", proficiency: 5 }],
        languages: ["ar"],
        countries: ["IQ"],
      }),
    );

    const result = registry.getAvailable({
      reviewType: "legal",
      contentType: "legal_case",
      language: "ar",
      country: "IQ",
    });

    expect(ids(result)).toEqual(["match"]);
  });
});

// ── workload ────────────────────────────────────────────────────────────────

describe("workload", () => {
  it("canAcceptMore returns false when workload is at or above max", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "full", currentWorkload: 5, maxWorkload: 5 }));
    registry.register(makeReviewer({ id: "over", currentWorkload: 6, maxWorkload: 5 }));
    registry.register(makeReviewer({ id: "under", currentWorkload: 4, maxWorkload: 5 }));

    expect(registry.canAcceptMore("full")).toBe(false);
    expect(registry.canAcceptMore("over")).toBe(false);
    expect(registry.canAcceptMore("under")).toBe(true);
  });

  it("updateWorkload correctly modifies active assignments", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "reviewer-1", currentWorkload: 2 }));

    registry.updateWorkload("reviewer-1", { assignments: 3 });

    expect(registry.getWorkload("reviewer-1").activeAssignments).toBe(5);
  });

  it("updateWorkload can also reduce the active assignment count", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "reviewer-1", currentWorkload: 3 }));

    registry.updateWorkload("reviewer-1", { assignments: -2 });

    expect(registry.getWorkload("reviewer-1").activeAssignments).toBe(1);
  });

  it("updateWorkload clamps counts at zero", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "reviewer-1", currentWorkload: 1, completedToday: 0 }));

    registry.updateWorkload("reviewer-1", { assignments: -5, completed: -1 });

    const workload = registry.getWorkload("reviewer-1");
    expect(workload.activeAssignments).toBe(0);
    expect(workload.completedToday).toBe(0);
  });

  it("tracks workload counts accurately across updates", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "reviewer-1", currentWorkload: 1, completedToday: 2 }));

    registry.updateWorkload("reviewer-1", { assignments: 2, completed: 1 });

    const workload = registry.getWorkload("reviewer-1");
    expect(workload.reviewerId).toBe("reviewer-1");
    expect(workload.activeAssignments).toBe(3);
    expect(workload.completedToday).toBe(3);
    expect(workload.averageReviewTimeMinutes).toBe(90);
    expect(workload.queueDepth).toBe(0);
  });

  it("throws ReviewerNotFoundError for workload operations on an unknown id", () => {
    const registry = new ReviewerRegistry();
    expect(() => registry.getWorkload("missing")).toThrow(ReviewerNotFoundError);
    expect(() => registry.canAcceptMore("missing")).toThrow(ReviewerNotFoundError);
    expect(() => registry.updateWorkload("missing", { assignments: 1 })).toThrow(
      ReviewerNotFoundError,
    );
  });
});

// ── setAvailability ─────────────────────────────────────────────────────────

describe("setAvailability", () => {
  it("updates the reviewer's availability status", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "reviewer-1" }));

    registry.setAvailability("reviewer-1", "busy");
    expect(registry.getById("reviewer-1")?.availability).toBe("busy");

    registry.setAvailability("reviewer-1", "available");
    expect(registry.getById("reviewer-1")?.availability).toBe("available");
  });

  it("throws ReviewerNotFoundError for an unknown id", () => {
    const registry = new ReviewerRegistry();
    expect(() => registry.setAvailability("missing", "busy")).toThrow(ReviewerNotFoundError);
  });
});

// ── expertise / content skill lookup ────────────────────────────────────────

describe("getByExpertise", () => {
  it("returns reviewers with matching expertise", () => {
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer({ id: "legal-reviewer", expertiseAreas: ["legal", "safety"] }));
    registry.register(makeReviewer({ id: "source-reviewer", expertiseAreas: ["source"] }));

    expect(ids(registry.getByExpertise("legal"))).toEqual(["legal-reviewer"]);
    expect(ids(registry.getByExpertise("safety"))).toEqual(["legal-reviewer"]);
    expect(registry.getByExpertise("translation")).toEqual([]);
  });
});

describe("getByContentSkill", () => {
  it("returns reviewers with matching content skill", () => {
    const registry = new ReviewerRegistry();
    registry.register(
      makeReviewer({
        id: "evidence-reviewer",
        contentSkills: [{ contentType: "evidence", proficiency: 4 }],
      }),
    );
    registry.register(
      makeReviewer({
        id: "source-reviewer",
        contentSkills: [{ contentType: "source", proficiency: 3 }],
      }),
    );

    expect(ids(registry.getByContentSkill("evidence"))).toEqual(["evidence-reviewer"]);
    expect(registry.getByContentSkill("country")).toEqual([]);
  });
});
