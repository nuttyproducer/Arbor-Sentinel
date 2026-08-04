// src/pages/review/reviewPageShared.ts

import { useCallback, useMemo, useState } from "react";
import type {
  ChecklistResult,
  ReviewChecklistResult,
  ReviewComment,
  ReviewItem,
  ReviewState,
} from "../../lib/review/types";
import { ReviewStateMachine } from "../../lib/review/ReviewStateMachine";
import type { ReviewQueue } from "../../lib/review/ReviewQueue";
import type { TranslationResult } from "../../lib/ai/stages/types";
import type { HighlightRange } from "../../components/review/SideBySideView";

/** Internal reviewer id recorded on transitions and comments. */
const REVIEWER_ID = "reviewer-admin";

export interface ReviewItemState {
  item: ReviewItem;
  checklist: ReviewChecklistResult[];
  validTransitions: ReviewState[];
  isLoading: boolean;
  handleChecklistChange: (itemId: string, result: ChecklistResult, note?: string) => void;
  handleAction: (toState: ReviewState, note?: string) => Promise<void>;
  handleNotesSave: (body: string) => Promise<void>;
}

/**
 * Shared state for a review page: the working review item, checklist results,
 * and the handlers that drive state transitions.
 *
 * When a `queue` is provided, actions are persisted through
 * `ReviewQueue.updateState` / `ReviewQueue.addComment`. Without one (the
 * pre-wiring default) the page keeps state locally so it is fully usable in
 * isolation and in tests.
 */
export function useReviewItemState(
  initialItem: ReviewItem,
  queue?: ReviewQueue,
): ReviewItemState {
  const [item, setItem] = useState<ReviewItem>(initialItem);
  const [checklist, setChecklist] = useState<ReviewChecklistResult[]>(initialItem.checklists);
  const [isLoading, setIsLoading] = useState(false);
  const stateMachine = useMemo(() => new ReviewStateMachine(), []);

  const validTransitions = useMemo(
    () => stateMachine.getValidTransitions(item.state),
    [stateMachine, item.state],
  );

  const handleChecklistChange = useCallback(
    (itemId: string, result: ChecklistResult, note?: string) => {
      setChecklist((prev) => [
        ...prev.filter((entry) => entry.itemId !== itemId),
        { itemId, result, note },
      ]);
    },
    [],
  );

  const handleAction = useCallback(
    async (toState: ReviewState, note?: string) => {
      setIsLoading(true);
      try {
        if (queue) {
          const updated = await queue.updateState(item.id, toState, {
            actor: REVIEWER_ID,
            reason: note,
          });
          setItem(updated);
        } else {
          const transition = stateMachine.transition(item.state, toState, {
            actor: REVIEWER_ID,
            reason: note,
            item: { ...item, checklists: checklist },
          });
          setItem((prev) => ({
            ...prev,
            state: toState,
            stateHistory: [...prev.stateHistory, transition],
            updatedAt: new Date().toISOString(),
          }));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [item, checklist, queue, stateMachine],
  );

  const handleNotesSave = useCallback(
    async (body: string) => {
      if (queue) {
        const comment = await queue.addComment(item.id, REVIEWER_ID, body);
        setItem((prev) => ({ ...prev, comments: [...prev.comments, comment] }));
      } else {
        const comment: ReviewComment = {
          id: `local-comment-${Date.now()}`,
          reviewItemId: item.id,
          authorId: REVIEWER_ID,
          body,
          stateAtComment: item.state,
          version: item.comments.length + 1,
          createdAt: new Date().toISOString(),
        };
        setItem((prev) => ({ ...prev, comments: [...prev.comments, comment] }));
      }
    },
    [item, queue],
  );

  return {
    item,
    checklist,
    validTransitions,
    isLoading,
    handleChecklistChange,
    handleAction,
    handleNotesSave,
  };
}

// ── AI content extraction ───────────────────────────────────────────────────

interface LegalContent {
  proposalText: string;
  sourceText: string;
}

/**
 * Extract the AI legal proposal (left panel) and the original source text
 * (right panel) from a review item's pipeline stage results. Falls back to a
 * placeholder when the stage result is absent.
 */
export function extractLegalContent(item: ReviewItem): LegalContent {
  const proposalStage = item.aiOutput?.stageResults?.["legal_proposal"] as
    | { data?: { proposalText?: string } }
    | undefined;
  const sourceStage = item.aiOutput?.stageResults?.["source"] as
    | { data?: { text?: string } }
    | undefined;

  return {
    proposalText:
      proposalStage?.data?.proposalText ?? "No AI legal proposal available for this item.",
    sourceText: sourceStage?.data?.text ?? "No source text available for this item.",
  };
}

interface TranslationContent {
  sourceText: string;
  translatedText: string;
  preservedEntities: string[];
  humanReviewed: boolean;
  confidence?: number;
  sourceLanguage?: string;
  targetLanguage?: string;
}

/**
 * Extract translation content (source text, translated text, preserved
 * entities, AI-assist flag) from the `translation` pipeline stage result.
 */
export function extractTranslationContent(item: ReviewItem): TranslationContent {
  const stage = item.aiOutput?.stageResults?.["translation"] as
    | { data?: Partial<TranslationResult> }
    | undefined;
  const data = stage?.data;

  return {
    sourceText: data?.originalText ?? "No source text available for this item.",
    translatedText: data?.translatedText ?? "No translation available for this item.",
    preservedEntities: data?.preservedEntities ?? [],
    humanReviewed: data?.humanReviewed ?? false,
    confidence: data?.confidence,
    sourceLanguage: data?.sourceLanguage,
    targetLanguage: data?.targetLanguage,
  };
}

interface EditorialContent {
  editedText: string;
  originalText: string;
}

/**
 * Extract the AI-edited content (left panel) and the original source text
 * (right panel) from a review item's pipeline stage results. Falls back to a
 * placeholder when the stage result is absent.
 */
export function extractEditorialContent(item: ReviewItem): EditorialContent {
  const editorialStage = item.aiOutput?.stageResults?.["editorial"] as
    | { data?: { editedText?: string } }
    | undefined;
  const sourceStage = item.aiOutput?.stageResults?.["source"] as
    | { data?: { text?: string } }
    | undefined;

  return {
    editedText:
      editorialStage?.data?.editedText ?? "No AI-edited content available for this item.",
    originalText: sourceStage?.data?.text ?? "No original source text available for this item.",
  };
}

// ── Country review content ──────────────────────────────────────────────────

export interface CountrySource {
  name: string;
  /** Human-readable source type, e.g. "un", "government", "eu". */
  type: string;
  /** ISO date the source was published or last updated. */
  date: string;
  /** Whether the source has been independently verified. */
  verified: boolean;
}

export interface CountryContent {
  sources: CountrySource[];
  /** Names of sources older than the freshness window. */
  staleSourceNames: string[];
  hasStaleSources: boolean;
}

/** Sources older than this window are flagged for a freshness warning. */
const SOURCE_FRESHNESS_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

function isSourceStale(dateIso: string, referenceIso: string): boolean {
  const date = new Date(dateIso).getTime();
  const reference = new Date(referenceIso).getTime();
  if (Number.isNaN(date) || Number.isNaN(reference)) return false;
  return reference - date > SOURCE_FRESHNESS_WINDOW_MS;
}

/**
 * Extract the source list for a country page and compute which sources are
 * stale relative to the item's `updatedAt` (so the freshness warning is
 * deterministic for a given item).
 */
export function extractCountryContent(item: ReviewItem): CountryContent {
  const stage = item.aiOutput?.stageResults?.["country"] as
    | { data?: { sources?: CountrySource[] } }
    | undefined;
  const sources = stage?.data?.sources ?? [];
  const referenceIso = item.updatedAt;
  const staleSourceNames = sources
    .filter((source) => isSourceStale(source.date, referenceIso))
    .map((source) => source.name);

  return {
    sources,
    staleSourceNames,
    hasStaleSources: staleSourceNames.length > 0,
  };
}

// ── Institution review content ──────────────────────────────────────────────

export type EUCompetencyType = "eu_exclusive" | "shared" | "national";

export interface CompetencyBoundary {
  area: string;
  /** Whether the institution may act in this area. */
  canAct: boolean;
  /** EU vs national vs shared competency classification. */
  competencyType: EUCompetencyType;
  detail: string;
}

export interface InstitutionContent {
  role: string;
  boundaries: CompetencyBoundary[];
}

/**
 * Extract the institutional role and competency boundaries from a review
 * item's pipeline stage results.
 */
export function extractInstitutionContent(item: ReviewItem): InstitutionContent {
  const stage = item.aiOutput?.stageResults?.["institution"] as
    | { data?: { role?: string; boundaries?: CompetencyBoundary[] } }
    | undefined;

  return {
    role: stage?.data?.role ?? "Institutional role unavailable.",
    boundaries: stage?.data?.boundaries ?? [],
  };
}

// ── Named-entity highlighting ───────────────────────────────────────────────

/**
 * Compute character ranges for every preserved entity in both panels.
 *
 * Matches on word boundaries so short tokens (e.g. "UN") do not highlight
 * substrings of larger words (e.g. "United"). Each occurrence of an entity in
 * the source maps to a `left` highlight; each occurrence in the translation
 * maps to a `right` highlight.
 */
export function buildEntityHighlights(
  sourceText: string,
  translatedText: string,
  entities: string[],
): HighlightRange[] {
  const ranges: HighlightRange[] = [];

  const findIn = (text: string, side: "left" | "right", entity: string) => {
    const needle = entity.trim();
    if (!needle) return;
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^A-Za-z0-9])(${escaped})(?=$|[^A-Za-z0-9])`, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index + match[1].length;
      ranges.push({ start, end: start + needle.length, side });
      regex.lastIndex = start + needle.length;
    }
  };

  for (const entity of entities) {
    findIn(sourceText, "left", entity);
    findIn(translatedText, "right", entity);
  }

  return ranges;
}
