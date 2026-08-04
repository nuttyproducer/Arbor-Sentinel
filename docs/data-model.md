# Data Model — Accountability Atlas

Complete database schema for the Supabase/PostgreSQL backend (Milestone 5).

---

## Schema Overview

The database has 18 tables organized into three groups:

| Group | Tables |
|---|---|
| **PRD Content (10)** | sources, evidence_items, evidence_references, countries, country_positions, actions, organizations, legal_cases, dossiers, corrections |
| **M4 Intelligence (6)** | collector_runs, ai_operations, review_queue_items, graph_nodes, graph_edges, map_layers |
| **Infrastructure (2)** | content_versions, user_roles |

---

## PRD Content Tables

### sources

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| type | text | NOT NULL |
| url | text | |
| country | text | |
| credibility_tier | int | |
| notes | text | |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

Indexes: `type`, `country`, `credibility_tier`

### evidence_items

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| title | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL |
| summary | text | NOT NULL |
| body | text | |
| category | text | NOT NULL |
| incident_date | timestamp | |
| publication_date | date | |
| location_name | text | |
| country_or_territory | text | |
| lat | numeric(10,6) | |
| lng | numeric(10,6) | |
| location_precision | text | |
| verification_level | int | NOT NULL, DEFAULT 0 |
| source_id | uuid | FK → sources(id) ON DELETE SET NULL |
| legal_tags | text[] | DEFAULT '{}' |
| humanitarian_tags | text[] | DEFAULT '{}' |
| visibility | text | NOT NULL, DEFAULT 'draft' |
| review_status | text | NOT NULL, DEFAULT 'draft' |
| created_by | uuid | |
| reviewed_by | uuid | |
| last_reviewed_at | timestamptz | |
| version | int | NOT NULL, DEFAULT 1 |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

Indexes: `slug` (unique), `category`, `review_status`, `visibility`, `country_or_territory`, `source_id`, `created_at`, `legal_tags` (GIN), `humanitarian_tags` (GIN)

### evidence_references

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| evidence_item_id | uuid | NOT NULL, FK → evidence_items(id) ON DELETE CASCADE |
| source_id | uuid | FK → sources(id) ON DELETE SET NULL |
| url | text | |
| archive_url | text | |
| quote_excerpt | text | |
| reference_type | text | |
| created_at | timestamptz | NOT NULL, DEFAULT now() |

### countries

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| iso_code | text | UNIQUE |
| region | text | |
| eu_member | boolean | NOT NULL, DEFAULT false |
| nato_member | boolean | NOT NULL, DEFAULT false |
| slug | text | UNIQUE, NOT NULL |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

### country_positions

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| country_id | uuid | NOT NULL, FK → countries(id) ON DELETE CASCADE |
| issue | text | NOT NULL |
| position_summary | text | |
| score | int | |
| source_url | text | |
| last_verified_at | timestamptz | |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

### actions

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| country_id | uuid | FK → countries(id) ON DELETE SET NULL |
| title | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL |
| action_type | text | |
| issue | text | |
| template_body | text | |
| language | text | |
| recipient_type | text | |
| recipient_name | text | |
| recipient_url | text | |
| source_notes | text | |
| active | boolean | NOT NULL, DEFAULT true |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

### organizations

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL |
| type | text | |
| website | text | |
| official_donation_url | text | |
| regions | text[] | DEFAULT '{}' |
| services | text[] | DEFAULT '{}' |
| partnership_status | text | |
| verification_document_url | text | |
| last_verified_at | timestamptz | |
| notes | text | |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

Indexes: `slug` (unique), `type`, `regions` (GIN), `services` (GIN)

### legal_cases

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| title | text | NOT NULL |
| institution | text | |
| jurisdiction | text | |
| status | text | |
| summary | text | |
| opened_date | date | |
| latest_update_date | date | |
| source_url | text | |
| action_relevance | text | |
| last_reviewed_at | timestamptz | |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

### dossiers

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| title | text | |
| slug | text | UNIQUE, NOT NULL |
| country_id | uuid | FK → countries(id) ON DELETE SET NULL |
| issue | text | |
| language | text | |
| format | text | |
| html_content | text | |
| pdf_url | text | |
| version | int | NOT NULL, DEFAULT 1 |
| published | boolean | NOT NULL, DEFAULT false |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

### corrections

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| target_type | text | NOT NULL |
| target_id | uuid | NOT NULL |
| reason | text | |
| message | text | |
| submitter_email_hash | text | |
| status | text | NOT NULL, DEFAULT 'pending' |
| review_notes | text | |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

---

## M4 Intelligence Layer Tables

### collector_runs

Tracks each execution of a content collector.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| source_id | uuid | FK → sources(id) ON DELETE CASCADE |
| collector_type | text | NOT NULL |
| status | text | CHECK (running, completed, failed) |
| items_fetched | int | DEFAULT 0 |
| items_validated | int | DEFAULT 0 |
| items_stored | int | DEFAULT 0 |
| stage_durations | jsonb | |
| errors | jsonb[] | |
| started_at | timestamptz | |
| completed_at | timestamptz | |
| created_at | timestamptz | |

### ai_operations

Records every AI pipeline operation for audit and monitoring.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| operation_type | text | NOT NULL |
| model_used | text | NOT NULL |
| confidence | numeric(3,2) | CHECK 0–1 |
| tokens_input | int | |
| tokens_output | int | |
| latency_ms | int | |
| source_spans | jsonb | |
| data | jsonb | |
| warnings | text[] | |
| status | text | |
| created_at | timestamptz | |

### review_queue_items

Human review queue for AI-processed content.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| source_content_type | text | NOT NULL |
| source_content_id | text | NOT NULL |
| source_content_slug | text | |
| review_type | text | NOT NULL |
| priority | text | CHECK (critical, high, medium, low) |
| priority_score | int | CHECK 0–100 |
| state | text | CHECK (new, assigned, in_review, changes_requested, approved, published, rejected, archived) |
| assigned_reviewer | uuid | |
| due_by | timestamptz | |
| comments | jsonb | |
| checklists | jsonb | |
| state_history | jsonb | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### graph_nodes

Knowledge graph node storage.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| type | text | CHECK (source, document, entity, event, location, claim, country, institution, organization, action) |
| label | text | NOT NULL |
| properties | jsonb | NOT NULL |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes: `type`, `label`, `properties` (GIN)

### graph_edges

Knowledge graph edge storage.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| type | text | CHECK (mentions, occurs_at, involves, supports, contradicts, related_to, authored_by, published_by, located_in, part_of) |
| source_id | uuid | FK → graph_nodes(id) ON DELETE CASCADE |
| target_id | uuid | FK → graph_nodes(id) ON DELETE CASCADE |
| label | text | NOT NULL |
| weight | numeric(3,2) | CHECK 0–1 |
| properties | jsonb | |
| created_at | timestamptz | |

### map_layers

Map layer configuration storage.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| name | text | NOT NULL |
| layer_type | text | CHECK (tile, geojson, heatmap, cluster) |
| source_config | jsonb | |
| style | jsonb | |
| visibility | boolean | DEFAULT false |
| z_index | int | |
| metadata | jsonb | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Infrastructure Tables

### content_versions

Version history for all content types. Created automatically on update.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| content_type | text | NOT NULL |
| content_id | uuid | NOT NULL |
| version | int | NOT NULL |
| data | jsonb | NOT NULL |
| created_by | uuid | |
| created_at | timestamptz | |

### user_roles

Maps Supabase Auth users to application roles. Referenced by RLS helper functions.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | NOT NULL, UNIQUE |
| role | text | CHECK (public, contributor, researcher, moderator, partner_org, legal_reviewer, security_admin, admin) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Relationships

```
sources ──┐
           ├── evidence_items ──── evidence_references ──── sources
           ├── collector_runs
           │
countries ─┐
           ├── country_positions
           ├── actions
           ├── dossiers
           │
graph_nodes ─── graph_edges ─── graph_nodes
```

---

## Row-Level Security Policy Matrix

| Table | anon (public) | contributor | reviewer | admin |
|---|---|---|---|---|
| sources | SELECT all | — | — | FULL |
| evidence_items | SELECT published+public | — | — | FULL |
| evidence_references | SELECT (parent published) | INSERT | UPDATE | FULL |
| countries | SELECT all | — | — | ALL auth |
| country_positions | SELECT all | — | — | ALL auth |
| actions | SELECT active=true | — | — | ALL auth |
| organizations | SELECT all | — | — | ALL auth |
| legal_cases | SELECT all | — | — | ALL auth |
| dossiers | SELECT published=true | — | — | ALL auth |
| corrections | INSERT | INSERT | SELECT+UPDATE | FULL |
| collector_runs | — | — | SELECT | FULL |
| ai_operations | — | — | SELECT | FULL |
| review_queue_items | — | — | SELECT+UPDATE (assigned) | FULL |
| graph_nodes | SELECT all | — | — | ALL auth |
| graph_edges | SELECT all | — | — | ALL auth |
| map_layers | SELECT visible=true | — | — | ALL auth |
| content_versions | — | — | SELECT | FULL |
| user_roles | — | — | — | FULL (admin+security_admin) |

**Key:**
- `—` = no access
- `SELECT` = read access
- `INSERT` = create access
- `UPDATE` = modify access
- `FULL` = all CRUD operations
- `ALL auth` = full access for authenticated users with appropriate roles (researcher, moderator, admin)

### RLS Helper Functions

| Function | Returns | Description |
|---|---|---|
| `user_role()` | text | Current user's role from user_roles, or 'public' if not authenticated |
| `has_role(role text)` | boolean | Whether current user has a specific role |
| `has_any_role(roles text[])` | boolean | Whether current user has any of the specified roles |
| `is_admin()` | boolean | Whether current user is an admin |

---

## TypeScript Types

Database record types are in `src/lib/db/types.ts`. Properties use camelCase:

- `SourceRecord`, `EvidenceItemRecord`, `EvidenceReferenceRecord`
- `CountryRecord`, `CountryPositionRecord`
- `ActionRecord`, `OrganizationRecord`
- `LegalCaseRecord`, `DossierRecord`, `CorrectionRecord`
- `CollectorRunRecord`, `AIOperationRecord`, `ReviewQueueItemRecord`
- `GraphNodeRecord`, `GraphEdgeRecord`, `MapLayerRecord`
- `ContentVersionRecord`, `UserRoleRecord`

Helper types: `InsertRecord<T>` (omit id, createdAt, updatedAt), `UpdateRecord<T>` (partial update).

Query helpers: `QueryResult<T>` and `QueryListResult<T>` following `{ data, error }` pattern.

---

## Migrations

| File | Description |
|---|---|
| `supabase/migrations/00001_initial_schema.sql` | All tables, extensions, indexes, triggers |
| `supabase/migrations/00002_row_level_security.sql` | RLS policies and helper functions |

Both migrations are reversible — down migration blocks are included as SQL comments.

Seed data: `supabase/seed.sql` — reference data for development/testing.

Migration script: `src/data/migration.ts` — converts static TypeScript data to database records.
