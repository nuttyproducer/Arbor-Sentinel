// src/lib/ai/__tests__/provider.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import { OpenAICompatibleAdapter, createMockProvider } from "../provider";
import type { OpenAICompatibleConfig } from "../provider";
import type { AIRequest, AIResponse } from "../types";

// ── Test helpers ────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<OpenAICompatibleConfig> = {}): OpenAICompatibleConfig {
  return {
    baseURL: "https://api.deepseek.com/v1",
    apiKey: "test-key",
    ...overrides,
  };
}

function makeFetchResponse(
  overrides: Partial<{
    ok: boolean;
    status: number;
    json: () => Promise<unknown>;
    text: () => Promise<string>;
  }> = {},
): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        choices: [{ message: { content: "Hello!" }, finish_reason: "stop" }],
        model: "deepseek-chat",
        usage: { prompt_tokens: 12, completion_tokens: 5 },
      }),
    text: () => Promise.resolve(""),
    ...overrides,
  });
}

// ── OpenAICompatibleAdapter ─────────────────────────────────────────────────

describe("OpenAICompatibleAdapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("throws when apiKey is empty", () => {
      expect(() =>
        new OpenAICompatibleAdapter({ baseURL: "https://example.com", apiKey: "" }),
      ).toThrow("apiKey is required");
    });

    it("throws when apiKey is missing", () => {
      expect(() =>
        new OpenAICompatibleAdapter({ baseURL: "https://example.com" } as OpenAICompatibleConfig),
      ).toThrow("apiKey is required");
    });

    it("constructs successfully with a valid config", () => {
      const adapter = new OpenAICompatibleAdapter(makeConfig());
      expect(adapter).toBeDefined();
    });
  });

  describe("complete", () => {
    it("strips trailing slash from baseURL and posts to /chat/completions", async () => {
      const fetchMock = makeFetchResponse();
      vi.stubGlobal("fetch", fetchMock);

      const adapter = new OpenAICompatibleAdapter({
        baseURL: "https://api.deepseek.com/v1/",
        apiKey: "test-key",
      });

      await adapter.complete({ messages: [{ role: "user", content: "Hi" }] });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toBe("https://api.deepseek.com/v1/chat/completions");
    });

    it("sends POST with bearer auth and default request body", async () => {
      const fetchMock = makeFetchResponse();
      vi.stubGlobal("fetch", fetchMock);

      const adapter = new OpenAICompatibleAdapter(makeConfig());
      await adapter.complete({ messages: [{ role: "user", content: "Hi" }] });

      const [, init] = fetchMock.mock.calls[0];
      expect(init.method).toBe("POST");
      expect(init.headers).toEqual({
        "Content-Type": "application/json",
        Authorization: "Bearer test-key",
      });
      expect(JSON.parse(init.body)).toEqual({
        model: "deepseek-chat",
        messages: [{ role: "user", content: "Hi" }],
        temperature: 0,
        max_tokens: 4096,
      });
    });

    it("uses request-level model, maxTokens, and temperature when provided", async () => {
      const fetchMock = makeFetchResponse();
      vi.stubGlobal("fetch", fetchMock);

      const adapter = new OpenAICompatibleAdapter(makeConfig({ defaultMaxTokens: 4096 }));
      await adapter.complete({
        messages: [{ role: "user", content: "Hi" }],
        model: "deepseek-reasoner",
        maxTokens: 8192,
        temperature: 0.7,
      });

      const [, init] = fetchMock.mock.calls[0];
      expect(JSON.parse(init.body)).toMatchObject({
        model: "deepseek-reasoner",
        max_tokens: 8192,
        temperature: 0.7,
      });
    });

    it("sends response_format json_object when requested", async () => {
      const fetchMock = makeFetchResponse();
      vi.stubGlobal("fetch", fetchMock);

      const adapter = new OpenAICompatibleAdapter(makeConfig());
      await adapter.complete({
        messages: [{ role: "user", content: "Return JSON" }],
        responseFormat: { type: "json_object" },
      });

      const [, init] = fetchMock.mock.calls[0];
      expect(JSON.parse(init.body)).toMatchObject({
        response_format: { type: "json_object" },
      });
    });

    it("omits response_format when not requested as json_object", async () => {
      const fetchMock = makeFetchResponse();
      vi.stubGlobal("fetch", fetchMock);

      const adapter = new OpenAICompatibleAdapter(makeConfig());
      await adapter.complete({
        messages: [{ role: "user", content: "Return text" }],
        responseFormat: { type: "text" },
      });

      const [, init] = fetchMock.mock.calls[0];
      expect(JSON.parse(init.body)).not.toHaveProperty("response_format");
    });

    it("parses content, model, tokens, and finish reason from the response", async () => {
      vi.stubGlobal("fetch", makeFetchResponse());
      const adapter = new OpenAICompatibleAdapter(makeConfig());

      const response = await adapter.complete({ messages: [] });

      expect(response.content).toBe("Hello!");
      expect(response.model).toBe("deepseek-chat");
      expect(response.tokensUsed).toEqual({ input: 12, output: 5 });
      expect(response.finishReason).toBe("stop");
    });

    it("falls back to the requested model when response omits model", async () => {
      const fetchMock = makeFetchResponse({
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Hi" }, finish_reason: "stop" }],
            usage: { prompt_tokens: 1, completion_tokens: 1 },
          }),
      });
      vi.stubGlobal("fetch", fetchMock);
      const adapter = new OpenAICompatibleAdapter(makeConfig());

      const response = await adapter.complete({ messages: [], model: "fallback-model" });
      expect(response.model).toBe("fallback-model");
    });

    it("defaults missing token usage to zero", async () => {
      const fetchMock = makeFetchResponse({
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Hi" }, finish_reason: "stop" }],
          }),
      });
      vi.stubGlobal("fetch", fetchMock);
      const adapter = new OpenAICompatibleAdapter(makeConfig());

      const response = await adapter.complete({ messages: [] });
      expect(response.tokensUsed).toEqual({ input: 0, output: 0 });
    });

    it("normalizes length and content_filter finish reasons", async () => {
      vi.stubGlobal(
        "fetch",
        makeFetchResponse({
          json: () =>
            Promise.resolve({
              choices: [
                { message: { content: "partial" }, finish_reason: "length" },
              ],
              usage: { prompt_tokens: 1, completion_tokens: 1 },
            }),
        }),
      );
      const adapter = new OpenAICompatibleAdapter(makeConfig());
      expect((await adapter.complete({ messages: [] })).finishReason).toBe("length");

      vi.stubGlobal(
        "fetch",
        makeFetchResponse({
          json: () =>
            Promise.resolve({
              choices: [
                { message: { content: "" }, finish_reason: "content_filter" },
              ],
              usage: { prompt_tokens: 1, completion_tokens: 1 },
            }),
        }),
      );
      expect((await adapter.complete({ messages: [] })).finishReason).toBe("content_filter");
    });

    it("throws a descriptive error on a non-OK response", async () => {
      const fetchMock = makeFetchResponse({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Rate limit exceeded"),
      });
      vi.stubGlobal("fetch", fetchMock);
      const adapter = new OpenAICompatibleAdapter(makeConfig());

      await expect(adapter.complete({ messages: [] })).rejects.toThrow(
        "AI provider returned 429: Rate limit exceeded",
      );
    });

    it("throws when the provider returns an empty choices array", async () => {
      const fetchMock = makeFetchResponse({
        json: () => Promise.resolve({ choices: [] }),
      });
      vi.stubGlobal("fetch", fetchMock);
      const adapter = new OpenAICompatibleAdapter(makeConfig());

      await expect(adapter.complete({ messages: [] })).rejects.toThrow(
        "AI provider returned empty choices array",
      );
    });

    it("aborts the request and throws a timeout error after timeoutMs", async () => {
      vi.useFakeTimers();

      const fetchMock = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        });
      });
      vi.stubGlobal("fetch", fetchMock);

      const adapter = new OpenAICompatibleAdapter(
        makeConfig({ timeoutMs: 100 }),
      );

      const promise = adapter.complete({ messages: [] });
      const assertion = expect(promise).rejects.toThrow("AI request timed out after 100ms");

      await vi.advanceTimersByTimeAsync(100);
      await assertion;
    });
  });
});

// ── createMockProvider ──────────────────────────────────────────────────────

describe("createMockProvider", () => {
  it("returns canned responses in order", async () => {
    const mock = createMockProvider([{ content: "first" }, { content: "second" }]);

    const r1 = await mock.complete({ messages: [] });
    const r2 = await mock.complete({ messages: [] });

    expect(r1.content).toBe("first");
    expect(r2.content).toBe("second");
  });

  it("repeats last response for excess calls", async () => {
    const mock = createMockProvider([{ content: "only" }]);

    const r1 = await mock.complete({ messages: [] });
    const r2 = await mock.complete({ messages: [] });

    expect(r1.content).toBe("only");
    expect(r2.content).toBe("only");
  });

  it("returns mock metadata", async () => {
    const mock = createMockProvider([{ content: "test" }]);
    const r: AIResponse = await mock.complete({ messages: [] });

    expect(r.model).toBe("mock-model");
    expect(r.tokensUsed).toEqual({ input: 10, output: 20 });
    expect(r.finishReason).toBe("stop");
  });

  it("passes through custom finishReason", async () => {
    const mock = createMockProvider([{ content: "x", finishReason: "length" }]);
    const r = await mock.complete({ messages: [] });
    expect(r.finishReason).toBe("length");
  });

  it("ignores the request payload", async () => {
    const mock = createMockProvider([{ content: "static" }]);
    const r = await mock.complete({ messages: [{ role: "user", content: "anything" }] });
    expect(r.content).toBe("static");
  });

  it("satisfies the AIRequest/AIResponse contract", async () => {
    const mock = createMockProvider([{ content: "ok" }]);
    const r: AIResponse = await mock.complete({ messages: [] } satisfies AIRequest);
    expect(r).toMatchObject({
      content: "ok",
      model: "mock-model",
      finishReason: "stop",
    });
  });
});
