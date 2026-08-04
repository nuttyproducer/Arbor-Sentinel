import { describe, it, expect } from "vitest";
import { GovernmentNormalizer } from "../GovernmentNormalizer";
import { euCouncilConclusion, euParliamentResolution, belgiumFpsPressRelease, belgiumParliamentaryQuestion } from "../mockData";

const normalizer = new GovernmentNormalizer();

describe("GovernmentNormalizer", () => {
  describe("normalize", () => {
    it("extracts institution from EU Council conclusion", () => {
      const result = normalizer.normalize(euCouncilConclusion);
      expect(result.institution).toBe("Council of the European Union");
    });

    it("extracts document reference", () => {
      const result = normalizer.normalize(euCouncilConclusion);
      expect(result.documentReference).toBe("COM(2024) 123");
    });

    it("preserves legal basis citations", () => {
      const result = normalizer.normalize(euCouncilConclusion);
      expect(result.legalBasis).toContain("Article 29 TEU");
      expect(result.legalBasis).toContain("Article 215 TFEU");
    });

    it("preserves vote tally from EP resolution", () => {
      const result = normalizer.normalize(euParliamentResolution);
      expect(result.documentType).toBe("parliament_resolution");
      expect(result.voteTally).toEqual({ for: 338, against: 85, abstain: 38 });
    });

    it("distinguishes government level for Belgium federal document", () => {
      const result = normalizer.normalize(belgiumFpsPressRelease);
      expect(result.governmentLevel).toBe("federal");
    });

    it("tags adopted vs proposed legislation", () => {
      const result = normalizer.normalize(euCouncilConclusion);
      expect(result.tags).toContain("adopted");
      expect(result.tags).toContain("eu");
    });

    it("normalizes a Belgium parliamentary question", () => {
      const result = normalizer.normalize(belgiumParliamentaryQuestion);
      expect(result.documentType).toBe("parliamentary_question");
      expect(result.institution).toBe("Chamber of Representatives");
      expect(result.language).toBe("nl");
    });

    it("marks proposed legislation correctly", () => {
      const proposed = { ...euCouncilConclusion, isAdopted: false };
      const result = normalizer.normalize(proposed);
      expect(result.tags).toContain("proposed");
      expect(result.isAdopted).toBe(false);
    });
  });

  describe("validate", () => {
    it("accepts valid document", () => {
      expect(normalizer.validate(euCouncilConclusion).valid).toBe(true);
    });

    it("rejects missing URL", () => {
      expect(normalizer.validate({ ...euCouncilConclusion, url: "" }).valid).toBe(false);
    });

    it("rejects missing title", () => {
      expect(normalizer.validate({ ...euCouncilConclusion, title: "" }).valid).toBe(false);
    });

    it("rejects missing body text", () => {
      expect(normalizer.validate({ ...euCouncilConclusion, bodyText: "" }).valid).toBe(false);
    });

    it("rejects missing institution", () => {
      expect(normalizer.validate({ ...euCouncilConclusion, institution: "" }).valid).toBe(false);
    });
  });
});
