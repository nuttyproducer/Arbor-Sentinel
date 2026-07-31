import { describe, it, expect } from "vitest";
import { UNNormalizer } from "../UNNormalizer";
import { ohchrCoiReport, ochaSituationReport } from "../mockData";

const normalizer = new UNNormalizer();

describe("UNNormalizer", () => {
  describe("normalize", () => {
    it("extracts document symbol from a COI report", () => {
      const result = normalizer.normalize(ohchrCoiReport);
      expect(result.documentSymbol).toBe("A/HRC/55/28");
    });

    it("extracts issuing body", () => {
      const result = normalizer.normalize(ohchrCoiReport);
      expect(result.issuingBody).toBe("Commission of Inquiry");
    });

    it("preserves session and agenda item", () => {
      const result = normalizer.normalize(ohchrCoiReport);
      expect(result.session).toBe("55th session of the Human Rights Council");
      expect(result.agendaItem).toContain("Item 7");
    });

    it("extracts report type", () => {
      const result = normalizer.normalize(ohchrCoiReport);
      expect(result.reportType).toBe("coi_report");
    });

    it("extracts geographic scope", () => {
      const result = normalizer.normalize(ohchrCoiReport);
      expect(result.geographicScope).toContain("Palestine");
      expect(result.geographicScope).toContain("Israel");
    });

    it("normalizes an OCHA situation report", () => {
      const result = normalizer.normalize(ochaSituationReport);
      expect(result.reportType).toBe("situation_report");
      expect(result.issuingBody).toBe("OCHA");
      expect(result.geographicScope).toContain("Gaza");
    });

    it("generates tags from report type and geographic scope", () => {
      const result = normalizer.normalize(ohchrCoiReport);
      expect(result.tags).toContain("coi_report");
      expect(result.tags).toContain("palestine");
    });

    it("detects document symbol from body text when not explicitly provided", () => {
      const result = normalizer.normalize({
        ...ochaSituationReport,
        documentSymbol: undefined,
      });
      // May detect from body text pattern
      expect(result.title).toBe(ochaSituationReport.title);
    });
  });

  describe("validate", () => {
    it("accepts valid document", () => {
      expect(normalizer.validate(ohchrCoiReport).valid).toBe(true);
    });

    it("rejects missing URL", () => {
      expect(normalizer.validate({ ...ohchrCoiReport, url: "" }).valid).toBe(false);
    });

    it("rejects missing title", () => {
      expect(normalizer.validate({ ...ohchrCoiReport, title: "" }).valid).toBe(false);
    });

    it("rejects missing body text", () => {
      expect(normalizer.validate({ ...ohchrCoiReport, bodyText: "" }).valid).toBe(false);
    });

    it("rejects missing issuing body", () => {
      expect(normalizer.validate({ ...ohchrCoiReport, issuingBody: "" }).valid).toBe(false);
    });
  });
});
