// src/components/admin/__tests__/AIPipelineMetrics.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIPipelineMetrics } from "../AIPipelineMetrics";
import type { PipelineStageMetrics } from "../../../lib/admin/types";

const TEST_DATA: PipelineStageMetrics[] = [
  { stageName: "fetch", throughput: 20, latency: { p50: 450, p95: 1200, p99: 3000 } },
  { stageName: "validate", throughput: 18, latency: { p50: 200, p95: 500, p99: 800 } },
];

describe("AIPipelineMetrics", () => {
  it("renders title", () => {
    render(<AIPipelineMetrics data={TEST_DATA} />);
    expect(screen.getByText("AI Pipeline Metrics")).toBeDefined();
  });

  it("renders latency table with formatted values", () => {
    render(<AIPipelineMetrics data={TEST_DATA} />);
    expect(screen.getByText("450ms")).toBeDefined();
    expect(screen.getByText("1.2s")).toBeDefined();
  });

  it("renders bar chart SVG", () => {
    const { container } = render(<AIPipelineMetrics data={TEST_DATA} />);
    expect(container.querySelectorAll("rect").length).toBeGreaterThan(0);
  });

  it("shows empty state", () => {
    render(<AIPipelineMetrics data={[]} />);
    expect(screen.getByText("No data for this period")).toBeDefined();
  });
});
