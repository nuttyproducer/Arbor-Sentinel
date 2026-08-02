// src/pages/review/mockReviewItems.ts

import type { ReviewItem, StateTransition } from "../../lib/review/types";
import type { EnqueueInput } from "../../lib/review/ReviewQueue";

/**
 * Mock review items for the LegalReviewPage and TranslationReviewPage.
 *
 * These pages are not wired to the live queue yet (M4.3-03 is the final
 * task in the milestone), so each page renders a representative item by
 * default. When the queue wiring lands, a real ReviewItem will be passed
 * via the `item` prop instead.
 */

const ASSIGNED_TRANSITION: StateTransition = {
  from: "new",
  to: "assigned",
  timestamp: "2026-08-01T09:00:00.000Z",
  actor: "system",
  reason: "Assigned for review",
};

const LEGAL_SLA_TARGET = {
  targetHours: 6,
  warningThreshold: 0.75,
  overdueThreshold: 1.25,
  escalationPath: [
    { afterHoursOverdue: 1, action: "notify_admin" as const },
    { afterHoursOverdue: 2, action: "reassign" as const },
  ],
};

const TRANSLATION_SLA_TARGET = {
  targetHours: 8,
  warningThreshold: 0.75,
  overdueThreshold: 1.25,
  escalationPath: [
    { afterHoursOverdue: 2, action: "notify_admin" as const },
    { afterHoursOverdue: 4, action: "reassign" as const },
  ],
};

export const mockLegalReviewItem: ReviewItem = {
  id: "review-legal-001",
  sourceContentRef: {
    type: "legal_case",
    id: "legal-case-icj-gaza",
    slug: "icj-provisional-measures-gaza",
  },
  aiOutput: {
    pipelineRunId: "pipeline-legal-001",
    stageResults: {
      source: {
        data: {
          text: "On 26 January 2024 the International Court of Justice issued provisional measures ordering the State of Israel to take all measures within its power to prevent acts of genocide in the Gaza Strip and to enable the provision of urgent humanitarian assistance.",
        },
      },
      legal_proposal: {
        data: {
          proposalText:
            "The International Court of Justice issued provisional measures on 26 January 2024. The Court did not make a final determination on the merits of the genocide allegation, but found a plausible risk of irreparable harm and ordered interim measures pending a final ruling.",
          legalStatus: "provisional_measures_issued",
        },
        confidence: 0.82,
      },
    },
  },
  reviewType: "legal",
  priority: "critical",
  priorityScore: 85,
  state: "assigned",
  assignedReviewer: "reviewer-legal-1",
  dueBy: "2026-08-05T12:00:00.000Z",
  comments: [],
  checklists: [],
  slaTarget: LEGAL_SLA_TARGET,
  stateHistory: [ASSIGNED_TRANSITION],
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-08-01T09:00:00.000Z",
};

export const mockTranslationReviewItem: ReviewItem = {
  id: "review-translation-001",
  sourceContentRef: {
    type: "evidence",
    id: "evidence-un-report-001",
    slug: "un-report-gaza-aug-2024",
  },
  aiOutput: {
    pipelineRunId: "pipeline-translation-001",
    stageResults: {
      translation: {
        data: {
          sourceLanguage: "ar",
          targetLanguage: "en",
          translatedText:
            "The United Nations (UN) spokesperson in Gaza said the World Health Organization (WHO) will meet in Geneva to discuss the humanitarian situation.",
          originalText:
            "قال المتحدث باسم الأمم المتحدة (UN) في غزة (Gaza) إن منظمة الصحة العالمية (WHO) ستجتمع في جنيف (Geneva) لمناقشة الوضع الإنساني.",
          confidence: 0.88,
          preservedEntities: ["UN", "Gaza", "WHO", "Geneva"],
          humanReviewed: false,
        },
      },
    },
  },
  reviewType: "translation",
  priority: "high",
  priorityScore: 65,
  state: "assigned",
  assignedReviewer: "reviewer-translation-1",
  dueBy: "2026-08-06T12:00:00.000Z",
  comments: [],
  checklists: [],
  slaTarget: TRANSLATION_SLA_TARGET,
  stateHistory: [ASSIGNED_TRANSITION],
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-08-01T09:00:00.000Z",
};

const EDITORIAL_SLA_TARGET = {
  targetHours: 4,
  warningThreshold: 0.75,
  overdueThreshold: 1.25,
  escalationPath: [
    { afterHoursOverdue: 1, action: "notify_admin" as const },
    { afterHoursOverdue: 2, action: "reassign" as const },
  ],
};

const COUNTRY_SLA_TARGET = {
  targetHours: 8,
  warningThreshold: 0.75,
  overdueThreshold: 1.25,
  escalationPath: [
    { afterHoursOverdue: 2, action: "notify_admin" as const },
    { afterHoursOverdue: 4, action: "reassign" as const },
  ],
};

const INSTITUTION_SLA_TARGET = {
  targetHours: 10,
  warningThreshold: 0.75,
  overdueThreshold: 1.25,
  escalationPath: [
    { afterHoursOverdue: 2, action: "notify_admin" as const },
    { afterHoursOverdue: 5, action: "reassign" as const },
  ],
};

export const mockEditorialReviewItem: ReviewItem = {
  id: "review-editorial-001",
  sourceContentRef: {
    type: "evidence",
    id: "evidence-gaza-briefing-001",
    slug: "gaza-humanitarian-briefing-aug-2024",
  },
  aiOutput: {
    pipelineRunId: "pipeline-editorial-001",
    stageResults: {
      source: {
        data: {
          text: "On 15 August 2024 the United Nations reported that more than 40,000 people have been killed in Gaza since October 2023. Hospitals are running out of fuel and basic medical supplies.",
        },
      },
      editorial: {
        data: {
          editedText:
            "More than 40,000 people have been killed in Gaza since October 2023, according to the United Nations. Hospitals warn they are running out of fuel and essential medical supplies as the humanitarian crisis deepens.",
        },
        confidence: 0.9,
      },
    },
  },
  reviewType: "editorial",
  priority: "high",
  priorityScore: 62,
  state: "assigned",
  assignedReviewer: "reviewer-editorial-1",
  dueBy: "2026-08-05T12:00:00.000Z",
  comments: [],
  checklists: [],
  slaTarget: EDITORIAL_SLA_TARGET,
  stateHistory: [ASSIGNED_TRANSITION],
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-08-01T09:00:00.000Z",
};

export const mockCountryReviewItem: ReviewItem = {
  id: "review-country-001",
  sourceContentRef: {
    type: "country",
    id: "country-belgium-001",
    slug: "belgium",
  },
  aiOutput: {
    pipelineRunId: "pipeline-country-001",
    stageResults: {
      country: {
        data: {
          sources: [
            {
              name: "UN General Assembly voting record",
              type: "un",
              date: "2024-12-11T00:00:00.000Z",
              verified: true,
            },
            {
              name: "Federal Ministry of Foreign Affairs statement",
              type: "government",
              date: "2023-05-20T00:00:00.000Z",
              verified: false,
            },
            {
              name: "EU Council position paper",
              type: "eu",
              date: "2026-06-10T00:00:00.000Z",
              verified: true,
            },
          ],
        },
      },
    },
  },
  reviewType: "source",
  priority: "high",
  priorityScore: 55,
  state: "assigned",
  assignedReviewer: "reviewer-country-1",
  dueBy: "2026-08-06T12:00:00.000Z",
  comments: [],
  checklists: [],
  slaTarget: COUNTRY_SLA_TARGET,
  stateHistory: [ASSIGNED_TRANSITION],
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-08-01T09:00:00.000Z",
};

export const mockInstitutionReviewItem: ReviewItem = {
  id: "review-institution-001",
  sourceContentRef: {
    type: "institution",
    id: "institution-eu-commission-001",
    slug: "european-commission",
  },
  aiOutput: {
    pipelineRunId: "pipeline-institution-001",
    stageResults: {
      institution: {
        data: {
          role: "European Commission — executive body of the European Union.",
          boundaries: [
            {
              area: "External trade",
              canAct: true,
              competencyType: "eu_exclusive",
              detail:
                "The EU has exclusive competence over the common commercial policy; the Commission negotiates trade agreements on behalf of member states.",
            },
            {
              area: "Environmental protection",
              canAct: true,
              competencyType: "shared",
              detail:
                "The EU sets minimum standards; member states may adopt more ambitious national rules where they are compatible with EU law.",
            },
            {
              area: "Direct taxation",
              canAct: false,
              competencyType: "national",
              detail:
                "Member states retain sovereignty over direct taxation; the EU may only coordinate or harmonise where unanimously agreed.",
            },
          ],
        },
      },
    },
  },
  reviewType: "competency",
  priority: "high",
  priorityScore: 58,
  state: "assigned",
  assignedReviewer: "reviewer-institution-1",
  dueBy: "2026-08-06T12:00:00.000Z",
  comments: [],
  checklists: [],
  slaTarget: INSTITUTION_SLA_TARGET,
  stateHistory: [ASSIGNED_TRANSITION],
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-08-01T09:00:00.000Z",
};

/**
 * Build an `EnqueueInput` from a full `ReviewItem` by dropping the fields the
 * queue produces itself. Used by the page tests to seed a real ReviewQueue
 * with a mock item.
 */
export function toEnqueueInput(item: ReviewItem): EnqueueInput {
  const {
    id: _id,
    priorityScore: _priorityScore,
    state: _state,
    stateHistory: _stateHistory,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...rest
  } = item;
  return rest;
}
