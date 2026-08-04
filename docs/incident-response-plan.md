# Incident Response Plan

**Status:** Active — pre-launch (M7-06)  
**Last reviewed:** 2026-08-04  
**Audience:** On-call engineers, platform operators, security contacts, spokespeople

This plan is the top-level entry point for any incident. It classifies
incidents, assigns response steps, and points to the detailed runbooks in
`docs/runbooks/` for each class. When an incident is declared, start here,
then open the matching runbook.

---

## 1. Roles and contact escalation

All contacts are **role-based**, not personal. Current role holders are
recorded in the secure operations manual (not committed to the repository).

| Role | Responsibility | Contact route |
|---|---|---|
| On-call engineer | First responder, technical containment | On-call phone/SMS + Slack |
| Incident lead | Coordinates response, owns the incident to resolution | Assigned per incident |
| Security contact | Security/credential incidents, forensic decisions | Security email |
| Data safety officer | Data breach assessment and notification decisions | Internal |
| Editorial lead | Content error review and corrections | Editorial channel |
| Spokesperson | All external communication | Press channel |
| **Legal counsel** | Legal exposure, breach notification obligations, defamation/content risk | Attorney contact (see secure ops manual) |
| Hosting/CDN provider | Infrastructure-level mitigation (DDoS, origin failures) | Provider dashboard/support |

**Legal counsel is a mandatory escalation for any security breach, data
breach, or defamation/content-risk incident.** Do not delay notification or
external communication until legal counsel has been consulted.

---

## 2. Incident classification

Every incident is assigned exactly one primary class at declaration. A
single incident may span classes; the primary class drives the response.

| Class | Definition | Primary runbook |
|---|---|---|
| **Security breach** | Unauthorized access to systems, credentials, or infrastructure; defacement; DDoS | `docs/runbooks/security-incident-response.md` |
| **Data breach** | Unauthorized access to or exfiltration of source data, AI pipeline outputs, review queue data, or user data | `docs/runbooks/security-incident-response.md` |
| **Service outage** | Platform unavailable, broken, or severely degraded for users (origin, DNS/CDN, build/deploy, collector/pipeline failure causing stale content) | `docs/runbooks/collector-failure-recovery.md`, `docs/runbooks/ai-pipeline-troubleshooting.md` |
| **Content error** | A factual, legal, translation, or map-safety error published on a public page | `docs/runbooks/map-data-incident-response.md`, `docs/runbooks/data-quality-degradation.md`, `docs/emergency-unpublish-policy.md` |

Severity and priority:

| Severity | Meaning | First response |
|---|---|---|
| **Critical (SEV-1)** | Active attack, confirmed data exposure, defacement visible, platform down | Immediately, < 15 min |
| **Warning (SEV-2)** | Sustained degraded service, high-severity content error, failed collector pattern | < 1 hour |
| **Info (SEV-3)** | Isolated issue, single collector failure, minor content inaccuracy | < 24 hours |

---

## 3. Response steps by class

### 3.1 Common first steps (all incidents)

1. Declare the incident: assign an incident ID (`INC-YYYYMMDD-NNN`), a lead, and a severity.
2. Open the secure incident channel; post the internal template (§5.1).
3. Notify the on-call engineer and the matching role contact.
4. Preserve evidence (logs, screenshots, request IDs). Do not delete or alter logs.
5. Contain before communicating externally. External statements go through the spokesperson.
6. Escalate to legal counsel for security breach, data breach, or content-risk incidents.

### 3.2 Security breach

**Primary runbook:** `docs/runbooks/security-incident-response.md`

Steps: classify (credential leak / data breach / defacement / DDoS) → contain
(revoke credentials, roll back deployment, block IPs, enable rate limiting) →
recover → post-mortem.

**Special notes:**
- Credential leak: revoke immediately (< 15 min), check git history, scan for other exposures.
- Defacement: revert to last known-good deployment immediately; take the site to maintenance mode if public-facing.
- DDoS: enable infrastructure-level rate limiting; DDoS is often a smokescreen for another attack.
- **Legal counsel: mandatory** — breach notification obligations and forensic decisions.

### 3.3 Data breach

**Primary runbook:** `docs/runbooks/security-incident-response.md`

Steps: identify breach vector → revoke compromised access → contain → assess
exposure scope → preserve evidence → notify security contact → **notify legal
counsel** → external notification only after legal and Data Safety Officer
review.

**Special notes:**
- During static beta the platform stores no user accounts or personal data; the primary concern is source data, AI pipeline outputs, and review queue data.
- Assess and document exactly what was accessed before any external communication.
- Notification obligations are determined by legal counsel and the Data Safety Officer.

### 3.4 Service outage

**Primary runbooks:** `docs/runbooks/collector-failure-recovery.md`, `docs/runbooks/ai-pipeline-troubleshooting.md`, `docs/runbooks/review-queue-escalation.md`

Steps:
1. Confirm scope: whole site, a route, an API endpoint, or a data layer.
2. For static hosting: check build/deploy status, DNS, CDN, and origin health.
3. For data freshness: check collector status (`/admin/monitoring`), pipeline status (`/admin/pipeline`), and review queue depth.
4. For search/map: verify data is published and the client bundles are served.
5. Restore, then monitor for 24 hours at elevated alerting.

**Special notes:**
- A stale-data outage is still an outage: if the public evidence layer is not current, treat the freshness failure as SEV-2.
- Review queue backlog → `docs/runbooks/review-queue-escalation.md`.

### 3.5 Content error

**Primary runbooks:** `docs/runbooks/data-quality-degradation.md`, `docs/runbooks/map-data-incident-response.md`, `docs/emergency-unpublish-policy.md`

Steps:
1. Assess severity: legal risk, safety risk (map coordinates), or factual inaccuracy.
2. For safety-critical errors (e.g., unsafe coordinates, identifying vulnerable people): unpublish immediately per `docs/emergency-unpublish-policy.md`, then review.
3. For factual/legal errors: open a correction, mark the record, and issue a correction notice per `docs/correction-policy.md`.
4. Notify the editorial lead; route any public acknowledgment through the spokesperson.
5. **Legal counsel: mandatory for defamation/content-risk assessments.**

---

## 4. Escalation path

```
On-call engineer
   │ (cannot contain within target time / severity raises)
   ▼
Incident lead + Security contact + Data Safety Officer
   │ (security/data breach or content risk)
   ▼
Legal counsel (mandatory) ── Spokesperson ── Editorial lead
   │
   ▼
External communication (only after containment + legal review)
```

Escalation triggers:
- Containment not achieved within the class target time → raise to incident lead.
- Severity raises (SEV-3 → SEV-2 → SEV-1) → widen notification.
- Any uncertainty about legal exposure → contact legal counsel immediately.

---

## 5. Communication templates

### 5.1 Internal notification

```
Security/Service incident [INC-YYYYMMDD-NNN] declared at [time UTC].

Class: [security breach / data breach / service outage / content error]
Severity: [SEV-1 / SEV-2 / SEV-3]
Status: [containment in progress / contained / resolved]
Lead: [name of incident lead]
Timeline: [brief timeline of known events]
Next update: [time]
Full details: [secure incident channel]
```

### 5.2 External holding statement (during containment)

> We are investigating an issue affecting the Accountability Atlas platform.
> The platform may be temporarily unavailable while we address it. We will
> provide an update within [timeframe]. For questions, contact [press email].

### 5.3 External resolution statement

> The issue affecting Accountability Atlas has been resolved. [One or two
> sentences on what happened and what we changed to prevent recurrence.]
> We thank users for their patience. If you believe you were affected,
> contact [press email].

### 5.4 Data breach notification (only after legal + Data Safety Officer review)

> We are writing to inform you of an incident affecting Accountability Atlas.
> On [date], [what happened]. We have [containment + remediation]. Based on
> our review, [what data was / was not affected]. We take this seriously and
> have taken the following steps to prevent recurrence: [steps]. For
> questions, contact [press email] or [security email].

**Do NOT:** share technical details before containment, speculate about cause
or impact, name individuals, or publish incident specifics on public channels
before the spokesperson has approved the statement.

---

## 6. Post-mortem process

Completed within **5 business days** of resolution. Incident lead drafts; team
reviews; security contact and legal counsel review as applicable; action items
are assigned owners and due dates.

| Day | Activity |
|---|---|
| 1 | Incident lead drafts post-mortem from preserved evidence |
| 2–3 | Team reviews and adds findings |
| 4 | Reviewed by security contact (and legal counsel if applicable) |
| 5 | Action items assigned with owners and deadlines |

Template:

```markdown
# Post-Mortem — [INC-YYYYMMDD-NNN]

**Date of incident:** [date]   **Date of report:** [date]   **Incident lead:** [name]

## Summary
[One paragraph — what happened, impact, resolution]

## Timeline (all times UTC)
- [HH:MM] — [event]

## Root cause
[What allowed this incident to occur]

## What went well / What went poorly
[Detection, containment, communication]

## Impact
- Systems affected: [list]
- Data accessed/exposed: [description, scope]
- Duration: [duration]
- Users affected: [count, if applicable]

## Action items
- [ ] [Action] — Owner: [name], Due: [date]

## Prevention
[Process changes, tooling improvements, monitoring enhancements]
```

---

## 7. Related documents

- `docs/runbooks/security-incident-response.md` — security breach / data breach
- `docs/runbooks/collector-failure-recovery.md` — collector outages
- `docs/runbooks/ai-pipeline-troubleshooting.md` — pipeline failures
- `docs/runbooks/data-quality-degradation.md` — content/data quality
- `docs/runbooks/map-data-incident-response.md` — map coordinate incidents
- `docs/runbooks/review-queue-escalation.md` — review backlog
- `docs/emergency-unpublish-policy.md` — emergency content removal
- `docs/monitoring-alerting.md` — how alerts trigger this plan
- `docs/communication-plan.md` — spokesperson and external statements
- `docs/security-review-report.md` — M7-03 security posture
