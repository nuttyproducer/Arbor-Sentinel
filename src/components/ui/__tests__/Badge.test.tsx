import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Published</Badge>);
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("applies neutral variant by default", () => {
    render(<Badge>Neutral</Badge>);
    const el = screen.getByText("Neutral");
    expect(el.className).toContain("bg-border/30");
  });

  it("applies info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    const el = screen.getByText("Info");
    expect(el.className).toContain("bg-trust/10");
  });

  it("applies warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const el = screen.getByText("Warning");
    expect(el.className).toContain("bg-amber/10");
  });

  it("applies alert variant", () => {
    render(<Badge variant="alert">Alert</Badge>);
    const el = screen.getByText("Alert");
    expect(el.className).toContain("bg-clay/10");
  });

  it("renders as a <span> element", () => {
    render(<Badge>Tag</Badge>);
    const el = screen.getByText("Tag");
    expect(el.tagName).toBe("SPAN");
  });

  it("merges custom className", () => {
    render(<Badge className="custom">Styled</Badge>);
    const el = screen.getByText("Styled");
    expect(el.className).toContain("custom");
  });
});
