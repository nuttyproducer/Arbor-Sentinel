# Source Policy

This policy defines how Accountability Atlas uses sources.

---

## Source principles

Sources must be:

- public or lawfully usable;
- attributable;
- dated;
- relevant;
- accurately represented;
- categorized by reliability;
- separated from opinion where possible.

---

## Preferred source types

### Primary legal sources

- ICJ case pages, orders, judgments, filings
- ICC arrest warrants, decisions, press releases, filings
- domestic court records
- official sanctions lists
- official parliamentary records

### International organizations

- UN OCHA
- UNRWA
- OHCHR
- UNICEF
- UNHCR
- UN Commission of Inquiry
- WHO where health-system data is relevant

### Humanitarian organizations

- ICRC
- IFRC
- national Red Cross/Red Crescent societies
- MSF
- International Medical Corps
- DEC members and other established humanitarian actors

### Human-rights organizations

- Amnesty International
- Human Rights Watch
- B'Tselem
- Adalah
- Physicians for Human Rights Israel
- other credible human-rights organizations with transparent methodology

### Government and parliamentary sources

- official government statements
- parliamentary votes
- export-control data
- budget and aid records
- arms transfer reports
- official gazettes

### Journalism

Use reputable outlets with editorial standards, bylines, dates, and clear sourcing.

### OSINT

Use OSINT where methods are disclosed, such as geolocation, chronolocation, satellite imagery analysis, metadata analysis where lawful, or cross-source verification.

### Social media

Social media may be used only as:

- a discovery lead;
- a source of public statements by verified/public figures;
- an item for later verification;
- not as final proof by itself.

---

## Source labels

Every source should be labeled:

```text
court-record
un-source
humanitarian-org
human-rights-ngo
government-record
parliamentary-record
journalism
osint
social-media-lead
user-submitted-pending
```

---

## Trust levels

Trust levels are assigned through human review and must never be
auto-assigned from source type alone. All sources default to 0 (unreviewed).

| Level | Label | Criteria |
|---|---|---|
| 0 | Unreviewed | No trust assessment has been performed. All sources start here. |
| 1 | Low confidence | Initial review performed; limited corroboration available. |
| 2 | Moderate confidence | Source has been reviewed; some corroborating evidence exists. |
| 3 | High confidence | Source has been reviewed and found reliable with corroborating evidence from multiple independent sources. |
| 4 | Trusted source | Consistently reliable over time; clear methodology and provenance. |
| 5 | Authoritative | Definitive institutional record with a clear chain of provenance (e.g. court order, official gazette, UN resolution). |

**Guardrails:**
- Never mark a source as trusted (level 4+) based on source type alone.
- A court record is not automatically level 5 — it must be the actual order/judgment, not a press summary.
- Trust levels may be downgraded if a source is found to contain errors or misrepresentations.
- Trust levels are public and subject to correction through the corrections process.

---

## Verification methods

Each source may be assigned a verification method describing how its content
was verified:

| Method | Description |
|---|---|
| `official` | Official institutional record — verified against the issuing body's own publication. |
| `ngo` | NGO / humanitarian report — verified against the organisation's published methodology and findings. |
| `journalism` | Investigative journalism — verified against the outlet's editorial standards and sourcing. |
| `academic` | Academic research — verified against the publication's peer review and citation record. |
| `osint` | OSINT / open-source documentation — verified through disclosed methods (geolocation, chronolocation, cross-source verification). |

**Guardrails:**
- Verification method is optional — leave unset if the verification approach is not yet determined.
- A source may have a trust level without a verification method, or vice versa.
- The verification method describes how the source was checked, not what the source claims.

---

## Citation fields

Every source entry should include:

- title;
- organization/publication;
- author if available;
- date published;
- date accessed;
- URL;
- archive URL if available;
- language;
- source type;
- summary;
- relevance note;
- reliability note.

---

## Source evaluation questions

Before using a source, ask:

1. Who published it?
2. When was it published?
3. What exactly does it claim?
4. Is it primary, secondary, or tertiary?
5. Does it cite evidence?
6. Is the methodology visible?
7. Does it contain legal conclusions or factual reporting?
8. Is it contradicted by other reliable sources?
9. Is it safe to republish or link?
10. Does it contain private data?

---

## Handling disagreement between sources

If sources disagree:

- do not choose the most emotionally powerful figure;
- show attribution;
- show ranges where appropriate;
- explain uncertainty;
- update when better sources appear;
- avoid using disputed figures in social cards.

---

## Archiving

Where lawful and appropriate, preserve links using public web archives. Do not archive or mirror sensitive private data, graphic content, or content that could endanger people.

---

## Copyright and reuse

Prefer linking and summarizing. Do not copy full articles, reports, photos, or videos into the repository unless the license permits reuse or permission exists.

---

## Unsafe sources

Do not use or promote sources that:

- encourage violence;
- publish private personal data;
- operate as harassment lists;
- use dehumanizing language;
- spread obvious misinformation;
- lack any traceable methodology;
- expose victims or witnesses without consent.

---

## Source correction

Any contributor may flag a source as outdated, inaccurate, unsafe, misrepresented, or disputed using the source correction issue template.
