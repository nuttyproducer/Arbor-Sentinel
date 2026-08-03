// src/components/admin/__tests__/DataFreshnessPanel.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataFreshnessPanel } from "../DataFreshnessPanel";

describe("DataFreshnessPanel", () => {
  it("renders category rows", () => {
    render(<DataFreshnessPanel items={[{ category: "evidence", lastUpdated: "2026-07-01", ageDays: 33, status: "critical", thresholdDays: 7 }]} />);
    expect(screen.getByText("evidence")).toBeDefined();
    expect(screen.getByText("critical")).toBeDefined();
  });
});
