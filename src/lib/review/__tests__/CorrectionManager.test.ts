// src/lib/review/__tests__/CorrectionManager.test.ts

import { describe, it, expect } from "vitest";
import {
  CorrectionManager,
  CorrectionPIIError,
  InvalidCorrectionStateError,
  type CorrectionSubmissionInput,
} from "../CorrectionManager";
import { ReviewQueue } from "../ReviewQueue";
import { InMemoryPersistence } from "../ReviewPersistence";
import { ReviewStateMachine } from "../ReviewStateMachine";

// ── Fixtures ────────────────────────────────────────────────────────────────

function makeHarness() {
  const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
  return { queue, manager: new CorrectionManager(queue) };
}

function makeInput(overrides: Partial<CorrectionSubmissionInput> = {}): CorrectionSubmissionInput {
  return {
    category: "factual_error",
    targetPage: "/evidence/icj-2024-01-26",
    description: "The ruling date is incorrect.",
    ...overrides,
  };
}

// ── submit ──────────────────────────────────────────────────────────────────

describe("CorrectionManager.submit", () => {
  it("creates a correction record in the new state", async () => {
    const { manager } = makeHarness();
    const corr = await manager.submit(makeInput());

    expect(corr.state).toBe("new");
    expect(corr.id).toBeTruthy();
    expect(corr.createdAt).toBeTruthy();
    expect(corr.updatedAt).toBeTruthy();
    expect(corr.resolution).toBeUndefined();
  });

  it("auto-detects isMajor from the category", async () => {
    const { manager } = makeHarness();
    const major = await manager.submit(makeInput({ category: "legal_wording" }));
    const minor = await manager.submit(makeInput({ category: "broken_link" }));

    expect(major.isMajor).toBe(true);
    expect(minor.isMajor).toBe(false);
  });

  it("rejects submissions whose description contains PII", async () => {
    const { manager } = makeHarness();
    await expect(
      manager.submit(makeInput({ description: "Contact me at witness@example.com" })),
    ).rejects.toBeInstanceOf(CorrectionPIIError);
  });
});

// ── review ──────────────────────────────────────────────────────────────────

describe("CorrectionManager.review", () => {
  it("transitions to a resolved state", async () => {
    const { manager } = makeHarness();
    const corr = await manager.submit(makeInput({ category: "factual_error" }));

    const reviewed = await manager.review(
      corr.id,
      "dispute",
      "Content is accurate per the court record.",
      "reviewer-1",
    );

    expect(reviewed.state).toBe("disputed");
    expect(reviewed.resolution).toBe("dispute");
    expect(reviewed.resolutionNote).toBe("Content is accurate per the court record.");
    expect(reviewed.assignedReviewer).toBe("reviewer-1");
    expect(reviewed.resolvedAt).toBeTruthy();
  });

  it("records rationale for rejected corrections", async () => {
    const { manager } = makeHarness();
    const corr = await manager.submit(makeInput({ category: "factual_error" }));

    const rejected = await manager.review(
      corr.id,
      "reject",
      "Verified against the primary source — no error found.",
      "reviewer-1",
    );

    expect(rejected.state).toBe("rejected");
    expect(rejected.resolution).toBe("reject");
    expect(rejected.resolutionNote).toBe("Verified against the primary source — no error found.");
    expect(rejected.resolvedAt).toBeTruthy();
  });

  it("keeps accepted corrections in under_review until apply", async () => {
    const { manager } = makeHarness();
    const corr = await manager.submit(makeInput());

    const reviewed = await manager.review(corr.id, "update", "Looks valid.", "reviewer-1");

    expect(reviewed.state).toBe("under_review");
    expect(reviewed.publicLogEntry).toBeUndefined();
  });

  it("throws when reviewing an already-resolved correction", async () => {
    const { manager } = makeHarness();
    const corr = await manager.submit(
      makeInput({ category: "unsafe_personal_info", description: "An address is exposed." }),
    ); // auto-applied

    await expect(manager.review(corr.id, "update", "n/a", "reviewer-1")).rejects.toBeInstanceOf(
      InvalidCorrectionStateError,
    );
  });
});

// ── apply ───────────────────────────────────────────────────────────────────

describe("CorrectionManager.apply", () => {
  it("applies the correction and creates a public log entry", async () => {
    const { manager } = makeHarness();
    const corr = await manager.submit(makeInput({ category: "factual_error" })); // major
    await manager.review(corr.id, "update", "Verified against ICJ press release.", "reviewer-1");

    const applied = await manager.apply(corr.id, "reviewer-1");

    expect(applied.state).toBe("applied");
    expect(applied.publicLogEntry).toBeTruthy();
    expect(applied.resolvedAt).toBeTruthy();
    expect(applied.version).toBe(2);

    const log = await manager.getPublicLog();
    expect(log).toHaveLength(1);
    expect(log[0].summary).toBe(applied.publicLogEntry);
  });

  it("applies unsafe_personal_info immediately on submit", async () => {
    const { manager } = makeHarness();
    const corr = await manager.submit(
      makeInput({
        category: "unsafe_personal_info",
        description: "A home address is exposed in the summary section.",
      }),
    );

    expect(corr.state).toBe("applied");
    expect(corr.publicLogEntry).toBeTruthy();
    expect(corr.resolvedAt).toBeTruthy();
  });

  it("throws when applying without a prior review", async () => {
    const { manager } = makeHarness();
    const corr = await manager.submit(makeInput({ category: "factual_error" }));

    await expect(manager.apply(corr.id, "reviewer-1")).rejects.toBeInstanceOf(
      InvalidCorrectionStateError,
    );
  });
});

// ── getPublicLog ────────────────────────────────────────────────────────────

describe("CorrectionManager.getPublicLog", () => {
  it("excludes non-major corrections", async () => {
    const { manager } = makeHarness();
    const minor = await manager.submit(makeInput({ category: "broken_link" }));
    const major = await manager.submit(makeInput({ category: "factual_error" }));

    await manager.review(minor.id, "update", "Link fixed.", "reviewer-1");
    await manager.apply(minor.id, "reviewer-1");
    await manager.review(major.id, "update", "Verified.", "reviewer-1");
    await manager.apply(major.id, "reviewer-1");

    const log = await manager.getPublicLog();
    expect(log).toHaveLength(1);
    expect(log[0].category).toBe("factual_error");
  });

  it("strips PII from entries", async () => {
    const { manager } = makeHarness();
    const corr = await manager.submit(
      makeInput({ category: "factual_error", contactInfo: "witness@example.com" }),
    );
    await manager.review(corr.id, "update", "Verified.", "reviewer-1");
    await manager.apply(corr.id, "reviewer-1");

    const log = await manager.getPublicLog();
    expect(log).toHaveLength(1);
    expect(log[0].summary).not.toContain("witness@example.com");
    expect(log[0].summary).not.toContain("example.com");
    expect(log[0].summary).not.toContain(corr.description);
  });

  it("filters by page, category, and since", async () => {
    const { manager } = makeHarness();
    const a = await manager.submit(makeInput({ targetPage: "/evidence/a", category: "factual_error" }));
    const b = await manager.submit(makeInput({ targetPage: "/evidence/b", category: "legal_wording" }));
    for (const corr of [a, b]) {
      await manager.review(corr.id, "update", "ok", "reviewer-1");
      await manager.apply(corr.id, "reviewer-1");
    }

    expect(await manager.getPublicLog({ page: "/evidence/a" })).toHaveLength(1);
    expect(await manager.getPublicLog({ category: "legal_wording" })).toHaveLength(1);
    expect(await manager.getPublicLog({ since: "2030-01-01" })).toHaveLength(0);
  });
});

// ── escalate ────────────────────────────────────────────────────────────────

describe("CorrectionManager.escalate", () => {
  it("routes to the correct reviewer type", async () => {
    const { queue, manager } = makeHarness();
    const corr = await manager.submit(makeInput({ category: "legal_wording" }));

    await manager.escalate(corr.id);

    const items = await queue.query({});
    expect(items).toHaveLength(1);
    expect(items[0].reviewType).toBe("legal");
  });

  it("does not escalate minor corrections", async () => {
    const { queue, manager } = makeHarness();
    const corr = await manager.submit(makeInput({ category: "broken_link" }));

    await manager.escalate(corr.id);

    expect(await queue.query({})).toHaveLength(0);
  });
});

// ── validateNoPII ───────────────────────────────────────────────────────────

describe("CorrectionManager.validateNoPII", () => {
  it("detects email patterns", () => {
    const { manager } = makeHarness();
    expect(manager.validateNoPII("Contact me at witness@example.com please")).toBe(false);
    expect(manager.validateNoPII("No personal data here.")).toBe(true);
  });

  it("detects phone patterns", () => {
    const { manager } = makeHarness();
    expect(manager.validateNoPII("Call 555-123-4567 for details")).toBe(false);
    expect(manager.validateNoPII("The ruling was issued on 2026-08-02.")).toBe(true);
  });
});

// ── getPending & getByTarget ────────────────────────────────────────────────

describe("CorrectionManager.getPending and getByTarget", () => {
  it("returns only unreviewed corrections", async () => {
    const { manager } = makeHarness();
    const a = await manager.submit(makeInput({ targetPage: "/evidence/a" }));
    const b = await manager.submit(makeInput({ targetPage: "/evidence/b", category: "broken_link" }));
    await manager.review(b.id, "dispute", "No issue found.", "reviewer-1");

    const pending = await manager.getPending();
    expect(pending.map((c) => c.id)).toEqual([a.id]);
  });

  it("returns corrections for a target page", async () => {
    const { manager } = makeHarness();
    await manager.submit(makeInput({ targetPage: "/evidence/x" }));
    await manager.submit(makeInput({ targetPage: "/evidence/y" }));

    const forX = await manager.getByTarget("/evidence/x");
    expect(forX).toHaveLength(1);
    expect(forX[0].targetPage).toBe("/evidence/x");
  });
});
