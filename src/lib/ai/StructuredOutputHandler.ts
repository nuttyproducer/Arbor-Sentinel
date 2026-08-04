// src/lib/ai/StructuredOutputHandler.ts

import { z } from "zod";
import type { AIProvider, AIOperationResult } from "./types";
import { successResult, emptyResult } from "./types";

/** Options for structured output extraction. */
export interface StructuredOutputOptions {
  /** Maximum retry attempts on validation failure. Default 3. */
  maxRetries?: number;
  /** Model override for this extraction. */
  model?: string;
}

/**
 * Handles structured (JSON) output extraction from AI providers
 * with Zod schema validation and self-correction retry.
 *
 * On validation failure, includes the Zod error in the retry prompt
 * so the model can self-correct. After maxRetries, returns an error result.
 */
export class StructuredOutputHandler {
  /**
   * Extract and validate structured output from the AI provider.
   *
   * Calls the provider, parses JSON from the response, validates
   * against the Zod schema, and retries on validation failure with
   * the error details included in the prompt.
   */
  async extract<T>(
    provider: AIProvider,
    prompt: { system: string; user: string },
    schema: z.ZodSchema<T>,
    options: StructuredOutputOptions = {},
  ): Promise<AIOperationResult<T>> {
    const maxRetries = options.maxRetries ?? 3;
    const startTime = Date.now();
    const allWarnings: string[] = [];
    const totalTokens = { input: 0, output: 0 };
    let lastModel = "unknown";

    let currentUserPrompt = prompt.user;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await provider.complete({
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: currentUserPrompt },
          ],
          model: options.model,
          temperature: 0,
          responseFormat: { type: "json_object" },
        });

        lastModel = response.model;
        totalTokens.input += response.tokensUsed.input;
        totalTokens.output += response.tokensUsed.output;

        // Parse JSON from response
        let parsed: unknown;
        try {
          parsed = JSON.parse(response.content);
        } catch {
          if (attempt < maxRetries) {
            currentUserPrompt = buildRetryPrompt(
              prompt.user,
              `Invalid JSON: response was not parseable. Please return valid JSON only.`,
            );
            allWarnings.push(`attempt_${attempt + 1}: invalid JSON`);
            continue;
          }
          return emptyResult<T>(lastModel, [
            ...allWarnings,
            "Failed to parse JSON after all retries",
          ]);
        }

        // Validate against schema
        const result = schema.safeParse(parsed);
        if (result.success) {
          const latencyMs = Date.now() - startTime;
          return successResult(result.data, {
            confidence: estimateConfidence(attempt, response.finishReason),
            modelUsed: lastModel,
            tokensUsed: totalTokens,
            latencyMs,
            warnings: allWarnings.length > 0 ? allWarnings : undefined,
          });
        }

        // Validation failed — retry with error details
        if (attempt < maxRetries) {
          const zodErrors = formatZodErrors(result.error);
          currentUserPrompt = buildRetryPrompt(
            prompt.user,
            `Your previous response did not match the required schema. Please fix these errors:\n${zodErrors}`,
          );
          allWarnings.push(`attempt_${attempt + 1}: validation failed`);
          continue;
        }

        // Exhausted retries
        const latencyMs = Date.now() - startTime;
        return {
          data: null,
          confidence: 0,
          modelUsed: lastModel,
          tokensUsed: totalTokens,
          latencyMs,
          warnings: [...allWarnings, `Schema validation failed: ${formatZodErrors(result.error)}`],
          sourceSpans: [],
        };
      } catch (error) {
        if (attempt < maxRetries) {
          allWarnings.push(`attempt_${attempt + 1}: provider error`);
          continue;
        }
        return emptyResult<T>(lastModel, [
          ...allWarnings,
          `Provider error after ${maxRetries + 1} attempts: ${error instanceof Error ? error.message : String(error)}`,
        ]);
      }
    }

    // Should never reach here, but TypeScript needs it
    return emptyResult<T>(lastModel, [...allWarnings, "Unexpected: exhausted all retries"]);
  }
}

function buildRetryPrompt(originalPrompt: string, errorDetail: string): string {
  return `${originalPrompt}\n\n[ERROR FROM PREVIOUS ATTEMPT]\n${errorDetail}\n\nPlease correct your response and return valid JSON that matches the required schema.`;
}

function formatZodErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");
}

function estimateConfidence(attempts: number, finishReason: string): number {
  // Base confidence decreases with more retries
  let confidence = 1.0 - attempts * 0.1;
  // Length-based finish may indicate truncation
  if (finishReason === "length") {
    confidence -= 0.15;
  }
  return Math.max(0, Math.min(1, confidence));
}
