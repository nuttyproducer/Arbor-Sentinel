import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PreviewNotice } from "../PreviewNotice";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PreviewNotice", () => {
  it("renders children", () => {
    renderWithRouter(
      <PreviewNotice>This page is a draft.</PreviewNotice>,
    );
    expect(screen.getByText("This page is a draft.")).toBeInTheDocument();
  });

  it("renders 'Static preview' badge by default", () => {
    renderWithRouter(
      <PreviewNotice>Content here.</PreviewNotice>,
    );
    expect(screen.getByText("Static preview")).toBeInTheDocument();
  });

  it("renders the methodology link", () => {
    renderWithRouter(<PreviewNotice>Content.</PreviewNotice>);
    const link = screen.getByText("Read the methodology");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/methodology");
  });

  it("renders the corrections link", () => {
    renderWithRouter(<PreviewNotice>Content.</PreviewNotice>);
    const link = screen.getByText("corrections welcome");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/corrections");
  });

  it("renders custom title when provided", () => {
    renderWithRouter(
      <PreviewNotice title="Heads up">Content.</PreviewNotice>,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
  });

  it("uses role='note' for accessibility", () => {
    renderWithRouter(<PreviewNotice>Content.</PreviewNotice>);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("uses warning badge variant when variant is warning", () => {
    renderWithRouter(
      <PreviewNotice variant="warning">Content.</PreviewNotice>,
    );
    const badge = screen.getByText("Static preview");
    expect(badge.className).toContain("bg-amber/10");
  });
});
