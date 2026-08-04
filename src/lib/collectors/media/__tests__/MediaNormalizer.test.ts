import { describe, it, expect } from "vitest";
import { MediaNormalizer, type RawMediaDocument } from "../MediaNormalizer";

describe("MediaNormalizer", () => {
  const normalizer = new MediaNormalizer();

  const validNewsDoc: RawMediaDocument = {
    url: "https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/",
    headline: "UN Security Council votes on Gaza resolution",
    byline: "Jane Smith",
    publication: "Reuters",
    date: "2026-08-01",
    accessDate: "2026-08-01",
    bodyPreview: "The UN Security Council voted today on a resolution concerning the humanitarian situation in Gaza. The resolution calls for immediate ceasefire and unhindered humanitarian access.",
    contentType: "news_report",
    categories: ["World", "United Nations"],
    language: "en",
    isSubscriptionOnly: false,
  };

  const validAcademicDoc: RawMediaDocument = {
    url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=123456",
    headline: "International Humanitarian Law and Armed Conflict: A Review of State Practice",
    byline: "Sarah Johnson, Michael Chen",
    publication: "Harvard International Law Journal",
    date: "2026-06-15",
    accessDate: "2026-08-01",
    bodyPreview: "This article examines state practice in IHL compliance across 15 armed conflicts from 2010-2025.",
    contentType: "academic_paper",
    categories: ["International Law", "Human Rights"],
    language: "en",
    abstract: "A comprehensive review of state practice in international humanitarian law compliance across 15 armed conflicts, examining patterns of adherence and violation.",
    doi: "10.1234/hilj.2026.001",
    publicationVenue: "Harvard International Law Journal, Vol. 45, Issue 2",
    openAccessUrl: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=123456",
    isSubscriptionOnly: false,
  };

  describe("validate", () => {
    it("accepts a valid news document", () => {
      const result = normalizer.validate(validNewsDoc);
      expect(result.valid).toBe(true);
    });

    it("accepts a valid academic document", () => {
      const result = normalizer.validate(validAcademicDoc);
      expect(result.valid).toBe(true);
    });

    it("rejects document with missing URL", () => {
      const result = normalizer.validate({ ...validNewsDoc, url: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("URL");
    });

    it("rejects document with missing headline", () => {
      const result = normalizer.validate({ ...validNewsDoc, headline: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("headline");
    });

    it("rejects document with missing publication", () => {
      const result = normalizer.validate({ ...validNewsDoc, publication: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("publication");
    });

    it("rejects document with missing accessDate", () => {
      const result = normalizer.validate({ ...validNewsDoc, accessDate: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("access");
    });

    it("rejects body preview over 500 characters", () => {
      const longPreview = "x".repeat(501);
      const result = normalizer.validate({ ...validNewsDoc, bodyPreview: longPreview });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("characters");
    });
  });

  describe("normalize", () => {
    it("extracts all required fields from news document", () => {
      const result = normalizer.normalize(validNewsDoc);

      expect(result.title).toBe("UN Security Council votes on Gaza resolution");
      expect(result.body).toBe(validNewsDoc.bodyPreview);
      expect(result.publishedAt).toBe("2026-08-01");
      expect(result.url).toBe(validNewsDoc.url);
      expect(result.language).toBe("en");
      expect(result.metadata.byline).toBe("Jane Smith");
      expect(result.metadata.publication).toBe("Reuters");
      expect(result.metadata.contentType).toBe("news_report");
      expect(result.metadata.isSubscriptionOnly).toBe(false);
      expect(result.tags).toContain("reuters");
      expect(result.tags).toContain("news");
    });

    it("distinguishes news_report from opinion content type", () => {
      const opinionDoc = { ...validNewsDoc, contentType: "opinion" as const };
      const result = normalizer.normalize(opinionDoc);

      expect(result.metadata.contentType).toBe("opinion");
      expect(result.tags).toContain("opinion");
      expect(result.tags).not.toContain("news_report");
    });

    it("labels paywalled content with isSubscriptionOnly", () => {
      const paywalled = { ...validNewsDoc, isSubscriptionOnly: true };
      const result = normalizer.normalize(paywalled);

      expect(result.metadata.isSubscriptionOnly).toBe(true);
      expect(result.tags).toContain("subscription-required");
    });

    it("extracts academic fields including DOI and OA URL", () => {
      const result = normalizer.normalize(validAcademicDoc);

      expect(result.title).toContain("International Humanitarian Law");
      expect(result.metadata.contentType).toBe("academic_paper");
      expect(result.metadata.doi).toBe("10.1234/hilj.2026.001");
      expect(result.metadata.publicationVenue).toContain("Harvard International Law Journal");
      expect(result.metadata.openAccessUrl).toBe("https://papers.ssrn.com/sol3/papers.cfm?abstract_id=123456");
      expect(result.metadata.isSubscriptionOnly).toBe(false);
      expect(result.tags).toContain("academic");
      expect(result.tags).toContain("analysis");
    });

    it("labels academic content as analysis not evidence", () => {
      const result = normalizer.normalize(validAcademicDoc);

      expect(result.tags).toContain("analysis");
      expect(result.tags).not.toContain("evidence");
    });

    it("falls back to bodyPreview for body when abstract not set", () => {
      const result = normalizer.normalize(validNewsDoc);
      expect(result.body).toBe(validNewsDoc.bodyPreview);
    });
  });
});
