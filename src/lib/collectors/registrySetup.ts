// src/lib/collectors/registrySetup.ts
// Central registration of all collectors. Import this once at app init
// or in any context that needs the full collector suite (RuntimeEngine,
// FeedManager, scheduler, tests).
//
// All collector imports and their source-type mappings live here so
// there is exactly one place to add or remove a collector.

import type { SourceType } from "../../types/content";
import type { StorageInterface } from "./types";
import type { CollectorConstructor } from "./CollectorRegistry";
import { CollectorRegistry } from "./CollectorRegistry";
import { RateLimiter } from "./rateLimiter";

// Court collectors
import { ICJCollector } from "./courts/ICJCollector";
import { ICCCollector } from "./courts/ICCCollector";

// UN collectors
import { OHCHRCollector } from "./un/OHCHRCollector";
import { OCHACollector } from "./un/OCHACollector";

// EU & Belgium collectors
import { EUCollector } from "./eu/EUCollector";
import { BelgiumCollector } from "./eu/BelgiumCollector";

// NGO collectors
import { AmnestyCollector } from "./ngo/AmnestyCollector";
import { HRWCollector } from "./ngo/HRWCollector";
import { BtselemCollector } from "./ngo/BtselemCollector";
import { MSFCollector } from "./ngo/MSFCollector";
import { ICRCCollector } from "./ngo/ICRCCollector";

// Media collectors
import { JournalismCollector } from "./media/JournalismCollector";
import { AcademicCollector } from "./media/AcademicCollector";

// ── Registry entries ────────────────────────────────────────────────────────

export interface CollectorEntry {
  cls: CollectorConstructor;
  types: SourceType[];
  label: string;
}

/**
 * All 13 active collectors with their source-type mappings.
 *
 * Order matters: the LAST collector registered for a given source type
 * is returned by `getCollectorForType()` as the default. RSS-capable
 * collectors (Journalism, Academic) are registered last so they serve as
 * the default for feeds of their respective types, while the specific
 * HTML-scraping collectors (Amnesty, HRW, ICJ, etc.) remain available
 * via `getCollectorsForType()`.
 */
export const ALL_COLLECTORS: CollectorEntry[] = [
  // Specific HTML-scraping collectors (registered first — available but not default)
  { cls: ICJCollector, types: ["court"], label: "ICJ" },
  { cls: ICCCollector, types: ["court"], label: "ICC" },
  { cls: OHCHRCollector, types: ["un"], label: "OHCHR" },
  { cls: OCHACollector, types: ["un"], label: "OCHA" },
  { cls: EUCollector, types: ["government"], label: "EU" },
  { cls: BelgiumCollector, types: ["government"], label: "Belgium" },
  { cls: AmnestyCollector, types: ["ngo"], label: "Amnesty" },
  { cls: HRWCollector, types: ["ngo"], label: "HRW" },
  { cls: BtselemCollector, types: ["ngo"], label: "Btselem" },
  { cls: MSFCollector, types: ["ngo"], label: "MSF" },
  { cls: ICRCCollector, types: ["ngo"], label: "ICRC" },

  // RSS/feed-capable collectors (registered last — default for feed-based collection)
  // JournalismCollector handles RSS for journalism, ngo, and academic feed types
  { cls: JournalismCollector, types: ["journalism", "ngo", "academic"], label: "Journalism" },
  { cls: AcademicCollector, types: ["academic"], label: "Academic" },
];

// ── Setup ────────────────────────────────────────────────────────────────────

/**
 * Register every collector in the provided registry.
 *
 * Safe to call multiple times — subsequent calls are no-ops because
 * the registry overwrites entries for already-registered source types.
 *
 * @returns The same registry instance for chaining.
 */
export function setupRegistry(
  registry: CollectorRegistry,
): CollectorRegistry {
  for (const { cls, types, label } of ALL_COLLECTORS) {
    registry.register(cls, types, label);
  }
  return registry;
}

/**
 * Convenience: create a new CollectorRegistry with all collectors
 * pre-registered and the given storage + rate limiter.
 */
export function createConfiguredRegistry(
  storage: StorageInterface,
  rateLimiter?: RateLimiter,
): CollectorRegistry {
  const limiter = rateLimiter ?? new RateLimiter();
  const registry = new CollectorRegistry(storage, limiter);
  return setupRegistry(registry);
}

/**
 * Get the list of source types currently covered by the full suite.
 * Useful for monitoring coverage-gap detection.
 */
export function getCoveredSourceTypes(): SourceType[] {
  const types = new Set<SourceType>();
  for (const entry of ALL_COLLECTORS) {
    for (const t of entry.types) {
      types.add(t);
    }
  }
  return Array.from(types);
}
