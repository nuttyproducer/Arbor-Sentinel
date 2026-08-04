import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CorrectionLink } from "../CorrectionLink";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("CorrectionLink", () => {
  it("renders default label", () => {
    renderWithRouter(<CorrectionLink />);
    expect(screen.getByText("Request a correction")).toBeInTheDocument();
  });

  it("renders custom label", () => {
    renderWithRouter(<CorrectionLink label="Fix this" />);
    expect(screen.getByText("Fix this")).toBeInTheDocument();
  });

  it("links to /corrections by default", () => {
    renderWithRouter(<CorrectionLink />);
    const link = screen.getByText("Request a correction");
    expect(link.getAttribute("href")).toBe("/corrections");
  });

  it("links to custom href", () => {
    renderWithRouter(
      <CorrectionLink label="Go" href="/methodology" />,
    );
    const link = screen.getByText("Go");
    expect(link.getAttribute("href")).toBe("/methodology");
  });

  it("renders an arrow SVG icon", () => {
    renderWithRouter(<CorrectionLink />);
    const link = screen.getByText("Request a correction");
    const svg = link.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
