# Monitoring Runbook

**Status:** Active development — monitoring system implemented (M4.1-08).  
**Last reviewed:** 2026-08-01

---

## Purpose

This runbook covers operational procedures for the collector health
monitoring system. It is intended for maintainers and contributors who
need to understand alert behavior, health status transitions, and
troubleshooting steps.

---

## Dashboard Access

The monitoring dashboard is at `/admin/monitoring`. It is not linked from
public navigation.

**Access:** Direct URL entry only. No authentication in the static beta —
the URL itself provides separation from public pages.

---

## Health Status Lifecycle

```
unknown ──(first run)──→ active
                            │
                    (failure occurs)
                            │
                            ▼
                        degraded ←──(1-2 consecutive failures)
                            │
                    (3+ consecutive failures)
                            │
                            ▼
                         failed ──(successful run)──→ active
```

| Status | Meaning | Action |
|---|---|---|
| `unknown` | Never run | Trigger a manual collection run |
| `active` | Operating normally | No action needed |
| `degraded` | 1-2 consecutive failures, or stale data | Monitor; investigate if pattern continues |
| `failed` | 3+ consecutive failures | Investigate source URL, check for website redesign or blocking |

---

## Alert Severities

| Severity | Meaning | Response |
|---|---|---|
| `info` | Informational — not a problem | Note and proceed |
| `warning` | Potential issue — monitor | Investigate within 24 hours |
| `critical` | Requires attention | Investigate immediately |

---

## Alert Types and Responses

### Consecutive Failures

**Warning (3+):** A collector has failed 3 times in a row.

**Critical (5+):** A collector has failed 5 times in a row.

**Response:**
1. Check the collector's `lastError` field for the error message
2. Verify the source URL is still valid (website redesigns, URL changes)
3. Check if the source is blocking automated access (anti-bot measures)
4. If the source URL has changed, update the Source Registry
5. If blocked, increase `minDelayMs` in the rate limit config
6. Resolve the alert once the issue is addressed

### Stale Data

**Warning:** No successful fetch in 24 hours.

**Response:**
1. Trigger a manual collection run for the source
2. If the collector is on a long polling interval, this may be expected — adjust `defaultStaleThresholdMs` in monitoring config
3. If the source rarely publishes new content, the stale threshold may need tuning

### High Error Rate

**Critical:** Error rate exceeds 50% over recent runs.

**Response:**
1. Check the error types — are they parse errors, fetch errors, or rate limits?
2. Parse errors: the source may have changed its HTML structure — update the collector
3. Fetch errors: network or blocking issues — check connectivity and rate limits
4. Rate limits: increase delay or reduce polling frequency

### Rate Limit Spike

**Warning:** Rate limit hits exceed 10 in the monitoring window.

**Response:**
1. Reduce polling frequency for the affected source
2. Increase `minDelayMs` in the rate limit config
3. Check if `respectRetryAfter` is enabled
4. If consistent, the source may have tightened its rate limits

---

## Configuring Alert Thresholds

Alert rules are defined in `DEFAULT_MONITORING_CONFIG` in
`src/lib/collectors/monitoring/types.ts`. Customize per deployment:

```typescript
const customConfig: MonitoringConfig = {
  ...DEFAULT_MONITORING_CONFIG,
  defaultStaleThresholdMs: 7 * 24 * 60 * 60 * 1000, // 7 days for low-frequency sources
  rules: [
    {
      id: "custom-failures",
      type: "consecutive_failures",
      description: "Custom failure threshold",
      severity: "warning",
      enabled: true,
      threshold: { maxConsecutiveFailures: 2 }, // More aggressive
      cooldownMs: 15 * 60_000, // 15 minutes
      sourceTypes: ["ngo"], // Only for NGO collectors
    },
  ],
};
```

---

## Coverage Gaps

The system health panel reports source types with no registered collector:

| Source Type | Status |
|---|---|
| `court` | Covered (ICJ, ICC) |
| `un` | Covered (OHCHR, OCHA) |
| `government` | Covered (EU, Belgium) |
| `humanitarian` | Covered (ICRC) |
| `ngo` | Covered (Amnesty, HRW, B'Tselem, MSF) |
| `academic` | Covered (AcademicCollector) |
| `journalism` | Covered (JournalismCollector) |
| `osint` | **Not covered** — collector needed |

---

## Troubleshooting

### Dashboard shows no collectors

The dashboard syncs registrations from the Source Registry. Ensure:
1. `src/data/sources.ts` has source records
2. Collectors are registered with `CollectorRegistry`
3. `syncRegistrations()` has been called with the registry's registration list

### All collectors show "unknown" status

This means no collection runs have been recorded. During the static beta,
collectors must be triggered manually — there is no auto-scheduler.

### Alert not firing when expected

Check:
1. The alert rule is enabled
2. The threshold is configured correctly
3. The cooldown period has elapsed
4. There isn't already an active alert for the same rule/collector

### Alert firing too frequently

1. Increase the `cooldownMs` for the rule
2. Resolve the active alert before a new one can fire
3. Check if the underlying issue has actually been fixed
