# Data Quality Degradation Runbook

**Status:** Active
**Last reviewed:** 2026-08-03
**Audience:** Platform operators, review coordinators, data quality analysts

---

## Purpose

Procedures for detecting, investigating, and correcting systemic data quality
degradation in the collector → AI pipeline → review workflow.

---

## Detection

### Automated monitoring alerts

| Alert | Threshold | Dashboard |
|---|---|---|
| Confidence drop | Average pipeline confidence < 0.5 for >1 hour | `/admin/data-quality` |
| Contradiction spike | Contradiction rate >20% of new content | `/admin/data-quality` |
| Hallucination spike | Hallucination flags >10% of pipeline output | `/admin/data-quality` |
| Empty output rate | >25% of stage outputs returning `data: null` | `/admin/data-quality` |
| Entity extraction drop | <1 entity per content item average | `/admin/data-quality` |
| Source coverage gap | Region/source type with 0 items in 7 days | `/admin/data-quality` |

### Manual review flags

Reviewers should flag systemic quality issues when they observe:
- Same error pattern across multiple content items from the same source
- AI-generated text that doesn't match the source (hallucination)
- Consistently incorrect entity extraction
- Timelines that are systematically wrong
- Geographic locations that are consistently imprecise

---

## Investigation Steps

### Step 1: Scope the degradation

1. **When did it start?** Check the data quality dashboard timeline
2. **Which sources are affected?** Filter by source type, individual source
3. **Which pipeline stages are affected?** Check per-stage confidence trends
4. **How many content items are affected?** Count affected records
5. **Is it still ongoing?** Check if degradation is active or historical

### Step 2: Identify the cause

| Symptom | Likely Cause | Check |
|---|---|---|
| Sudden confidence drop | Model change or prompt regression | `PromptManager` versions, model routing config |
| Gradual confidence decline | Source quality degradation | Raw collector output for affected sources |
| Spike in contradictions | New source with conflicting data | Compare new source claims against existing records |
| Empty outputs increasing | Content format change | Raw collector output format |
| Entity extraction decline | Source changed naming conventions | Raw source text for entity mentions |
| Geographic precision issues | New source with different location format | Geographic extractor output for affected sources |

### Step 3: Root cause analysis

For each likely cause:
1. Collect sample data: 10-20 affected items
2. Compare with baseline: 10-20 unaffected items from before the degradation
3. Identify the difference: what changed between baseline and degraded samples?
4. Test the hypothesis: can you reproduce the degradation with the suspected cause?
5. Document the finding

---

## Correction Deployment

### When the root cause is identified

1. **For code fixes:**
   - Implement the fix in a branch
   - Run the regression test suite
   - Run the AI pipeline tests with ground truth data
   - Deploy following standard procedure
   - Monitor for 24 hours post-deploy

2. **For configuration fixes:**
   - Update the configuration (prompt version, model route, rate limit)
   - No deployment needed for config changes
   - Monitor for 1 hour post-change

3. **For source-level fixes:**
   - Update the collector configuration or extraction logic
   - Manually re-run the collector for the affected source
   - Re-process affected content through the pipeline

### Reprocessing affected content

Content that was processed during the degradation period may need reprocessing:

1. Identify affected content items by timestamp and source
2. Re-run them through the pipeline with the fix applied
3. Compare new output with old output — verify improvement
4. Replace the old AI output with the corrected output
5. Update the review queue status if items were already reviewed

**Do NOT:**
- Reprocess without comparing old vs new output
- Delete the old audit log entries — they document the degradation
- Skip review for reprocessed content — it needs re-review

---

## Verification Process

### Before closing the degradation incident

- [ ] Root cause confirmed and documented
- [ ] Fix deployed and validated
- [ ] Affected content reprocessed (if applicable)
- [ ] Data quality dashboard shows metrics returning to baseline
- [ ] No new alerts for the same pattern in 24 hours
- [ ] Regression tests pass
- [ ] Review coordinator confirms no systemic quality issues in new content

### If quality does not recover

1. Re-examine the root cause — may be multiple factors
2. Consider model fallback if the issue is model-related
3. Consider source suspension if the issue is source quality
4. Escalate to engineering if undiagnosable after 2 investigation cycles

---

## Prevention

### Monitoring improvements

After each degradation incident, ask:
- Could this have been detected earlier?
- Is the alert threshold appropriate?
- Do we need a new alert for this specific pattern?

### Automated quality gates

Consider automated quality gates that block pipeline output when:
- Overall confidence < 0.3 (configurable threshold)
- Hallucination flags > 50% of a batch
- Entity extraction rate drops to 0 for a source

These gates prevent degraded content from entering the review queue.

---

## Related Documents

- `docs/quality-and-testing.md` — test suite and quality infrastructure
- `docs/ai-pipeline-overview.md` — pipeline architecture
- `docs/ai-prompt-guidelines.md` — prompt management and versioning
- `docs/runbooks/ai-pipeline-troubleshooting.md` — per-stage troubleshooting
- `docs/runbooks/collector-failure-recovery.md` — source-level issues
- `docs/admin-dashboard-guide.md` — dashboard usage and metrics interpretation
