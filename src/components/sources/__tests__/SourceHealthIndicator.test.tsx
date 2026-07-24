import { render, screen } from "@testing-library/react";
import { SourceHealthIndicator } from "../SourceHealthIndicator";

describe("SourceHealthIndicator", () => {
  it("renders active status with accessible label", () => {
    render(<SourceHealthIndicator healthStatus="active" />);
    const el = screen.getByLabelText("Source health: Active");
    expect(el).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders degraded status", () => {
    render(<SourceHealthIndicator healthStatus="degraded" />);
    expect(screen.getByLabelText("Source health: Degraded")).toBeInTheDocument();
    expect(screen.getByText("Degraded")).toBeInTheDocument();
  });

  it("renders failed status", () => {
    render(<SourceHealthIndicator healthStatus="failed" />);
    expect(screen.getByLabelText("Source health: Failed")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders unknown status", () => {
    render(<SourceHealthIndicator healthStatus="unknown" />);
    expect(screen.getByLabelText("Source health: Unknown")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("applies sm size prop with smaller dot", () => {
    const { container } = render(
      <SourceHealthIndicator healthStatus="active" size="sm" />,
    );
    const dot = container.querySelector(".w-2.h-2");
    expect(dot).toBeInTheDocument();
  });

  it("defaults to md size", () => {
    const { container } = render(
      <SourceHealthIndicator healthStatus="active" />,
    );
    const dot = container.querySelector(".w-2\\.5.h-2\\.5");
    expect(dot).toBeInTheDocument();
  });
});
