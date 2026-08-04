# AI Pipeline Overview

**Status:** Active — full pipeline implemented (M4.2-01 through M4.2-12).
**Last reviewed:** 2026-08-03

---

## Purpose

The AI pipeline transforms normalized collector output into structured, verified
evidence records. It runs as a DAG (directed acyclic graph) where each stage
processes content and enriches the context available to downstream stages.

All stages produce typed outputs with calibrated confidence scores, source span
references, and immutable audit logs.

---

## Architecture

```
Collector Output (NormalizedContent)
        │
        ▼
┌─────────────────────────────────────────────┐
│              AI Pipeline (DAG)               │
│                                              │
│  ┌──────────────┐                            │
│  │ Language      │ ──► ISO 639-1 detection   │
│  │ Detection     │                             │
│  └──────┬───────┘                            │
│         │                                     │
│  ┌──────▼───────┐                            │
│  │ Translation   │ ──► en output (if needed)  │
│  │ (conditional) │                             │
│  └──────┬───────┘                            │
│         │                                     │
│  ┌──────▼───────┐                            │
│  │ Summarization │ ──► facts, source spans    │
│  └──────┬───────┘                            │
│         │                                     │
│  ┌──────▼───────┐  ┌──────────────┐          │
│  │ Entity        │  │ Claim         │          │
│  │ Extraction    │  │ Extraction    │          │
│  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                   │
│  ┌──────▼───────┐  ┌──────▼───────┐          │
│  │ Timeline      │  │ Geographic    │          │
│  │ Extraction    │  │ Extraction    │          │
│  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                   │
│  ┌──────▼───────┐         │                   │
│  │ Relationship  │◄────────┘                   │
│  │ Detection     │                             │
│  └──────┬───────┘                            │
│         │                                     │
│  ┌──────▼───────┐  ┌──────────────┐          │
│  │ Contradiction │  │ Duplicate     │          │
│  │ Detection     │  │ Detection     │          │
│  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                   │
│  ┌──────▼───────┐         │                   │
│  │ Hallucination │         │                   │
│  │ Detection     │         │                   │
│  └──────┬───────┘         │                   │
│         │                  │                   │
│  ┌──────▼──────────────────▼───────┐          │
│  │ Confidence Estimation            │          │
│  └──────┬──────────────────────────┘          │
│         │                                     │
│  ┌──────▼───────┐                            │
│  │ Topic          │                            │
│  │ Classification │                            │
│  └──────────────┘                            │
│                                              │
└─────────────────────────────────────────────┘
        │
        ▼
AIProcessedContent (evidence-ready structured output)
```

### Stage Dependency Graph

```
language_detection ──────► translation ──────► summarization
                                                    │
                              ┌──────────────────────┤
                              ▼                      ▼
                      entity_extraction      claim_extraction
                              │                      │
                              ▼                      ▼
                      timeline_extraction    geographic_extraction
                              │                      │
                              └──────────┬───────────┘
                                         ▼
                                relationship_detection
                                         │
                              ┌──────────┤
                              ▼          ▼
                    contradiction    duplicate
                      detection      detection
                              │          │
                              ▼          │
                    hallucination        │
                      detection          │
                              │          │
                              └────┬─────┘
                                   ▼
                          confidence_estimation
                                   │
                                   ▼
                          topic_classification
```

---

## Stage Descriptions

### Language Detection
- **Input:** `NormalizedContent`
- **Output:** `{ language: string, confidence: number }`
- **Purpose:** Detect ISO 639-1 language code for routing to translation or
  language-specific prompts. Always runs first.

### Translation (conditional)
- **Input:** `NormalizedContent` + language detection result
- **Output:** English translation of source content
- **Purpose:** Translate non-English content to English for downstream processing.
  Skipped if source is already English (`language === "en"`).

### Summarization
- **Input:** Content (translated if needed)
- **Output:** `{ summary, facts[], preservedAmbiguities[], sourceReferences[] }`
- **Purpose:** Extract a factual summary with source-character-span references.
  Facts are categorized (legal_finding, number, temporal, testimonial, etc.).
  Ambiguities are preserved, not resolved.

### Entity Extraction
- **Input:** Content + summary
- **Output:** `Array<{ name, type, subtype, confidence }>`
- **Purpose:** Extract named entities: persons, organizations, locations,
  legal instruments. Links to known entity registry when possible.

### Claim Extraction
- **Input:** Content + summary + entities
- **Output:** `Array<{ text, type, confidence, sourceSpan }>`
- **Purpose:** Extract factual and legal claims with source character spans.
  Classifies claims: factual, legal, numerical, testimony, allegation.

### Timeline Extraction
- **Input:** Content + summary
- **Output:** `Array<{ date, event, precision, endDate? }>`
- **Purpose:** Extract chronological events with precision levels:
  `exact`, `month`, `year`, `range`, `approximate`.

### Geographic Extraction
- **Input:** Content + summary
- **Output:** `Array<{ location, precisionLevel, coordinates?, safeName }>`
- **Purpose:** Extract location references with precision enforcement.
  **Guardrail:** Coordinates are rounded to 1 decimal place maximum.
  See `docs/map-safety-rules.md`.

### Relationship Detection
- **Input:** Entities + timeline + geographic
- **Output:** `Array<{ source, target, relationshipType }>`
- **Purpose:** Detect relationships between entities (command responsibility,
  institutional affiliation, geographic containment, temporal ordering).

### Contradiction Detection
- **Input:** Claims + existing evidence records
- **Output:** `Array<{ claimA, claimB, severity, resolution }>`
- **Purpose:** Compare extracted claims against existing records to detect
  contradictions. Severity: low, medium, high, critical.
  **Guardrail:** Different sources may legitimately report different numbers —
  contradiction detection distinguishes factual inconsistency from reporting
  variance.

### Duplicate Detection
- **Input:** Summary + existing evidence records
- **Output:** `Array<{ matchId, similarity, isDuplicate }>`
- **Purpose:** Detect near-duplicate content from different sources.
  Uses semantic similarity, not exact text matching.

### Hallucination Detection
- **Input:** All stage outputs + original source content
- **Output:** `{ flags[], hallucinationScore }`
- **Purpose:** Detect AI-generated fabrications: invented facts, fabricated
  sources, made-up quotes, hallucinated legal rulings, numerical inconsistencies.
  **Guardrail:** This stage is the safety net — it compares all AI-generated
  outputs against the original source text.

### Confidence Estimation
- **Input:** All stage outputs + metadata
- **Output:** `{ overallConfidence, stageConfidences{}, factors[] }`
- **Purpose:** Produce a calibrated overall confidence score (0–1) with
  per-stage breakdowns. Factors include source quality, ambiguity presence,
  contradiction severity, and hallucination flags.

### Topic Classification
- **Input:** Content + summary + claims
- **Output:** `{ topics[], primaryTopic }`
- **Purpose:** Classify content into topic taxonomy for routing and search.

---

## Pipeline Execution Model

### AIOperationResult<T>

Every stage returns `AIOperationResult<T>`:
```typescript
interface AIOperationResult<T> {
  data: T | null;           // Structured output — null on failure
  confidence: number;       // 0–1 calibrated confidence
  modelUsed: string;        // Model identifier
  tokensUsed: { input: number; output: number };
  latencyMs: number;        // Wall-clock time
  warnings: string[];       // Non-fatal issues
  sourceSpans: SourceSpan[];// Source text references
}
```

### Audit Log

Every AI operation is logged immutably:
```typescript
interface AILogEntry {
  timestamp: string;
  stageName: string;
  model: string;
  prompt: string;          // Truncated to 500 chars
  responseSummary: string; // Truncated to 500 chars
  tokensUsed: { input: number; output: number };
  latencyMs: number;
  confidence: number;
  error?: string;
}
```

Logs are never disabled — they are the audit trail for all AI operations.

---

## Provider Abstraction

The pipeline uses a provider-agnostic interface:
```typescript
interface AIProvider {
  complete(request: AIRequest): Promise<AIResponse>;
}
```

Swap providers by implementing this interface. The default provider routes
requests through a configurable model router that selects models based on
task type, content length, and language.

---

## Testing

See `docs/quality-and-testing.md` for AI pipeline testing documentation.
Ground truth datasets live at `src/lib/ai/__tests__/groundTruth/`.

---

## Related Documents

- `docs/ai-prompt-guidelines.md` — prompt structure and safety rules
- `docs/map-safety-rules.md` — coordinate precision and safety
- `docs/quality-and-testing.md` — test suite documentation
- `docs/architecture.md` — overall technical architecture
