# Map Data Incident Response Runbook

**Status:** Active
**Last reviewed:** 2026-08-03
**Audience:** Data Safety Officer, platform operators, map system maintainers

---

## Purpose

Immediate response procedures for sensitive coordinate exposure in map data.
This is a safety-critical runbook — coordinate exposure can endanger lives.

---

## Incident Classification

### Severity 1 — Critical (immediate action, <15 min)

Exact coordinates published for:
- Hospitals, medical facilities, clinics
- Schools, educational institutions
- Refugee camps, IDP settlements
- Civilian shelters
- Humanitarian aid distribution points

### Severity 2 — High (action within 1 hour)

Coordinates with excessive precision (>1 decimal place) for:
- Residential areas
- Places of worship
- Water infrastructure
- Any location in an active conflict zone

### Severity 3 — Medium (action within 24 hours)

Coordinates with 1 decimal place that should have 0, or lack of `safeName` label.

---

## Immediate Response (Severity 1)

### Within 15 minutes of detection

1. **Unpublish the content immediately**
   - Use the emergency unpublish button in the admin dashboard
   - Or: set `visibility: "hidden"` on the content record directly
   - Or: run the emergency unpublish API endpoint

2. **Check public cache**
   - Verify the content is removed from all public pages
   - Clear CDN cache for the affected URLs
   - Check that map tiles no longer render the sensitive markers

3. **Notify the Data Safety Officer** (role-based contact)

4. **Log the incident**
   ```
   Incident ID: INC-MAP-YYYY-MM-DD-NNN
   Detected at: [ISO timestamp]
   Content record ID: [record_id]
   Coordinates exposed: [lat, lng]
   Location type: [hospital/school/etc.]
   Precision of exposed coordinates: [N decimal places]
   Source: [collector → AI stage → review step]
   Action taken: [unpublish/clear cache]
   ```

### Within 1 hour

1. **Audit the pipeline** that produced the coordinates:
   - Which collector fetched the source?
   - Did the geographic extractor round coordinates correctly?
   - Was the safety check bypassed or did it fail silently?
   - Who reviewed the content before publication?

2. **Scan for similar exposures**
   - Search all published content for coordinates at the same precision level
   - Search all published content for the same location type
   - Check the last 30 days of AI pipeline output

3. **Fix the immediate gap**
   - If rounding was not applied: fix the extraction code
   - If sensitivity was misclassified: update the sensitivity table
   - If review missed it: update the review checklist

---

## Post-Incident Review (within 24 hours)

### Root cause analysis

Answer these questions:
1. **Which safety check failed?** (Extraction? Rounding? Rendering? Review?)
2. **Why did it fail?** (Code bug? Configuration error? Human error?)
3. **Was this a one-off or systemic?** (Check similar content for same pattern)
4. **How long were the coordinates exposed?** (Check timestamps)
5. **Was the exposure accessed?** (Check access logs if available)

### Fix deployment

1. Implement the code/config fix
2. Run the geographic extraction regression tests
3. Run the map data safety integration tests
4. Re-scan all published content with the fix applied
5. Fix any additional exposures found

### Post-incident report

Template:
```markdown
# Map Data Incident Report — [INCIDENT-ID]

**Date:** [date]
**Severity:** [1/2/3]
**Exposure duration:** [start time] to [end time] ([duration])

## What happened
[Brief description of the exposure]

## Root cause
[Which safety check failed and why]

## Impact assessment
- Content records affected: [count]
- Location types exposed: [types]
- Coordinates precision: [N decimal places]
- Was the content publicly accessible: [yes/no]
- Was the content cached by search engines: [unknown/yes/no]

## Remediation
- [Actions taken to fix the exposure]
- [Actions taken to prevent recurrence]
- [Re-scan results]

## Prevention
- [Process changes]
- [Code changes]
- [Review checklist updates]
```

---

## Safety Check Before Re-Publishing

After correction, verify ALL of these before re-publishing:

- [ ] All coordinates rounded to correct precision level (≤1 decimal place)
- [ ] No Level 3 locations (hospitals, schools, camps) have coordinates
- [ ] All coordinates have `safeName` labels
- [ ] Map renders at correct precision level
- [ ] Geographic extraction regression tests pass
- [ ] Map data safety integration tests pass
- [ ] Data Safety Officer has signed off

**Do NOT re-publish until every checkbox is confirmed.**

---

## Prevention Checklist

### Daily
- [ ] Review automated coordinate precision alerts
- [ ] Check map layer rendering for any anomalous markers

### Weekly
- [ ] Run geographic extraction adversarial test suite
- [ ] Review sensitivity classification rules for updates
- [ ] Check for new location types that should be Level 3

### Monthly
- [ ] Full re-scan of all published content for coordinate precision
- [ ] Review and update this runbook
- [ ] Tabletop exercise: simulate a Severity 1 incident

---

## Related Documents

- `docs/map-safety-rules.md` — coordinate precision rules and sensitivity classification
- `docs/map-architecture.md` — map layer system
- `docs/ai-prompt-guidelines.md` — geographic extraction prompt safety rules
- `docs/emergency-unpublish-policy.md` — platform-wide unpublish policy
- `docs/runbooks/security-incident-response.md` — broader security incidents
