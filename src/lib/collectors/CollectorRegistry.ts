import type { SourceType, HealthStatus } from "../../types/content";
import type {
  CollectorConfig,
  CollectorRegistration,
  StorageInterface,
} from "./types";
import type { BaseCollector } from "./BaseCollector";
import { RateLimiter } from "./rateLimiter";

/** Constructor type for a collector subclass. */
export type CollectorConstructor = new (
  source: Parameters<BaseCollector["constructor"]>[0],
  config: CollectorConfig,
  storage: StorageInterface,
  rateLimiter: RateLimiter,
) => BaseCollector;

/**
 * Registry for collector classes and instances.
 *
 * Collectors are registered by source type. When a source needs to
 * be collected, the registry discovers the appropriate collector class,
 * instantiates it, and returns the configured instance.
 */
export class CollectorRegistry {
  private readonly classes = new Map<SourceType, CollectorConstructor>();
  private readonly instances = new Map<string, BaseCollector>();
  private readonly registrations = new Map<string, CollectorRegistration>();
  private readonly storage: StorageInterface;
  private readonly rateLimiter: RateLimiter;

  constructor(storage: StorageInterface, rateLimiter: RateLimiter) {
    this.storage = storage;
    this.rateLimiter = rateLimiter;
  }

  // ── Class Registration ─────────────────────────────────────────────────

  /**
   * Register a collector class for one or more source types.
   *
   * @param constructor - The collector class constructor.
   * @param sourceTypes - Source types this collector handles.
   * @param description - Human-readable description.
   */
  register(
    constructor: CollectorConstructor,
    sourceTypes: SourceType[],
    description: string,
  ): void {
    const name = constructor.name;
    const registration: CollectorRegistration = {
      name,
      supportedSourceTypes: sourceTypes,
      description,
      healthStatus: "unknown",
      consecutiveFailures: 0,
    };

    this.registrations.set(name, registration);

    for (const sourceType of sourceTypes) {
      if (this.classes.has(sourceType)) {
        console.warn(
          `CollectorRegistry: Overwriting collector for source type "${sourceType}" ` +
            `(was "${this.classes.get(sourceType)?.name}", now "${name}")`,
        );
      }
      this.classes.set(sourceType, constructor);
    }
  }

  /**
   * Unregister a collector by its constructor name.
   */
  unregister(name: string): void {
    const reg = this.registrations.get(name);
    if (!reg) return;

    for (const sourceType of reg.supportedSourceTypes) {
      if (this.classes.get(sourceType)?.name === name) {
        this.classes.delete(sourceType);
      }
    }
    this.registrations.delete(name);
  }

  // ── Discovery ──────────────────────────────────────────────────────────

  /**
   * Get the collector constructor for a given source type.
   * @returns The constructor, or undefined if no collector is registered.
   */
  getCollectorForType(sourceType: SourceType): CollectorConstructor | undefined {
    return this.classes.get(sourceType);
  }

  /**
   * Check whether a collector is registered for a given source type.
   */
  hasCollectorForType(sourceType: SourceType): boolean {
    return this.classes.has(sourceType);
  }

  /**
   * Get all registered collector class names and their supported types.
   */
  listRegistrations(): CollectorRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Find registrations matching a health status filter.
   */
  findByHealth(status: HealthStatus): CollectorRegistration[] {
    return this.listRegistrations().filter(
      (r) => r.healthStatus === status,
    );
  }

  /**
   * Get all source types that have a registered collector.
   */
  getCoveredSourceTypes(): SourceType[] {
    return Array.from(this.classes.keys());
  }

  // ── Instance Management ────────────────────────────────────────────────

  /**
   * Create (or retrieve cached) a collector instance for a source.
   *
   * @param source - The source record from the Source Registry.
   * @param config - Collector configuration.
   * @returns A configured collector instance.
   * @throws If no collector is registered for this source's type.
   */
  createInstance(
    source: Parameters<BaseCollector["constructor"]>[0],
    config: CollectorConfig,
  ): BaseCollector {
    const cacheKey = `${source.id}:${config.sourceId}`;

    // Return cached instance if available
    const cached = this.instances.get(cacheKey);
    if (cached) return cached;

    const Constructor = this.classes.get(source.sourceType);
    if (!Constructor) {
      throw new Error(
        `No collector registered for source type "${source.sourceType}". ` +
          `Registered types: ${this.getCoveredSourceTypes().join(", ") || "none"}`,
      );
    }

    const instance = new Constructor(source, config, this.storage, this.rateLimiter);
    this.instances.set(cacheKey, instance);
    return instance;
  }

  /**
   * Remove a cached collector instance.
   */
  evictInstance(sourceId: string): void {
    for (const [key] of this.instances) {
      if (key.startsWith(sourceId)) {
        this.instances.delete(key);
      }
    }
  }

  /**
   * Update the health status of a registered collector.
   */
  updateHealth(name: string, status: HealthStatus): void {
    const reg = this.registrations.get(name);
    if (reg) {
      reg.healthStatus = status;
      if (status === "active") {
        reg.consecutiveFailures = 0;
      }
    }
  }

  /**
   * Record a successful run for a collector.
   */
  recordSuccess(name: string): void {
    const reg = this.registrations.get(name);
    if (reg) {
      reg.healthStatus = "active";
      reg.lastSuccessfulRun = new Date().toISOString();
      reg.consecutiveFailures = 0;
    }
  }

  /**
   * Record a failed run for a collector.
   */
  recordFailure(name: string): void {
    const reg = this.registrations.get(name);
    if (reg) {
      reg.consecutiveFailures++;
      reg.healthStatus =
        reg.consecutiveFailures >= 3 ? "failed" : "degraded";
    }
  }

  /** Reset all registry state (for testing). */
  reset(): void {
    this.classes.clear();
    this.instances.clear();
    this.registrations.clear();
    this.rateLimiter.reset();
  }
}
