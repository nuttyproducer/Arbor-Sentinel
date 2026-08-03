// src/pages/explore/EntityDetailPage.tsx
//
// Entity detail page with relationship navigation.
// Shows entity properties, connected nodes, related events/claims/documents.
// Links to the full graph explorer.

import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { Badge } from "../../components/ui/Badge";
import type { GraphNode, GraphEdge, NodeType, EdgeType } from "../../lib/graph/types";
import { NODE_TYPE_LABELS } from "../../lib/graph/types";
import { NODE_TYPE_COLORS } from "../../lib/graph/viz/layout";
import { GraphExplorer } from "../../components/graph/GraphExplorer";

// ── Props ────────────────────────────────────────────────────────────────────

export interface EntityDetailPageProps {
  /** All nodes in the knowledge graph. */
  nodes: GraphNode[];
  /** All edges in the knowledge graph. */
  edges: GraphEdge[];
}

// ── Component ────────────────────────────────────────────────────────────────

export function EntityDetailPage({ nodes, edges }: EntityDetailPageProps) {
  const { entityId } = useParams<{ entityId: string }>();

  const entity = useMemo(
    () => nodes.find((n) => n.id === entityId || n.id === `entity:${entityId}`),
    [nodes, entityId],
  );

  if (!entity) {
    return (
      <Container>
        <PageIntro title="Entity Not Found" description="The requested entity could not be found." />
      </Container>
    );
  }

  // Find connected edges and nodes
  const connectedEdges = useMemo(
    () => edges.filter((e) => e.sourceId === entity.id || e.targetId === entity.id),
    [edges, entity.id],
  );

  const connectedNodeIds = useMemo(
    () => new Set(connectedEdges.map((e) => (e.sourceId === entity.id ? e.targetId : e.sourceId))),
    [connectedEdges, entity.id],
  );

  const connectedNodes = useMemo(
    () => nodes.filter((n) => connectedNodeIds.has(n.id)),
    [nodes, connectedNodeIds],
  );

  // Group connected nodes by type
  const groupedByType = useMemo(() => {
    const groups = new Map<NodeType, GraphNode[]>();
    for (const node of connectedNodes) {
      if (!groups.has(node.type)) groups.set(node.type, []);
      groups.get(node.type)!.push(node);
    }
    return groups;
  }, [connectedNodes]);

  // Group edges by type
  const edgesByType = useMemo(() => {
    const groups = new Map<EdgeType, GraphEdge[]>();
    for (const edge of connectedEdges) {
      if (!groups.has(edge.type)) groups.set(edge.type, []);
      groups.get(edge.type)!.push(edge);
    }
    return groups;
  }, [connectedEdges]);

  // Subgraph: entity + 1 hop
  const subgraphNodes = useMemo(
    () => [entity, ...connectedNodes],
    [entity, connectedNodes],
  );

  return (
    <Container>
      <PageIntro
        title={entity.label}
        description={`${NODE_TYPE_LABELS[entity.type]} — ${connectedNodes.length} connections`}
      />

      {/* Entity metadata */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: NODE_TYPE_COLORS[entity.type] }}
            aria-hidden="true"
          />
          <Badge variant="info">{NODE_TYPE_LABELS[entity.type]}</Badge>
          <span className="text-sm text-ink/50">
            ID: <code className="text-xs font-mono">{entity.id}</code>
          </span>
        </div>

        {/* Properties */}
        <div className="bg-white border border-border rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-ink/70 uppercase tracking-wide mb-3">
            Properties
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(entity.properties)
              .filter(([, v]) => v !== undefined && v !== null && v !== "" && !Array.isArray(v))
              .map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2 text-sm">
                  <dt className="text-ink/50">{key}</dt>
                  <dd className="text-ink font-mono text-right">{String(value)}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      {/* Connections by type */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-ink mb-4">
          Connections ({connectedNodes.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from(groupedByType.entries()).map(([type, typedNodes]) => (
            <div
              key={type}
              className="border border-border rounded-lg bg-white p-4"
            >
              <h3 className="text-sm font-medium text-ink/60 mb-3 flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: NODE_TYPE_COLORS[type] }}
                  aria-hidden="true"
                />
                {NODE_TYPE_LABELS[type]} ({typedNodes.length})
              </h3>
              <ul className="space-y-1">
                {typedNodes.slice(0, 15).map((node) => (
                  <li key={node.id}>
                    <Link
                      to={`/explore/entity/${encodeURIComponent(node.id)}`}
                      className="text-sm text-trust hover:underline block truncate"
                    >
                      {node.label}
                    </Link>
                  </li>
                ))}
                {typedNodes.length > 15 && (
                  <li className="text-xs text-ink/40">
                    +{typedNodes.length - 15} more
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Edge types */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-ink/60 mb-2">Relationship Types</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(edgesByType.keys()).map((edgeType) => (
              <Badge key={edgeType} variant="info">
                {edgeType} ({edgesByType.get(edgeType)!.length})
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Mini graph visualization */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-ink mb-4">Connection Graph</h2>
        <GraphExplorer
          nodes={subgraphNodes}
          edges={connectedEdges}
          height="400px"
          showPathFinder={false}
        />
      </section>

      {/* Explore connections link */}
      <div className="text-center py-6">
        <Link
          to={`/explore/graph?focus=${encodeURIComponent(entity.id)}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-trust text-white rounded-lg text-sm font-medium hover:bg-trust/90 transition-colors"
        >
          Explore Full Graph
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Container>
  );
}
