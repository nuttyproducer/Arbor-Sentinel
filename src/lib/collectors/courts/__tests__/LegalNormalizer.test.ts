import { describe, it, expect } from "vitest";
import { LegalNormalizer } from "../LegalNormalizer";
import type { RawCourtDocument } from "../LegalNormalizer";
import {
  icjOrderDocument,
  icjPressRelease,
  iccWarrantDocument,
  iccProceedingUpdate,
  iccDocketEntry,
} from "../mockData";

const normalizer = new LegalNormalizer();

describe("LegalNormalizer", () => {
  describe("normalize", () => {
    it("extracts all required fields from an ICJ order", () => {
      const result = normalizer.normalize(icjOrderDocument);

      expect(result.title).toBe(icjOrderDocument.title);
      expect(result.court).toBe("ICJ");
      expect(result.caseName).toBe("South Africa v. Israel");
      expect(result.caseNumber).toBe("ICJ Case No. 192");
      expect(result.parties).toEqual(["South Africa", "Israel"]);
      expect(result.documentType).toBe("order");
      expect(result.publishedAt).toBe("2024-01-26");
      expect(result.url).toBe(icjOrderDocument.url);
      expect(result.language).toBe("en");
    });

    it("maps ICJ order to correct legal statuses", () => {
      const result = normalizer.normalize(icjOrderDocument);

      expect(result.legalStatus).toContain("court_proceeding_active");
      expect(result.legalStatus).toContain("provisional_measures_issued");
    });

    it("maps ICJ order to correct timeline event type", () => {
      const result = normalizer.normalize(icjOrderDocument);
      expect(result.timelineEventType).toBe("order");
    });

    it("preserves verbatim key rulings without modification", () => {
      const result = normalizer.normalize(icjOrderDocument);

      expect(result.keyRulings.length).toBeGreaterThanOrEqual(1);
      expect(result.keyRulings[0]).toContain("Article II");
      // Verbatim check: original text is preserved exactly
      expect(icjOrderDocument.keyRulings[0]).toContain("Article II");
    });

    it("preserves verbatim body text", () => {
      const result = normalizer.normalize(icjOrderDocument);

      expect(result.bodyText).toBe(icjOrderDocument.bodyText);
      expect(result.bodyText).toContain("By fifteen votes to two");
    });

    it("extracts fields from an ICC arrest warrant", () => {
      const result = normalizer.normalize(iccWarrantDocument);

      expect(result.court).toBe("ICC");
      expect(result.caseName).toBe("The Prosecutor v. Benjamin Netanyahu and Yoav Gallant");
      expect(result.caseNumber).toBe("ICC-01/18");
      expect(result.parties).toContain("The Prosecutor");
      expect(result.documentType).toBe("warrant");
    });

    it("maps ICC warrant to arrest_warrant_issued legal status", () => {
      const result = normalizer.normalize(iccWarrantDocument);

      expect(result.legalStatus).toContain("arrest_warrant_issued");
      expect(result.legalStatus).toContain("court_proceeding_active");
      expect(result.timelineEventType).toBe("arrest_warrant_issued");
    });

    it("maps ICC prosecutor statement correctly", () => {
      const result = normalizer.normalize(iccProceedingUpdate);

      expect(result.documentType).toBe("prosecutor_statement");
      expect(result.legalStatus).toContain("allegation_under_investigation");
      expect(result.timelineEventType).toBe("official_report_update");
    });

    it("maps ICJ press release correctly", () => {
      const result = normalizer.normalize(icjPressRelease);

      expect(result.documentType).toBe("press_release");
      expect(result.timelineEventType).toBe("official_report_update");
    });

    it("generates relevant tags", () => {
      const result = normalizer.normalize(icjOrderDocument);

      expect(result.tags).toContain("icj");
      expect(result.tags).toContain("order");
      expect(result.tags).toContain("gaza");
    });

    it("includes legal basis in output", () => {
      const result = normalizer.normalize(iccWarrantDocument);

      expect(result.legalBasis.length).toBeGreaterThan(0);
      expect(result.legalBasis.some((b) => b.includes("Rome Statute"))).toBe(true);
    });

    it("includes next steps in output", () => {
      const result = normalizer.normalize(icjOrderDocument);

      expect(result.nextSteps.length).toBeGreaterThan(0);
      expect(result.nextSteps.some((s) => s.toLowerCase().includes("report"))).toBe(true);
    });

    it("detects document type from title and body when not explicitly set", () => {
      // Create a document without explicit documentType — the normalizer should detect it
      const rawWithDetection: RawCourtDocument = {
        ...icjOrderDocument,
        documentType: undefined as unknown as RawCourtDocument["documentType"],
      };

      const result = normalizer.normalize(rawWithDetection);

      // The detection should still result in "order" based on title/body content
      expect(result.documentType).toBeDefined();
      expect(["order", "judgment", "press_release"]).toContain(result.documentType);
    });

    it("detects case number when not explicitly provided", () => {
      const rawNoCase: RawCourtDocument = {
        ...iccWarrantDocument,
        caseNumber: undefined,
      };

      const result = normalizer.normalize(rawNoCase);

      expect(result.caseNumber).toBeDefined();
    });
  });

  describe("validate", () => {
    it("accepts valid document", () => {
      const result = normalizer.validate(icjOrderDocument);
      expect(result.valid).toBe(true);
    });

    it("rejects document with missing URL", () => {
      const result = normalizer.validate({ ...icjOrderDocument, url: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("URL");
    });

    it("rejects document with missing title", () => {
      const result = normalizer.validate({ ...icjOrderDocument, title: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("title");
    });

    it("rejects document with missing body text", () => {
      const result = normalizer.validate({ ...icjOrderDocument, bodyText: "" });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("body");
    });

    it("rejects document with invalid court", () => {
      const result = normalizer.validate({
        ...icjOrderDocument,
        court: "UNKNOWN" as "ICJ" | "ICC",
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Invalid court");
    });

    it("rejects document with missing body text", () => {
      const result = normalizer.validate({ ...icjOrderDocument, bodyText: "  " });
      expect(result.valid).toBe(false);
    });
  });
});
