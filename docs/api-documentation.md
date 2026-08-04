# API Documentation — Arbor Sentinel

## Base URL

```
Production: https://api.arborsentinel.org/api/v1
Development: http://localhost:54321/api/v1
```

## Response Format

All endpoints return JSON:

```json
{
  "data": { ... },
  "meta": { "page": 1, "perPage": 20, "total": 150, "totalPages": 8 },
  "error": null
}
```

Error responses:
```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Evidence item not found",
    "requestId": "req_abc123"
  }
}
```

## Rate Limiting

- Public: 100 requests/min per IP
- Authenticated: 300 requests/min per user
- Admin: 600 requests/min per user
- Correction submission: 5 per IP per day

Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination

All list endpoints support:

| Parameter | Default | Max | Description |
|---|---|---|---|
| `page` | 1 | — | Page number |
| `per_page` | 20 | 100 | Items per page |

## Public Endpoints

### Evidence

```
GET /api/v1/evidence
GET /api/v1/evidence/:slug
```

Query params: `category`, `country`, `verification_level`, `search`, `sort_by`, `sort_order`, `page`, `per_page`

### Countries

```
GET /api/v1/countries
GET /api/v1/countries/:slug
```

Query params: `region`, `eu_member`, `search`, `sort_by`, `sort_order`, `page`, `per_page`

### Actions

```
GET /api/v1/actions
GET /api/v1/actions/:slug
```

Query params: `country_id`, `issue`, `action_type`, `active_only`, `search`

### Organizations

```
GET /api/v1/organizations
GET /api/v1/organizations/:slug
```

Query params: `type`, `region`, `partnership_status`, `search`

### Legal Cases

```
GET /api/v1/legal-cases
GET /api/v1/legal-cases/:id
```

Query params: `institution`, `jurisdiction`, `status`, `search`

### Dossiers

```
GET /api/v1/dossiers
GET /api/v1/dossiers/:slug
```

Query params: `country_id`, `issue`, `published_only`

### Sources

```
GET /api/v1/sources
GET /api/v1/sources/:id
```

Query params: `type`, `country`, `search`

### Search

```
GET /api/v1/search?query=ceasefire&types=evidence,legal_case
```

Query params: `query` (required), `types` (comma-separated), `date_from`, `date_to`, `category`, `verification_level`, `page`, `per_page`

### Corrections

```
POST /api/v1/corrections
```

Body:
```json
{
  "target_type": "evidence_items",
  "target_id": "uuid",
  "category": "factual_error",
  "description": "...",
  "source_url": "https://...",
  "contact_email": "user@example.com"
}
```

### Spatial

```
GET /api/v1/locations/nearby?lat=50.85&lng=4.35&radius_km=50
GET /api/v1/locations/bbox?north=51.5&south=50.5&east=5.0&west=3.5
GET /api/v1/locations/geojson/:layer
```

## Admin Endpoints

All admin endpoints require `Authorization: Bearer <token>` header.

```
POST   /admin/v1/evidence        — Create evidence
PUT    /admin/v1/evidence/:id    — Update evidence
DELETE /admin/v1/evidence/:id    — Soft delete evidence

POST   /admin/v1/sources
PUT    /admin/v1/sources/:id
DELETE /admin/v1/sources/:id

POST   /admin/v1/countries/:id/positions
PUT    /admin/v1/countries/:id/positions/:pid
DELETE /admin/v1/countries/:id/positions/:pid

POST   /admin/v1/actions
PUT    /admin/v1/actions/:id
DELETE /admin/v1/actions/:id

POST   /admin/v1/legal-cases
PUT    /admin/v1/legal-cases/:id
DELETE /admin/v1/legal-cases/:id

POST   /admin/v1/organizations
PUT    /admin/v1/organizations/:id
DELETE /admin/v1/organizations/:id

POST   /admin/v1/dossiers
PUT    /admin/v1/dossiers/:id
DELETE /admin/v1/dossiers/:id

GET    /admin/v1/corrections      — List corrections
PUT    /admin/v1/corrections/:id  — Moderate (approve/reject)

POST   /admin/v1/bulk/status      — Batch update statuses
POST   /admin/v1/bulk/assign      — Batch assign reviews
```

## CORS

Allowed origins are configured per environment. Default development: `http://localhost:5173`.

## Cache Headers

- List endpoints: `Cache-Control: public, max-age=300` (5 min)
- Detail endpoints: `Cache-Control: public, max-age=900` (15 min)
- Search: `Cache-Control: no-cache`
