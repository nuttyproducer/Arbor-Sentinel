# Graph Navigation Guide

User guide for the Knowledge Graph Explorer.

---

## Overview

The Knowledge Graph Explorer visualizes entities, documents, claims, events, and locations as an interactive graph. You can explore connections, find paths between entities, and navigate relationships.

---

## Getting Started

### Opening the Explorer

Navigate to `/explore/graph` to see the full knowledge graph. From any entity detail page, click "Explore Full Graph" to open the graph focused on that entity.

### Understanding the Visualization

- **Nodes** are colored circles labeled by type (entities in purple, documents in blue, events in amber, etc.)
- **Edges** are arrows showing relationships (mentions, supports, located in, etc.)
- **Node size** is uniform — importance is shown through connectivity

### Interaction

| Action | How |
|---|---|
| **Pan** | Click and drag on empty canvas |
| **Zoom** | Mouse wheel or zoom buttons (+/−) |
| **Select node** | Click any node |
| **Deselect** | Click empty canvas |
| **View details** | Inspector panel appears when a node is selected |

---

## Controls

### Layout Selector

Choose from five layouts:
- **Force** — physics-based layout, best for exploring
- **Hierarchical** — top-down tree layout, best for organizational structures
- **Concentric** — circular layers by node type
- **Circle** — simple circular arrangement
- **Grid** — regular grid arrangement

### Search

Type in the search box to find and highlight nodes by name. Matching nodes are highlighted; non-matching nodes are dimmed.

### Type Filter

Toggle node types on/off using the type buttons in the toolbar. Hidden types are faded out. Use this to focus on specific relationships.

---

## Path Finder

The Path Finder finds the shortest connection between two nodes:

1. Search for a source node in the "From" field
2. Search for a target node in the "To" field
3. Click "Find Path"
4. The shortest path is highlighted in the graph
5. A numbered list shows each step in the path

Click "Clear" to remove the path and reset.

---

## Entity Detail Pages

Each entity has a detail page at `/explore/entity/:id` showing:

- **Properties** — all metadata for the entity
- **Connections** — grouped by relationship type and connected node type
- **Mini graph** — a focused visualization of the entity and its immediate neighbors
- **Explore link** — opens the full graph centered on this entity

---

## Performance Notes

- The graph is optimized for 500+ nodes
- For large graphs, use type filters to reduce visual complexity
- Subgraph view (from entity detail pages) shows 2-hop neighborhoods for focused exploration

---

## Tips

- **Start from a known entity** — use the entity detail page to enter the graph
- **Follow interesting connections** — click connected nodes in the inspector to jump
- **Use path finding** — to understand how two entities are related
- **Filter aggressively** — hide types you're not interested in to reduce clutter
- **Switch layouts** — different layouts reveal different structural patterns
