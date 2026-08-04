# Audit Logging — Accountability Atlas

## Overview

Every create, update, and delete operation on every content table is automatically logged to the `audit_log` table via database triggers. No application code is required for basic audit coverage.

## Schema

### audit_log

| Column | Type | Description |
|---|---|---|
| id | uuid | PK |
| actor_id | uuid | auth.uid() of the user |
| actor_role | text | Role at time of action |
| action | text | create, read, update, delete, restore |
| target_type | text | Table name |
| target_id | uuid | Affected row PK |
| diff | jsonb | Before/after for updates |
| request_id | text | Correlation ID |
| ip_address | text | Admin only |
| created_at | timestamptz | |

### Covered Tables

All 16 content tables are covered: sources, evidence_items, evidence_references, countries, country_positions, actions, organizations, legal_cases, dossiers, corrections, collector_runs, ai_operations, review_queue_items, graph_nodes, graph_edges, map_layers.

## Querying the Audit Log

### By target
```sql
SELECT * FROM audit_log
WHERE target_type = 'evidence_items' AND target_id = '...'
ORDER BY created_at DESC;
```

### By actor
```sql
SELECT * FROM audit_log
WHERE actor_id = '...'
ORDER BY created_at DESC;
```

### By time range
```sql
SELECT * FROM audit_log
WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31'
ORDER BY created_at DESC;
```

### Summary statistics (via API)
```typescript
import { getAuditSummary } from '../lib/audit/queries';
const summary = await getAuditSummary(30); // last 30 days
```

## Access Control

- Only `admin` and `security_admin` roles can view audit logs
- Public/anonymous users have no access
- Audit logs are append-only (no UPDATE or DELETE from application)

## Export

CSV export available via the admin audit viewer:
```typescript
import { exportAuditCSV } from '../lib/audit/logger';
const csv = await exportAuditCSV({ dateFrom: '2026-01-01' });
```

## What is NOT logged

- Passwords and TOTP tokens (never logged)
- Personal data (filtered before logging)
- Session tokens
- API keys
- Content of evidence document uploads (metadata only)
