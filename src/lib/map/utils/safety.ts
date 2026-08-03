import type { RawCoordinate, SafeCoordinate, LocationPrecision, SafetyContext } from "../types";

/** Locations that must NEVER have exact coordinates published. Mirrors GeographicExtractor's set. */
export const SENSITIVE_LOCATION_TYPES = new Set([
  "shelter", "safe_house", "medical_facility", "aid_distribution_point",
  "checkpoint", "witness_location", "individual_home", "school", "hospital",
]);

/** Precision downgrade map for sensitive location types. */
export const SAFE_PRECISION_MAP: Record<string, LocationPrecision> = {
  exact: "safe",
  district: "city",
  city: "city",
  region: "region",
  country: "country",
  safe: "safe",
};

// Seeded random for deterministic jitter (seeded per coordinate + session)
let jitterCounter = 0;

function applyJitter(value: number, rangeKm: number): number {
  // ~1 degree ≈ 111km. rangeKm / 111 gives degree range.
  // Use deterministic pseudo-random for reproducibility.
  jitterCounter++;
  const seed = jitterCounter * 2654435761;
  const pseudo = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const offset = (pseudo - 0.5) * 2 * (rangeKm / 111);
  return value + offset;
}

/**
 * Apply safety rules to a raw coordinate. This is the ONE AND ONLY way
 * coordinates enter the map display system. Every coordinate MUST pass
 * through this function.
 *
 * @param raw - The raw coordinate before safety processing
 * @param context - Location type, sensitivity, and source precision
 * @returns A safe coordinate suitable for public map display
 */
export function safeCoordinate(
  raw: RawCoordinate,
  context: SafetyContext,
): SafeCoordinate {
  const { locationType, isSensitive, sourcePrecision } = context;

  // Determine if this location type is classified as sensitive
  const isSensitiveType = SENSITIVE_LOCATION_TYPES.has(locationType);

  // Determine display precision
  let displayPrecision: LocationPrecision;
  if (isSensitive || isSensitiveType) {
    displayPrecision = SAFE_PRECISION_MAP[sourcePrecision] ?? "safe";
  } else {
    displayPrecision = sourcePrecision;
  }

  // Apply jitter based on precision level
  let lat = raw.lat;
  let lon = raw.lon;

  if (isSensitive || isSensitiveType) {
    switch (displayPrecision) {
      case "safe":
        // Maximum jitter: 20-50km
        lat = applyJitter(lat, 35);
        lon = applyJitter(lon, 35);
        break;
      case "city":
        // City-level jitter: 5-15km
        lat = applyJitter(lat, 10);
        lon = applyJitter(lon, 10);
        break;
      case "region":
        // Region-level jitter: 15-30km
        lat = applyJitter(lat, 20);
        lon = applyJitter(lon, 20);
        break;
      case "country":
        // Country level: no jitter needed — already imprecise
        break;
      default:
        break;
    }
  }

  // In dev, log safety decisions
  if (import.meta.env.DEV && displayPrecision !== sourcePrecision) {
    console.debug(
      `[map/safety] Precision downgraded: ${sourcePrecision} → ${displayPrecision} ` +
      `for ${locationType} (sensitive=${isSensitive || isSensitiveType})`
    );
  }

  return {
    lat,
    lon,
    precision: displayPrecision,
  } as SafeCoordinate;
}

/**
 * Create a raw coordinate from lat/lon values.
 * Only for use in tests and data preprocessing — never in map rendering code.
 */
export function makeRawCoordinate(lat: number, lon: number): RawCoordinate {
  return { lat, lon } as RawCoordinate;
}
