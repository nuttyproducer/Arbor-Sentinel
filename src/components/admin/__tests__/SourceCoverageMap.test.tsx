// src/components/admin/__tests__/SourceCoverageMap.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SourceCoverageMap } from "../SourceCoverageMap";

describe("SourceCoverageMap", () => {
  it("renders coverage table", () => {
    render(<SourceCoverageMap cells={[{ country: "Belgium", sourceType: "court", status: "covered", sourceCount: 3 }]} />);
    expect(screen.getByText("Belgium")).toBeDefined();
    // "Covered" appears in the table cell and the status legend
    expect(screen.getAllByText("Covered").length).toBeGreaterThan(0);
  });
});
