// src/components/admin/__tests__/BottleneckPanel.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottleneckPanel } from "../BottleneckPanel";
import type { Bottleneck } from "../../lib/admin/types";

const BOTTLENECKS: Bottleneck[] = [
  { type: "stuck", description: "3 items stuck in review (>48h)", count: 3, threshold: "48h" },
  { type: "overdue", description: "5 items past SLA deadline", count: 5, threshold: "Per-item SLA target" },
];

describe("BottleneckPanel", () => {
  it("renders all bottleneck alerts", () => {
    render(<BottleneckPanel bottlenecks={BOTTLENECKS} />);
    expect(screen.getByText(/3 items stuck/)).toBeDefined();
    expect(screen.getByText(/5 items past/)).toBeDefined();
  });

  it("renders green state when no bottlenecks", () => {
    render(<BottleneckPanel bottlenecks={[]} />);
    expect(screen.getByText("No bottlenecks detected.")).toBeDefined();
  });
});
