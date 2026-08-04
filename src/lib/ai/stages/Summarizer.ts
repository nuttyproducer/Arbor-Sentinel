// src/lib/ai/stages/Summarizer.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult, SourceSpan } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { SummaryResult, FactExtraction, SummaryType } from "./types";

const summarySchema = z.object({
  summary: z.string(),
  preservedAmbiguities: z.array(z.string()).optional(),
  sourceReferences: z.array(z.object({
    text: z.string(),
    startChar: z.number(),
    endChar: z.number(),
  })),
  facts: z.array(z.object({
    fact: z.string(),
    category: z.enum(["number", "named_entity", "legal_finding", "policy_position", "humanitarian_metric", "date"]),
    confidence: z.number().min(0).max(1),
    startChar: z.number(),
    endChar: z.number(),
    numericValue: z.number().optional(),
    unit: z.string().optional(),
  })),
});

const PROMPTS: Record<SummaryType, { system: string; user: string }> = {
  brief: {
    system: `You are a neutral fact summarizer. Produce a 1-2 sentence summary. Never add information not present in the source. Preserve ambiguity from the source. Return JSON only.`,
    user: `Summarize the following text in 1-2 sentences. Extract all key facts with exact character positions.

Rules:
- NEVER add any information, claim, number, or finding not present in the source
- No editorial framing, emotional language, or advocacy
- Preserve ambiguity — if something is uncertain, reflect that
- Numbers must be exact transcriptions — no rounding
- Include exact character ranges for every fact

Text:
{{text}}

Return JSON with:
- summary: 1-2 sentence summary
- preservedAmbiguities: any ambiguities preserved from source
- sourceReferences: supporting text with exact startChar/endChar positions
- facts: array of { fact, category (number/named_entity/legal_finding/policy_position/humanitarian_metric/date), confidence, startChar, endChar, numericValue?, unit? }`,
  },
  normal: {
    system: `You are a neutral fact summarizer. Produce a paragraph-length summary. Never add information not present in the source. Preserve ambiguity from the source. Return JSON only.`,
    user: `Summarize the following text in one paragraph (3-5 sentences). Extract all key facts with exact character positions.

Rules:
- NEVER add any information, claim, number, or finding not present in the source
- No editorial framing, emotional language, or advocacy
- Preserve ambiguity — if something is uncertain, reflect that
- Numbers must be exact transcriptions — no rounding
- Include exact character ranges for every fact

Text:
{{text}}

Return JSON with summary, preservedAmbiguities, sourceReferences, and facts as described.`,
  },
  detailed: {
    system: `You are a neutral fact summarizer. Produce a detailed multi-paragraph structured summary. Never add information not present in the source. Preserve ambiguity from the source. Return JSON only.`,
    user: `Summarize the following text in detail (multiple paragraphs with structure). Extract all key facts with exact character positions.

Rules:
- NEVER add any information, claim, number, or finding not present in the source
- No editorial framing, emotional language, or advocacy
- Preserve ambiguity — if something is uncertain, reflect that
- Numbers must be exact transcriptions — no rounding
- Include exact character ranges for every fact

Text:
{{text}}

Return JSON with summary, preservedAmbiguities, sourceReferences, and facts as described.`,
  },
};

/**
 * Summarizes content at three detail levels: brief, normal, detailed.
 * Extracts key facts with exact source spans.
 * NEVER adds information not present in the source.
 */
export const summarizerStage = createStage({
  name: "summarization",
  requires: [],
  run: async (
    input,
    _context,
    provider: AIProvider,
  ): Promise<AIOperationResult<SummaryResult & { facts: FactExtraction[] }>> => {
    const handler = new StructuredOutputHandler();

    // Default to "normal" summary; configurable later
    const summaryType: SummaryType = "normal";
    const promptTemplate = PROMPTS[summaryType];

    const prompt = {
      system: promptTemplate.system,
      user: promptTemplate.user.replace("{{text}}", input.body),
    };

    const result = await handler.extract(provider, prompt, summarySchema);

    if (result.data) {
      const facts: FactExtraction[] = (result.data.facts ?? []).map((f: {
        fact: string;
        category: FactExtraction["category"];
        confidence: number;
        startChar: number;
        endChar: number;
        numericValue?: number;
        unit?: string;
      }) => ({
        fact: f.fact,
        category: f.category,
        confidence: Math.min(f.confidence, 1),
        sourceSpan: {
          sourceId: input.url,
          start: f.startChar,
          end: f.endChar,
          excerpt: input.body.slice(f.startChar, f.endChar),
        },
        numericValue: f.numericValue,
        unit: f.unit,
      }));

      const sourceSpans: SourceSpan[] = (result.data.sourceReferences ?? []).map((ref: {
        text: string;
        startChar: number;
        endChar: number;
      }) => ({
        sourceId: input.url,
        start: ref.startChar,
        end: ref.endChar,
        excerpt: ref.text,
      }));

      return {
        ...result,
        data: {
          summary: result.data.summary,
          type: summaryType,
          sourceSpans,
          ambiguityChecked: true,
          preservedAmbiguities: result.data.preservedAmbiguities,
          facts,
        },
      };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
