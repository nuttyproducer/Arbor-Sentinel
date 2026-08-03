// src/components/admin/__tests__/IngestionChart.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IngestionChart } from "../IngestionChart";

const TEST_DATA = [
  { period: "2026-08-01T00:00:00.000Z", bySourceType: { court: 5, ngo: 3 } },
  { period: "2026-08-02T00:00:00.000Z", bySourceType: { court: 8, ngo: 6 } },
];

describe("IngestionChart", () => {
  it("renders title", () => {
    render(<IngestionChart data={TEST_DATA} />);
    expect(screen.getByText("Content Ingestion")).toBeDefined();
  });

  it("shows empty state when no data", () => {
    render(<IngestionChart data={[]} />);
    expect(screen.getByText("No data for this period")).toBeDefined();
  });

  it("shows loading state", () => {
    render(<IngestionChart data={[]} isLoading />);
    expect(screen.getByText("Loading chart data…")).toBeDefined();
  });

  it("shows error state", () => {
    render(<IngestionChart data={[]} error="Failed to load" />);
    expect(screen.getByText("Failed to load")).toBeDefined();
  });

  it("renders bars for source types", () => {
    const { container } = render(<IngestionChart data={TEST_DATA} />);
    // Recharts renders SVGs; bars are <rect> elements
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBeGreaterThan(0);
  });
});
