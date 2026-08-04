// src/components/admin/__tests__/DataQualityTrend.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataQualityTrend } from "../DataQualityTrend";

describe("DataQualityTrend", () => {
  it("renders title", () => {
    render(<DataQualityTrend data={[{ period: "2026-08-01", confidence: 65, contradictionRate: 12, duplicateRate: 8, freshnessScore: 80 }]} />);
    expect(screen.getByText("Quality Trends")).toBeDefined();
  });
});
