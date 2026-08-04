// src/lib/ai/stages/TimelineExtractor.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { TimelineEvent, DatePrecision } from "./types";

const timelineSchema = z.object({
  events: z.array(z.object({
    description: z.string(),
    date: z.string(),
    datePrecision: z.enum(["exact", "month", "year", "range", "ambiguous"]),
    originalDateText: z.string(),
    endDate: z.string().optional(),
    isApproximate: z.boolean(),
    confidence: z.number().min(0).max(1),
    startChar: z.number(),
    endChar: z.number(),
    linkedEntityNames: z.array(z.string()),
    isUndated: z.boolean(),
  })),
});

const PROMPT = {
  system: `You are a timeline extraction expert. Extract dated events from text. Never fabricate dates beyond what the source provides. Return JSON only.`,
  user: `Extract all dated events from the following text. For each event:

- description: what happened
- date: ISO format (best available precision: YYYY-MM-DD, YYYY-MM, or YYYY)
- datePrecision: exact/month/year/range/ambiguous
- originalDateText: the date text as written in the source
- endDate: for date ranges (ISO format)
- isApproximate: true for "early 2024", "recently", "last week"
- confidence: 0-1
- startChar/endChar: character positions of the date mention
- linkedEntityNames: entities involved in this event
- isUndated: true if the event has no date

Rules:
- NEVER fabricate or estimate dates beyond what the source provides
- Undated events must be clearly labeled as such
- Approximate dates must include the precision level
- Multiple conflicting date sources must be preserved as alternatives
- For relative dates ("last week", "yesterday"): resolve to approximate absolute dates and flag as approximate

Text:
{{text}}`,
};

let eventCounter = 0;

/**
 * Extracts dated events from text with precision classification
 * (exact/month/year/range/ambiguous). Sequences chronologically.
 * Flags undated and approximate events. Never fabricates dates
 * beyond what the source provides.
 */
export const timelineExtractorStage = createStage({
  name: "timeline_extraction",
  requires: [],
  run: async (input, _context, provider: AIProvider): Promise<AIOperationResult<TimelineEvent[]>> => {
    const handler = new StructuredOutputHandler();
    const prompt = { system: PROMPT.system, user: PROMPT.user.replace("{{text}}", input.body) };
    const result = await handler.extract(provider, prompt, timelineSchema);

    if (result.data) {
      const events: TimelineEvent[] = result.data.events.map((e) => {
        eventCounter++;
        return {
          id: `timeline_event_${eventCounter}`,
          description: e.description,
          date: e.date,
          datePrecision: e.datePrecision as DatePrecision,
          originalDateText: e.originalDateText,
          endDate: e.endDate,
          isApproximate: e.isApproximate,
          confidence: Math.min(e.confidence, 1),
          linkedEntityIds: [],
          linkedClaimIds: [],
          sourceSpan: { sourceId: input.url, start: e.startChar, end: e.endChar, excerpt: input.body.slice(e.startChar, e.endChar) },
          isUndated: e.isUndated,
        };
      });

      // Sort chronologically
      events.sort((a, b) => a.date.localeCompare(b.date));

      return { ...result, data: events };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
