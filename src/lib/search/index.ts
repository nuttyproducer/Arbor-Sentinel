/**
 * Local static search and cross-record relationship layer.
 *
 * Usage:
 * ```ts
 * import { search, getRelationships, RECORD_TYPE_LABELS } from "../lib/search";
 *
 * const results = search({ query: "ICJ provisional measures" });
 * const rels = getRelationships("source:icj-2024-01-26");
 * ```
 */

export type {
  SearchableRecordType,
  SearchableRecord,
  SearchQuery,
  SearchResult,
  SearchResponse,
  RelatedRecord,
  RecordRelationships,
} from "./types";

export { RECORD_TYPE_LABELS } from "./types";

export { search, quickSearch } from "./search";
export { getSearchIndex, rebuildIndex, getIndexedCount } from "./buildIndex";
export { getRelationships } from "./relationships";
