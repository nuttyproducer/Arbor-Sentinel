import { render, screen } from "@testing-library/react";
import { LegalStatusBadge } from "../LegalStatusBadge";

describe("LegalStatusBadge", () => {
  it("renders court proceeding active label", () => {
    render(<LegalStatusBadge status="court_proceeding_active" />);
    expect(
      screen.getByText("Court proceeding active"),
    ).toBeInTheDocument();
  });

  it("renders arrest warrant issued label", () => {
    render(<LegalStatusBadge status="arrest_warrant_issued" />);
    expect(screen.getByText("Arrest warrant issued")).toBeInTheDocument();
  });

  it("renders not judicially determined as neutral", () => {
    render(<LegalStatusBadge status="not_judicially_determined" />);
    expect(
      screen.getByText("Not yet judicially determined"),
    ).toBeInTheDocument();
  });

  it("maps provisional_measures_issued to warning variant", () => {
    const { container } = render(
      <LegalStatusBadge status="provisional_measures_issued" />,
    );
    expect(container.querySelector("span")!.className).toContain("bg-amber/10");
  });

  it("maps arrest_warrant_issued to alert variant", () => {
    const { container } = render(
      <LegalStatusBadge status="arrest_warrant_issued" />,
    );
    expect(container.querySelector("span")!.className).toContain("bg-clay/10");
  });

  it("maps un_finding to info variant", () => {
    const { container } = render(
      <LegalStatusBadge status="un_finding" />,
    );
    expect(container.querySelector("span")!.className).toContain("bg-trust/10");
  });

  it("renders all 9 legal statuses without error", () => {
    const statuses = [
      "court_proceeding_active",
      "provisional_measures_issued",
      "arrest_warrant_issued",
      "allegation_under_investigation",
      "un_finding",
      "ngo_legal_determination",
      "not_judicially_determined",
      "contested_claim",
      "requires_further_verification",
    ] as const;

    for (const status of statuses) {
      const { unmount } = render(<LegalStatusBadge status={status} />);
      unmount();
    }
    // If we got here, all rendered without throwing
    expect(true).toBe(true);
  });
});
