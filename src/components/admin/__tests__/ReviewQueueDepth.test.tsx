// src/components/admin/__tests__/ReviewQueueDepth.test.tsx
import { describe, it, expect } from "vitest";
import { render, within } from "@testing-library/react";
import { ReviewQueueDepth } from "../ReviewQueueDepth";

const DATA = { new: 5, assigned: 3, in_review: 8, changes_requested: 2, approved: 10, published: 15, rejected: 1, archived: 6 };

describe("ReviewQueueDepth", () => {
  it("renders stat tiles for key states", () => {
    const { container } = render(<ReviewQueueDepth data={DATA} />);
    // Scope queries to the stat tiles (<dl>) so chart axis ticks can't collide.
    const tiles = container.querySelector("dl");
    expect(tiles).not.toBeNull();
    const tilesView = within(tiles as HTMLElement);
    expect(tilesView.getByText("5")).toBeDefined();
    expect(tilesView.getByText("3")).toBeDefined();
    expect(tilesView.getByText("8")).toBeDefined();
    expect(tilesView.getByText("2")).toBeDefined();
  });
});
