// src/components/admin/__tests__/DuplicateRatePanel.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DuplicateRatePanel } from "../DuplicateRatePanel";

describe("DuplicateRatePanel", () => {
  it("renders three stat tiles", () => {
    render(<DuplicateRatePanel data={{ detectionRate: 15, falsePositiveRate: 5, mergeRate: 60, bySourceType: { ngo: 8 } }} />);
    expect(screen.getByText("15%")).toBeDefined();
  });
});
