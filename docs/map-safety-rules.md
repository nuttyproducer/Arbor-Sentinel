# Map Safety Rules

**Status:** Active — enforced at geographic extraction and map rendering layers.
**Last reviewed:** 2026-08-03

---

## Purpose

This document defines the coordinate precision rules, sensitivity classification
criteria, and emergency unpublish procedure for the Arbor Sentinel map
system. These rules protect vulnerable populations by preventing the publication
of exact coordinates that could be used to target sensitive locations.

---

## Coordinate Precision Table

| Location Type | Max Precision | Example | Rule |
|---|---|---|---|
| Country | 0 decimal places | `31°N, 34°E` | Country-level only |
| Region/Province | 0 decimal places | `Test Region` | Administrative boundary |
| City (>100k population) | 1 decimal place | `31.5°N, 34.4°E` | City centroid, not exact |
| City (<100k population) | 0 decimal places | `31°N, 35°E` | Approximate region only |
| District | 0 decimal places | `Eastern District` | District name only |
| Village/Rural area | 0 decimal places | `Test Region` | Region name only |
| **Sensitive locations** | **NEVER publish** | N/A | See below |

---

## Sensitivity Classification

### Level 3 — Never Publish Coordinates

These location types must NEVER have coordinates published, even approximately:

- Hospitals and medical facilities
- Schools and educational institutions
- Refugee camps and IDP settlements
- Places of worship
- Humanitarian aid distribution points
- Civilian shelters
- Residential buildings
- Water infrastructure

**Rule:** For Level 3 locations, output only the safe location name (region-level).
The geographic extractor must set `precisionLevel: "approximate"` and round
coordinates to at most 0 decimal places (if any coordinates are provided at all).

### Level 2 — Approximate Only

These locations may have approximate coordinates (1 decimal place max):

- Government buildings
- Court buildings
- Military installations (only when cited in official court documents)
- Border crossings
- Ports and airports
- UN facilities

**Rule:** For Level 2 locations, coordinates are rounded to 1 decimal place.
Safe name must use regional description, not exact address.

### Level 1 — City-Level

These locations may have city-level coordinates (1 decimal place):

- Capital cities
- Major urban centers (>100k population)
- Public squares and monuments
- International organization headquarters

**Rule:** Coordinates rounded to 1 decimal place. Must be clearly the city
centroid, not a specific building.

---

## Safe Coordinate Output

### Implementation

The geographic extractor enforces these rules programmatically:

```typescript
function enforceCoordinateSafety(
  lat: number,
  lng: number,
  locationType: LocationType,
  sensitivityLevel: number,
): SafeCoordinates {
  if (sensitivityLevel === 3) {
    // NEVER publish exact coordinates for sensitive locations
    return {
      lat: undefined,
      lng: undefined,
      safeName: locationType.safeName,
      precisionLevel: "approximate",
    };
  }

  if (sensitivityLevel === 2) {
    // Round to 1 decimal place maximum
    return {
      lat: Math.round(lat * 10) / 10,
      lng: Math.round(lng * 10) / 10,
      safeName: `${locationType.safeName} (approximate)`,
      precisionLevel: "approximate",
    };
  }

  // Level 1: city-level, 1 decimal place
  return {
    lat: Math.round(lat * 10) / 10,
    lng: Math.round(lng * 10) / 10,
    safeName: locationType.safeName,
    precisionLevel: "city",
  };
}
```

### What "safe coordinates" means

- Coordinates are always rounded (never exact)
- Coordinates are always accompanied by a `safeName` label
- Coordinates for sensitive locations are suppressed entirely
- The precision level is always explicit in the output

---

## Sensitive Location Detection

The geographic extractor must detect sensitive locations from:
1. **Entity type:** If the extracted entity is typed as `hospital`, `school`,
   `refugee_camp`, `place_of_worship`, `shelter`, `residential` — it is Level 3.
2. **Context keywords:** If the source mentions "hospital", "medical facility",
   "school", "refugee camp", "shelter", "camp", "clinic" in proximity to
   coordinates — flag for sensitivity review.
3. **Source type:** Content from humanitarian sources (MSF, ICRC, OCHA) is more
   likely to reference sensitive locations — apply stricter scrutiny.

---

## Map Rendering Safety

### Layer visibility rules

| Location Type | Default Visibility | Can Be Toggled? |
|---|---|---|
| Country boundaries | Always visible | No |
| Region boundaries | Always visible | No |
| City markers | Visible at zoom ≥ 8 | No |
| Incident markers | Visible at zoom ≥ 10 | Yes (opt-in) |
| Evidence markers | Visible at zoom ≥ 12 | Yes (opt-in) |
| **Sensitive markers** | **Never rendered** | No |

### Coordinate fuzzing at render time

Even if coordinates pass extraction safety, the map renderer applies a second
layer of fuzzing:

- Add random jitter of ±0.01 degrees (~1km) to all rendered markers
- Jitter is deterministic per marker ID (same ID → same fuzz offset)
- This prevents reverse-engineering exact coordinates from rendered positions

---

## Emergency Unpublish Procedure

If sensitive coordinates are detected in published content:

### Detection

- Automated: Hallucination detector flags exact coordinates in AI output
- Automated: Map renderer logs all rendered coordinates for audit
- Manual: Reviewer notices sensitive coordinate in public content

### Immediate Response (within 15 minutes)

1. **Remove the content** from the public map layer immediately
2. **Audit** the source: which collector, which AI stage, which review step
   failed to catch this
3. **Notify** the data safety officer (role-based, not personal contact)
4. **Log** the incident with:
   - What coordinates were exposed
   - Which content record they were attached to
   - Which safety rule was violated
   - Timestamp of exposure and removal

### Post-Incident (within 24 hours)

1. **Root cause analysis:** Which safety check failed? Why?
2. **Fix the gap:** Update extraction rules, rendering rules, or review checklist
3. **Re-scan all content:** Search for similar exposures in all published content
4. **Post-incident review:** Document lessons learned, update this document

### Safety Check Before Re-Publishing

Before any content with location data is re-published after correction:

1. Verify coordinates are rounded to correct precision
2. Verify no Level 3 locations have coordinates
3. Verify all coordinates have `safeName` labels
4. Verify the map renders at correct precision level
5. Get sign-off from data safety reviewer

---

## Testing Map Safety

### Unit tests

`src/lib/ai/__tests__/GeographicExtractor.test.ts` tests coordinate rounding.

### Integration tests

`src/__tests__/integration/mapDataSafety.test.ts` (M4.7-03) verifies:
- No exact coordinates leak for sensitive location types
- All coordinates are rounded to ≤1 decimal place
- Safe names are populated for all location outputs

### Adversarial inputs

Tests include intentionally tricky inputs:
- Coordinates for locations near (but not at) sensitive sites
- Multiple coordinate formats (decimal, DMS, UTM)
- Coordinates embedded in narrative text rather than structured data

---

## Related Documents

- `docs/map-architecture.md` — map layer system and architecture
- `docs/ai-prompt-guidelines.md` — geographic extraction prompt safety rules
- `docs/ai-pipeline-overview.md` — geographic extraction stage description
- `docs/runbooks/map-data-incident-response.md` — incident response procedures
- `docs/emergency-unpublish-policy.md` — platform-wide unpublish policy
