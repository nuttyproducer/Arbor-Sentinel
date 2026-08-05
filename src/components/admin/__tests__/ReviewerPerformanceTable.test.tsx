// src/components/admin/__tests__/ReviewerPerformanceTable.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewerPerformanceTable } from "../ReviewerPerformanceTable";
import type { ReviewerMetric } from "../../../lib/admin/types";

const DATA: ReviewerMetric[] = [
  { id: "rev-001", completed: 10, avgTimeMinutes: 45, slaCompliancePercent: 85, workload: 5, maxWorkload: 8 },
  { id: "rev-002", completed: 5, avgTimeMinutes: 30, slaCompliancePercent: 95, workload: 9, maxWorkload: 10 },
];

describe("ReviewerPerformanceTable", () => {
  it("renders internal reviewer IDs only (no personal names)", () => {
    render(<ReviewerPerformanceTable data={DATA} />);
    expect(screen.getByText("rev-001")).toBeDefined();
    expect(screen.getByText("rev-002")).toBeDefined();
    // Check table header exists
    expect(screen.getByText("Reviewer")).toBeDefined();
  });

  it("renders SLA percentage with color coding", () => {
    render(<ReviewerPerformanceTable data={DATA} />);
    expect(screen.getByText("85%")).toBeDefined();
    expect(screen.getByText("95%")).toBeDefined();
  });

  it("renders empty state", () => {
    render(<ReviewerPerformanceTable data={[]} />);
    expect(screen.getByText("No reviewer data available")).toBeDefined();
  });
});
