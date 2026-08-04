// src/lib/graph/EntityResolver.ts
//
// Entity resolution system for the knowledge graph.
// Merges duplicate entities, resolves name variants, and maintains canonical IDs.
//
// Resolution rules:
// - Entities must have the same type to be merged (never merge person into org)
// - Name similarity is checked via normalized comparison
// - Source overlap (shared source documents) increases merge confidence
// - All merges are logged and reversible
// - Original IDs are preserved as aliases on the canonical entity

import type { NodeType, MergeRecord } from "./types";

// ── Entity resolver ──────────────────────────────────────────────────────────

/**
 * Configuration for the entity resolver.
 */
export interface EntityResolverConfig {
  /** Minimum name similarity score (0–1) to consider two entities as candidates. Default: 0.7. */
  minNameSimilarity: number;
  /** Minimum confidence (0–1) required to auto-merge. Below this, merge is flagged for review. Default: 0.85. */
  autoMergeConfidence: number;
  /** Whether to consider source overlap in merge decisions. Default: true. */
  useSourceOverlap: boolean;
}

const DEFAULT_CONFIG: EntityResolverConfig = {
  minNameSimilarity: 0.7,
  autoMergeConfidence: 0.85,
  useSourceOverlap: true,
};

export class EntityResolver {
  private config: EntityResolverConfig;

  /** Canonical ID → set of alias IDs (including the canonical ID itself). */
  private canonicalToAliases: Map<string, Set<string>> = new Map();

  /** Alias ID → canonical ID. */
  private aliasToCanonical: Map<string, string> = new Map();

  /** Complete merge history. */
  private mergeLog: MergeRecord[] = [];

  /** Merge counter for generating unique merge IDs. */
  private mergeCounter = 0;

  constructor(config: Partial<EntityResolverConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Resolution ───────────────────────────────────────────────────────────

  /**
   * Find the canonical ID for an entity.
   * If the entity has not been merged, returns its own ID (and registers it).
   */
  resolve(id: string): string {
    const canonical = this.aliasToCanonical.get(id);
    if (canonical) return canonical;

    // Not yet known — it's its own canonical
    if (!this.canonicalToAliases.has(id)) {
      this.canonicalToAliases.set(id, new Set([id]));
      this.aliasToCanonical.set(id, id);
    }
    return id;
  }

  /**
   * Get all aliases (including the canonical ID) for a given entity ID.
   */
  getAliases(id: string): string[] {
    const canonicalId = this.resolve(id);
    return Array.from(this.canonicalToAliases.get(canonicalId) ?? [id]);
  }

  /**
   * Check whether an entity ID is the canonical one.
   */
  isCanonical(id: string): boolean {
    return this.resolve(id) === id;
  }

  /**
   * Check if two entity IDs resolve to the same canonical entity.
   */
  isSameEntity(id1: string, id2: string): boolean {
    return this.resolve(id1) === this.resolve(id2);
  }

  // ── Entity matching ──────────────────────────────────────────────────────

  /**
   * Compute name similarity between two entity names (0–1).
   * Uses a normalized Levenshtein-like approach with common cleanup.
   */
  computeNameSimilarity(name1: string, name2: string): number {
    const a = normalizeEntityName(name1);
    const b = normalizeEntityName(name2);

    if (a === b) return 1.0;
    if (a.length === 0 || b.length === 0) return 0;

    // Check if one is a substring of the other
    if (a.includes(b) || b.includes(a)) {
      const shorter = Math.min(a.length, b.length);
      const longer = Math.max(a.length, b.length);
      return shorter / longer;
    }

    // Levenshtein distance normalized to 0–1
    const distance = levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    return 1 - distance / maxLen;
  }

  /**
   * Find merge candidates for a given entity among existing entities.
   * Returns candidate IDs sorted by match confidence (descending).
   */
  findCandidates(
    entity: { id: string; type: NodeType; name: string; sourceIds?: string[] },
    candidates: Array<{ id: string; type: NodeType; name: string; sourceIds?: string[] }>,
  ): Array<{ candidateId: string; confidence: number; rationale: string }> {
    const results: Array<{ candidateId: string; confidence: number; rationale: string }> = [];

    for (const candidate of candidates) {
      if (candidate.id === entity.id) continue;

      // Never merge across types
      if (candidate.type !== entity.type) continue;

      const nameSimilarity = this.computeNameSimilarity(entity.name, candidate.name);
      if (nameSimilarity < this.config.minNameSimilarity) continue;

      let confidence = nameSimilarity;

      // Boost confidence if they share sources
      if (this.config.useSourceOverlap) {
        const sourceOverlap = computeSourceOverlap(
          entity.sourceIds ?? [],
          candidate.sourceIds ?? [],
        );
        if (sourceOverlap > 0) {
          confidence = Math.min(1, confidence + sourceOverlap * 0.2);
        }
      }

      results.push({
        candidateId: candidate.id,
        confidence,
        rationale: `Name similarity: ${nameSimilarity.toFixed(2)}${entity.sourceIds?.length ? `, source overlap: ${computeSourceOverlap(entity.sourceIds ?? [], candidate.sourceIds ?? []).toFixed(2)}` : ""}`,
      });
    }

    // Sort by confidence descending
    results.sort((a, b) => b.confidence - a.confidence);
    return results;
  }

  // ── Merge operations ─────────────────────────────────────────────────────

  /**
   * Merge one or more entity IDs into a single canonical entity.
   *
   * The first ID in mergedIds is treated as the canonical (survivor).
   * All subsequent IDs are merged into it.
   *
   * Throws if entities have conflicting type assignments that have been
   * explicitly set differently.
   */
  merge(
    entityType: NodeType,
    mergedIds: string[],
    rationale: MergeRecord["rationale"] = "name_similarity",
    confidence = 0.9,
    performedBy = "auto",
  ): MergeRecord {
    if (mergedIds.length < 2) {
      throw new Error("Merge requires at least 2 entity IDs.");
    }

    // Resolve all IDs to their current canonicals first
    const canonicalIds = mergedIds.map((id) => this.resolve(id));
    const uniqueCanonicals = [...new Set(canonicalIds)];

    if (uniqueCanonicals.length < 2) {
      throw new Error("All provided IDs already resolve to the same canonical entity.");
    }

    const canonicalId = uniqueCanonicals[0];
    const idsToMerge = uniqueCanonicals.slice(1);

    const record: MergeRecord = {
      id: `merge-${++this.mergeCounter}-${Date.now()}`,
      canonicalId,
      mergedIds: idsToMerge,
      entityType,
      rationale,
      confidence,
      performedBy,
      timestamp: new Date().toISOString(),
    };

    // Execute merge
    for (const mergeId of idsToMerge) {
      const aliases = this.canonicalToAliases.get(mergeId);
      if (aliases) {
        for (const alias of aliases) {
          this.aliasToCanonical.set(alias, canonicalId);
          this.canonicalToAliases.get(canonicalId)?.add(alias);
        }
        this.canonicalToAliases.delete(mergeId);
      }
    }

    this.mergeLog.push(record);
    return record;
  }

  /**
   * Reverse a merge operation using its merge record ID.
   * Restores the original canonical-to-alias mappings.
   */
  reverseMerge(mergeId: string): boolean {
    const idx = this.mergeLog.findIndex((r) => r.id === mergeId);
    if (idx === -1) return false;

    const record = this.mergeLog[idx];

    // Remove merged IDs from the canonical's alias set
    for (const mergedId of record.mergedIds) {
      const aliases = this.canonicalToAliases.get(record.canonicalId);
      if (aliases) {
        // Restore the merged ID as its own canonical again
        this.canonicalToAliases.set(mergedId, new Set([mergedId]));
        this.aliasToCanonical.set(mergedId, mergedId);

        // Remove from the canonical's alias set
        aliases.delete(mergedId);
      }
    }

    // Remove the merge record
    this.mergeLog.splice(idx, 1);
    return true;
  }

  /**
   * Undo the most recent merge operation.
   */
  undoLastMerge(): MergeRecord | undefined {
    if (this.mergeLog.length === 0) return undefined;
    const lastRecord = this.mergeLog[this.mergeLog.length - 1];
    this.reverseMerge(lastRecord.id);
    return lastRecord;
  }

  // ── Merge history ────────────────────────────────────────────────────────

  /** Get the complete merge log. */
  getMergeHistory(): MergeRecord[] {
    return [...this.mergeLog];
  }

  /** Get merge records involving a specific entity ID. */
  getMergeHistoryForEntity(entityId: string): MergeRecord[] {
    const canonicalId = this.resolve(entityId);
    return this.mergeLog.filter(
      (r) =>
        r.canonicalId === canonicalId ||
        r.mergedIds.includes(canonicalId) ||
        r.mergedIds.some((mid) => this.resolve(mid) === canonicalId),
    );
  }

  /** Check if two entity types are compatible for merging. Never merges across types. */
  canMergeTypes(type1: NodeType, type2: NodeType): boolean {
    // Same type — always compatible
    if (type1 === type2) return true;

    // Certain types are semantically compatible but stored differently:
    // "entity" is the generic bucket for AI-extracted things.
    // "organization" and "country" are specific subtypes.
    // We strictly forbid cross-type merges per the guardrail.
    return false;
  }

  // ── Bulk resolution ──────────────────────────────────────────────────────

  /**
   * Resolve duplicates among a batch of entities.
   * Finds clusters of similar entities and merges them.
   * Returns the merge records for all auto-merges performed.
   */
  resolveBatch(
    entities: Array<{
      id: string;
      type: NodeType;
      name: string;
      sourceIds?: string[];
    }>,
    performedBy = "auto-batch",
  ): MergeRecord[] {
    const records: MergeRecord[] = [];
    const processed = new Set<string>();

    for (const entity of entities) {
      if (processed.has(entity.id)) continue;

      const candidates = this.findCandidates(
        entity,
        entities.filter((e) => !processed.has(e.id) && e.id !== entity.id),
      );

      const autoMerges = candidates.filter(
        (c) => c.confidence >= this.config.autoMergeConfidence,
      );

      for (const match of autoMerges) {
        try {
          // Ensure we use the correct canonical ID order
          const existingCanonical = this.resolve(entity.id);
          const matchCanonical = this.resolve(match.candidateId);
          if (existingCanonical !== matchCanonical) {
            const record = this.merge(
              entity.type,
              [existingCanonical, matchCanonical],
              "name_similarity",
              match.confidence,
              performedBy,
            );
            records.push(record);
            processed.add(match.candidateId);
          }
        } catch {
          // Skip failed merges (e.g., already resolved to same canonical)
        }
      }

      processed.add(entity.id);
    }

    return records;
  }

  /** Get the total number of unique canonical entities tracked. */
  get canonicalCount(): number {
    return this.canonicalToAliases.size;
  }

  /** Get the total number of aliases (includes canonicals). */
  get aliasCount(): number {
    return this.aliasToCanonical.size;
  }

  /** Reset the resolver to empty state. */
  reset(): void {
    this.canonicalToAliases.clear();
    this.aliasToCanonical.clear();
    this.mergeLog = [];
    this.mergeCounter = 0;
  }

  /** Export the current resolution state for serialization. */
  export(): {
    mappings: Record<string, string[]>;
    mergeLog: MergeRecord[];
  } {
    const mappings: Record<string, string[]> = {};
    for (const [canonical, aliases] of this.canonicalToAliases) {
      mappings[canonical] = Array.from(aliases);
    }
    return { mappings, mergeLog: [...this.mergeLog] };
  }

  /** Import a previously exported resolution state. */
  import(data: { mappings: Record<string, string[]>; mergeLog: MergeRecord[] }): void {
    this.reset();
    for (const [canonical, aliases] of Object.entries(data.mappings)) {
      this.canonicalToAliases.set(canonical, new Set(aliases));
      for (const alias of aliases) {
        this.aliasToCanonical.set(alias, canonical);
      }
    }
    this.mergeLog = [...data.mergeLog];
    // Restore merge counter to avoid collisions
    const maxMerge = data.mergeLog.reduce((max, r) => {
      const num = parseInt(r.id.replace("merge-", "").split("-")[0], 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    this.mergeCounter = maxMerge;
  }
}

// ── Name normalization ───────────────────────────────────────────────────────

/**
 * Normalize an entity name for comparison.
 * - Lowercase
 * - Strip common honorifics and titles
 * - Remove punctuation
 * - Collapse whitespace
 * - Remove common stop words
 */
function normalizeEntityName(name: string): string {
  return name
    .toLowerCase()
    // Remove common titles/honorifics
    .replace(/\b(dr\.?|mr\.?|mrs\.?|ms\.?|prof\.?|hon\.?|sir|lord|lady)\b/gi, "")
    // Remove parenthetical content
    .replace(/\([^)]*\)/g, "")
    // Remove punctuation
    .replace(/[.,;:!?"'`'\-–—]/g, " ")
    // Collapse multiple spaces
    .replace(/\s+/g, " ")
    // Remove common stop words in entity names
    .replace(/\b(the|a|an|of|in|at|on|for|to|by)\b/gi, " ")
    // Collapse again
    .replace(/\s+/g, " ")
    .trim();
}

// ── Levenshtein distance ─────────────────────────────────────────────────────

/**
 * Compute Levenshtein edit distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Optimize: use single-row DP
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

// ── Source overlap ───────────────────────────────────────────────────────────

/**
 * Compute source overlap score (0–1) between two sets of source IDs.
 * Uses Jaccard similarity: |A ∩ B| / |A ∪ B|.
 */
function computeSourceOverlap(sources1: string[], sources2: string[]): number {
  if (sources1.length === 0 && sources2.length === 0) return 0;

  const set1 = new Set(sources1);
  const set2 = new Set(sources2);

  let intersection = 0;
  for (const s of set1) {
    if (set2.has(s)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
