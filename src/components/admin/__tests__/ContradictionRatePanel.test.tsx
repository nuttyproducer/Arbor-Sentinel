// src/components/admin/__tests__/ContradictionRatePanel.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContradictionRatePanel } from "../ContradictionRatePanel";

describe("ContradictionRatePanel", () => {
  it("renders unresolved count", () => {
    render(<ContradictionRatePanel byContentType={[]} bySourceType={[]} unresolvedTotal={7} />);
    expect(screen.getByText("7")).toBeDefined();
  });
});
