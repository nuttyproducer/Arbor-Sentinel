// src/components/admin/__tests__/SLAComplianceChart.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SLAComplianceChart } from "../SLAComplianceChart";

describe("SLAComplianceChart", () => {
  it("renders title with target percentage", () => {
    render(<SLAComplianceChart data={[{ date: "2026-08-01", overall: 92, byContentType: { evidence: 95 } }]} targetPercent={90} />);
    expect(screen.getByText("SLA Compliance")).toBeDefined();
  });
});
