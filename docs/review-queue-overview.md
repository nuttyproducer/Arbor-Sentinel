# Review Queue System — Architecture & Usage

**Status:** Active — implements the M4.3 review queue system.
**Last updated:** 2026-08-03
**Version:** 0.1.0

---

## Architecture

The review queue system processes AI pipeline outputs (M4.2) through structured human review. It has three layers:

### 1. Core (M4.3-01)

| Module | File | Responsibility |
|--------|------|----------------|
| Types | `src/lib/review/types.ts` | All type definitions: ReviewItem, ReviewState, ReviewerProfile, CorrectionSubmission, etc. |
| Schemas | `src/lib/review/schemas.ts` | Zod validation schemas for all review types |
| State Machine | `src/lib/review/ReviewStateMachine.ts` | Validates state transitions with guard conditions |
| Priority | `src/lib/review/ReviewPriority.ts` | Calculates priority scores based on content risk, source type, contradictions, hallucinations |
| Queue | `src/lib/review/ReviewQueue.ts` | Priority-ordered queue with enqueue/dequeue/update operations |
| Persistence | `src/lib/review/ReviewPersistence.ts` | Storage interface with in-memory and localStorage implementations |

### 2. Assignment & SLA (M4.3-02)

| Module | File | Responsibility |
|--------|------|----------------|
| Registry | `src/lib/review/ReviewerRegistry.ts` | Reviewer profiles, expertise, workload tracking |
| Router | `src/lib/review/AssignmentRouter.ts` | Four assignment strategies: round-robin, expertise, load-balanced, manual |
| SLA | `src/lib/review/SLATracker.ts` | SLA monitoring with warning/overdue/breached detection and escalation |

### 3. Review Interfaces (M4.3-03/04)

| Type | Page | Checklist |
|------|------|-----------|
| Legal | `src/pages/review/LegalReviewPage.tsx` | 8 items: terminology, attribution, labeling, boundaries |
| Translation | `src/pages/review/TranslationReviewPage.tsx` | 8 items: accuracy, fluency, cultural context |
| Editorial | `src/pages/review/EditorialReviewPage.tsx` | 8 items: tone, evidence, audience, safety |
| Country | `src/pages/review/CountryReviewPage.tsx` | 9 items: position, UN voting, arms, aid, ICC/ICJ |
| Institution | `src/pages/review/InstitutionReviewPage.tsx` | 7 items: role, competency, EU distinctions |

**Shared components** in `src/components/review/`:
- `SideBySideView` — resizable two-panel comparison
- `ReviewChecklist` — pass/fail/na toggle per item
- `ReviewActions` — state transition buttons with guards
- `ReviewHistory` — timeline of state changes and comments
- `ReviewNotes` — PII-aware notes editor
- `ReviewSummary` — aggregated checklist results

### 4. Correction Workflow (M4.3-05)

| Module | File | Responsibility |
|--------|------|----------------|
| Categories | `src/data/correctionCategories.ts` | 10 correction categories with urgency and escalation rules |
| Manager | `src/lib/review/CorrectionManager.ts` | Submit → review → apply/reject workflow, public log |
| UI | `src/pages/review/CorrectionReviewPage.tsx` | Admin correction review interface |

---

## State Machine

```
new → assigned → in_review → {approved, changes_requested}
changes_requested → in_review
approved → published → archived
any → rejected → archived
```

**Guard conditions:**
- `new → assigned`: must have a reviewer assigned
- `in_review → approved`: all required checklist items must pass
- `changes_requested → in_review`: must have at least one change-request comment
- `approved → published`: must have at least one approval in history

---

## Priority System

Priority score (0-100) = content risk weight + source type weight + bonuses.

**Content risk weights:** legal (40), casualty (35), testimony (25), humanitarian (20), general (10)

**Source type weights:** court (30), UN (25), NGO (15), media (10)

**Bonuses:** contradictions (+15), hallucinations (+20)

**Score bands:** critical ≥ 80, high ≥ 60, medium ≥ 30, low < 30

---

## Assignment Strategies

1. **Round-robin:** Cycles through available reviewers per review type
2. **Expertise:** Scores reviewers by matching expertise, content skills, language, and country
3. **Load-balanced:** Picks the least-loaded available reviewer
4. **Manual:** Direct assignment with capacity validation

All strategies respect workload caps. `getAvailable()` excludes at-capacity reviewers.

---

## Correction Workflow

```
correction received (public form)
→ triage urgency (immediate/high/normal)
→ PII validation
→ auto-apply if unsafe_personal_info
→ assign reviewer (if escalation needed)
→ review → apply/reject/dispute/archive
→ public log for major corrections (no PII)
```

**Major correction categories** (always publicly logged): unsafe_personal_info, factual_error, legal_wording, mistranslation, misleading_framing

**Minor corrections** (logged internally): outdated_source, wrong_location_date, broken_link, duplicate, licensing_attribution

---

## Integration with AI Pipeline

The review queue receives `AIProcessedContent` from the AI pipeline (M4.2). Each review item references:
- `sourceContentRef`: the content record being reviewed
- `aiOutput.pipelineRunId`: the specific pipeline run that produced the AI output
- `aiOutput.stageResults`: individual stage results for review

Review items are created when AI pipeline outputs need human verification. High-risk content (legal, casualty) and content with contradiction or hallucination flags receive higher priority.

---

## Usage

```typescript
import {
  ReviewQueue,
  InMemoryPersistence,
  ReviewStateMachine,
  AssignmentRouter,
  ReviewerRegistry,
  SLATracker,
  CorrectionManager,
  calculatePriority,
} from "../lib/review";

// Create the queue
const persistence = new InMemoryPersistence();
const stateMachine = new ReviewStateMachine();
const queue = new ReviewQueue(persistence, stateMachine);

// Enqueue an item
const item = await queue.enqueue({
  sourceContentRef: { type: "evidence", id: "ev-001", slug: "some-evidence" },
  reviewType: "legal",
  // ... other required fields
});

// Assign a reviewer
const registry = new ReviewerRegistry();
registry.register({ id: "rev-1", role: "Legal Reviewer", /* ... */ });
const router = new AssignmentRouter(registry, queue);
await router.assign(item, "expertise");

// Track SLA
const slaTracker = new SLATracker();
slaTracker.track(item);

// Submit a correction
const correctionManager = new CorrectionManager(queue);
await correctionManager.submit({
  category: "factual_error",
  targetPage: "/countries/belgium",
  description: "Incorrect voting record date",
});
```

---

## Testing

```bash
# All review tests
npx vitest run src/lib/review src/components/review src/pages/review

# Specific modules
npx vitest run src/lib/review/__tests__/ReviewQueue.test.ts
npx vitest run src/lib/review/__tests__/CorrectionManager.test.ts
```
