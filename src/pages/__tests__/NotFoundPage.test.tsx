import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NotFoundPage } from "../NotFoundPage";

vi.mock("framer-motion", () => ({
  motion: {
    div: "div",
    section: "section",
    span: "span",
    p: "p",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    li: "li",
    ul: "ul",
    a: "a",
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
  useReducedMotion: () => true,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

describe("NotFoundPage", () => {
  it("displays 404 indicator", () => {
    renderPage();
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("displays 'Page not found' heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Page not found/i }),
    ).toBeInTheDocument();
  });

  it("displays explanation text", () => {
    renderPage();
    expect(
      screen.getByText(/This page may not exist yet/),
    ).toBeInTheDocument();
  });

  it("renders a Home button linking to /", () => {
    renderPage();
    const homeBtn = screen.getByText("Home");
    expect(homeBtn.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders a Methodology button", () => {
    renderPage();
    const btn = screen.getByText("Methodology");
    expect(btn.closest("a")).toHaveAttribute("href", "/methodology");
  });

  it("renders a Contribute button", () => {
    renderPage();
    const btn = screen.getByText("Contribute");
    expect(btn.closest("a")).toHaveAttribute("href", "/contribute");
  });

  it("renders a GitHub button with external link", () => {
    renderPage();
    const btn = screen.getByText("GitHub");
    expect(btn.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/nuttyproducer/accountability-atlas",
    );
    expect(btn.closest("a")).toHaveAttribute("target", "_blank");
  });
});
