# AI Pipeline Troubleshooting Runbook

**Status:** Active
**Last reviewed:** 2026-08-03
**Audience:** Platform operators with access to monitoring dashboards and AI audit logs

---

## Purpose

Step-by-step troubleshooting for each AI pipeline stage failure mode. Use when
the pipeline produces low-confidence outputs, hallucination flags, empty results,
or timeouts.

---

## Per-Stage Troubleshooting

### Summarization

**Symptom:** Summary is empty, facts array is empty, or confidence < 0.5.

**Investigation:**
1. Check source content is not empty or trivial
2. Review the prompt template for regressions (check `PromptManager` versions)
3. Check if content language was correctly detected (wrong language → bad summary)
4. Review audit log for this stage: prompt, response, tokens used
5. If `tokensUsed.output` is very low: model may have truncated the response

**Fix:**
- Increase `maxTokens` for this task type
- If content is very long: the summarizer may need more tokens
- Revert prompt to last known-good version if recent change caused regression

**Do NOT:**
- Accept empty summaries as valid — they hide data loss
- Increase maxTokens arbitrarily without checking prompt design

### Entity Extraction

**Symptom:** Zero entities extracted from content that clearly contains entities.
**Common cause:** Model not recognizing entities, or JSON parse failure.

**Investigation:**
1. Check source text for entity density (names, orgs, locations)
2. Review StructuredOutputHandler logs for JSON parse errors
3. Check if entities are extracted but in wrong format
4. Verify the output schema matches what the model returned

**Fix:**
- If JSON parse errors: add schema reinforcement to prompt
- If zero entities for entity-dense text: try a different model route

### Claim Extraction

**Symptom:** Claims not classified correctly, or source spans don't match.
**Common cause:** Source text offsets shifted by translation or preprocessing.

**Investigation:**
1. Compare `claim.sourceSpan.start/end` with the actual source text
2. If content was translated: verify translation preserved character positions
3. Check if claim types are all "factual" (model may be defaulting)

**Fix:**
- Ensure source text used for span calculation matches what the model received
- Retry with explicit claim type examples in the prompt

### Timeline Extraction

**Symptom:** Events out of chronological order, dates parsed incorrectly.
**Common cause:** Ambiguous date formats (DD/MM vs MM/DD), relative dates ("last month").

**Investigation:**
1. Review extracted dates against source text
2. Check for date format ambiguity (e.g., "01/02/2026")
3. Check `precision` field — are approximate dates correctly labeled?

**Fix:**
- Add explicit date format instructions to prompt
- For ambiguous dates: set `precision: "approximate"` not `"exact"`

### Geographic Extraction

**Symptom:** Coordinates with too much precision, sensitive locations flagged.
**Common cause:** Model outputting exact coordinates from source.

**Investigation:**
1. **URGENT:** Check if any coordinates have more than 1 decimal place
2. Check if any location type is `hospital`, `school`, `refugee_camp`
3. Review the coordinate rounding enforcement in `GeographicExtractor.ts`

**Fix:**
- **If sensitive coordinates leaked:** Follow `docs/runbooks/map-data-incident-response.md`
- Ensure post-processing rounds all coordinates (defense in depth)
- Add explicit precision instructions to geographic extraction prompt

### Contradiction Detection

**Symptom:** High false-positive rate or missed contradictions.

**Investigation:**
1. Review flagged contradictions — are they genuine conflicts or reporting variance?
2. Check if `severity` classification is appropriate
3. Verify existing records are correctly loaded for comparison

**Fix:**
- Adjust severity thresholds if flags are too sensitive
- Ensure "reporting variance" (different orgs, different numbers) is not conflated with contradictions

### Hallucination Detection

**Symptom:** High hallucination scores on valid content, or missed fabrications.

**Investigation:**
1. Review flagged items — check source text against AI output
2. If false positives: check if "fabrication" is actually a legitimate inference
3. If false negatives: review recent prompt changes

**Fix:**
- Tune hallucination detection thresholds
- Add specific known hallucination patterns to detection rules

---

## Confidence Degradation Investigation

When overall pipeline confidence drops significantly:

1. **Identify which stage** has the lowest confidence
2. **Check recent prompt changes** — did a prompt update break calibration?
3. **Check source quality** — low-quality sources naturally produce lower confidence
4. **Check model routing** — is a weaker model being used for this content?
5. **Review audit logs** — are multiple stages flagging issues?

### When confidence < 0.5 across multiple runs
1. Check for systemic issue (model change, prompt regression, data quality)
2. Review ground truth test results for calibration drift
3. Consider temporary model fallback to a more capable model
4. Escalate to engineering if sustained for >1 hour

---

## Model Fallback Procedures

### When to fall back

Fall back to an alternative model when:
1. Primary model returns persistent errors (>5 in 10 minutes)
2. Primary model latency exceeds 3x baseline
3. Primary model returns empty responses for >10% of requests

### Fallback procedure
1. The `ModelRouter` handles fallback automatically if configured
2. Manual override: update `ModelRoute` configuration for the affected task type
3. Monitor fallback model quality — it may have different characteristics
4. Restore primary model once the issue is resolved

### Available models
Configured in `ModelRouter` — see `src/lib/ai/ModelRouter.ts`. The router
selects models based on task type, content length, and language.

---

## Prompt Debugging Guide

### When a prompt may be the issue

- Regression coincides with a prompt version bump
- Same model, same content — different quality
- Output format changes without code changes

### Debugging steps
1. Check `PromptManager` for the current prompt version
2. Compare with the previous version (diff the prompt files)
3. Run the affected stage with the previous prompt version
4. If quality recovers: revert the prompt, investigate the change
5. If quality does not recover: the issue is not the prompt — investigate further

### Prompt rollback procedure
1. Set the prompt version back to the last known-good version
2. Re-run the regression test suite (`hallucinationRegression.test.ts`)
3. Monitor confidence scores for 1 hour
4. Document why the prompt was rolled back

---

## Empty Output Investigation

When a stage returns `data: null`:

1. Check `result.warnings` for clues
2. Check `result.tokensUsed` — zero output tokens means model produced nothing
3. Check if content was too short or too long (context window limits)
4. Check if content triggered a content filter (`finishReason: "content_filter"`)
5. Review the audit log for the exact prompt and response

**Do NOT:**
- Silently skip empty outputs — they indicate a pipeline problem
- Accept "no data" as valid for content that clearly has extractable information

---

## Related Documents

- `docs/ai-pipeline-overview.md` — architecture and stage descriptions
- `docs/ai-prompt-guidelines.md` — prompt structure and safety rules
- `docs/map-safety-rules.md` — coordinate safety rules
- `docs/runbooks/map-data-incident-response.md` — coordinate exposure incidents
- `docs/runbooks/data-quality-degradation.md` — systemic quality issues
