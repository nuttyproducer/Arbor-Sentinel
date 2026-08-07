import { describe, it, expect } from "vitest";
import { feedConfig } from "../feedConfig";

describe("feedConfig", () => {
  it("all feeds have valid URLs", () => {
    for (const feed of feedConfig) {
      expect(() => new URL(feed.url)).not.toThrow();
    }
  });

  it("all feeds have non-empty id and label", () => {
    for (const feed of feedConfig) {
      expect(feed.id).toBeTruthy();
      expect(feed.label).toBeTruthy();
      expect(feed.sourceId).toBeTruthy();
    }
  });

  it("all feeds have positive polling interval", () => {
    for (const feed of feedConfig) {
      expect(feed.pollingIntervalMinutes).toBeGreaterThan(0);
    }
  });

  it("all category mapping values are valid MediaContentType strings", () => {
    const validTypes = [
      "news_report", "opinion", "editorial", "feature", "investigative",
      "interview", "academic_paper", "working_paper", "book_chapter",
      "conference_paper", "preprint",
    ];
    for (const feed of feedConfig) {
      for (const value of Object.values(feed.categoryMapping)) {
        expect(validTypes).toContain(value);
      }
    }
  });

  it("filtering by source type returns correct feeds", () => {
    const byType = (type: string) => feedConfig.filter((f) => f.sourceType === type);
    for (const feed of byType("journalism")) {
      expect(feed.sourceType).toBe("journalism");
    }
    for (const feed of byType("academic")) {
      expect(feed.sourceType).toBe("academic");
    }
  });

  it("enabled feeds can be filtered", () => {
    const enabled = feedConfig.filter((f) => f.enabled);
    for (const feed of enabled) {
      expect(feed.enabled).toBe(true);
    }
  });

  it("feed IDs are unique", () => {
    const ids = feedConfig.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
