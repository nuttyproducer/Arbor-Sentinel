// src/lib/review/CorrectionManager.ts

import type {
  CorrectionSubmission,
  CorrectionCategory,
  CorrectionState,
  CorrectionResolution,
  ReviewType,
  PublicCorrectionEntry,
  SLATarget,
} from "./types";
import type { ReviewQueue } from "./ReviewQueue";
import {
  CORRECTION_CATEGORIES,
  type CorrectionCategoryDef,
} from "../../data/correctionCategories";

// ── Errors ──────────────────────────────────────────────────────────────────

/** Thrown when an operation targets a correction that is not in the store. */
export class CorrectionNotFoundError extends Error {
  public readonly correctionId: string;

  constructor(correctionId: string) {
    super(`Correction '${correctionId}' not found.`);
    this.name = "CorrectionNotFoundError";
    this.correctionId = correctionId;
  }
}

/** Thrown when a correction cannot move to the requested state. */
export class InvalidCorrectionStateError extends Error {
  public readonly correctionId: string;
  public readonly from: CorrectionState;
  public readonly to: CorrectionState;

  constructor(correctionId: string, from: CorrectionState, to: CorrectionState) {
    super(`Cannot transition correction '${correctionId}' from '${from}' to '${to}'.`);
    this.name = "InvalidCorrectionStateError";
    this.correctionId = correctionId;
    this.from = from;
    this.to = to;
  }
}

/** Thrown when a public submission's description contains PII. */
export class CorrectionPIIError extends Error {
  constructor() {
    super(
      "Correction submission contains personal data (email or phone number) in its description. " +
        "Describe the issue without personal information, or use the optional contact field.",
    );
    this.name = "CorrectionPIIError";
  }
}

// ── Submit input ────────────────────────────────────────────────────────────

/** Fields accepted from the public correction form. */
export type CorrectionSubmissionInput = Omit<
  CorrectionSubmission,
  "id" | "state" | "createdAt" | "updatedAt" | "isMajor"
>;

// ── ID generation ───────────────────────────────────────────────────────────

let fallbackIdCounter = 0;

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  fallbackIdCounter += 1;
  return `corr-${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}`;
}

// ── Correction state machine ────────────────────────────────────────────────

/**
 * Valid correction state transitions (from -> allowed next states). Mirrors the
 * M4.3-05 spec: `new -> under_review -> applied | rejected | disputed | archived
 * | withdrawn`, plus immediate application and pre-review withdrawal from `new`.
 * All resolved states are terminal.
 */
const VALID_CORRECTION_TRANSITIONS: Record<CorrectionState, ReadonlySet<CorrectionState>> = {
  new: new Set<CorrectionState>(["under_review", "applied", "withdrawn"]),
  under_review: new Set<CorrectionState>(["applied", "rejected", "disputed", "archived", "withdrawn"]),
  applied: new Set<CorrectionState>([]),
  rejected: new Set<CorrectionState>([]),
  disputed: new Set<CorrectionState>([]),
  archived: new Set<CorrectionState>([]),
  withdrawn: new Set<CorrectionState>([]),
};

/**
 * Terminal state reached immediately during review for non-content resolutions.
 * Content-affecting resolutions (`update` / `downgrade` / `remove`) keep the
 * correction in `under_review` until {@link CorrectionManager.apply} runs.
 */
const REVIEW_TERMINAL_STATES: Partial<Record<CorrectionResolution, CorrectionState>> = {
  dispute: "disputed",
  archive: "archived",
  withdraw: "withdrawn",
  reject: "rejected",
};

/** Fallback reviewer type for categories that require escalation but list none. */
const DEFAULT_ESCALATE_TO: Partial<Record<CorrectionCategory, ReviewType>> = {
  factual_error: "editorial",
};

/** Placeholder SLA — enqueue re-derives the real target from priority. */
const PLACEHOLDER_SLA: SLATarget = {
  targetHours: 24,
  warningThreshold: 0.75,
  overdueThreshold: 1.25,
  escalationPath: [],
};

// ── PII patterns ────────────────────────────────────────────────────────────

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_PATTERN = /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?)?\d{3}[\s.-]\d{3}[\s.-]\d{4}/;

// ── Manager ─────────────────────────────────────────────────────────────────

/**
 * Correction manager (M4.3-05).
 *
 * Owns the correction lifecycle: public submission, admin review, application,
 * escalation to the review queue, and the public correction log (major
 * corrections only; PII is never exposed).
 */
export class CorrectionManager {
  private readonly store = new Map<string, CorrectionSubmission>();

  constructor(
    private readonly queue: ReviewQueue,
    /** Injectable clock for deterministic testing. */
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** Submit a new correction request from the public form. */
  async submit(submission: CorrectionSubmissionInput): Promise<CorrectionSubmission> {
    if (!this.validateNoPII(submission.description)) {
      throw new CorrectionPIIError();
    }
    const categoryDef = this.getCategory(submission.category);
    const nowIso = this.now().toISOString();
    const correction: CorrectionSubmission = {
      ...submission,
      id: generateId(),
      state: "new",
      isMajor: categoryDef.isMajor,
      version: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    this.store.set(correction.id, correction);

    // unsafe_personal_info corrections are applied immediately — no review delay.
    if (categoryDef.id === "unsafe_personal_info") {
      return this.apply(correction.id, "system");
    }
    return correction;
  }

  /** Review a correction (admin action). */
  async review(
    id: string,
    resolution: CorrectionResolution,
    note: string,
    reviewerId: string,
  ): Promise<CorrectionSubmission> {
    const corr = this.getOrThrow(id);
    const terminalState = REVIEW_TERMINAL_STATES[resolution];
    const resolvedState = terminalState ?? "under_review";

    // Validate the full path against the state machine.
    if (corr.state === "new") {
      this.assertTransition("new", "under_review", id);
      if (resolvedState !== "under_review") {
        this.assertTransition("under_review", resolvedState, id);
      }
    } else {
      this.assertTransition(corr.state, resolvedState, id);
    }

    const nowIso = this.now().toISOString();
    let updated: CorrectionSubmission = {
      ...corr,
      state: "under_review",
      resolution,
      resolutionNote: note,
      assignedReviewer: reviewerId,
      updatedAt: nowIso,
    };

    if (terminalState) {
      updated = {
        ...updated,
        state: terminalState,
        resolvedAt: nowIso,
      };
      if (updated.isMajor) {
        updated.publicLogEntry = this.buildPublicLogEntry(updated);
      }
    }

    this.store.set(id, updated);
    return updated;
  }

  /** Apply a correction — updates target content, creates version record. */
  async apply(id: string, reviewerId: string): Promise<CorrectionSubmission> {
    const corr = this.getOrThrow(id);
    // unsafe_personal_info is applied immediately (from submit), so it may apply
    // straight from `new`; everything else must first be reviewed.
    const validFrom: CorrectionState[] =
      corr.category === "unsafe_personal_info"
        ? ["new", "under_review"]
        : ["under_review"];

    if (!validFrom.includes(corr.state)) {
      throw new InvalidCorrectionStateError(id, corr.state, "applied");
    }

    const nowIso = this.now().toISOString();
    const updated: CorrectionSubmission = {
      ...corr,
      state: "applied",
      resolution: corr.resolution ?? "update",
      assignedReviewer: corr.assignedReviewer ?? reviewerId,
      resolvedAt: nowIso,
      updatedAt: nowIso,
      version: (corr.version ?? 1) + 1,
    };
    if (updated.isMajor) {
      updated.publicLogEntry = this.buildPublicLogEntry(updated);
    }

    this.store.set(id, updated);
    return updated;
  }

  /** Get public correction log — no PII, major corrections only. */
  async getPublicLog(opts?: {
    page?: string;
    category?: CorrectionCategory;
    since?: string;
  }): Promise<PublicCorrectionEntry[]> {
    const entries: PublicCorrectionEntry[] = [];
    for (const corr of this.store.values()) {
      if (!corr.isMajor || !corr.publicLogEntry) continue;
      if (opts?.page !== undefined && corr.targetPage !== opts.page) continue;
      if (opts?.category !== undefined && corr.category !== opts.category) continue;
      if (opts?.since !== undefined && corr.createdAt < opts.since) continue;
      entries.push({
        id: corr.id,
        category: corr.category,
        targetPage: corr.targetPage,
        resolution: corr.resolution,
        summary: corr.publicLogEntry,
        createdAt: corr.createdAt,
        resolvedAt: corr.resolvedAt,
      });
    }
    return entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /** Get corrections by target page. */
  async getByTarget(page: string): Promise<CorrectionSubmission[]> {
    return [...this.store.values()]
      .filter((corr) => corr.targetPage === page)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /** Get pending corrections for review. */
  async getPending(): Promise<CorrectionSubmission[]> {
    return [...this.store.values()]
      .filter((corr) => corr.state === "new" || corr.state === "under_review")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /** Escalate a correction to the appropriate reviewer type in the review queue. */
  async escalate(id: string): Promise<void> {
    const corr = this.getOrThrow(id);
    const categoryDef = this.getCategory(corr.category);
    if (!categoryDef.requiresEscalation) return;

    const reviewType = categoryDef.escalateTo ?? DEFAULT_ESCALATE_TO[corr.category];
    if (!reviewType) return;

    await this.queue.enqueue({
      sourceContentRef: { type: "source", id: corr.id, slug: corr.targetPage },
      reviewType,
      priority: "medium",
      slaTarget: PLACEHOLDER_SLA,
      comments: [],
      checklists: [],
      assignedReviewer: corr.assignedReviewer,
    });
  }

  /** Validate that a submission contains no PII (email or phone in the description). */
  validateNoPII(description: string): boolean {
    return !EMAIL_PATTERN.test(description) && !PHONE_PATTERN.test(description);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private assertTransition(from: CorrectionState, to: CorrectionState, id: string): void {
    if (!VALID_CORRECTION_TRANSITIONS[from].has(to)) {
      throw new InvalidCorrectionStateError(id, from, to);
    }
  }

  private getOrThrow(id: string): CorrectionSubmission {
    const corr = this.store.get(id);
    if (!corr) throw new CorrectionNotFoundError(id);
    return corr;
  }

  private getCategory(category: CorrectionCategory): CorrectionCategoryDef {
    const def = CORRECTION_CATEGORIES.find((c) => c.id === category);
    if (!def) throw new Error(`Unknown correction category: ${category}`);
    return def;
  }

  /** Build a sanitized public log summary — never includes description, contact,
   * or submitter identity. */
  private buildPublicLogEntry(corr: CorrectionSubmission): string {
    const def = this.getCategory(corr.category);
    const resolution = corr.resolution ?? "update";
    return `${def.label} (${resolution}) on ${corr.targetPage}.`;
  }
}
