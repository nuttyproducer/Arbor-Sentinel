// src/components/admin/__tests__/ErrorRateChart.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorRateChart } from "../ErrorRateChart";
import type { ErrorRatePoint } from "../../../lib/admin/types";

const TEST_DATA: ErrorRatePoint[] = [
  { timestamp: "2026-08-01T00:00:00.000Z", bySourceType: { court: 2, ngo: 1 }, byCategory: { fetch_error: 2, parse_error: 1 } },
  { timestamp: "2026-08-02T00:00:00.000Z", bySourceType: { court: 1, ngo: 3 }, byCategory: { fetch_error: 1, parse_error: 3 } },
];

describe("ErrorRateChart", () => {
  it("renders title", () => {
    render(<ErrorRateChart data={TEST_DATA} />);
    expect(screen.getByText("Error Rates")).toBeDefined();
  });

  it("renders toggle buttons", () => {
    render(<ErrorRateChart data={TEST_DATA} />);
    expect(screen.getByText("Source Type")).toBeDefined();
    expect(screen.getByText("Error Category")).toBeDefined();
  });

  it("switches view on toggle click", async () => {
    const user = userEvent.setup();
    render(<ErrorRateChart data={TEST_DATA} />);
    await user.click(screen.getByText("Error Category"));
    expect(screen.getByText("Error Category").getAttribute("aria-pressed")).toBeNull(); // aria-pressed not set, so check className
    expect(screen.getByText("Error Category").className).toContain("bg-ink");
  });

  it("renders SVG lines", () => {
    const { container } = render(<ErrorRateChart data={TEST_DATA} />);
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
  });
});
