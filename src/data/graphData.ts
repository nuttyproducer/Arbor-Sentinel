// src/data/graphData.ts
//
// Static knowledge-graph seed data for the explore routes.
//
// The knowledge graph is populated at runtime from AI pipeline output
// (see src/lib/graph/population/PipelineIntegration.ts). Before live
// data exists, the explore pages render a curated preview graph built
// from the static data collections — countries, institutions,
// organizations, sources, legal cases, and action templates.
//
// Every node/edge here conforms to the graph schema (src/lib/graph/types.ts)
// so GraphDB can ingest it without validation errors.

import type { GraphNode, GraphEdge, NodeType } from "../lib/graph/types";
import { countries } from "./countries";
import { euInstitutions, institutionIndexEntries } from "./institutions";
import { organizationRecords } from "./organizations";
import { sources } from "./sources";
import { legalCases } from "./legalCases";
import { getActiveTemplates } from "./actionTemplates";

// ── Node builders ─────────────────────────────────────────────────────────────

function makeNode(id: string, type: NodeType, label: string, properties: Record<string, unknown>): GraphNode {
  const now = new Date().toISOString();
  return { id, type, label, properties, createdAt: now, updatedAt: now };
}

function buildNodes(): GraphNode[] {
  const nodes: GraphNode[] = [];

  // Countries
  for (const c of countries) {
    nodes.push(
      makeNode(`country:${c.id}`, "country", c.name, {
        name: c.name,
        region: c.region,
        entityType: "country",
      }),
    );
  }

  // Institutions (index entries + EU sub-institutions)
  for (const inst of institutionIndexEntries) {
    nodes.push(
      makeNode(`institution:${inst.id}`, "institution", inst.name, {
        name: inst.name,
        acronym: inst.acronym ?? null,
        region: inst.region,
      }),
    );
  }
  for (const sub of euInstitutions) {
    nodes.push(
      makeNode(`institution:${sub.id}`, "institution", sub.name, {
        name: sub.name,
        acronym: sub.acronym ?? null,
        role: sub.role,
      }),
    );
  }

  // Organizations
  for (const org of organizationRecords) {
    nodes.push(
      makeNode(`organization:${org.id}`, "organization", org.name, {
        name: org.name,
        category: org.category,
        regions: org.regions,
      }),
    );
  }

  // Sources
  for (const s of sources) {
    nodes.push(
      makeNode(`source:${s.id}`, "source", s.title, {
        publisher: s.publisher,
        sourceType: s.sourceType,
        documentType: s.documentType ?? null,
      }),
    );
  }

  // Legal cases → document nodes
  for (const lc of legalCases) {
    nodes.push(
      makeNode(`document:${lc.id}`, "document", lc.title, {
        title: lc.title,
        institution: lc.institution,
        jurisdiction: lc.jurisdiction,
        legalStatuses: lc.legalStatuses,
      }),
    );
  }

  // Legal case parties → entity nodes (for graph connectivity)
  for (const lc of legalCases) {
    for (const party of lc.parties) {
      const partyId = `entity:${slugify(party)}`;
      if (!nodes.some((n) => n.id === partyId)) {
        nodes.push(
          makeNode(partyId, "entity", party, {
            canonicalName: party,
            entityType: "organization",
          }),
        );
      }
    }
  }

  // Action templates
  for (const at of getActiveTemplates()) {
    nodes.push(
      makeNode(`action:${at.id}`, "action", at.title, {
        name: at.title,
        actionType: at.actionType,
        jurisdiction: at.jurisdiction,
      }),
    );
  }

  return nodes;
}

// ── Edge builders ─────────────────────────────────────────────────────────────

function makeEdge(id: string, type: GraphEdge["type"], sourceId: string, targetId: string, label: string): GraphEdge {
  return { id, type, sourceId, targetId, label, properties: {}, createdAt: new Date().toISOString() };
}

function buildEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const hasNode = (id: string) => nodes.some((n) => n.id === id);

  // Legal case documents mention their parties (document → entity)
  for (const lc of legalCases) {
    const docId = `document:${lc.id}`;
    if (!hasNode(docId)) continue;
    for (const party of lc.parties) {
      const partyId = `entity:${slugify(party)}`;
      if (!hasNode(partyId)) continue;
      edges.push(makeEdge(`edge:${docId}:mentions:${partyId}`, "mentions", docId, partyId, "Mentions"));
    }
  }

  // Organizations located in a listed country (organization → country)
  for (const org of organizationRecords) {
    const orgId = `organization:${org.id}`;
    if (!hasNode(orgId)) continue;
    for (const region of org.regions) {
      const match = countries.find((c) => c.name.toLowerCase() === region.toLowerCase());
      if (match && hasNode(`country:${match.id}`)) {
        edges.push(makeEdge(`edge:${orgId}:located_in:${match.id}`, "located_in", orgId, `country:${match.id}`, "Located in"));
      }
    }
  }

  // EU sub-institutions are part of the European Union (institution → institution)
  const euId = `institution:european-union`;
  if (hasNode(euId)) {
    for (const sub of euInstitutions) {
      const subId = `institution:${sub.id}`;
      if (!hasNode(subId)) continue;
      edges.push(makeEdge(`edge:${subId}:part_of:eu`, "part_of", subId, euId, "Part of"));
    }
  }

  return edges;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Singleton data ────────────────────────────────────────────────────────────

const _nodes = buildNodes();
const _edges = buildEdges(_nodes);

/** All preview graph nodes. */
export const graphNodes: GraphNode[] = _nodes;

/** All preview graph edges. */
export const graphEdges: GraphEdge[] = _edges;
