// src/components/admin/shared/__tests__/ChartContainer.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartContainer } from "../ChartContainer";

describe("ChartContainer", () => {
  it("renders title and children when loaded", () => {
    render(<ChartContainer title="Test Chart"><p>chart content</p></ChartContainer>);
    expect(screen.getByText("Test Chart")).toBeDefined();
    expect(screen.getByText("chart content")).toBeDefined();
  });

  it("renders subtitle when provided", () => {
    render(<ChartContainer title="Test" subtitle="A subtitle"><p>x</p></ChartContainer>);
    expect(screen.getByText("A subtitle")).toBeDefined();
  });

  it("shows loading skeleton when isLoading", () => {
    render(<ChartContainer title="Test" isLoading><p>should not show</p></ChartContainer>);
    expect(screen.getByText("Loading chart data…")).toBeDefined();
    expect(screen.queryByText("should not show")).toBeNull();
  });

  it("shows empty state when isEmpty", () => {
    render(<ChartContainer title="Test" isEmpty><p>hidden</p></ChartContainer>);
    expect(screen.getByText("No data for this period")).toBeDefined();
    expect(screen.queryByText("hidden")).toBeNull();
  });

  it("shows error state when error is set", () => {
    render(<ChartContainer title="Test" error="Something went wrong"><p>hidden</p></ChartContainer>);
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.queryByText("hidden")).toBeNull();
  });

  it("has accessible section with aria-labelledby", () => {
    render(<ChartContainer title="My Chart"><p>ok</p></ChartContainer>);
    const section = screen.getByRole("region");
    expect(section.getAttribute("aria-labelledby")).toContain("chart-my-chart");
  });
});
