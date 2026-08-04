import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ICRCCollector } from "../ICRCCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { ValidationError } from "../../errors";
import { CollectorRegistry } from "../../CollectorRegistry";
import { icrcIhlStatementHtml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "icrc-test",
    slug: "icrc-test",
    title: "International Committee of the Red Cross",
    publisher: "International Committee of the Red Cross",
    sourceType: "humanitarian" as SourceType,
    url: "https://www.icrc.org/en/document/gaza-ihl-statement-2026",
    accessedAt: "2026-08-01",
    status: "active",
    version: 1,
    correctionUrl: "/corrections",
    trustLevel: 0,
    healthStatus: "unknown",
    automationStatus: "manual",
    failureCount: 0,
    monitoringEnabled: false,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<CollectorConfig> = {}): CollectorConfig {
  return {
    sourceId: "icrc-test",
    label: "ICRCCollector",
    sourceType: "humanitarian" as SourceType,
    enabled: true,
    trigger: { type: "manual" as const },
    rateLimit: DEFAULT_RATE_LIMIT,
    retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000,
    maxContentAgeMs: 24 * 60 * 60 * 1000,
    storeRawResponse: false,
    ...overrides,
  };
}

describe("ICRCCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: ICRCCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new ICRCCollector(source, config, storage, rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
  });

  describe("fetch", () => {
    it("fetches and parses an ICRC IHL statement from HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(icrcIhlStatementHtml),
      });

      const result = await collector.fetch();
      expect(result).toHaveLength(1);
      const doc = result[0] as Record<string, unknown>;
      expect(doc.organization).toBe("International Committee of the Red Cross");
      expect(doc.reportType).toBe("ihl_statement");
      expect(doc.title).toContain("international humanitarian law");
    });

    it("detects Geneva Convention references in IHL statements", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(icrcIhlStatementHtml),
      });

      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;
      const legalRefs = doc.legalReferences as string[];
      expect(legalRefs.length).toBeGreaterThan(0);
    });
  });

  describe("normalize", () => {
    it("normalizes an ICRC document through NGONormalizer", async () => {
      const rawDoc = {
        url: "https://www.icrc.org/en/document/gaza-ihl-statement",
        title: "Gaza: ICRC calls for respect of IHL",
        organization: "International Committee of the Red Cross",
        reportType: "ihl_statement" as const,
        date: "2026-07-25",
        bodyText: "The ICRC reminds all parties of their obligations under the Geneva Conventions.",
        summaryText: "ICRC calls for respect of IHL.",
        keyFindings: ["Medical facilities must be protected at all times"],
        legalReferences: ["Geneva Convention IV Article 18", "Additional Protocol I Article 12"],
        language: "en",
        isOfficialSource: false,
      };

      const result = await collector.normalize(rawDoc);
      expect(result.metadata.organization).toBe("International Committee of the Red Cross");
      expect(result.metadata.reportType).toBe("ihl_statement");
      expect(result.metadata.isOfficialSource).toBe(false);
    });

    it("labels ICRC content as a humanitarian organization with a Geneva Conventions disclaimer", async () => {
      const rawDoc = {
        url: "https://www.icrc.org/en/document/gaza-ihl-statement",
        title: "Gaza: ICRC calls for respect of IHL",
        organization: "International Committee of the Red Cross",
        reportType: "ihl_statement" as const,
        date: "2026-07-25",
        bodyText: "The ICRC reminds all parties of their obligations under the Geneva Conventions.",
        keyFindings: ["Medical facilities must be protected at all times"],
        legalReferences: ["Geneva Convention IV Article 18"],
        language: "en",
        isOfficialSource: false,
      };

      const result = await collector.normalize(rawDoc);
      expect(result.metadata.sourceCategory).toBe("humanitarian-organization");
      expect(result.metadata.disclaimer).toContain("Geneva Conventions");
    });

    it("throws ValidationError for missing body text", async () => {
      const invalidDoc = {
        url: "https://www.icrc.org/en/document/gaza-ihl-statement",
        title: "Gaza: ICRC calls for respect of IHL",
        organization: "International Committee of the Red Cross",
        reportType: "ihl_statement" as const,
        bodyText: "",
        keyFindings: [],
        legalReferences: [],
        language: "en",
        isOfficialSource: false,
      };

      await expect(collector.normalize(invalidDoc)).rejects.toThrow(ValidationError);
    });
  });

  describe("CollectorRegistry integration", () => {
    it("registers for humanitarian source type", () => {
      const regStorage = new DevMemoryStore();
      const regRateLimiter = new RateLimiter();
      const registry = new CollectorRegistry(regStorage, regRateLimiter);

      registry.register(ICRCCollector, ["humanitarian"], "ICRC humanitarian collector");

      expect(registry.hasCollectorForType("humanitarian")).toBe(true);
      expect(registry.hasCollectorForType("ngo")).toBe(false);

      registry.reset();
    });
  });
});
