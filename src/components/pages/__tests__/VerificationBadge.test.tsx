import { render, screen } from "@testing-library/react";
import { VerificationBadge } from "../VerificationBadge";

describe("VerificationBadge", () => {
  it("renders level 0 as warning with prefix", () => {
    render(<VerificationBadge level={0} />);
    expect(screen.getByText(/Level 0/)).toBeInTheDocument();
    expect(screen.getByText(/Unreviewed lead/)).toBeInTheDocument();
  });

  it("renders level 5 as info with full label", () => {
    render(<VerificationBadge level={5} />);
    expect(screen.getByText(/Level 5/)).toBeInTheDocument();
    expect(screen.getByText(/Legal\/institutional record/)).toBeInTheDocument();
  });

  it("hides prefix when showPrefix is false", () => {
    render(<VerificationBadge level={2} showPrefix={false} />);
    expect(screen.getByText("Source checked")).toBeInTheDocument();
    expect(screen.queryByText(/Level 2/)).not.toBeInTheDocument();
  });

  it("shows prefix by default", () => {
    render(<VerificationBadge level={3} />);
    expect(screen.getByText(/Level 3 — Corroborated/)).toBeInTheDocument();
  });

  it("maps levels 0-1 to warning variant", () => {
    const { container } = render(<VerificationBadge level={1} />);
    // warning uses amber classes
    expect(container.querySelector("span")!.className).toContain("bg-amber/10");
  });

  it("maps levels 3-5 to info variant", () => {
    const { container } = render(<VerificationBadge level={4} />);
    expect(container.querySelector("span")!.className).toContain("bg-trust/10");
  });

  it("maps level 2 to neutral variant", () => {
    const { container } = render(<VerificationBadge level={2} />);
    expect(container.querySelector("span")!.className).toContain("bg-border/30");
  });
});
