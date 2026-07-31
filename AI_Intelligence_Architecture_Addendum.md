# AI Intelligence & Automation Expansion — SUPERSEDED

> **⚠️ SUPERSEDED — July 2026**
>
> This 72-line sketch has been superseded by **[AI-INTELLIGENCE-PRD.md](AI-INTELLIGENCE-PRD.md)** — a 4,900+ line complete specification covering the Collector Framework (10 collectors), 12-stage AI Pipeline, Review Queue System, Maps & Geospatial (MapLibre + GeoJSON), Timeline Engine, Knowledge Graph, Intelligence Dashboard, Testing/QA, and Monitoring/Operations.
>
> This file is preserved for historical reference. All future work on the intelligence layer should reference **[AI-INTELLIGENCE-PRD.md](AI-INTELLIGENCE-PRD.md)**.

## Executive Goal
Transform Accountability Atlas into an AI-assisted civic intelligence platform.

### Principles
- AI never publishes automatically.
- Human review is mandatory.
- Every public claim is source-backed.
- Every edit is versioned.
- Every correction is transparent.

## Architecture
1. Collection Layer
   - RSS
   - APIs
   - Government portals
   - Courts
   - UN
   - NGOs
2. AI Processing
   - language detection
   - translation
   - summarisation
   - entity extraction
   - duplicate detection
   - topic classification
3. Human Review
   - New
   - Reviewing
   - Approved
   - Published
4. Public Platform

## Collector Framework
Independent collectors for:
- ICJ
- ICC
- OHCHR
- OCHA
- EU
- Belgium
- NGOs
- Journalism
- Academic
- Open Data

## Future Modules
- Source Registry
- Review Queue
- Intelligence Dashboard
- Interactive Maps
- Timelines
- Public API

## Interactive Maps
Preferred stack:
- MapLibre GL
- OpenStreetMap
- GeoJSON

Only use embeddable third-party maps where licensing permits.

## Definition of Done
Every feature must be:
- documented
- tested
- accessible
- reviewed
- source-backed
- correction-enabled
