// src/lib/collectors/filters/RelevanceFilter.ts
// Configurable filtering pipeline that runs between deduplicate and store.
// Each collected item passes through a chain of rules — any rule can ACCEPT
// (keep immediately), REJECT (discard with reason), or PASS (defer to next rule).
//
// Discard reasons use the canonical taxonomy (lib/taxonomy).

import type { CollectedItem } from "../types";
import type { DiscardReason } from "../../taxonomy";

// ── Types ────────────────────────────────────────────────────────────────────

export type FilterVerdict = "ACCEPT" | "REJECT" | "PASS";

export interface FilterRule {
  name: string;
  evaluate: (item: CollectedItem, ctx: FilterContext) => FilterVerdict | Promise<FilterVerdict>;
}

export interface FilterContext {
  /** Minimum trust_level to accept (0-5). Sources below this are rejected. */
  minTrustLevel: number;
  /** URL patterns to reject (e.g., noise domains, aggregators). */
  urlBlacklist: string[];
  /** Keywords that trigger rejection when found in title/body. */
  keywordBlacklist: string[];
  /** If set, only these languages pass the filter. */
  allowedLanguages: string[];
  /** If set, only these entity types are accepted. */
  requiredEntities: string[];
  /** Collectors can store arbitrary config here. */
  [key: string]: unknown;
}

export interface FilterResult {
  accepted: boolean;
  reason?: DiscardReason;
  ruleName?: string;
}

export const DEFAULT_FILTER_CONTEXT: FilterContext = {
  minTrustLevel: 0,           // accept all by default
  urlBlacklist: [],
  keywordBlacklist: [
    "sponsored content", "advertisement", "click here",
  ],
  allowedLanguages: [],       // empty = all allowed
  requiredEntities: [],       // empty = no entity gate
};

// ── Built-in rules ───────────────────────────────────────────────────────────

/** Reject items from sources below the minimum trust level. */
export const sourceCredibilityRule: FilterRule = {
  name: "source_credibility",
  evaluate: (item, ctx) => {
    const trust = (item.normalized?.metadata?.trustLevel as number) ?? 0;
    if (trust < ctx.minTrustLevel) return "REJECT";
    return "PASS";
  },
};

/** Reject items whose URL matches blacklist patterns. */
export const urlBlacklistRule: FilterRule = {
  name: "url_blacklist",
  evaluate: (item, ctx) => {
    if (ctx.urlBlacklist.length === 0) return "PASS";
    const url = item.url.toLowerCase();
    for (const pattern of ctx.urlBlacklist) {
      if (url.includes(pattern.toLowerCase())) return "REJECT";
    }
    return "PASS";
  },
};

/** Reject items containing blacklisted keywords in title or body. */
export const keywordBlacklistRule: FilterRule = {
  name: "keyword_blacklist",
  evaluate: (item, ctx) => {
    if (ctx.keywordBlacklist.length === 0) return "PASS";
    const text = `${item.normalized?.title ?? ""} ${item.normalized?.body ?? ""}`.toLowerCase();
    for (const kw of ctx.keywordBlacklist) {
      if (text.includes(kw.toLowerCase())) return "REJECT";
    }
    return "PASS";
  },
};

/** Reject items in unsupported languages (when allowedLanguages is configured). */
export const languageFilterRule: FilterRule = {
  name: "language_filter",
  evaluate: (item, ctx) => {
    if (ctx.allowedLanguages.length === 0) return "PASS";
    const lang = (item.normalized?.language as string)?.split("-")[0] ?? "en";
    if (!ctx.allowedLanguages.includes(lang)) return "REJECT";
    return "PASS";
  },
};

// ── Filter runner ────────────────────────────────────────────────────────────

/**
 * Default filter chain — runs in order, first REJECT/ACCEPT verdict wins.
 * Rules are pluggable; add custom rules for specific source types.
 */
const DEFAULT_RULES: FilterRule[] = [
  sourceCredibilityRule,
  urlBlacklistRule,
  keywordBlacklistRule,
  languageFilterRule,
];

/**
 * Run collected items through the filter chain.
 * Returns accepted items and a map of fingerprint → discard reason for rejected items.
 */
export async function applyFilters(
  items: CollectedItem[],
  context: FilterContext = DEFAULT_FILTER_CONTEXT,
  rules: FilterRule[] = DEFAULT_RULES,
): Promise<{
  accepted: CollectedItem[];
  rejected: Array<{ fingerprint: string; reason: DiscardReason; ruleName: string }>;
}> {
  const accepted: CollectedItem[] = [];
  const rejected: Array<{ fingerprint: string; reason: DiscardReason; ruleName: string }> = [];

  for (const item of items) {
    let verdict: FilterVerdict = "PASS";
    let rejectedBy = "";

    for (const rule of rules) {
      verdict = await rule.evaluate(item, context);
      if (verdict !== "PASS") {
        rejectedBy = rule.name;
        break;
      }
    }

    if (verdict === "ACCEPT" || verdict === "PASS") {
      accepted.push(item);
    } else {
      // Map rule name to discard reason
      const reason = ruleNameToDiscardReason(rejectedBy);
      rejected.push({ fingerprint: item.fingerprint, reason, ruleName: rejectedBy });
    }
  }

  return { accepted, rejected };
}

function ruleNameToDiscardReason(ruleName: string): DiscardReason {
  const map: Record<string, DiscardReason> = {
    source_credibility: "low_credibility_source",
    url_blacklist: "out_of_scope",
    keyword_blacklist: "non_accountability_topic",
    language_filter: "language_not_supported",
  };
  return map[ruleName] ?? ("out_of_scope" as DiscardReason);
}
