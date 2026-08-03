// src/components/graph/__tests__/GraphExplorer.test.tsx
//
// Tests for GraphExplorer component.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GraphExplorer } from "../GraphExplorer";
import type { GraphNode, GraphEdge, NodeType } from "../../../lib/graph/types";

// Mock cytoscape — jsdom does not have canvas/DOM layout
vi.mock("cytoscape", () => {
  const mockCy = {
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    layout: vi.fn(() => ({ run: vi.fn() })),
    elements: vi.fn(() => ({
      style: vi.fn().mockReturnThis(),
    })),
    nodes: vi.fn(() => ({
      forEach: vi.fn(),
      addClass: vi.fn().mockReturnThis(),
      removeClass: vi.fn().mockReturnThis(),
      filter: vi.fn(() => ({ removeClass: vi.fn(), addClass: vi.fn() })),
      style: vi.fn().mockReturnThis(),
    })),
    edges: vi.fn(() => ({
      forEach: vi.fn(),
      addClass: vi.fn().mockReturnThis(),
      removeClass: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
      filter: vi.fn(() => ({ removeClass: vi.fn(), addClass: vi.fn() })),
    })),
    getElementById: vi.fn(() => ({ length: 0, emit: vi.fn() })),
    fit: vi.fn(),
    center: vi.fn(),
    zoom: vi.fn(() => 1),
    style: vi.fn(),
  };

  return {
    default: vi.fn(() => mockCy),
    __esModule: true,
  };
});

// ── Test helpers ────────────────────────────────────────────────────────────

function makeNode(id: string, type: NodeType, label: string): GraphNode {
  const baseProps: Record<string, Record<string, unknown>> = {
    entity: { canonicalName: label, entityType: "organization" },
    document: { title: label },
    source: { publisher: label, sourceType: "ngo" },
    event: { description: label, date: "2026-01-15" },
    location: { name: label, locationType: "city" },
    claim: { claimText: label, claimType: "factual" },
    country: { name: label },
    institution: { name: label },
    organization: { name: label },
    action: { name: label, actionType: "contact_representative" },
  };

  return {
    id,
    type,
    label,
    properties: baseProps[type] ?? {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("GraphExplorer", () => {
  it("renders the graph canvas container", () => {
    const nodes = [
      makeNode("e-1", "entity", "UN"),
      makeNode("e-2", "entity", "WHO"),
    ];
    const edges: GraphEdge[] = [];

    render(<GraphExplorer nodes={nodes} edges={edges} height="400px" />);

    // Cytoscape renders labels on canvas (not DOM text), so verify DOM structure
    const canvas = document.querySelector(".graph-canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveStyle({ height: "400px" });
  });

  it("renders controls with layout selector", () => {
    const nodes = [makeNode("e-1", "entity", "Test")];
    const edges: GraphEdge[] = [];

    render(<GraphExplorer nodes={nodes} edges={edges} />);

    expect(screen.getByRole("toolbar", { name: /graph controls/i })).toBeInTheDocument();
  });

  it("renders path finder", () => {
    const nodes = [
      makeNode("e-1", "entity", "Source"),
      makeNode("e-2", "entity", "Target"),
    ];
    const edges: GraphEdge[] = [];

    render(<GraphExplorer nodes={nodes} edges={edges} showPathFinder={true} />);

    expect(screen.getByText("Path Finder")).toBeInTheDocument();
  });

  it("hides path finder when showPathFinder is false", () => {
    const nodes = [makeNode("e-1", "entity", "Test")];
    const edges: GraphEdge[] = [];

    render(<GraphExplorer nodes={nodes} edges={edges} showPathFinder={false} />);

    expect(screen.queryByText("Path Finder")).not.toBeInTheDocument();
  });

  it("hides controls when showControls is false", () => {
    const nodes = [makeNode("e-1", "entity", "Test")];
    const edges: GraphEdge[] = [];

    render(<GraphExplorer nodes={nodes} edges={edges} showControls={false} />);

    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("renders count indicator", () => {
    const nodes = [
      makeNode("e-1", "entity", "UN"),
      makeNode("e-2", "entity", "WHO"),
      makeNode("d-1", "document", "Report"),
    ];
    const edges: GraphEdge[] = [];

    render(<GraphExplorer nodes={nodes} edges={edges} />);

    expect(screen.getByText(/3 nodes/)).toBeInTheDocument();
    expect(screen.getByText(/0 edges/)).toBeInTheDocument();
  });

  it("shows empty state for path finder", () => {
    const nodes = [makeNode("e-1", "entity", "UN")];
    const edges: GraphEdge[] = [];

    render(<GraphExplorer nodes={nodes} edges={edges} />);

    expect(screen.getByPlaceholderText("Search source node…")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search target node…")).toBeInTheDocument();
  });
});

describe("GraphControls", () => {
  it("provides layout options", () => {
    const nodes = [makeNode("e-1", "entity", "Test")];
    const edges: GraphEdge[] = [];

    render(<GraphExplorer nodes={nodes} edges={edges} />);

    expect(screen.getByLabelText("Layout:")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThanOrEqual(3);
  });
});
