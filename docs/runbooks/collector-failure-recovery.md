# Collector Failure Recovery Runbook

**Status:** Active
**Last reviewed:** 2026-08-03
**Audience:** Platform operators with access to monitoring dashboards

---

## Purpose

Step-by-step recovery procedures for each collector error type. Use this runbook
when a collector health alert fires or a collection run fails.

---

## Error Type Reference

### Fetch Failure

**Symptom:** `CollectError.type === "fetch"`, collector health → `degraded` or `failed`.
**Causes:** Network timeout, DNS resolution failure, source server unreachable.

**Recovery steps:**
1. Check source URL is reachable from your network (`curl -I <source_url>`)
2. Verify the source website is online (check independently in a browser)
3. If source is down: suspend the collector for 24h, re-check automatically
4. If source is reachable but collector fails: check DNS, proxy, or firewall rules
5. Increase `fetchTimeoutMs` if source is slow (try 2x current value)
6. After fix: manually rerun the collector via `collector.collect()`

**Do NOT:**
- Retry immediately without investigating — may trigger rate limits
- Change the source URL without updating the Source Registry
- Leave a failed collector running on a tight interval

### Parse Failure

**Symptom:** `CollectError.type === "parse"`, items parsed < items fetched.
**Causes:** Source website HTML structure changed, RSS feed format changed.

**Recovery steps:**
1. Review the raw HTML/JSON from the last successful run vs the failed run
2. Check if the source redesigned their website or changed their CMS
3. If minor HTML change: update the collector's extraction selectors
4. If major redesign: flag for source redesign (see below)
5. Re-run the collector after fix
6. If parse errors persist after 3 attempts: escalate to engineering

**Do NOT:**
- Blindly update selectors without checking if the source's data model changed
- Skip validation to force items through — produces garbage data

### Rate Limit

**Symptom:** `CollectError.type === "rate_limit"`, 429 responses increasing.
**Causes:** Collector exceeding source's rate limits, or source tightening limits.

**Recovery steps:**
1. Check `RateLimitConfig` for this source — is it within source's terms?
2. Increase `minDelayMs` by 2x for this source
3. Reduce `maxRequestsPerMinute` by 50%
4. Check if multiple collectors are hitting the same domain — coordinate them
5. If source sent `Retry-After` header: the rate limiter will respect it automatically
6. Check the rate limiter dashboard for domain-level contention

**Do NOT:**
- Disable rate limiting to "get through" — you will be blocked or IP-banned  
- Bypass `respectRetryAfter` — it exists for a reason

### Auth Failure

**Symptom:** `CollectError.type === "auth"`, 401 or 403 responses.
**Causes:** API key expired, credentials rotated, access revoked.

**Recovery steps:**
1. Verify the API key/credential is still valid
2. Check the source's developer portal for key status
3. Rotate the credential following the source's procedure
4. Update the credential in the secure configuration store
5. **Never commit credentials to the repository**
6. Manually rerun the collector after credential update

**Do NOT:**
- Hard-code credentials in collector code
- Share API keys in runbooks, chat, or email
- Leave expired keys in configuration

### Timeout

**Symptom:** `CollectError.type === "timeout"`, fetch exceeds `fetchTimeoutMs`.
**Causes:** Source server slow, large response, network congestion.

**Recovery steps:**
1. Check if source is experiencing performance issues
2. Increase `fetchTimeoutMs` for this specific source (not globally)
3. If timeout persists: check if source response size has grown
4. Consider paginating requests if source supports it
5. If source is consistently slow: increase interval to reduce load

**Do NOT:**
- Set global timeouts very high — one slow source should not block others
- Retry timeouts aggressively — the source may be overloaded

### Unknown Errors

**Symptom:** `CollectError.type === "unknown"`, unclassified failure.
**Causes:** Unanticipated edge case, bug in collector code.

**Recovery steps:**
1. Check the full error stack trace in logs
2. Compare raw response with expected format
3. If reproducible: file a bug with the raw (sanitized) response
4. Suspend the collector until the bug is fixed
5. Escalate to engineering if not diagnosable

---

## Source Health Check Procedure

### Manual health check (ad-hoc)

1. Navigate to the admin dashboard at `/admin`
2. Find the source in the collector health panel
3. Check: `healthStatus`, `consecutiveFailures`, `lastSuccessfulRun`
4. If `consecutiveFailures >= 3`: source is `failed` — follow recovery steps above
5. If `healthStatus === "degraded"`: source is working but with issues — investigate
6. Run a manual collection to test: use the "Run Now" button or API call

### Automated health monitoring

The `HealthMonitor` (see `src/lib/collectors/monitoring/HealthMonitor.ts`) tracks:
- Success/failure rates per source
- Latency trends (degrading performance = early warning)
- Consecutive failure counts (3+ = alert)
- Source staleness (no successful run in >2x the configured interval)

---

## Manual Rerun Procedure

From the admin dashboard or API:

```typescript
// Programmatic manual rerun
const source = sourceRegistry.get("source-id");
const config = getCollectorConfig("source-id");
const collector = registry.createInstance(source, config);
const result = await collector.collect();

if (result.success) {
  // Items collected — proceed to AI pipeline
} else {
  // Check result for specific error info, follow recovery steps
}
```

From the CLI (if available):
```bash
npm run collect -- --source=source-id
```

---

## Source Suspension Criteria

Suspend a collector when:
1. `consecutiveFailures >= 5` — no successful runs in last 5 attempts
2. Source returns 403/401 for >24h — access likely revoked
3. Source website is confirmed offline for >48h
4. Source has redesigned and collector needs code changes
5. Source's terms of service have changed and crawling may violate them

### Suspension procedure
1. Set `collector.enabled = false` in configuration
2. Add a note explaining why and when it was suspended
3. Set a reminder to re-check in 7 days (for temporary issues)
4. For permanent issues (source decommissioned): mark `status: "archived"` in Source Registry

---

## Reactivation Procedure

Reactivate a suspended collector when:
1. Root cause is confirmed fixed
2. Source is verified reachable
3. At least one successful manual collection run completes
4. Health status transitions back to `active`

### Reactivation steps
1. Verify the source URL is accessible
2. Run a manual collection — verify `result.success === true`
3. Check that normalized output looks correct (spot-check 2-3 items)
4. Set `collector.enabled = true` in configuration
5. Set `healthStatus = "active"` (the system will do this automatically on success)
6. Monitor for 2-3 scheduled runs to confirm stability
7. Document the incident and resolution

---

## Related Documents

- `docs/collector-framework.md` — collector architecture
- `docs/collector-configuration.md` — configuration reference
- `docs/monitoring-runbook.md` — health monitoring setup
- `docs/runbooks/data-quality-degradation.md` — downstream impact of collector failures
