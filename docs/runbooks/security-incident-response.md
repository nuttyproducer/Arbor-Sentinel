# Security Incident Response Runbook

**Status:** Active
**Last reviewed:** 2026-08-03
**Audience:** Platform operators, security contacts, all personnel with admin access

---

## Purpose

Classification, containment, communication, recovery, and post-mortem procedures
for security incidents affecting the Arbor Sentinel platform.

---

## Incident Classification

### Credential Leak

**Definition:** API keys, access tokens, database credentials, or other secrets
exposed in code, logs, configuration, or public communication.

**Examples:**
- API key committed to repository
- Credential logged in error output
- Access token shared in chat or email
- `.env` file accidentally published

### Data Breach

**Definition:** Unauthorized access to or exfiltration of:
- Source data (collector outputs, raw content)
- AI pipeline outputs (evidence records, entity data)
- Review queue data (reviewer notes, unpublished content)
- User data (if any is stored)

**Note:** During static beta, no user accounts exist — the primary concern is
source data and evidence records.

### Defacement

**Definition:** Unauthorized modification of public-facing content:
- Homepage or content page text changed
- Map data altered
- Evidence records tampered with
- DNS hijacking or domain compromise

### Denial of Service (DDoS)

**Definition:** Attack making the platform unavailable to legitimate users.
During static beta, impact is limited but availability should be restored.

---

## Immediate Containment

### Credential Leak (<15 minutes)

1. **Revoke the credential immediately** — rotate the API key/secret
2. **Check access logs** for unauthorized use of the leaked credential
3. **Scan the repository** for other exposed credentials
4. **Remove from git history** if committed (use `git filter-branch` or BFG)
5. **Notify affected services** if the credential granted access to third-party APIs
6. **Issue new credentials** and update configuration

**Do NOT:**
- Just delete the file — the credential is still in git history
- Rotate without checking if the old credential was abused
- Use the same credential value for the replacement

### Data Breach (<1 hour)

1. **Identify the breach vector** — how was access obtained?
2. **Revoke compromised access** — rotate all potentially affected credentials
3. **Contain the breach** — block the access path (IP, account, API key)
4. **Assess what was accessed** — check access logs for data exfiltration patterns
5. **Preserve evidence** — save logs, do not delete or modify (for forensic analysis)
6. **Notify the security contact** (role-based)

### Defacement (<15 minutes)

1. **Revert to last known-good deployment** — roll back immediately
2. **Take the site to maintenance mode** if defacement is visible to public
3. **Identify how the defacement occurred** — compromised credentials? CMS access? DNS?
4. **Check deployment pipeline** for unauthorized changes
5. **Verify DNS records** for hijacking

### DDoS (<30 minutes)

1. **Enable rate limiting** at the infrastructure level (CDN, load balancer)
2. **Block attacking IPs** if identifiable
3. **Scale up** if on auto-scaling infrastructure
4. **Contact hosting provider** for DDoS mitigation support
5. **Monitor** — DDoS is often a smokescreen for another attack

---

## Communication Guidelines

### Who to contact

| Incident Type | Contact | When |
|---|---|---|
| Credential leak | Security contact + affected service owner | Immediately |
| Data breach | Security contact + Data Safety Officer | Within 15 minutes |
| Defacement | Security contact + all admins | Immediately |
| DDoS | Security contact + hosting provider | Immediately |

All contacts are **role-based** (not personal). Current role holders are in the
secure operations manual.

### What to say (external communication template)

```
We are investigating a [security incident / technical issue] affecting the
Arbor Sentinel platform. The platform may be temporarily unavailable
while we address this. We will provide an update within [timeframe].

If you have questions, contact [role-based email].
```

**Do NOT:**
- Share technical details before containment is complete
- Speculate about cause or impact
- Name individuals
- Share incident-specific details on public channels

### What to say (internal communication template)

```
Security incident [INCIDENT-ID] declared at [time].

Type: [credential leak / data breach / defacement / DDoS]
Severity: [classification]
Status: [containment in progress / contained / resolved]
Lead: [name of incident lead]
Timeline: [brief timeline of known events]
Next update: [when]

Full details in [secure incident channel].
```

---

## Recovery Procedure

### After containment

1. **Verify the fix** — confirm the vulnerability is closed
2. **Rotate all potentially affected credentials** — even if not confirmed compromised
3. **Rebuild affected systems** from known-good state (not just patch)
4. **Run the full test suite** — all tests must pass
5. **Deploy the fixed version** — follow standard deployment procedure
6. **Monitor for 24 hours** — elevated alerting during recovery period

### Service restoration

- Restore from backup if data was modified
- Verify data integrity after restoration
- Gradual traffic ramp-up if behind CDN/load balancer
- Monitor error rates, latency, and unusual access patterns

---

## Post-Mortem Process

### Timeline (within 5 business days)

1. **Day 1:** Incident lead drafts post-mortem
2. **Day 2-3:** Team reviews and adds findings
3. **Day 4:** Post-mortem reviewed by security contact
4. **Day 5:** Action items assigned with owners and deadlines

### Post-mortem template

```markdown
# Security Incident Post-Mortem — [INCIDENT-ID]

**Date of incident:** [date]
**Date of report:** [date]
**Incident lead:** [name]

## Summary
[One paragraph — what happened, impact, resolution]

## Timeline (all times in UTC)
- [HH:MM] — [event]
- [HH:MM] — [detection]
- [HH:MM] — [containment start]
- [HH:MM] — [containment complete]
- [HH:MM] — [recovery start]
- [HH:MM] — [recovery complete]

## Root cause
[What allowed this incident to occur]

## What went well
[Containment speed, detection, communication]

## What went poorly
[Gaps in detection, slow response, unclear ownership]

## Impact
- Systems affected: [list]
- Data accessed/exposed: [description, scope]
- Duration of exposure: [duration]
- Users affected: [count, if applicable]

## Action items
- [ ] [Action] — Owner: [name], Due: [date]
- [ ] [Action] — Owner: [name], Due: [date]

## Prevention
[Process changes, tooling improvements, monitoring enhancements]
```

---

## Prevention Checklist

### Weekly
- [ ] Review access logs for unusual patterns
- [ ] Check for exposed credentials in logs and error outputs
- [ ] Verify all dependencies are at latest secure versions

### Monthly
- [ ] Rotate all service credentials
- [ ] Review and update this runbook
- [ ] Run credential scan on the full repository
- [ ] Review access control list — remove unused accounts

### Quarterly
- [ ] Penetration testing (authorized, by security professional)
- [ ] Tabletop exercise: simulate each incident type
- [ ] Review and update security contacts list

---

## Related Documents

- `docs/static-beta-security-checklist.md` — security requirements for beta
- `docs/privacy-principles.md` — data privacy commitments
- `docs/emergency-unpublish-policy.md` — content emergency procedures
- `docs/runbooks/map-data-incident-response.md` — specific to map coordinate incidents
