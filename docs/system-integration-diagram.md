# System Integration Diagram

> Milestone 7 — Functional Beta. End-to-end integration of the collector
> framework (M4), Supabase backend (M5), and editorial platform (M6).

This document describes how every subsystem connects, the data flow through
the pipeline, and the integration points between systems. It complements the
architecture overview in [`architecture.md`](./architecture.md) and the
database model in [`data-model.md`](./data-model.md).

## 1. Component map

```mermaid
flowchart LR
  subgraph INGEST["Ingestion (M4)"]
    REG[CollectorRegistry]
    BC[BaseCollector]
    RL[RateLimiter]
    RT[Retry]
    SCH[Scheduler]
    STORE[(DevMemoryStore)]
    NORM[NormalizedContent]
  end

  subgraph AI["AI Pipeline (M4)"]
    PIPE[AIPipeline]
    MR[ModelRouter]
    PM[PromptManager]
    STG[14+ stage extractors]
    AIC[AIContent]
    AIOUT[AIProcessedContent]
  end

  subgraph REVIEW["Editorial Platform (M6)"]
    RQ[ReviewQueue]
    RSM[ReviewStateMachine]
    AR[AssignmentRouter]
    RR[ReviewerRegistry]
    SLA[SLATracker]
    CM[CorrectionManager]
  end

  subgraph WORKFLOW["Publishing Workflow (M6)"]
    PUB[Publishing State Machine]
    GATES[Approval Gates]
    VER[Versioning Manager]
  end

  subgraph BACKEND["Backend (M5)"]
    DB[(Supabase / Postgres)]
    RLS[Row-Level Security]
    FTS[search_all FTS]
    GIS[PostGIS RPCs]
    AUDIT[Audit Logs]
  end

  subgraph PUBLIC["Public Surface"]
    API[Public API /api/v1]
    SEARCH[Client Search Index]
    MAP[Map Layers]
    GRAPH[Knowledge Graph Explorer]
  end

  REG --> BC
  BC --> RL
  BC --> RT
  SCH --> REG
  BC --> STORE
  BC --> NORM

  NORM --> AIC
  AIC --> PIPE
  PIPE --> MR
  MR --> PM
  PIPE --> STG
  STG --> AIOUT

  AIOUT --> RQ
  RQ --> RSM
  RSM --> AR
  AR --> RR
  RQ --> SLA
  RQ --> CM

  RQ -- approved --> PUB
  PUB --> GATES
  PUB --> VER
  PUB --> DB

  DB --> RLS
  DB --> FTS
  DB --> GIS
  DB --> AUDIT

  DB --> API
  API --> SEARCH
  DB --> MAP
  AIOUT --> GRAPH
  VER --> DB
  CM --> RQ
```

## 2. End-to-end data flow

The primary data path runs from a public source through AI processing,
editorial review, publication, and out to every public surface.

```mermaid
sequenceDiagram
  participant SRC as Public Source
  participant COL as Collector
  participant AI as AI Pipeline
  participant RQ as Review Queue
  participant PUB as Publishing Workflow
  participant DB as Supabase
  participant API as Public API
  participant SEARCH as Search Index
  participant MAP as Map Layers

  SRC->>COL: fetch source document
  COL->>COL: validate + normalize
  COL->>AI: NormalizedContent
  AI->>AI: run 14+ extraction stages
  AI->>RQ: AIProcessedContent (enqueue review item)
  RQ->>RQ: assign reviewer → in_review → approved
  RQ->>PUB: approved content
  PUB->>PUB: run approval gates
  PUB->>DB: update review_status = published
  PUB->>DB: create content_version
  DB->>API: published content (RLS-filtered)
  API->>SEARCH: indexed, searchable
  DB->>MAP: spatial query → safe coordinates
  DB->>PUB: rollback / corrections / versions
```

## 3. Integration points

| From | To | Interface | Contract |
|---|---|---|---|
| Collector | AI Pipeline | `NormalizedContent` → `AIContent.source` | `title`, `body`, `url`, `tags`, `metadata` |
| AI Pipeline | Review Queue | `AIProcessedContent` → review item `aiOutput` | `pipelineRunId`, `stageResults` |
| Review Queue | Publishing | `approved` review state → `publish` action | Valid `ReviewState` → `PublishState` transition |
| Publishing | Backend | `executeTransition()` → `evidence_items.review_status` | `PublishState` persisted; RLS filters public reads |
| Publishing | Versioning | `content_versions` insert | Version number derived from previous version |
| Backend | Public API | `GET /api/v1/evidence/:slug` | Published + public visibility only |
| Backend | Search | `search_all()` FTS / client `search()` | Published records indexed as `SearchableRecord` |
| Backend | Map | PostGIS RPCs (`evidence_nearby`, `evidence_in_bbox`) | Results pass through `safeCoordinate()` |
| AI Pipeline | Knowledge Graph | `populateFromPipeline()` | Graph nodes/edges validated against schema |

## 4. Identity & role propagation

```mermaid
flowchart LR
  AUTH[Supabase Auth] --> USER[(auth.users)]
  USER --> ROLES[(user_roles)]
  ROLES --> RBAC[roles.ts permissions]
  RBAC --> API2[API permission checks]
  RBAC --> ADMIN2[Admin route guards]
  RBAC --> TWOFA[2FA requirement]
```

Users created in Supabase Auth are assigned a role in `user_roles`. The
`roles.ts` module resolves that role into a permission set
(`content:read`, `content:publish`, `review:approve`, …) which gates API
access, admin routes (`AuthGuard`), and content operations. All non-public
roles require 2FA.

## 5. Content lifecycle

```mermaid
stateDiagram-v2
  [*] --> Draft: Admin CMS create
  Draft --> InReview: submit_for_review
  InReview --> Approved: review approve
  InReview --> ChangesRequested: review request_changes
  ChangesRequested --> InReview: resubmit
  Approved --> Published: publish
  Published --> RolledBack: rollback
  Published --> Corrected: correction applied
  Corrected --> Published: version increment
  Published --> Archived: archive
```

## 6. Verification

Every stage boundary is verified by:

- `npm run typecheck` — TypeScript interfaces align across pipeline boundaries
- `scripts/verify-data-flow.ts` — runtime shape assertions per stage
- `src/__tests__/integration/fullSystem.test.ts` — the complete pipeline with
  all external services mocked

Run the full check with `scripts/verify-data-flow.sh` (CI-compatible).
