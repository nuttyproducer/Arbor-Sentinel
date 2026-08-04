# AI Prompt Guidelines

**Status:** Active — all pipeline stages use versioned prompt templates.
**Last reviewed:** 2026-08-03

---

## Purpose

This document defines the structure, versioning, variable naming conventions,
and safety rules for AI prompts used in the Accountability Atlas pipeline.

---

## Prompt Structure

Every prompt follows a consistent template:

```
[SYSTEM] ← System prompt: defines role, constraints, rules
---
[USER]   ← User prompt: provides content and asks for specific output

Source document:
{{sourceTitle}}
{{sourceBody}}
---
Output the result as valid JSON matching this schema:
{{outputSchema}}
```

### Template Variables

Variables use `{{doubleBrace}}` syntax. Standard variables available to all prompts:

| Variable | Description | Source |
|---|---|---|
| `{{sourceTitle}}` | Normalized content title | `NormalizedContent.title` |
| `{{sourceBody}}` | Full body text (or translation) | `NormalizedContent.body` |
| `{{sourceUrl}}` | Original source URL | `NormalizedContent.url` |
| `{{sourceLanguage}}` | ISO 639-1 language code | `NormalizedContent.language` |
| `{{publishedAt}}` | Publication date if known | `NormalizedContent.publishedAt` |
| `{{sourceType}}` | Source type from registry | `CollectorConfig.sourceType` |
| `{{sourcePublisher}}` | Publisher name | `SourceRecord.publisher` |
| `{{outputSchema}}` | Expected JSON schema | Stage-specific |

### Naming Convention

- Prompt files: `kebab-case.md` matching the stage name (e.g., `summarization.md`)
- Variable names: `camelCase` in template placeholders
- Stage names: `snake_case` for internal IDs (e.g., `entity_extraction`)

---

## Version Tracking

Each prompt is versioned. Versions are stored in the prompt's frontmatter:

```markdown
---
version: 3
last_updated: 2026-08-03
stage: summarization
---
```

When a prompt is updated:
1. Increment the version number
2. Add a changelog entry
3. Run the regression test suite (`hallucinationRegression.test.ts`)
4. Re-calibrate confidence thresholds if needed

**Never update a prompt without incrementing the version.**

---

## Safety Rules

### 1. Never resolve ambiguity

Prompts must instruct the model to **preserve** ambiguity, not resolve it:

```
If the source uses hedging language ("approximately", "may have", 
"reportedly"), preserve that uncertainty in your output. Do NOT convert 
uncertain statements into certain ones.
```

### 2. Never introduce facts not in source

```
Every fact you output MUST have a corresponding excerpt in the source text.
If you are uncertain whether a detail is in the source, OMIT it.
```

### 3. Source-span everything

```
For every fact, provide startChar and endChar into the source body text.
The excerpt between these offsets MUST match the fact exactly.
```

### 4. Never generate legal conclusions

```
You may extract legal claims from sources but you MUST NOT generate your own
legal analysis or conclusions. The distinction between "the ICJ found X" 
(factual, from source) and "this means Y" (legal analysis, AI-generated) 
must be clear.
```

### 5. Numeric precision preservation

```
Reproduce numbers exactly as they appear in the source. Do not round, 
convert units, or change precision. If the source says "approximately 
200-300", output "approximately 200-300", not "250".
```

### 6. Coordinate safety (geographic extraction only)

```
If coordinates appear in the source, round them to at most 1 decimal place.
Never output exact coordinates for sensitive locations (hospitals, schools, 
refugee camps, residential areas).
```

### 7. NGO disclaimer

```
All content labeled with sourceType "ngo" or "humanitarian" MUST include
the disclaimer: "NGO findings are not judicial determinations."
```

### 8. No PII extraction

```
Do not extract personally identifiable information (PII) beyond what is
strictly necessary for legal attribution. Never extract names of victims,
witnesses, or non-public figures without explicit source attribution to
an official public document.
```

---

## Hallucination Mitigation

### Known hallucination patterns to guard against

| Pattern | Detection Method | Prompt Countermeasure |
|---|---|---|
| Fabricated numbers | Compare to source text character spans | "Every number must have a startChar/endChar in source." |
| Invented source citations | Check against known source registry | "Only cite legal instruments if they appear verbatim." |
| Hallucinated legal rulings | Cross-reference with court databases | "Do not characterize legal status beyond what the source states." |
| Made-up quotes | Compare to source text | "Direct quotes must be exact character-span matches." |
| Fabricated dates | Validate date ranges | "Dates must appear explicitly in the source text." |
| Unsupported attribution | Check entity extraction | "Attribute claims only to entities named in the source." |

### Prompt-level defenses

```
Before outputting, verify:
1. Are all numbers present in the source text? (check character spans)
2. Are all quoted statements verbatim from the source?
3. Are all legal conclusions explicitly stated in the source?
4. Are all dates explicitly mentioned in the source?
5. Is all attribution traceable to an entity in the source?
If any answer is "no", OMIT that item from your output.
```

---

## Stage-Specific Prompt Notes

### Summarization
- **Critical:** Facts MUST have `startChar` and `endChar` into source body
- Facts categorized: `legal_finding`, `number`, `temporal`, `testimonial`, `policy_position`
- Ambiguities preserved in `preservedAmbiguities[]`

### Entity Extraction
- Person names: extract full names as they appear, include role/title
- Organizations: use canonical name from entity registry when available
- Locations: include `safeLocation` (approximate region) for sensitive coordinates

### Claim Extraction
- Claim types: `factual`, `legal`, `numerical`, `testimony`, `allegation`
- Each claim must have a source span proving it exists in the source
- Allegations must be labeled as such, not presented as facts

### Timeline Extraction
- Precision levels: `exact` (YYYY-MM-DD), `month` (YYYY-MM), `year` (YYYY), `range`, `approximate`
- Events must be ordered chronologically
- Ambiguous dates get `approximate` precision

### Geographic Extraction
- **Safety-critical:** See `docs/map-safety-rules.md`
- Round coordinates to 1 decimal place
- Never output exact coordinates for sensitive locations
- Provide `safeName` for all locations

### Contradiction Detection
- Compare claims against existing evidence records
- Severity: `low` (minor variance), `medium` (significant difference), `high` (contradictory), `critical` (legal finding conflict)
- Different sources reporting different numbers is NOT necessarily a contradiction

### Hallucination Detection
- Compare ALL AI outputs against original source text
- Flag types: `fabricated_fact`, `invented_source`, `numerical_inconsistency`, `unsupported_attribution`, `made_up_quote`, `hallucinated_legal_ruling`, `fabricated_date`

---

## Related Documents

- `docs/ai-pipeline-overview.md` — pipeline architecture and stage descriptions
- `docs/map-safety-rules.md` — coordinate precision and geographic safety
- `docs/quality-and-testing.md` — AI pipeline testing and ground truth
- `docs/architecture.md` — overall technical architecture
