// src/components/admin/__tests__/CollectorStatusGrid.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CollectorStatusGrid } from "../CollectorStatusGrid";
import type { CollectorGridItem } from "../../../lib/admin/types";

const ITEMS: CollectorGridItem[] = [
  { name: "ICJCollector", sourceType: "court", status: "active", lastFetch: new Date().toISOString(), itemsCollected: 48, errorCount: 2 },
  { name: "BelgiumCollector", sourceType: "government", status: "failed", lastFetch: null, itemsCollected: 0, errorCount: 7 },
];

describe("CollectorStatusGrid", () => {
  it("renders all collector cards", () => {
    render(<CollectorStatusGrid items={ITEMS} />);
    expect(screen.getByText("ICJCollector")).toBeDefined();
    expect(screen.getByText("BelgiumCollector")).toBeDefined();
  });

  it("shows status labels", () => {
    render(<CollectorStatusGrid items={ITEMS} />);
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText("Failed")).toBeDefined();
  });

  it("shows error count when > 0", () => {
    render(<CollectorStatusGrid items={ITEMS} />);
    expect(screen.getByText("(7 errors)")).toBeDefined();
  });

  it("renders empty state when no items", () => {
    render(<CollectorStatusGrid items={[]} />);
    expect(screen.getByText("No collectors registered")).toBeDefined();
  });
});
