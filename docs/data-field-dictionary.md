# Data Field Dictionary

**Status:** Active — canonical reference for every field in the data model.  
**Last reviewed:** 2026-07-12

---

## Purpose

This dictionary defines every field used across the Arbor Sentinel
static data model. It serves as the authoritative reference for contributors
creating or reviewing records, and as the basis for future database schema
design.

---

## Common fields (used across multiple record types)

### `id`

| Property | Value |
|---|---|
| **Type** | `string` |
| **Purpose** | Stable unique identifier for the record |
| **Public** | Yes |
| **Required** | ✅ Always |
| **Format** | kebab-case, e.g. `icj-provisional-measures-jan-2024` |
| **Validation** | Must be unique within its collection |
| **Review implication** | Changing an `id` breaks source references — use with caution |
| **Future DB mapping** | Primary key |

### `slug`

| Property | Value |
|---|---|
| **Type** | `string` |
| **Purpose** | URL-safe identifier for routing and human-readable references |
| **Public** | Yes |
| **Required** | ✅ For records with public detail pages |
| **Format** | kebab-case, usually matching `id` |
| **Validation** | Must be unique; no spaces or special characters |
| **Future DB mapping** | Slug column, unique index |

### `title`

| Property | Value |
|---|---|
| **Type** | `string` |
| **Purpose** | Human-readable title displayed on cards and page headings |
| **Public** | Yes |
| **Required** | ✅ Always |
| **Validation** | Must not be empty or whitespace-only |
| **Future DB mapping** | `title` text column |

### `summary` / `shortDescription`

| Property | Value |
|---|---|
| **Type** | `string` |
| **Purpose** | One-paragraph factual description displayed on record cards |
| **Public** | Yes |
| **Required** | ✅ For publishable records |
| **Validation** | Must not be empty |
| **Review implication** | Must be verified against sources; legal reviewer must approve if it describes legal proceedings |
| **Future DB mapping** | `summary` text column |

### `contentStatus`

| Property | Value |
|---|---|
| **Type** | `ContentStatus` |
| **Purpose** | Editorial review state of this record |
| **Public** | Yes — displayed as a badge |
| **Required** | ✅ For all publishable records |
| **Allowed values** | `draft`, `static_preview`, `review_pending`, `reviewed`, `disputed`, `corrected`, `archived` |
| **Validation** | Must be one of the allowed values |
| **Review implication** | Only an editor may set to `reviewed` |
| **Future DB mapping** | Enum or foreign key to status table |

### `sourceQuality`

| Property | Value |
|---|---|
| **Type** | `VerificationLevel` (0–5) |
| **Purpose** | Source-quality / verification level — separate from editorial status |
| **Public** | Yes — displayed as "Level N — [label]" |
| **Required** | ✅ For `review_pending` and `reviewed` records |
| **Allowed values** | `0`, `1`, `2`, `3`, `4`, `5` |
| **Validation** | Must be 0–5 inclusive |
| **Review implication** | Assigned by source verifier; independent from editorial review |
| **Future DB mapping** | Integer column with CHECK constraint |

### `legalStatuses`

| Property | Value |
|---|---|
| **Type** | `LegalStatus[]` |
| **Purpose** | Legal procedural statuses associated with this record |
| **Public** | Yes — displayed as alert badges |
| **Required** | No (only for records with legal context) |
| **Allowed values** | `court_proceeding_active`, `provisional_measures_issued`, `arrest_warrant_issued`, `allegation_under_investigation`, `un_finding`, `ngo_legal_determination`, `not_judicially_determined`, `contested_claim`, `requires_further_verification` |
| **Validation** | Each value must be one of the allowed values |
| **Review implication** | Must be assigned or approved by a legal reviewer |
| **Future DB mapping** | Many-to-many join table |

### `sourceIds`

| Property | Value |
|---|---|
| **Type** | `string[]` |
| **Purpose** | References to SourceRecord IDs in `src/data/sources.ts` |
| **Public** | Yes — rendered as a source list |
| **Required** | ✅ For `review_pending` and `reviewed` records (exception: organizations with valid `officialWebsite`) |
| **Validation** | Each ID must exist in sources.ts; `reviewed` records must have ≥ 1 (or valid org website) |
| **Review implication** | Source verifier confirms each referenced source exists and supports the record |
| **Future DB mapping** | Many-to-many join table |

### `lastReviewedAt`

| Property | Value |
|---|---|
| **Type** | `string` (ISO 8601 date) |
| **Purpose** | Date the record's editorial summary was last reviewed |
| **Public** | Yes |
| **Required** | ✅ For `reviewed` records; recommended for `review_pending` |
| **Format** | `YYYY-MM-DD` |
| **Validation** | Must be a valid date; must not be in the future |
| **Review implication** | Set by the editor when marking `reviewed`; updated on each review |
| **Future DB mapping** | `DATE` column |

### `reviewedByRole`

| Property | Value |
|---|---|
| **Type** | `string` |
| **Purpose** | Description of the role(s) that performed the review |
| **Public** | Yes |
| **Required** | ✅ For `reviewed` records |
| **Format** | Role description, not personal name. E.g. "Contributor — legal research background" or "legal reviewer pending" |
| **Validation** | Must not be empty for `reviewed` records |
| **Review implication** | Must accurately describe the actual review that occurred; must not claim external or formal review that did not happen |
| **Future DB mapping** | Text column |

### `reviewNotes`

| Property | Value |
|---|---|
| **Type** | `string` |
| **Purpose** | Free-text notes about the review process, caveats, or pending work |
| **Public** | Yes (for transparency) |
| **Required** | Recommended for `reviewed` and `disputed` records |
| **Validation** | Must not contain private personal information |
| **Future DB mapping** | Text column |

### `nextReviewAt`

| Property | Value |
|---|---|
| **Type** | `string` (ISO 8601 date) |
| **Purpose** | Date when the record should next be reviewed |
| **Public** | Yes |
| **Required** | Recommended for `reviewed` records |
| **Format** | `YYYY-MM-DD` |
| **Validation** | Must be a valid date |
| **Future DB mapping** | `DATE` column |

### `version`

| Property | Value |
|---|---|
| **Type** | `number` |
| **Purpose** | Schema version of this record; incremented on substantive updates |
| **Public** | Yes |
| **Required** | ✅ For all publishable records |
| **Allowed values** | Integer ≥ 1 |
| **Validation** | Must be ≥ 1 |
| **Review implication** | Incremented by the editor when content changes substantively |
| **Future DB mapping** | Integer column |

### `correctionUrl`

| Property | Value |
|---|---|
| **Type** | `string` |
| **Purpose** | Route to the corrections process for this record |
| **Public** | Yes — rendered as a "Report an error" link |
| **Required** | ✅ For all publishable records |
| **Format** | Usually `"/corrections"` |
| **Validation** | Must not be empty |
| **Future DB mapping** | Text column |

### `relatedRoutes`

| Property | Value |
|---|---|
| **Type** | `string[]` |
| **Purpose** | Related platform routes for cross-linking |
| **Public** | Yes — rendered as links |
| **Required** | No |
| **Format** | Route paths, e.g. `"/methodology"` |
| **Validation** | Should reference valid routes |
| **Future DB mapping** | Array or join table |

### `tags`

| Property | Value |
|---|---|
| **Type** | `string[]` |
| **Purpose** | Searchable tags for filtering and discovery |
| **Public** | Yes — rendered as tag chips |
| **Required** | No |
| **Format** | Lowercase, no special characters |
| **Validation** | Must not include private or unreviewed labels |
| **Future DB mapping** | Many-to-many join table |

---

## Source record fields

### Core identity

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | ✅ | Unique; kebab-case |
| `slug` | `string` | ✅ | URL-safe identifier for routing |
| `title` | `string` | ✅ | Exact or summarised source title |
| `publisher` | `string` | ✅ | Institution that published the source |
| `sourceType` | `SourceType` | ✅ | One of 8 valid values: court, un, government, humanitarian, ngo, academic, journalism, osint |
| `documentType` | `string?` | No | Free-text document type label |
| `url` | `string` | ✅ | Must resolve via http/https |
| `publicationDate` | `string?` | Recommended | Year minimum (YYYY-MM-DD, YYYY-MM, or YYYY) |
| `accessedAt` | `string` | ✅ | Date the source was last checked |
| `archiveUrl` | `string?` | No | For sources that may disappear |
| `language` | `string?` | Recommended | ISO 639-1 code |
| `jurisdiction` | `string?` | No | Legal or geographic jurisdiction |
| `authors` | `string[]?` | No | Named authors or bodies |
| `official` | `boolean?` | No | Whether this is an official institutional record |
| `status` | `SourceStatus` | ✅ | active, broken, archived, or superseded |
| `notes` | `string?` | No | Free-text contextual notes — not internal review notes |
| `version` | `number` | ✅ | Schema version (≥ 1) |
| `lastCheckedAt` | `string?` | No | When the URL was last verified |
| `correctionUrl` | `string` | ✅ | Route to corrections process |

### Trust & Verification

| Field | Type | Required | Notes |
|---|---|---|---|
| `trustLevel` | `TrustLevel` (0–5) | ✅ | Human-assigned trust level. Default 0 (unreviewed). NEVER auto-assigned from source type. |
| `verificationMethod` | `VerificationMethod?` | No | How this source's content is verified: official, ngo, journalism, academic, osint |

### API / RSS Automation Config

| Field | Type | Required | Notes |
|---|---|---|---|
| `apiEndpoint` | `string?` | No | API endpoint URL for programmatic access |
| `apiKeyRef` | `string?` | No | Reference to stored API key name — NEVER the actual key value |
| `rssFeedUrl` | `string?` | No | RSS feed URL for automated polling |
| `feedConfig.pollingIntervalMinutes` | `number?` | No | Polling interval in minutes (≥ 1) |
| `feedConfig.lastFetched` | `string?` | No | ISO date of last successful feed fetch |

### Licensing & Classification

| Field | Type | Required | Notes |
|---|---|---|---|
| `license` | `string?` | No | License name (e.g. "CC BY 4.0") |
| `licenseUrl` | `string?` | No | URL to license text |
| `region` | `string?` | No | Geographic region for filtering (e.g. "Middle East", "Europe") |
| `category` | `string?` | No | Topical category for filtering |
| `reliabilityNotes` | `string?` | No | Public notes on source reliability |

### Health & Monitoring

| Field | Type | Required | Notes |
|---|---|---|---|
| `healthStatus` | `HealthStatus` | ✅ | unknown, active, degraded, or failed. Default unknown — never assume active. |
| `automationStatus` | `AutomationStatus` | ✅ | manual, scheduled, or real-time. Default manual. |
| `lastSuccessfulFetch` | `string?` | No | ISO date of last successful automated fetch |
| `lastFailedFetch` | `string?` | No | ISO date of last failed fetch attempt |
| `failureCount` | `number` | ✅ | Consecutive failure count since last success. Default 0. |
| `monitoringEnabled` | `boolean` | ✅ | Whether automated health monitoring is enabled. Default false. |

---

## Evidence record fields

| Field | Type | Required | Notes |
|---|---|---|---|
| (All common fields) | — | — | See above |
| `category` | `EvidenceCategory` | ✅ | One of 6 valid values |
| `primarySourceType` | `SourceType` | ✅ | Primary source type for filtering |
| `publicationDate` | `string?` | Recommended | When the source was published |
| `incidentDate` | `string?` | No | Date of the event — only when safe to display |
| `safeLocation` | `string?` | No | General region only — never exact coordinates |
| `sourceLanguage` | `string?` | Recommended | ISO 639-1 |

---

## Legal case fields

| Field | Type | Required | Notes |
|---|---|---|---|
| (All common fields) | — | — | See above |
| `institution` | `string` | ✅ | Court or body |
| `jurisdiction` | `string` | ✅ | Legal jurisdiction |
| `parties` | `string[]` | ✅ | Named parties to the case |
| `openedDate` | `string?` | Recommended | When the case was filed |
| `latestVerifiedUpdateDate` | `string?` | Recommended | Last confirmed procedural update |
| `nextMilestone` | `string?` | Recommended | Next expected procedural event |
| `legalBasisOrAllegedCrimes` | `string?` | No | Treaty, statute, or alleged crimes |
| `actionRelevance` | `string?` | No | Why this case matters for accountability |
| `proceduralNote` | `string?` | Recommended | Explains procedural posture |

---

## Organization fields

| Field | Type | Required | Notes |
|---|---|---|---|
| (All common fields) | — | — | See above |
| `name` | `string` | ✅ | Full organisation name |
| `category` | `OrganizationCategory` | ✅ | One of 7 valid values |
| `regions` | `string[]` | ✅ | General regions only |
| `officialWebsite` | `string` | ✅ | Must resolve to the org's domain |
| `officialDonationUrl` | `string?` | No | Only official donation pages; must resolve |
| `services` | `string[]?` | No | Publicly stated services |
| `relationshipStatus` | `RelationshipStatus` | ✅ | `public_resource` only in static beta |

---

## Action template fields

| Field | Type | Required | Notes |
|---|---|---|---|
| (All common fields) | — | — | See above |
| `actionType` | `ActionType` | ✅ | One of 6 valid values |
| `jurisdiction` | `string` | ✅ | Where this action is relevant |
| `intendedAudience` | `string` | ✅ | Who this action is for |
| `purpose` | `string` | ✅ | Why this action exists |
| `policyAsk` | `string` | ✅ | What the recipient can realistically do |
| `sourceBasis` | `string` | ✅ | Legal or procedural basis |
| `instructions` | `string` | ✅ | Step-by-step safe instructions |
| `templateBody` | `string?` | No | Draft template text — copy-only in beta |
| `templateReviewStatus` | `"draft" \| "reviewed"?` | No | Draft = not yet reviewed |
| `language` | `string` | ✅ | ISO 639-1 |
| `warnings` | `string[]` | ✅ | Safety and limitation warnings |
| `active` | `boolean` | ✅ | Whether displayed on the Action Hub |

---

## Attribution fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | ✅ | Unique |
| `title` | `string` | ✅ | Image/asset title |
| `author` | `string` | ✅ | Creator name |
| `sourceName` | `string` | ✅ | Where the image was sourced from |
| `sourceUrl` | `string` | ✅ (for `complete`) | URL to the original asset page |
| `licenseName` | `string` | ✅ | Licence name (e.g. "CC BY-SA 4.0") |
| `licenseUrl` | `string` | ✅ (for `complete`) | URL to the licence text |
| `whereUsed` | `string` | ✅ | Where the image appears on the platform |
| `filePath` | `string` | ✅ | Path in the repository |
| `modifications` | `string` | ✅ | What was changed |
| `dateAdded` | `string` | ✅ | Date added to the platform |
| `accessedAt` | `string` | ✅ | Date the source was accessed |
| `status` | `AttributionStatus` | ✅ | `complete`, `review_pending`, `disputed`, or `removed` |
| `statusNote` | `string?` | No | Why a record is not `complete` |

---

## Future database mapping notes

When the platform moves from static data files to a database:

- **Primary keys:** `id` fields become primary keys.
- **Foreign keys:** `sourceIds` becomes a many-to-many join table
  (`evidence_sources`, `legal_case_sources`, etc.).
- **Enums:** `contentStatus`, `sourceType`, `legalStatuses`, `category`,
  `relationshipStatus`, `actionType` become enum tables or CHECK-constrained
  columns.
- **Dates:** All date strings (`lastReviewedAt`, `publicationDate`, etc.)
  become `DATE` or `TIMESTAMP` columns.
- **Arrays:** `tags`, `regions`, `relatedRoutes`, `warnings` become
  many-to-many join tables.
- **Review metadata:** `reviewedByRole`, `reviewNotes`, `nextReviewAt`
  become columns on a `review_log` table tracking each review event.
- **Version history:** A `record_versions` table stores previous versions
  of each record, keyed by `id` + `version`.
