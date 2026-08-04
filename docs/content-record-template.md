# Content Record Template

**Use when:** Creating a new record in any data collection
(`sources.ts`, `evidenceItems.ts`, `organizations.ts`, `legalCases.ts`,
`countries.ts`, `institutions.ts`, `actionTemplates.ts`,
`attributions.ts`).

**Last reviewed:** 2026-07-12

---

## Required fields (all record types)

Every publishable record must include:

```typescript
{
  // ── Identity ──────────────────────────────────────────────────────
  id: string;           // Stable unique identifier — kebab-case
  slug: string;         // URL-safe slug matching the id
  title: string;        // Human-readable title

  // ── Source basis ──────────────────────────────────────────────────
  sourceIds: string[];  // IDs of SourceRecords supporting this record
                        // For organizations: may be empty if officialWebsite
                        // is valid (the website IS the source)

  // ── Status ────────────────────────────────────────────────────────
  contentStatus: ContentStatus;  // Editorial review state
  sourceQuality?: VerificationLevel;  // 0–5, where applicable
  legalStatuses?: LegalStatus[];      // Where legal context applies

  // ── Review metadata ───────────────────────────────────────────────
  lastReviewedAt?: string;    // ISO date — YYYY-MM-DD
  reviewedByRole?: string;    // Role that performed the review
  reviewNotes?: string;       // Free-text review context or caveats
  nextReviewAt?: string;      // Stale-after date — YYYY-MM-DD

  // ── Versioning ────────────────────────────────────────────────────
  version: number;            // ≥ 1 for publishable records
  correctionUrl: string;      // Route to the corrections process
}
```

## Honest placeholder roles

Do not invent reviewer names. Use one of these honest placeholders:

| Placeholder | When to use |
|---|---|
| `source reviewer pending` | Source URL, publisher, and dates need verification |
| `editorial reviewer pending` | Summary text needs editorial review |
| `legal reviewer pending` | Legal terminology needs expert review |
| `safety reviewer pending` | Content needs safety/privacy review |
| `Belgian governance reviewer pending` | Belgium-specific content needs domain expertise |
| `EU institutional reviewer pending` | EU-specific content needs domain expertise |
| `humanitarian sector reviewer pending` | Humanitarian content needs domain expertise |
| `OSINT methodology reviewer pending` | Open-source investigation content needs domain expertise |
| `Contributor — verified against official public website` | Organization listing verified against its own site |
| `Contributor — internal platform route; no external source review required` | Internal routing actions |
| `Contributor — legal research background` | General legal research, not formal legal review |
| `Contributor — OSINT/data background` | Open-source/data review, not formal verification |
| `Static beta — editorial review pending` | General placeholder for unreviewed beta content |

## Example: evidence record (review_pending)

```typescript
{
  id: "gaza-humanitarian-access-2025",
  slug: "gaza-humanitarian-access-2025",
  title: "Humanitarian access restrictions in Gaza",
  summary: "UN OCHA and humanitarian organisations have documented…",
  category: "humanitarian update",
  sourceIds: [],
  primarySourceType: "humanitarian",
  sourceQuality: 3,
  contentStatus: "review_pending",
  publicationDate: "2024–2025",
  safeLocation: "Gaza",
  sourceLanguage: "en",
  lastReviewedAt: "2026-07-12",
  reviewedByRole: "humanitarian sector reviewer pending",
  version: 1,
  correctionUrl: "/corrections",
  tags: ["humanitarian access", "Gaza", "UN OCHA"],
  relatedRoutes: ["/gaza-dossier", "/methodology"],
}
```

## Example: organization record (reviewed)

```typescript
{
  id: "icrc",
  slug: "icrc",
  name: "ICRC (International Committee of the Red Cross)",
  category: "Red Cross / Red Crescent",
  regions: ["Global", "Gaza", "West Bank", "Israel"],
  shortDescription: "The ICRC is an independent, neutral organisation…",
  officialWebsite: "https://www.icrc.org/",
  officialDonationUrl: "https://www.icrc.org/en/donate",
  services: ["War surgery and medical support", "…"],
  relationshipStatus: "public_resource",
  contentStatus: "reviewed",
  sourceIds: [],
  lastReviewedAt: "2026-07-12",
  reviewedByRole: "Contributor — verified against official public website",
  version: 1,
  correctionUrl: "/corrections",
  reviewNotes: "Organisation verified against own public website. Formal second-reviewer process pending.",
}
```

## Pre-submit checklist

Before committing a new or modified record:

- [ ] `id` is unique across all records of the same type
- [ ] `contentStatus` is one of the valid values in `src/types/content.ts`
- [ ] `sourceIds` reference existing records in `src/data/sources.ts`
- [ ] `sourceQuality` is 0–5 (not negative, not > 5)
- [ ] `version` is ≥ 1
- [ ] `correctionUrl` is set (typically `"/corrections"`)
- [ ] If `contentStatus` is `reviewed`: `lastReviewedAt` and `reviewedByRole` are set
- [ ] URLs use `https://` (not `http://`)
- [ ] `reviewedByRole` uses an honest placeholder — no invented names
- [ ] Run `npx vitest run src/data/__tests__/validation.test.ts` — all 14 tests pass
