// src/components/admin/__tests__/ConfidenceDistribution.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfidenceDistribution } from "../ConfidenceDistribution";

const DATA = [{ range: "0.6-0.8", min: 0.6, max: 0.8, count: 20 }, { range: "0.8-1.0", min: 0.8, max: 1.0, count: 15 }];

describe("ConfidenceDistribution", () => {
  it("renders title", () => { render(<ConfidenceDistribution data={DATA} />); expect(screen.getByText("Confidence Distribution")).toBeDefined(); });
  it("renders SVG bars", () => { const { container } = render(<ConfidenceDistribution data={DATA} />); expect(container.querySelectorAll("rect").length).toBeGreaterThan(0); });
});
