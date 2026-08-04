# Monitoring and Alerting

**Status:** Pre-launch (M7-06)  
**Last reviewed:** 2026-08-04  
**Audience:** On-call engineers, platform operators

This document defines the monitoring and alerting posture for the public
launch. It complements `docs/monitoring-runbook.md`, which covers the
collector-health monitoring system (health status lifecycle, alert
thresholds, troubleshooting). Together they tell an on-call engineer what to
watch, what an alert means, and what to do.

**Privacy guardrail:** Monitoring must never collect personal data. There is
no session replay, no per-user tracking, no cross-site tracking, and no
collection of identifiers from visitors. All traffic metrics are aggregate
counts (requests, bytes, status-code distributions, latency percentiles) at
the CDN/host level. Any monitoring tool that would collect personal data is
out of scope.

---

## 1. Monitoring pillars

### 1.1 Uptime monitoring

Purpose: detect that the public site is reachable and returning correct
responses.

| Check | Target | Frequency |
|---|---|---|
| HTTPS availability (200) on `/` | All regions | 1 min |
| Key route smoke checks: `/methodology`, `/evidence`, `/map`, `/legal-tracker`, `/gaza-dossier` | 200 + contains expected `<title>` | 5 min |
| `robots.txt` returns `Allow: /` | — | 15 min |
| TLS certificate expiry | > 14 days | 1 hour |
| CDN/origin error rate (5xx) | < 0.5% of requests | 1 min |

Tooling options: any uptime probe service (e.g., UptimeRobot, StatusCake) or
a self-hosted probe. Checks must run from outside the hosting provider so a
provider outage is detected.

### 1.2 Error tracking (with error budgets)

Purpose: catch client-side and API errors and keep them within budget.

| Signal | Budget | Alert |
|---|---|---|
| Client-side uncaught errors (JS `window.onerror`) | ≤ 0.1% of page loads | warning at 0.1%, critical at 0.5% |
| API 4xx/5xx responses (Supabase/PostgREST) | 5xx ≤ 0.5% of requests | warning at 0.5%, critical at 2% |
| Content validation errors | 0 tolerated | critical |

Error budgets are monthly. Burning the monthly error budget (e.g., error rate
above budget for > 30 days) triggers a reliability review and an entry in the
changelog.

**Privacy:** error reports include a stack trace and URL path only — no
personal data, no input contents, no session data.

### 1.3 Performance monitoring

Purpose: keep the site fast for real users.

| Metric | Target | Alert |
|---|---|---|
| LCP (largest contentful paint) | ≤ 2.5 s p75 | warning at 3.5 s, critical at 4.5 s |
| INP (interaction to next paint) | ≤ 200 ms p75 | warning at 300 ms |
| CLS (cumulative layout shift) | ≤ 0.1 | warning at 0.25 |
| JS bundle (gzipped) | < 300 kB | critical if exceeded on `main` build |
| API latency (p95) | ≤ 500 ms | warning at 800 ms |

Use Lighthouse CI in the deploy pipeline (synthetic, in CI) and, if the host
provides it, aggregated RUM (real user monitoring) at a **cohort level only**
(no individual user identity).

### 1.4 Traffic monitoring

Purpose: observe aggregate load and detect anomalies (e.g., a DDoS smokescreen
or a viral spike that needs capacity).

| Signal | Source |
|---|---|
| Requests/min, bytes/min, status-code distribution | CDN analytics (aggregate only) |
| Unique IP counts (aggregate) | CDN analytics — used only as a count, never stored per-IP |
| Origin CPU/bandwidth | Hosting provider metrics |

Traffic anomalies (a sudden 10× spike or a sudden drop to near-zero) raise a
warning so an on-call engineer checks for attack or outage. No per-visitor
data is retained.

### 1.5 Collector / pipeline health (existing)

Covered by `docs/monitoring-runbook.md`: collector health status lifecycle
(`unknown → active → degraded → failed`), consecutive-failure thresholds,
stale-data detection, and high-error-rate rules. Dashboards: `/admin/monitoring`
and `/admin/pipeline`.

---

## 2. Alert channels

| Channel | Use | Notes |
|---|---|---|
| **Email** | All alerts (info/warning/critical) | On-call list + ops list |
| **SMS** | Critical (SEV-1) alerts only | On-call engineer phone |
| **Slack** | All alerts + incident channel | `#incidents` with severity prefix |
| **Hosting/CDN dashboard** | Infrastructure alerts | Provider-native |
| **Status page** | Public status during major outage | Optional pre-launch |

Rule of thumb: every critical alert must reach the on-call engineer on a
device they carry (SMS). Email and Slack alone are not sufficient for SEV-1.

---

## 3. Severity levels

Aligns with `docs/monitoring-runbook.md` and `docs/incident-response-plan.md`.

| Severity | Meaning | Response | Channels |
|---|---|---|---|
| **Critical (SEV-1)** | Site down, security breach, confirmed data exposure, defaced, error budget blown | Immediately (< 15 min); declare incident | SMS + Slack + email |
| **Warning (SEV-2)** | Degraded performance, sustained 5xx, failed collector pattern, stale data, high error rate | < 1 hour | Slack + email |
| **Info (SEV-3)** | Isolated collector failure, minor latency blip, cert < 30 days | < 24 hours | Email |

---

## 4. On-call rotation

- **Single on-call engineer per week** (primary), one backup.
- Rotation is tracked in the secure operations manual; the roster is current
  before launch.
- The on-call engineer acknowledges every critical alert within 15 minutes
  or the escalation path is triggered (below).
- Handover notes are posted to the ops channel each rotation change.

---

## 5. Escalation path

```
Critical alert → On-call engineer (acknowledge < 15 min)
   │  no ack / not contained in target time
   ▼
Backup on-call + Engineering lead
   │  still unresolved or severity raises
   ▼
Incident lead + Security contact (+ Data Safety Officer if data)
   │  security/data/content-risk
   ▼
Legal counsel (mandatory) ── Spokesperson ── Editorial lead
   │
   ▼
Declare incident per docs/incident-response-plan.md
```

Escalation rules:
- A critical alert not acknowledged in 15 minutes pages the backup and
  engineering lead.
- Any alert that indicates an active security breach or data exposure
  escalates immediately to the security contact and legal counsel regardless
  of acknowledgment.
- On-call engineers carry the runbook index (`docs/runbooks/`) and this plan
  when on rotation.

---

## 6. Alert threshold configuration

Collector-health thresholds live in `DEFAULT_MONITORING_CONFIG` in
`src/lib/collectors/monitoring/types.ts` (see `docs/monitoring-runbook.md`).

Uptime/performance/traffic alerts are configured in the external monitoring
tool (or the host), with the thresholds in §1. Keep this document in sync
with whatever is actually configured — the document is the source of truth
for the on-call engineer.

---

## 7. Pre-launch verification

- [ ] Uptime probes active and passing for all target routes
- [ ] Test alert sent on each channel (email, SMS, Slack) and acknowledged
- [ ] On-call roster current; backup reachable
- [ ] Escalation path rehearsed (tabletop) with the on-call engineer
- [ ] Dashboard access confirmed (`/admin/monitoring`, `/admin/pipeline`)
- [ ] Privacy review: no monitoring signal collects personal data
- [ ] Error budget thresholds configured and documented in the monitoring tool

---

## 8. Related documents

- `docs/monitoring-runbook.md` — collector health lifecycle and thresholds
- `docs/incident-response-plan.md` — what to do when an alert becomes an incident
- `docs/runbooks/` — per-class response runbooks
- `docs/privacy-principles.md` — privacy commitments that constrain monitoring
- `docs/security-review-report.md` — M7-03 security posture
