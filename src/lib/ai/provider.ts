// src/lib/ai/provider.ts

import type { AIProvider, AIRequest, AIResponse } from "./types";

/** Configuration for the OpenAI-compatible adapter. */
export interface OpenAICompatibleConfig {
  /** Base URL of the API (e.g. "https://api.deepseek.com/v1"). */
  baseURL: string;
  /** API key — loaded from environment variable, never hardcoded. */
  apiKey: string;
  /** Default model to use when not specified in the request. */
  defaultModel?: string;
  /** Default max tokens. */
  defaultMaxTokens?: number;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
}

/**
 * Provider-agnostic adapter for any OpenAI-compatible API.
 *
 * Works with DeepSeek, OpenAI, and any endpoint that implements
 * the /v1/chat/completions contract. Configured via baseURL + apiKey.
 */
export class OpenAICompatibleAdapter implements AIProvider {
  private config: Required<OpenAICompatibleConfig>;

  constructor(config: OpenAICompatibleConfig) {
    if (!config.apiKey) {
      throw new Error(
        "OpenAICompatibleAdapter: apiKey is required. Set DEEPSEEK_API_KEY environment variable.",
      );
    }
    this.config = {
      baseURL: config.baseURL.replace(/\/$/, ""),
      apiKey: config.apiKey,
      defaultModel: config.defaultModel ?? "deepseek-chat",
      defaultMaxTokens: config.defaultMaxTokens ?? 4096,
      timeoutMs: config.timeoutMs ?? 60000,
    };
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const url = `${this.config.baseURL}/chat/completions`;
    const model = request.model ?? this.config.defaultModel;

    const body = JSON.stringify({
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0,
      max_tokens: request.maxTokens ?? this.config.defaultMaxTokens,
      ...(request.responseFormat?.type === "json_object"
        ? { response_format: { type: "json_object" } }
        : {}),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`AI provider returned ${response.status}: ${errorText}`);
      }

      const json = (await response.json()) as {
        choices: Array<{
          message: { content: string };
          finish_reason: string;
        }>;
        model: string;
        usage: { prompt_tokens: number; completion_tokens: number };
      };

      const choice = json.choices?.[0];
      if (!choice) {
        throw new Error("AI provider returned empty choices array");
      }

      return {
        content: choice.message.content ?? "",
        model: json.model ?? model,
        tokensUsed: {
          input: json.usage?.prompt_tokens ?? 0,
          output: json.usage?.completion_tokens ?? 0,
        },
        finishReason: normalizeFinishReason(choice.finish_reason),
      };
    } catch (error) {
      // Surface a clear message when the timeout fired instead of the
      // browser's generic AbortError, preserving the original as `cause`.
      if (error instanceof DOMException && error.name === "AbortError") {
        const timeoutError = new Error(
          `AI request timed out after ${this.config.timeoutMs}ms`,
        ) as Error & { cause?: unknown };
        timeoutError.cause = error;
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function normalizeFinishReason(raw: string): AIResponse["finishReason"] {
  switch (raw) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content_filter";
    default:
      return "stop";
  }
}

/**
 * Create a mock AIProvider for testing.
 * Returns canned responses in order, then repeats the last one.
 */
export function createMockProvider(
  responses: Array<{ content: string; finishReason?: AIResponse["finishReason"] }>,
): AIProvider {
  let callIndex = 0;

  return {
    async complete(_request: AIRequest): Promise<AIResponse> {
      const resp = responses[Math.min(callIndex, responses.length - 1)];
      callIndex++;
      return {
        content: resp.content,
        model: "mock-model",
        tokensUsed: { input: 10, output: 20 },
        finishReason: resp.finishReason ?? "stop",
      };
    },
  };
}
