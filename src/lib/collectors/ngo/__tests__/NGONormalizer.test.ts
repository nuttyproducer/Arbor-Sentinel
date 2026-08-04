import { describe, it, expect } from "vitest";
import { NGONormalizer, type RawNgoDocument } from "../NGONormalizer";

describe("NGONormalizer", () => {
  const normalizer = new NGONormalizer();

  const validDoc: RawNgoDocument = {
    url: "https://www.amnesty.org/en/latest/news/2026/07/gaza-human-rights-report/",
    title: "Gaza: Humanitarian Crisis Deepens — New Research Report",
    organization: "Amnesty International",
    reportType: "research_report",
    date: "2026-07-15",
    bodyText: "Amnesty International has documented extensive violations of international humanitarian law in Gaza. This report details findings from a six-month investigation involving interviews with over 200 witnesses and analysis of satellite imagery.",
    summaryText: "New research documents IHL violations in Gaza.",
    methodology: "Interviews with 200+ witnesses, satellite imagery analysis, open-source intelligence verification, and legal analysis under IHL framework.",
    keyFindings: [
      "Indiscriminate attacks on civilian infrastructure in violation of IHL Article 51",
      "Use of explosive weapons with wide-area effects in densely populated areas",
      "Disproportionate harm to civilians relative to anticipated military advantage",
    ],
    geographicScope: ["Gaza Strip", "Occupied Palestinian Territory"],
    legalReferences: ["Geneva Convention IV Article 33", "Additional Protocol I Article 51", "Rome Statute Article 8"],
    language: "en",
    isOfficialSource: false,
  };

  describe("validate", () => {
    it("accepts a valid document", () => {
      const result = normalizer.validate(validDoc);
      expect(result.valid).toBe(true);
    });

    it("rejects document with missing URL", () => {
      const result = normalizer.validate({ ...validDoc, url: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("URL");
    });

    it("rejects document with missing title", () => {
      const result = normalizer.validate({ ...validDoc, title: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("title");
    });

    it("rejects document with missing organization", () => {
      const result = normalizer.validate({ ...validDoc, organization: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("organization");
    });

    it("rejects document with missing body text", () => {
      const result = normalizer.validate({ ...validDoc, bodyText: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("body");
    });
  });

  describe("normalize", () => {
    it("extracts all required fields into NormalizedContent", () => {
      const result = normalizer.normalize(validDoc);

      expect(result.title).toBe("Gaza: Humanitarian Crisis Deepens — New Research Report");
      expect(result.body).toBe("New research documents IHL violations in Gaza.");
      expect(result.publishedAt).toBe("2026-07-15");
      expect(result.url).toBe(validDoc.url);
      expect(result.language).toBe("en");
      expect(result.tags).toContain("ngo-research");
      expect(result.tags).toContain("amnesty-international");
      expect(result.tags).toContain("research_report");
      expect(result.metadata.organization).toBe("Amnesty International");
      expect(result.metadata.reportType).toBe("research_report");
      expect(result.metadata.isOfficialSource).toBe(false);
      expect(result.metadata.sourceCategory).toBe("ngo-research");
    });

    it("preserves exact key finding quotes without modification", () => {
      const result = normalizer.normalize(validDoc);

      const findings = result.metadata.keyFindings as string[];
      expect(findings).toHaveLength(3);
      expect(findings[0]).toBe(
        "Indiscriminate attacks on civilian infrastructure in violation of IHL Article 51",
      );
      expect(findings[1]).toBe(
        "Use of explosive weapons with wide-area effects in densely populated areas",
      );
      expect(findings[2]).toBe(
        "Disproportionate harm to civilians relative to anticipated military advantage",
      );
    });

    it("sets isOfficialSource to false in all outputs", () => {
      const result = normalizer.normalize(validDoc);
      expect(result.metadata.isOfficialSource).toBe(false);

      // Even with an official-sounding org, it's still NGO research
      const icrcDoc = { ...validDoc, organization: "ICRC" };
      const icrcResult = normalizer.normalize(icrcDoc);
      expect(icrcResult.metadata.isOfficialSource).toBe(false);
    });

    it("generates correct tags including geo scope", () => {
      const result = normalizer.normalize(validDoc);

      expect(result.tags).toContain("gaza-strip");
      expect(result.tags).toContain("occupied-palestinian-territory");
      expect(result.tags).toContain("ngo-research");
      expect(result.tags).toContain("research_report");
      expect(result.tags).toContain("amnesty-international");
    });

    it("falls back to bodyText when summaryText is not provided", () => {
      const docWithoutSummary = { ...validDoc, summaryText: undefined };
      const result = normalizer.normalize(docWithoutSummary);

      expect(result.body).toContain("Amnesty International has documented extensive violations");
    });
  });
});
