// src/lib/ai/stages/GeographicExtractor.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { ExtractedLocation, LocationPrecision, GeoJSONFeature } from "./types";

/** Locations that must NEVER have exact coordinates published. */
const SENSITIVE_LOCATION_TYPES = new Set([
  "shelter", "safe_house", "medical_facility", "aid_distribution_point",
  "checkpoint", "witness_location", "individual_home", "school", "hospital",
]);

/** Precision downgrade: what precision to use for sensitive locations. */
const SAFE_PRECISION_MAP: Record<string, LocationPrecision> = {
  exact: "safe",
  district: "city",
  city: "city",
  region: "region",
  country: "country",
  safe: "safe",
};

const locationSchema = z.object({
  locations: z.array(z.object({
    name: z.string(),
    locationType: z.string(),
    parentLocation: z.string().optional(),
    sourcePrecision: z.enum(["country", "region", "city", "district", "exact", "safe"]),
    coordinates: z.object({ lat: z.number(), lon: z.number() }).optional(),
    confidence: z.number().min(0).max(1),
    startChar: z.number(),
    endChar: z.number(),
    isUnresolvable: z.boolean().default(false),
    unresolvableReference: z.string().optional(),
  })),
});

const PROMPT = {
  system: `You are a geographic extraction expert. Extract locations from text. NEVER publish exact coordinates for sensitive sites. Return JSON only.`,
  user: `Extract all geographic locations from the following text. For each:

- name: location name
- locationType: country/region/city/district/named_location/geographic_feature
- parentLocation: parent administrative area
- sourcePrecision: the precision level mentioned in the source
- coordinates: lat/lon (ONLY for public, non-sensitive locations)
- confidence: 0-1
- startChar/endChar: character positions
- isUnresolvable: true for "here", "there", "nearby"
- unresolvableReference: the text if unresolvable

SENSITIVE LOCATIONS (never publish exact coordinates):
- Shelters, safe houses, medical facilities still in operation
- Aid distribution points, checkpoints
- Individual homes, witness locations
- Schools and hospitals at district or higher precision only after verification

Text:
{{text}}`,
};

let locationCounter = 0;

export const geographicExtractorStage = createStage({
  name: "geographic_extraction",
  requires: ["timeline_extraction"],
  run: async (input, context, provider: AIProvider): Promise<AIOperationResult<ExtractedLocation[]>> => {
    const handler = new StructuredOutputHandler();
    const prompt = { system: PROMPT.system, user: PROMPT.user.replace("{{text}}", input.body) };
    const result = await handler.extract(provider, prompt, locationSchema);

    if (result.data) {
      const timelineResult = context.get("timeline_extraction");
      const timelineEvents = (timelineResult?.data as Array<{ id: string; description: string }>) ?? [];

      const locations: ExtractedLocation[] = result.data.locations.map((l) => {
        locationCounter++;
        const isSensitive = SENSITIVE_LOCATION_TYPES.has(l.locationType);
        const displayPrecision = isSensitive
          ? (SAFE_PRECISION_MAP[l.sourcePrecision] ?? "safe")
          : (l.sourcePrecision as LocationPrecision);

        // Generate GeoJSON
        let geojson: GeoJSONFeature | undefined;
        if (l.coordinates && !isSensitive) {
          geojson = {
            type: "Feature",
            geometry: { type: "Point", coordinates: [l.coordinates.lon, l.coordinates.lat] },
            properties: { name: l.name, locationType: l.locationType, precision: displayPrecision },
          };
        }

        // Link to timeline events that mention this location
        const linkedEventIds = timelineEvents
          .filter((e) => e.description.toLowerCase().includes(l.name.toLowerCase()))
          .map((e) => e.id);

        return {
          id: `location_${locationCounter}`,
          name: l.name,
          locationType: l.locationType,
          parentLocation: l.parentLocation,
          sourcePrecision: l.sourcePrecision as LocationPrecision,
          displayPrecision,
          precisionDowngraded: displayPrecision !== l.sourcePrecision,
          coordinates: isSensitive ? undefined : l.coordinates,
          geojson,
          confidence: Math.min(l.confidence, 1),
          sourceSpan: { sourceId: input.url, start: l.startChar, end: l.endChar, excerpt: input.body.slice(l.startChar, l.endChar) },
          linkedEventIds,
          isUnresolvable: l.isUnresolvable,
          unresolvableReference: l.unresolvableReference,
        };
      });

      return { ...result, data: locations };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
