// src/components/admin/shared/__tests__/StatTile.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatTile } from "../StatTile";

describe("StatTile", () => {
  it("renders label, value, and subtitle", () => {
    render(<StatTile label="Active" value={42} subtitle="of 50 sources" />);
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText("of 50 sources")).toBeDefined();
  });

  it("applies color class to value", () => {
    render(<StatTile label="Failed" value={3} colorClass="text-clay" />);
    const value = screen.getByText("3");
    expect(value.className).toContain("text-clay");
  });

  it("renders up trend indicator", () => {
    render(<StatTile label="Items" value={100} trend="up" />);
    const value = screen.getByText("100");
    expect(value.textContent).toContain("↑");
  });

  it("renders down trend indicator", () => {
    render(<StatTile label="Errors" value={5} trend="down" />);
    const value = screen.getByText("5");
    expect(value.textContent).toContain("↓");
  });

  it("renders without trend when neutral", () => {
    render(<StatTile label="Stable" value={10} trend="neutral" />);
    const value = screen.getByText("10");
    expect(value.textContent).not.toContain("↑");
    expect(value.textContent).not.toContain("↓");
  });
});
