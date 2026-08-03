// src/components/admin/__tests__/ReviewThroughputChart.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewThroughputChart } from "../ReviewThroughputChart";

describe("ReviewThroughputChart", () => {
  it("renders title", () => {
    render(<ReviewThroughputChart data={[{ date: "2026-08-01", reviewed: 5, trend: 4.5 }]} />);
    expect(screen.getByText("Review Throughput")).toBeDefined();
  });
});
