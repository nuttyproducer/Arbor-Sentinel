// src/lib/graph/__tests__/Population.test.ts
//
// Tests for graph population: SourcePopulator, DocumentPopulator, EntityPopulator,
// ClaimPopulator, EventPopulator, LocationPopulator, RelationshipBuilder,
// and PipelineIntegration.

import { describe, it, expect, beforeEach } from "vitest";
import { GraphDB } from "../GraphDB";
import { EntityResolver } from "../EntityResolver";
import { populateSources } from "../population/SourcePopulator";
import { populateDocuments } from "../population/DocumentPopulator";
import { populateEntities } from "../population/EntityPopulator";
import { populateClaims } from "../population/ClaimPopulator";
import { populateEvents } from "../population/EventPopulator";
import { populateLocations } from "../population/LocationPopulator";
import {
  buildRelationships,
  buildDocumentLinks,
  buildEventLinks,
} from "../population/RelationshipBuilder";
import { populateFromPipeline } from "../population/PipelineIntegration";
import type { ExtractedEntity, ExtractedClaim, TimelineEvent, ExtractedLocation, EntityRelationship } from "../../ai/stages/types";
import type { AIProcessedContent } from "../../ai/types";
import type { SourceRecord, SourceType } from "../../../types/content";

// ── Test helpers ────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "test-source",
    slug: "test-source",
    title: "Test Source",
    publisher: "Test Publisher",
    sourceType: "court" as SourceType,
    url: "https://example.com",
    accessedAt: "2026-01-01",
    status: "active",
    version: 1,
    correctionUrl: "/corrections",
    trustLevel: 3,
    healthStatus: "unknown",
    automationStatus: "manual",
    failureCount: 0,
    monitoringEnabled: false,
    ...overrides,
  };
}

function makeEntity(id: string, name: string, entityType = "organization"): ExtractedEntity {
  return {
    id,
    canonicalName: name,
    aliases: [],
    entityType: entityType as ExtractedEntity["entityType"],
    confidence: 0.9,
    sourceSpan: { sourceId: "test", start: 0, end: 10, excerpt: name },
    linked: false,
  };
}

function makeClaim(id: string, text: string, claimType = "factual"): ExtractedClaim {
  return {
    id,
    claimText: text,
    claimType: claimType as ExtractedClaim["claimType"],
    confidence: 0.85,
    sourceSpan: { sourceId: "test", start: 0, end: 10, excerpt: text },
    linkedEntityIds: [],
    verificationStatus: "unverified",
    isNested: false,
    fromOpinionContent: false,
  };
}

function makeEvent(id: string, desc: string, date = "2026-01-15"): TimelineEvent {
  return {
    id,
    description: desc,
    date,
    datePrecision: "exact",
    originalDateText: date,
    isApproximate: false,
    confidence: 0.9,
    linkedEntityIds: [],
    linkedClaimIds: [],
    sourceSpan: { sourceId: "test", start: 0, end: 10, excerpt: desc },
    isUndated: false,
  };
}

function makeLocation(id: string, name: string, locationType = "city"): ExtractedLocation {
  return {
    id,
    name,
    locationType,
    sourcePrecision: "city",
    displayPrecision: "city",
    precisionDowngraded: false,
    confidence: 0.9,
    sourceSpan: { sourceId: "test", start: 0, end: 10, excerpt: name },
    linkedEventIds: [],
    isUnresolvable: false,
  };
}

function makeRelationship(
  id: string,
  sourceId: string,
  targetId: string,
  type: EntityRelationship["relationshipType"] = "affiliation",
): EntityRelationship {
  return {
    id,
    sourceEntityId: sourceId,
    targetEntityId: targetId,
    relationshipType: type,
    direction: "directed",
    strength: "strong",
    label: "related to",
    confidence: 0.9,
    sourceSpans: [],
    isInferred: false,
  };
}

// ── SourcePopulator tests ────────────────────────────────────────────────────

describe("SourcePopulator", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
  });

  it("creates source nodes from source records", () => {
    const sources = [makeSource({ id: "icj" })];
    const stats = populateSources(db, sources);

    expect(stats.created).toBe(1);
    expect(stats.skipped).toBe(0);
    expect(stats.errors).toHaveLength(0);
    expect(db.hasNode("source:icj")).toBe(true);

    const node = db.getNode("source:icj")!;
    expect(node.type).toBe("source");
    expect(node.properties.publisher).toBe("Test Publisher");
    expect(node.properties.sourceType).toBe("court");
  });

  it("is idempotent — skipping existing nodes", () => {
    const sources = [makeSource({ id: "icj" })];
    populateSources(db, sources);
    const stats = populateSources(db, sources);

    expect(stats.skipped).toBe(1);
    expect(stats.created).toBe(0);
    expect(db.nodeCount).toBe(1);
  });
});

// ── DocumentPopulator tests ─────────────────────────────────────────────────

describe("DocumentPopulator", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
  });

  it("creates document nodes", () => {
    const stats = populateDocuments(db, [{
      id: "doc-1",
      sourceId: "src-1",
      content: { url: "https://example.com/report", title: "Test Report", body: "", tags: [], metadata: {} },
    }]);

    expect(stats.created).toBe(1);
    expect(db.hasNode("document:doc-1")).toBe(true);

    const node = db.getNode("document:doc-1")!;
    expect(node.type).toBe("document");
    expect(node.properties.title).toBe("Test Report");
  });

  it("is idempotent", () => {
    populateDocuments(db, [{ id: "doc-1", sourceId: "src-1", content: { url: "url", title: "T", body: "", tags: [], metadata: {} } }]);
    const stats = populateDocuments(db, [{ id: "doc-1", sourceId: "src-1", content: { url: "url", title: "T", body: "", tags: [], metadata: {} } }]);

    expect(stats.skipped).toBe(1);
    expect(stats.created).toBe(0);
  });
});

// ── EntityPopulator tests ───────────────────────────────────────────────────

describe("EntityPopulator", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
    // Add document node needed for entity population
    db.addNode({
      id: "document:doc-1",
      type: "document",
      label: "Test Document",
      properties: { title: "Test Document" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("creates entity nodes with required properties", () => {
    const entities = [makeEntity("e-1", "United Nations"), makeEntity("e-2", "UN Security Council")];
    const stats = populateEntities(db, { documentId: "doc-1", entities });

    expect(stats.created).toBe(2);
    expect(db.hasNode("entity:e-1")).toBe(true);
    expect(db.hasNode("entity:e-2")).toBe(true);

    const node = db.getNode("entity:e-1")!;
    expect(node.type).toBe("entity");
    expect(node.properties.canonicalName).toBe("United Nations");
    expect(node.properties.entityType).toBe("organization");
  });

  it("is idempotent", () => {
    const entities = [makeEntity("e-1", "UN")];
    populateEntities(db, { documentId: "doc-1", entities });
    const stats = populateEntities(db, { documentId: "doc-1", entities });

    expect(stats.skipped).toBe(1);
    expect(stats.created).toBe(0);
  });

  it("deduplicates entities with EntityResolver", () => {
    const resolver = new EntityResolver();
    const entities = [
      makeEntity("e-1", "United Nations"),
      makeEntity("e-2", "United Nations"),
    ];

    const stats = populateEntities(db, { documentId: "doc-1", entities }, resolver);

    expect(stats.created).toBe(2);
    expect(stats.merged).toBeGreaterThanOrEqual(1);
    // Both should resolve to the same canonical
    expect(resolver.isSameEntity("entity:e-1", "entity:e-2")).toBe(true);
  });

  it("preserves aliases and extra properties", () => {
    const entities = [{
      ...makeEntity("e-1", "ICJ"),
      aliases: ["International Court of Justice", "World Court"],
      role: "Judicial Body",
      acronym: "ICJ",
    }];

    populateEntities(db, { documentId: "doc-1", entities });

    const node = db.getNode("entity:e-1")!;
    expect(node.properties.aliases).toEqual(["International Court of Justice", "World Court"]);
    expect(node.properties.role).toBe("Judicial Body");
    expect(node.properties.acronym).toBe("ICJ");
  });
});

// ── ClaimPopulator tests ────────────────────────────────────────────────────

describe("ClaimPopulator", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
  });

  it("creates claim nodes with required properties", () => {
    const claims = [
      makeClaim("c-1", "The court found violations of international law.", "legal"),
    ];
    const stats = populateClaims(db, { documentId: "doc-1", claims });

    expect(stats.created).toBe(1);
    expect(db.hasNode("claim:c-1")).toBe(true);

    const node = db.getNode("claim:c-1")!;
    expect(node.type).toBe("claim");
    expect(node.properties.claimText).toContain("violations of international law");
    expect(node.properties.claimType).toBe("legal");
  });

  it("is idempotent", () => {
    populateClaims(db, { documentId: "doc-1", claims: [makeClaim("c-1", "Test")] });
    const stats = populateClaims(db, { documentId: "doc-1", claims: [makeClaim("c-1", "Test")] });

    expect(stats.skipped).toBe(1);
  });
});

// ── EventPopulator tests ────────────────────────────────────────────────────

describe("EventPopulator", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
  });

  it("creates event nodes with temporal properties", () => {
    const events = [
      makeEvent("evt-1", "Filing of case at the ICJ", "2024-01-26"),
    ];
    const stats = populateEvents(db, { documentId: "doc-1", events });

    expect(stats.created).toBe(1);
    expect(db.hasNode("event:evt-1")).toBe(true);

    const node = db.getNode("event:evt-1")!;
    expect(node.type).toBe("event");
    expect(node.properties.date).toBe("2024-01-26");
    expect(node.properties.datePrecision).toBe("exact");
  });

  it("is idempotent", () => {
    populateEvents(db, { documentId: "doc-1", events: [makeEvent("evt-1", "Test")] });
    const stats = populateEvents(db, { documentId: "doc-1", events: [makeEvent("evt-1", "Test")] });

    expect(stats.skipped).toBe(1);
  });
});

// ── LocationPopulator tests ─────────────────────────────────────────────────

describe("LocationPopulator", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
  });

  it("creates location nodes", () => {
    const locations = [
      makeLocation("loc-1", "The Hague", "city"),
    ];
    const stats = populateLocations(db, { documentId: "doc-1", locations });

    expect(stats.created).toBe(1);
    expect(db.hasNode("location:loc-1")).toBe(true);

    const node = db.getNode("location:loc-1")!;
    expect(node.type).toBe("location");
    expect(node.properties.name).toBe("The Hague");
    expect(node.properties.locationType).toBe("city");
  });

  it("creates parent-child hierarchy when parent exists", () => {
    // First, create a country node
    db.addNode({
      id: "location:parent-nl",
      type: "location",
      label: "Netherlands",
      properties: { name: "Netherlands", locationType: "country" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Now create a child location referencing the parent
    const locations = [
      { ...makeLocation("loc-1", "The Hague", "city"), parentLocation: "Netherlands" },
    ];
    const stats = populateLocations(db, { documentId: "doc-1", locations });

    expect(stats.created).toBe(1);
    expect(stats.edgesCreated).toBe(1);

    // Check the edge was created
    const edges = db.findEdges({ types: ["located_in"] });
    expect(edges).toHaveLength(1);
  });

  it("is idempotent", () => {
    populateLocations(db, { documentId: "doc-1", locations: [makeLocation("loc-1", "Test")] });
    const stats = populateLocations(db, { documentId: "doc-1", locations: [makeLocation("loc-1", "Test")] });

    expect(stats.skipped).toBe(1);
  });
});

// ── RelationshipBuilder tests ───────────────────────────────────────────────

describe("RelationshipBuilder", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
    // Set up entity nodes for relationships
    db.addNode({
      id: "entity:org-1",
      type: "entity",
      label: "UN",
      properties: { canonicalName: "UN", entityType: "organization" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addNode({
      id: "entity:org-2",
      type: "entity",
      label: "WHO",
      properties: { canonicalName: "WHO", entityType: "organization" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("creates edges from relationship data", () => {
    const rels = [
      makeRelationship("rel-1", "org-1", "org-2", "affiliation"),
    ];
    const stats = buildRelationships(db, { documentId: "doc-1", relationships: rels });

    expect(stats.created).toBe(1);

    const edges = db.findEdges({ types: ["related_to"] });
    expect(edges).toHaveLength(1);
    expect(edges[0].sourceId).toBe("entity:org-1");
    expect(edges[0].targetId).toBe("entity:org-2");
  });

  it("is idempotent", () => {
    buildRelationships(db, { documentId: "doc-1", relationships: [makeRelationship("rel-1", "org-1", "org-2")] });
    const stats = buildRelationships(db, { documentId: "doc-1", relationships: [makeRelationship("rel-1", "org-1", "org-2")] });

    expect(stats.skipped).toBe(1);
  });

  it("skips relationships where endpoints don't exist", () => {
    const rels = [
      makeRelationship("rel-1", "nonexistent", "org-2"),
    ];
    const stats = buildRelationships(db, { documentId: "doc-1", relationships: rels });

    expect(stats.created).toBe(0);
    expect(stats.errors.length).toBeGreaterThan(0);
  });
});

// ── DocumentLinks tests ─────────────────────────────────────────────────────

describe("buildDocumentLinks", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
    // Set up nodes needed for links
    db.addNode({
      id: "document:doc-1",
      type: "document",
      label: "Test Document",
      properties: { title: "Test Document" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addNode({
      id: "source:src-1",
      type: "source",
      label: "Test Source",
      properties: { publisher: "Test Publisher", sourceType: "court" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addNode({
      id: "entity:e-1",
      type: "entity",
      label: "Entity",
      properties: { canonicalName: "Entity", entityType: "organization" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addNode({
      id: "claim:c-1",
      type: "claim",
      label: "A test claim",
      properties: { claimText: "A test claim", claimType: "factual" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("creates published_by edge to source", () => {
    const stats = buildDocumentLinks(db, {
      documentId: "doc-1",
      sourceId: "src-1",
    });

    expect(stats.created).toBe(1);
    const edges = db.findEdges({ types: ["published_by"] });
    expect(edges).toHaveLength(1);
    expect(edges[0].sourceId).toBe("document:doc-1");
    expect(edges[0].targetId).toBe("source:src-1");
  });

  it("creates mentions edges to entities", () => {
    const stats = buildDocumentLinks(db, {
      documentId: "doc-1",
      mentionedEntityIds: ["e-1"],
    });

    expect(stats.created).toBe(1);
    const edges = db.findEdges({ types: ["mentions"] });
    expect(edges).toHaveLength(1);
  });

  it("creates supports edges to claims", () => {
    const stats = buildDocumentLinks(db, {
      documentId: "doc-1",
      claimIds: ["c-1"],
    });

    expect(stats.created).toBe(1);
    const edges = db.findEdges({ types: ["supports"] });
    expect(edges).toHaveLength(1);
  });

  it("is idempotent for all edge types", () => {
    buildDocumentLinks(db, {
      documentId: "doc-1",
      sourceId: "src-1",
      mentionedEntityIds: ["e-1"],
      claimIds: ["c-1"],
    });
    const stats = buildDocumentLinks(db, {
      documentId: "doc-1",
      sourceId: "src-1",
      mentionedEntityIds: ["e-1"],
      claimIds: ["c-1"],
    });

    expect(stats.created).toBe(0);
    expect(stats.skipped).toBe(3);
  });
});

// ── EventLinks tests ────────────────────────────────────────────────────────

describe("buildEventLinks", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
    db.addNode({
      id: "event:evt-1",
      type: "event",
      label: "Test Event",
      properties: {
        description: "Test Event",
        date: "2026-01-15",
        linkedEntityIds: ["e-1"],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addNode({
      id: "entity:e-1",
      type: "entity",
      label: "Entity",
      properties: { canonicalName: "Entity", entityType: "organization" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("creates involves edges for event entity links", () => {
    const stats = buildEventLinks(db, ["evt-1"]);

    expect(stats.created).toBe(1);
    const edges = db.findEdges({ types: ["involves"] });
    expect(edges).toHaveLength(1);
    expect(edges[0].sourceId).toBe("event:evt-1");
    expect(edges[0].targetId).toBe("entity:e-1");
  });
});

// ── PipelineIntegration tests ───────────────────────────────────────────────

describe("PipelineIntegration", () => {
  let db: GraphDB;
  let resolver: EntityResolver;

  beforeEach(() => {
    db = new GraphDB();
    resolver = new EntityResolver();
  });

  function makeProcessedContent(overrides: Partial<AIProcessedContent> = {}): AIProcessedContent {
    return {
      sourceId: "test-doc-1",
      processedAt: new Date().toISOString(),
      entities: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
      claims: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
      timeline: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
      locations: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
      relationships: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
      topics: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
      confidence: { data: {}, confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
      hallucinationFlags: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
      auditLog: [],
      ...overrides,
    };
  }

  it("populates source and document nodes", () => {
    const sources = [makeSource({ id: "icj" })];
    const content = makeProcessedContent();

    const result = populateFromPipeline(
      { db, resolver, sources },
      content,
    );

    expect(result.success).toBe(true);
    expect(result.nodesCreated).toBeGreaterThanOrEqual(2); // source + document
    expect(db.hasNode("source:icj")).toBe(true);
    expect(db.hasNode("document:test-doc-1")).toBe(true);
  });

  it("populates entities and creates mentions edges", () => {
    const content = makeProcessedContent({
      entities: {
        data: [makeEntity("e-1", "United Nations"), makeEntity("e-2", "ICJ")],
        confidence: 0.9,
        modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
        warnings: [],
        sourceSpans: [],
      },
    });

    const result = populateFromPipeline({ db, resolver }, content);

    expect(result.success).toBe(true);
    expect(db.hasNode("entity:e-1")).toBe(true);
    expect(db.hasNode("entity:e-2")).toBe(true);

    // Should have mentions edges from document to entities
    const mentionsEdges = db.findEdges({ types: ["mentions"] });
    expect(mentionsEdges.length).toBeGreaterThanOrEqual(2);
  });

  it("populates claims, events, and locations", () => {
    const content = makeProcessedContent({
      claims: {
        data: [makeClaim("c-1", "A serious allegation")],
        confidence: 0.85,
        modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
        warnings: [],
        sourceSpans: [],
      },
      timeline: {
        data: [makeEvent("evt-1", "ICJ filing")],
        confidence: 0.9,
        modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
        warnings: [],
        sourceSpans: [],
      },
      locations: {
        data: [makeLocation("loc-1", "The Hague")],
        confidence: 0.9,
        modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
        warnings: [],
        sourceSpans: [],
      },
    });

    const result = populateFromPipeline({ db, resolver }, content);

    expect(result.success).toBe(true);
    expect(db.hasNode("claim:c-1")).toBe(true);
    expect(db.hasNode("event:evt-1")).toBe(true);
    expect(db.hasNode("location:loc-1")).toBe(true);
  });

  it("populates relationships from detection output", () => {
    // Need entity nodes for relationships
    const content = makeProcessedContent({
      entities: {
        data: [makeEntity("e-1", "UN"), makeEntity("e-2", "WHO")],
        confidence: 0.9,
        modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
        warnings: [],
        sourceSpans: [],
      },
      relationships: {
        data: [makeRelationship("rel-1", "e-1", "e-2", "affiliation")],
        confidence: 0.9,
        modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
        warnings: [],
        sourceSpans: [],
      },
    });

    const result = populateFromPipeline({ db, resolver }, content);

    expect(result.success).toBe(true);
    const relEdges = db.findEdges({ types: ["related_to"] });
    expect(relEdges.length).toBeGreaterThanOrEqual(1);
  });

  it("is idempotent — running twice creates no duplicates", () => {
    const content = makeProcessedContent({
      entities: {
        data: [makeEntity("e-1", "UN")],
        confidence: 0.9,
        modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
        warnings: [],
        sourceSpans: [],
      },
    });

    populateFromPipeline({ db, resolver }, content);
    const result2 = populateFromPipeline({ db, resolver }, content);

    // Second run should skip everything
    expect(result2.nodesCreated).toBe(0);
    expect(result2.nodesSkipped).toBeGreaterThan(0);
    expect(result2.success).toBe(true);
  });
});
