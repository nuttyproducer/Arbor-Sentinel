// src/lib/ai/__tests__/Logger.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { Logger } from "../Logger";
import type { AILogEntry } from "../types";

function makeEntry(overrides: Partial<AILogEntry> = {}): AILogEntry {
  return {
    timestamp: "2026-08-01T12:00:00.000Z",
    stageName: "entity_extraction",
    model: "deepseek-chat",
    prompt: "Extract entities from: The ICJ issued a ruling.",
    responseSummary: '{"entities": []}',
    tokensUsed: { input: 50, output: 30 },
    latencyMs: 1200,
    confidence: 0.85,
    ...overrides,
  };
}

describe("Logger", () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  it("records log entries", () => {
    logger.log(makeEntry());
    expect(logger.count).toBe(1);
  });

  it("truncates long prompts to 500 characters", () => {
    const longPrompt = "x".repeat(1000);
    logger.log(makeEntry({ prompt: longPrompt }));

    const entries = logger.getEntries();
    expect(entries[0].prompt.length).toBeLessThanOrEqual(520); // 500 + truncation suffix
    expect(entries[0].prompt).toContain("[truncated]");
  });

  it("truncates long response summaries to 500 characters", () => {
    const longResponse = "y".repeat(1000);
    logger.log(makeEntry({ responseSummary: longResponse }));

    const entries = logger.getEntries();
    expect(entries[0].responseSummary).toContain("[truncated]");
  });

  it("filters entries by stage name", () => {
    logger.log(makeEntry({ stageName: "translation" }));
    logger.log(makeEntry({ stageName: "summarization" }));
    logger.log(makeEntry({ stageName: "translation" }));

    const filtered = logger.getEntries({ stageName: "translation" });
    expect(filtered).toHaveLength(2);
  });

  it("filters entries by start date", () => {
    logger.log(makeEntry({ timestamp: "2026-01-01T00:00:00.000Z" }));
    logger.log(makeEntry({ timestamp: "2026-06-01T00:00:00.000Z" }));
    logger.log(makeEntry({ timestamp: "2026-12-01T00:00:00.000Z" }));

    const filtered = logger.getEntries({ startDate: "2026-06-01T00:00:00.000Z" });
    expect(filtered).toHaveLength(2);
  });

  it("exports entries as JSON", () => {
    logger.log(makeEntry());
    const exported = logger.export();
    const parsed = JSON.parse(exported);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].stageName).toBe("entity_extraction");
  });

  it("clear removes all entries", () => {
    logger.log(makeEntry());
    logger.log(makeEntry());
    logger.clear();
    expect(logger.count).toBe(0);
  });

  it("records all required fields", () => {
    logger.log(makeEntry());
    const [entry] = logger.getEntries();

    expect(entry.timestamp).toBeDefined();
    expect(entry.stageName).toBeDefined();
    expect(entry.model).toBeDefined();
    expect(entry.prompt).toBeDefined();
    expect(entry.responseSummary).toBeDefined();
    expect(entry.tokensUsed).toBeDefined();
    expect(entry.latencyMs).toBeDefined();
    expect(entry.confidence).toBeDefined();
  });

  it("records error field when present", () => {
    logger.log(makeEntry({ error: "Rate limit exceeded" }));
    const [entry] = logger.getEntries();
    expect(entry.error).toBe("Rate limit exceeded");
  });
});
