// src/components/admin/__tests__/ReviewAgeChart.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewAgeChart } from "../ReviewAgeChart";

const DATA = [
  { label: "0-1d", minDays: 0, maxDays: 1, count: 10 },
  { label: "1-3d", minDays: 1, maxDays: 3, count: 8 },
  { label: "3-7d", minDays: 3, maxDays: 7, count: 5 },
  { label: "7-14d", minDays: 7, maxDays: 14, count: 4 },
  { label: "14d+", minDays: 14, maxDays: Infinity, count: 3 },
];

describe("ReviewAgeChart", () => {
  it("renders title", () => {
    render(<ReviewAgeChart data={DATA} />);
    expect(screen.getByText("Queue Age Distribution")).toBeDefined();
  });

  it("renders SVG bars", () => {
    const { container } = render(<ReviewAgeChart data={DATA} />);
    expect(container.querySelectorAll("rect").length).toBeGreaterThan(0);
  });
});
