// src/lib/graph/schema.ts
//
// Graph schema definitions — node property schemas, edge property schemas,
// and validation functions. Defines what properties each node and edge type
// requires and accepts, and validates nodes/edges before creation.

import type { NodeType, EdgeType, GraphEdge } from "./types";
import { EDGE_TYPE_ALLOWED_PAIRS } from "./types";

// ── Property schema types ────────────────────────────────────────────────────

/** Definition of a single property within a node or edge type schema. */
export interface PropertyDef {
  /** Whether this property must be present. */
  required: boolean;
  /** Expected JavaScript type. */
  type: "string" | "number" | "boolean" | "string[]" | "object";
  /** Human-readable description. */
  description: string;
}

/** Schema for a node type: maps property keys to their definitions. */
export type NodePropertySchema = Record<string, PropertyDef>;

/** Schema for an edge type: maps property keys to their definitions. */
export type EdgePropertySchema = Record<string, PropertyDef>;

// ── Node property schemas ────────────────────────────────────────────────────

/** Property schemas for each node type. */
export const NODE_SCHEMAS: Record<NodeType, NodePropertySchema> = {
  source: {
    publisher: { required: true, type: "string", description: "Name of the publishing organization." },
    sourceType: { required: true, type: "string", description: "Type of source (court, ngo, un, etc.)." },
    url: { required: false, type: "string", description: "Primary URL of the source." },
    trustLevel: { required: false, type: "number", description: "Human-assigned trust level 0–5." },
    jurisdiction: { required: false, type: "string", description: "Geographic or legal jurisdiction." },
    language: { required: false, type: "string", description: "Primary language code (ISO 639-1)." },
    region: { required: false, type: "string", description: "Geographic region for filtering." },
  },

  document: {
    title: { required: true, type: "string", description: "Document title." },
    url: { required: false, type: "string", description: "URL to the original document." },
    publicationDate: { required: false, type: "string", description: "ISO date of publication." },
    contentType: { required: false, type: "string", description: "article, report, legal_filing, press_release, etc." },
    language: { required: false, type: "string", description: "ISO 639-1 language code." },
    summary: { required: false, type: "string", description: "Brief summary of the document." },
    authors: { required: false, type: "string[]", description: "Author names." },
    sourceQuality: { required: false, type: "number", description: "Verification level 0–5." },
  },

  entity: {
    canonicalName: { required: true, type: "string", description: "Canonical display name." },
    entityType: { required: true, type: "string", description: "Sub-type: person, organization, location, date, event, legal_case." },
    aliases: { required: false, type: "string[]", description: "Known name variants." },
    role: { required: false, type: "string", description: "Role or title (for persons)." },
    affiliation: { required: false, type: "string", description: "Affiliation (for persons)." },
    organizationType: { required: false, type: "string", description: "Organization type (ngo, court, government, etc.)." },
    acronym: { required: false, type: "string", description: "Acronym (for organizations)." },
    locationType: { required: false, type: "string", description: "Location type (country, region, city, etc.)." },
    parentLocation: { required: false, type: "string", description: "Parent location name." },
    confidence: { required: false, type: "number", description: "Extraction confidence 0–1." },
  },

  event: {
    description: { required: true, type: "string", description: "Event description." },
    date: { required: true, type: "string", description: "ISO date of the event." },
    datePrecision: { required: false, type: "string", description: "exact, month, year, range, ambiguous." },
    endDate: { required: false, type: "string", description: "End date for date ranges (ISO)." },
    isApproximate: { required: false, type: "boolean", description: "Whether the date is approximate." },
    isUndated: { required: false, type: "boolean", description: "Whether the event has no date." },
    originalDateText: { required: false, type: "string", description: "Original date text from source." },
    confidence: { required: false, type: "number", description: "Extraction confidence 0–1." },
  },

  location: {
    name: { required: true, type: "string", description: "Location name." },
    locationType: { required: true, type: "string", description: "country, region, city, district, named_location, geographic_feature." },
    parentLocation: { required: false, type: "string", description: "Parent location ID or name." },
    sourcePrecision: { required: false, type: "string", description: "Original precision from source." },
    displayPrecision: { required: false, type: "string", description: "Safe precision for public display." },
    coordinates: { required: false, type: "object", description: "lat/lon coordinates (only if safe)." },
    confidence: { required: false, type: "number", description: "Extraction confidence 0–1." },
  },

  claim: {
    claimText: { required: true, type: "string", description: "The full claim text." },
    claimType: { required: true, type: "string", description: "legal, humanitarian, political, factual, allegation." },
    verificationStatus: { required: false, type: "string", description: "unverified, verified, contradicted." },
    confidence: { required: false, type: "number", description: "Extraction confidence 0–1." },
    isNested: { required: false, type: "boolean", description: "Whether this is part of a compound statement." },
    fromOpinionContent: { required: false, type: "boolean", description: "Whether claim is from opinion/editorial." },
  },

  country: {
    name: { required: true, type: "string", description: "Country name." },
    isoCode: { required: false, type: "string", description: "ISO 3166-1 alpha-2 code." },
    region: { required: false, type: "string", description: "Geographic region." },
    continent: { required: false, type: "string", description: "Continent." },
    population: { required: false, type: "number", description: "Population estimate." },
  },

  institution: {
    name: { required: true, type: "string", description: "Institution name." },
    acronym: { required: false, type: "string", description: "Institution acronym." },
    institutionType: { required: false, type: "string", description: "eu_body, un_body, international_court, etc." },
    parentInstitution: { required: false, type: "string", description: "Parent institution ID or name." },
    jurisdiction: { required: false, type: "string", description: "Jurisdiction scope." },
  },

  organization: {
    name: { required: true, type: "string", description: "Organization name." },
    acronym: { required: false, type: "string", description: "Organization acronym." },
    orgType: { required: false, type: "string", description: "ngo, court, government, humanitarian, academic, media, etc." },
    category: { required: false, type: "string", description: "UN and humanitarian, medical, legal and human rights, etc." },
    jurisdiction: { required: false, type: "string", description: "Primary jurisdiction." },
    url: { required: false, type: "string", description: "Organization website." },
  },

  action: {
    name: { required: true, type: "string", description: "Action template name." },
    actionType: { required: true, type: "string", description: "contact_representative, arms_transfer_review, etc." },
    description: { required: false, type: "string", description: "Action description." },
    audience: { required: false, type: "string[]", description: "Target audiences." },
    difficulty: { required: false, type: "string", description: "easy, moderate, advanced." },
    estimatedTime: { required: false, type: "string", description: "Estimated time to complete." },
  },
};

// ── Edge property schemas ────────────────────────────────────────────────────

/** Property schemas for each edge type. */
export const EDGE_SCHEMAS: Record<EdgeType, EdgePropertySchema> = {
  mentions: {
    confidence: { required: false, type: "number", description: "Extraction confidence 0–1." },
    context: { required: false, type: "string", description: "How the entity is mentioned in context." },
    sourceSpan: { required: false, type: "object", description: "Source span reference." },
  },

  occurs_at: {
    confidence: { required: false, type: "number", description: "Confidence in the location attribution." },
    role: { required: false, type: "string", description: "How the event relates to the location (primary, secondary)." },
  },

  involves: {
    confidence: { required: false, type: "number", description: "Confidence in the involvement." },
    role: { required: false, type: "string", description: "Role of the entity in the event (participant, subject, witness)." },
  },

  supports: {
    confidence: { required: false, type: "number", description: "Confidence in the support relationship." },
    strength: { required: false, type: "string", description: "strong, moderate, weak." },
  },

  contradicts: {
    confidence: { required: false, type: "number", description: "Confidence in the contradiction." },
    contradictionType: { required: false, type: "string", description: "numerical, factual, temporal, source_source." },
    severity: { required: false, type: "string", description: "critical, major, minor, informational." },
  },

  related_to: {
    confidence: { required: false, type: "number", description: "Confidence in the relationship." },
    relationshipType: { required: false, type: "string", description: "affiliation, association, causal, etc." },
    strength: { required: false, type: "string", description: "strong, weak, inferred." },
  },

  authored_by: {
    confidence: { required: false, type: "number", description: "Confidence in the authorship." },
    role: { required: false, type: "string", description: "Author role (primary, contributor, editor)." },
  },

  published_by: {
    confidence: { required: false, type: "number", description: "Confidence in the publisher attribution." },
    publicationType: { required: false, type: "string", description: "How the document was published (hosted, syndicated, etc.)." },
  },

  located_in: {
    confidence: { required: false, type: "number", description: "Confidence in the location." },
    precision: { required: false, type: "string", description: "country, region, city, district, exact." },
  },

  part_of: {
    confidence: { required: false, type: "number", description: "Confidence in the membership." },
    relationshipType: { required: false, type: "string", description: "subsidiary, division, member, child_location." },
  },
};

// ── Validation ───────────────────────────────────────────────────────────────

/** Result of a node or edge validation. */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a node's properties against the schema for its type.
 * Returns a ValidationResult with any errors found.
 */
export function validateNodeProperties(
  type: NodeType,
  properties: Record<string, unknown>,
): ValidationResult {
  const schema = NODE_SCHEMAS[type];
  if (!schema) {
    return { valid: false, errors: [`Unknown node type: ${type}`] };
  }

  const errors: string[] = [];

  // Check required properties
  for (const [key, def] of Object.entries(schema)) {
    if (def.required && !(key in properties)) {
      errors.push(`Missing required property "${key}" for node type "${type}".`);
    }
  }

  // Check property types
  for (const [key, value] of Object.entries(properties)) {
    const def = schema[key];
    if (!def) {
      // Unknown property — warn but don't reject (forward compatibility)
      continue;
    }

    const expectedType = def.type;
    const actualType = Array.isArray(value) ? "string[]" : typeof value;

    if (actualType !== expectedType) {
      // Allow null/undefined for non-required fields
      if (value === null || value === undefined) {
        if (def.required) {
          errors.push(`Required property "${key}" is null/undefined for node type "${type}".`);
        }
        continue;
      }
      errors.push(
        `Property "${key}" for node type "${type}" has wrong type: ` +
        `expected ${expectedType}, got ${actualType}.`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an edge's endpoints and properties against the schema.
 */
export function validateEdge(
  edge: Pick<GraphEdge, "type" | "sourceId" | "targetId" | "properties">,
  sourceNodeType: NodeType,
  targetNodeType: NodeType,
): ValidationResult {
  const errors: string[] = [];

  // Check allowed pairs
  const allowedPairs = EDGE_TYPE_ALLOWED_PAIRS[edge.type];
  if (!allowedPairs) {
    return { valid: false, errors: [`Unknown edge type: ${edge.type}`] };
  }

  const pairValid = allowedPairs.some(
    ([src, tgt]) => src === sourceNodeType && tgt === targetNodeType,
  );

  if (!pairValid) {
    errors.push(
      `Invalid edge: "${edge.type}" cannot connect "${sourceNodeType}" to "${targetNodeType}". ` +
      `Allowed pairs: ${allowedPairs.map(([s, t]) => `${s} → ${t}`).join(", ")}`,
    );
  }

  // Check edge property schema
  const edgeSchema = EDGE_SCHEMAS[edge.type];
  if (edgeSchema) {
    for (const [key, def] of Object.entries(edgeSchema)) {
      if (def.required && !(key in edge.properties)) {
        errors.push(`Missing required property "${key}" for edge type "${edge.type}".`);
      }
    }

    for (const [key, value] of Object.entries(edge.properties)) {
      const def = edgeSchema[key];
      if (!def) continue;

      const expectedType = def.type;
      const actualType = Array.isArray(value) ? "string[]" : typeof value;

      if (actualType !== expectedType && value !== null && value !== undefined) {
        errors.push(
          `Property "${key}" for edge type "${edge.type}" has wrong type: ` +
          `expected ${expectedType}, got ${actualType}.`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check whether an edge type is valid between two specific node types.
 */
export function isValidEdgePair(
  edgeType: EdgeType,
  sourceType: NodeType,
  targetType: NodeType,
): boolean {
  const allowedPairs = EDGE_TYPE_ALLOWED_PAIRS[edgeType];
  if (!allowedPairs) return false;
  return allowedPairs.some(([src, tgt]) => src === sourceType && tgt === targetType);
}

/**
 * Get the allowed target node types for a given edge type and source node type.
 */
export function getAllowedTargetTypes(
  edgeType: EdgeType,
  sourceType: NodeType,
): NodeType[] {
  const allowedPairs = EDGE_TYPE_ALLOWED_PAIRS[edgeType];
  if (!allowedPairs) return [];
  return allowedPairs
    .filter(([src]) => src === sourceType)
    .map(([, tgt]) => tgt);
}

/**
 * Get the allowed source node types for a given edge type and target node type.
 */
export function getAllowedSourceTypes(
  edgeType: EdgeType,
  targetType: NodeType,
): NodeType[] {
  const allowedPairs = EDGE_TYPE_ALLOWED_PAIRS[edgeType];
  if (!allowedPairs) return [];
  return allowedPairs
    .filter(([, tgt]) => tgt === targetType)
    .map(([src]) => src);
}
