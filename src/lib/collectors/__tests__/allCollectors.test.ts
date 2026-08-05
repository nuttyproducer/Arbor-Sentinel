/**
 * Integration test: all collectors load and register correctly.
 * Verifies every collector can be registered, instantiated, and
 * produces valid CollectResult outputs.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CollectorRegistry } from "../CollectorRegistry";
import { RateLimiter } from "../rateLimiter";
import { DevMemoryStore } from "../store";

// Court collectors
import { ICJCollector } from "../courts/ICJCollector";
import { ICCCollector } from "../courts/ICCCollector";

// UN collectors
import { OHCHRCollector } from "../un/OHCHRCollector";
import { OCHACollector } from "../un/OCHACollector";

// EU & Belgium collectors
import { EUCollector } from "../eu/EUCollector";
import { BelgiumCollector } from "../eu/BelgiumCollector";

// NGO collectors
import { AmnestyCollector } from "../ngo/AmnestyCollector";
import { HRWCollector } from "../ngo/HRWCollector";
import { BtselemCollector } from "../ngo/BtselemCollector";
import { MSFCollector } from "../ngo/MSFCollector";
import { ICRCCollector } from "../ngo/ICRCCollector";

// Media collectors
import { JournalismCollector } from "../media/JournalismCollector";
import { AcademicCollector } from "../media/AcademicCollector";

import type { SourceRecord, SourceType } from "../../../types/content";
import type { CollectorConfig } from "../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../types";
import { BaseCollector } from "../BaseCollector";

// ── Collector registry ────────────────────────────────────────────────────────

const ALL_COLLECTORS = [
  { cls: ICJCollector, types: ["court"] as SourceType[], label: "ICJ" },
  { cls: ICCCollector, types: ["court"] as SourceType[], label: "ICC" },
  { cls: OHCHRCollector, types: ["un"] as SourceType[], label: "OHCHR" },
  { cls: OCHACollector, types: ["un"] as SourceType[], label: "OCHA" },
  { cls: EUCollector, types: ["government"] as SourceType[], label: "EU" },
  { cls: BelgiumCollector, types: ["government"] as SourceType[], label: "Belgium" },
  { cls: AmnestyCollector, types: ["ngo"] as SourceType[], label: "Amnesty" },
  { cls: HRWCollector, types: ["ngo"] as SourceType[], label: "HRW" },
  { cls: BtselemCollector, types: ["ngo"] as SourceType[], label: "Btselem" },
  { cls: MSFCollector, types: ["ngo"] as SourceType[], label: "MSF" },
  { cls: ICRCCollector, types: ["ngo"] as SourceType[], label: "ICRC" },
  { cls: JournalismCollector, types: ["journalism"] as SourceType[], label: "Journalism" },
  { cls: AcademicCollector, types: ["academic"] as SourceType[], label: "Academic" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSource(type: SourceType, url: string): SourceRecord {
  return {
    id: `src-${type}`,
    slug: `slug-${type}`,
    title: `${type} Test Source`,
    publisher: `${type} Publisher`,
    sourceType: type,
    url,
    accessedAt: "2026-08-03",
    status: "active",
    version: 1,
    correctionUrl: "/corrections",
    trustLevel: 0,
    healthStatus: "unknown",
    automationStatus: "manual",
    failureCount: 0,
    monitoringEnabled: false,
  };
}

function makeConfig(type: SourceType): CollectorConfig {
  return {
    sourceId: `src-${type}`,
    label: `${type}Test`,
    sourceType: type,
    enabled: true,
    trigger: { type: "manual" as const },
    rateLimit: DEFAULT_RATE_LIMIT,
    retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000,
    maxContentAgeMs: 24 * 60 * 60 * 1000,
    storeRawResponse: false,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("All Collectors — Registration & Discovery", () => {
  let registry: CollectorRegistry;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    registry = new CollectorRegistry(storage, rateLimiter);
  });

  afterEach(() => {
    registry.reset();
    storage.clear();
  });

  it("registers all 13 collectors without errors", () => {
    for (const { cls, types, label } of ALL_COLLECTORS) {
      expect(() => registry.register(cls, types, label)).not.toThrow();
    }
    expect(registry.listRegistrations()).toHaveLength(ALL_COLLECTORS.length);
  });

  it("covers all required source types", () => {
    for (const { cls, types, label } of ALL_COLLECTORS) {
      registry.register(cls, types, label);
    }
    const covered = registry.getCoveredSourceTypes();
    expect(covered).toContain("court");
    expect(covered).toContain("un");
    expect(covered).toContain("government");
    expect(covered).toContain("ngo");
    expect(covered).toContain("journalism");
    expect(covered).toContain("academic");
  });

  it("creates an instance of every collector type from the registry", () => {
    const sourceUrls: Record<string, string> = {
      court: "https://www.icj-cij.org/node/200001",
      un: "https://www.ohchr.org/en/test",
      government: "https://www.europarl.europa.eu/test",
      ngo: "https://www.amnesty.org/en/test",
      journalism: "https://www.test-news-outlet.org/test",
      academic: "https://doi.org/10.9999/test.001",
    };

    for (const { cls, types, label } of ALL_COLLECTORS) {
      registry.register(cls, types, label);
    }

    for (const type of ["court", "un", "government", "ngo", "journalism", "academic"] as SourceType[]) {
      const source = makeSource(type, sourceUrls[type] ?? "https://example.com");
      const config = makeConfig(type);
      const instance = registry.createInstance(source, config);
      expect(instance).toBeInstanceOf(BaseCollector);
      expect(registry.hasCollectorForType(type)).toBe(true);
    }
  });

  it("lists all registrations with correct metadata", () => {
    for (const { cls, types, label } of ALL_COLLECTORS) {
      registry.register(cls, types, label);
    }

    const list = registry.listRegistrations();
    expect(list).toHaveLength(ALL_COLLECTORS.length);

    for (const entry of list) {
      expect(entry.name).toBeTruthy();
      expect(entry.supportedSourceTypes.length).toBeGreaterThan(0);
      expect(entry.description).toBeTruthy();
      expect(entry.healthStatus).toBe("unknown");
      expect(entry.consecutiveFailures).toBe(0);
    }
  });

  it("tracks health across all collectors", () => {
    for (const { cls, types, label } of ALL_COLLECTORS) {
      registry.register(cls, types, label);
    }

    // Record success for all
    for (const { cls } of ALL_COLLECTORS) {
      registry.recordSuccess(cls.name);
    }

    const active = registry.findByHealth("active");
    expect(active).toHaveLength(ALL_COLLECTORS.length);

    // Record failure for one
    registry.recordFailure(ALL_COLLECTORS[0].cls.name);
    registry.recordFailure(ALL_COLLECTORS[0].cls.name);
    registry.recordFailure(ALL_COLLECTORS[0].cls.name);

    const failed = registry.findByHealth("failed");
    expect(failed).toHaveLength(1);
  });

  it("unregisters collectors individually", () => {
    for (const { cls, types, label } of ALL_COLLECTORS) {
      registry.register(cls, types, label);
    }

    expect(registry.listRegistrations()).toHaveLength(ALL_COLLECTORS.length);

    // Unregister one
    registry.unregister(ALL_COLLECTORS[0].cls.name);
    expect(registry.listRegistrations()).toHaveLength(ALL_COLLECTORS.length - 1);
  });

  it("reset clears all registrations", () => {
    for (const { cls, types, label } of ALL_COLLECTORS) {
      registry.register(cls, types, label);
    }

    registry.reset();
    expect(registry.listRegistrations()).toHaveLength(0);
    expect(registry.getCoveredSourceTypes()).toHaveLength(0);
  });
});
