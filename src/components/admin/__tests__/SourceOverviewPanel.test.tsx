// src/components/admin/__tests__/SourceOverviewPanel.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SourceOverviewPanel } from "../SourceOverviewPanel";

describe("SourceOverviewPanel", () => {
  it("renders four stat tiles with correct counts", () => {
    render(<SourceOverviewPanel data={{ total: 11, active: 8, degraded: 1, failed: 1 }} />);
    expect(screen.getByText("11")).toBeDefined();
    expect(screen.getByText("8")).toBeDefined();
    expect(screen.getAllByText("1")).toHaveLength(2); // appears twice (degraded + failed)
  });

  it("applies green color to active", () => {
    render(<SourceOverviewPanel data={{ total: 5, active: 5, degraded: 0, failed: 0 }} />);
    const activeValue = screen.getAllByText("5").find((el) => el.className.includes("text-green-700"));
    expect(activeValue?.className).toContain("text-green-700");
  });

  it("applies red color to failed when > 0", () => {
    render(<SourceOverviewPanel data={{ total: 5, active: 3, degraded: 0, failed: 2 }} />);
    // The "2" for failed should have text-clay
    const values = screen.getAllByText("2");
    const failedValue = values.find((el) => el.className.includes("text-clay"));
    expect(failedValue).toBeDefined();
  });
});
