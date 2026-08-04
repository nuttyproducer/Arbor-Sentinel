// src/lib/ai/__tests__/TimelineExtractor.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { timelineExtractorStage } from "../stages/TimelineExtractor";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string): NormalizedContent {
  return { title: "Test", body, url: "https://example.com/test", tags: [], metadata: {} };
}

describe("TimelineExtractor", () => {
  it("extracts events with exact dates", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        events: [
          { description: "ICJ issued provisional measures", date: "2026-01-26", datePrecision: "exact", originalDateText: "January 26, 2026", isApproximate: false, confidence: 0.95, startChar: 0, endChar: 16, linkedEntityNames: ["ICJ"], isUndated: false },
          { description: "UN Security Council met", date: "2026-02-01", datePrecision: "exact", originalDateText: "February 1, 2026", isApproximate: false, confidence: 0.95, startChar: 50, endChar: 66, linkedEntityNames: ["UN Security Council"], isUndated: false },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("On January 26, 2026, the ICJ issued provisional measures. On February 1, 2026, the UN Security Council met."));
    const result = await timelineExtractorStage.run(makeContent("On January 26, 2026, the ICJ issued provisional measures. On February 1, 2026, the UN Security Council met."), ctx, provider);

    expect(result.data!).toHaveLength(2);
    expect(result.data![0].date).toBe("2026-01-26");
    expect(result.data![0].datePrecision).toBe("exact");
  });

  it("handles ambiguous dates", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        events: [
          { description: "Attack occurred", date: "2024-01", datePrecision: "ambiguous", originalDateText: "early 2024", isApproximate: true, confidence: 0.5, startChar: 0, endChar: 10, linkedEntityNames: [], isUndated: false },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("In early 2024, an attack occurred."));
    const result = await timelineExtractorStage.run(makeContent("In early 2024, an attack occurred."), ctx, provider);

    expect(result.data![0].isApproximate).toBe(true);
    expect(result.data![0].datePrecision).toBe("ambiguous");
  });

  it("flags undated events", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        events: [
          { description: "A ceasefire was announced", date: "", datePrecision: "ambiguous", originalDateText: "", isApproximate: false, confidence: 0.3, startChar: 0, endChar: 0, linkedEntityNames: [], isUndated: true },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("A ceasefire was announced at some point."));
    const result = await timelineExtractorStage.run(makeContent("A ceasefire was announced at some point."), ctx, provider);

    expect(result.data![0].isUndated).toBe(true);
  });

  it("sorts events chronologically", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        events: [
          { description: "Third event", date: "2026-03", datePrecision: "month", originalDateText: "March 2026", isApproximate: false, confidence: 0.9, startChar: 0, endChar: 0, linkedEntityNames: [], isUndated: false },
          { description: "First event", date: "2025-01", datePrecision: "month", originalDateText: "January 2025", isApproximate: false, confidence: 0.9, startChar: 0, endChar: 0, linkedEntityNames: [], isUndated: false },
          { description: "Second event", date: "2025-06", datePrecision: "month", originalDateText: "June 2025", isApproximate: false, confidence: 0.9, startChar: 0, endChar: 0, linkedEntityNames: [], isUndated: false },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("Events in Jan 2025, June 2025, and March 2026."));
    const result = await timelineExtractorStage.run(makeContent("Events in Jan 2025, June 2025, and March 2026."), ctx, provider);

    expect(result.data![0].description).toBe("First event");
    expect(result.data![1].description).toBe("Second event");
    expect(result.data![2].description).toBe("Third event");
  });
});
