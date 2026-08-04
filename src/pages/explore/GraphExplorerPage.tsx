// src/pages/explore/GraphExplorerPage.tsx
//
// Full-page graph explorer for the knowledge graph.
// Allows users to explore entity relationships, find paths,
// and navigate the knowledge graph interactively.

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { PageStatusNotice } from "../../components/pages/PageStatusNotice";
import { GraphExplorer } from "../../components/graph/GraphExplorer";
import { GraphDB } from "../../lib/graph/GraphDB";
import type { GraphNode, GraphEdge, Subgraph } from "../../lib/graph/types";

// ── Props ────────────────────────────────────────────────────────────────────

export interface GraphExplorerPageProps {
  /** All nodes in the knowledge graph. */
  nodes: GraphNode[];
  /** All edges in the knowledge graph. */
  edges: GraphEdge[];
}

// ── Component ────────────────────────────────────────────────────────────────

export function GraphExplorerPage({ nodes, edges }: GraphExplorerPageProps) {
  const [searchParams] = useSearchParams();
  const focusNodeId = searchParams.get("focus");

  // Build temporary GraphDB for subgraph extraction
  const graphDB = useMemo(() => {
    const db = new GraphDB();
    for (const node of nodes) {
      try { db.addNode(node); } catch { /* skip */ }
    }
    for (const edge of edges) {
      try { db.addEdge(edge); } catch { /* skip */ }
    }
    return db;
  }, [nodes, edges]);

  // If a focus node is specified, show its subgraph
  const displayData = useMemo((): { nodes: GraphNode[]; edges: GraphEdge[] } => {
    if (focusNodeId && graphDB.hasNode(focusNodeId)) {
      try {
        const subgraph: Subgraph = graphDB.extractSubgraph({
          nodeId: focusNodeId,
          hops: 2,
          limit: 100,
        });
        return { nodes: subgraph.nodes, edges: subgraph.edges };
      } catch {
        // Fall through to full graph
      }
    }
    return { nodes, edges };
  }, [focusNodeId, graphDB, nodes, edges]);

  return (
    <Container>
      <PageIntro
        title="Knowledge Graph Explorer"
        description="Explore entity relationships, trace connections, and navigate the knowledge graph."
      />

      <PageStatusNotice>
        This is a static preview. The graph explorer will populate with live data when AI-processed evidence is available.
      </PageStatusNotice>

      {focusNodeId && (
        <div className="mb-4 p-3 bg-trust/5 border border-trust/20 rounded-lg text-sm text-ink/70">
          Focused on: <strong className="text-ink">{focusNodeId}</strong>{" "}
          (showing nodes within 2 hops)
        </div>
      )}

      {nodes.length === 0 ? (
        <div className="text-center py-16 text-ink/50">
          <p className="text-lg mb-2">No graph data available</p>
          <p className="text-sm">
            The knowledge graph will populate when AI-processed data is available.
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <GraphExplorer
            nodes={displayData.nodes}
            edges={displayData.edges}
            height="700px"
            showControls={true}
            showInspector={true}
            showPathFinder={true}
          />
        </div>
      )}
    </Container>
  );
}
