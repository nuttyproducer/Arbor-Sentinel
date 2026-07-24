import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ActionDetailPage from "../ActionDetailPage";

// Mock framer-motion — jsdom doesn't support animation APIs.
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
    pre: "pre",
    button: "button",
    nav: "nav",
    header: "header",
    footer: "footer",
    main: "main",
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
  useReducedMotion: () => true,
}));

function renderActionDetail(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/take-action/${slug}`]}>
      <Routes>
        <Route path="/take-action/:slug" element={<ActionDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ActionDetailPage", () => {
  it("renders a known action template by slug", () => {
    renderActionDetail("contact-representative");
    expect(
      screen.getByRole("heading", { name: "Contact your representative" }),
    ).toBeInTheDocument();
  });

  it("displays action type badge", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Contact a representative")).toBeInTheDocument();
  });

  it("displays jurisdiction information", () => {
    renderActionDetail("contact-representative");
    expect(
      screen.getByText(/Any country with elected or appointed public representatives/),
    ).toBeInTheDocument();
  });

  it("displays intended audience section", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Intended audience")).toBeInTheDocument();
  });

  it("displays purpose section", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Purpose")).toBeInTheDocument();
  });

  it("displays policy ask section", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("What the recipient can do")).toBeInTheDocument();
  });

  it("displays source basis section", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Legal and policy basis")).toBeInTheDocument();
  });

  it("displays instructions section", () => {
    renderActionDetail("contact-representative");
    expect(
      screen.getByText("How to complete this action safely"),
    ).toBeInTheDocument();
  });

  it("displays template text and copy button when template exists", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Template text")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy.*template.*clipboard/i })).toBeInTheDocument();
  });

  it("displays review status dimensions", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Review status")).toBeInTheDocument();
    expect(screen.getByText("Template review")).toBeInTheDocument();
    expect(screen.getByText("Jurisdiction review")).toBeInTheDocument();
    expect(screen.getByText("Language review")).toBeInTheDocument();
    expect(screen.getByText("Editorial content status")).toBeInTheDocument();
  });

  it("displays language information", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Language and translation")).toBeInTheDocument();
    // "English" may appear in the language label
    const englishMatches = screen.getAllByText(/English/);
    expect(englishMatches.length).toBeGreaterThan(0);
  });

  it("displays warnings section", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Important warnings")).toBeInTheDocument();
  });

  it("displays related pages section", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Related pages")).toBeInTheDocument();
  });

  it("displays version and review metadata", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Version and review metadata")).toBeInTheDocument();
    expect(screen.getByText("Record version")).toBeInTheDocument();
  });

  it("displays correction link", () => {
    renderActionDetail("contact-representative");
    expect(
      screen.getByText("Report an error in this action template"),
    ).toBeInTheDocument();
  });

  it("displays lawful use disclaimer", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("Lawful use only")).toBeInTheDocument();
  });

  it("displays what-the-platform-does-not-do section", () => {
    renderActionDetail("contact-representative");
    expect(screen.getByText("What this platform does not do")).toBeInTheDocument();
  });

  it("displays back link to Action Hub", () => {
    renderActionDetail("contact-representative");
    expect(
      screen.getByText("← Back to Action Hub"),
    ).toBeInTheDocument();
  });

  it("renders template without body correctly (volunteer action)", () => {
    renderActionDetail("volunteer");
    expect(
      screen.getByRole("heading", { name: "Volunteer for the project" }),
    ).toBeInTheDocument();
    // Volunteer has no template body — should not render template text section
    expect(screen.queryByText("Template text")).not.toBeInTheDocument();
  });

  it("renders not-found state for unknown slug", () => {
    renderActionDetail("nonexistent-action");
    expect(
      screen.getByText("Action template not found"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Browse all actions"),
    ).toBeInTheDocument();
  });

  it("separates review dimensions (does not collapse to single reviewed flag)", () => {
    renderActionDetail("contact-representative");
    // Each review dimension appears independently
    const reviewStatusSection = screen.getByText("Review status").closest("section") ??
      screen.getByText("Review status").parentElement!;
    const reviewText = reviewStatusSection.textContent ?? "";
    // All four dimensions should appear separately
    expect(reviewText).toContain("Template review");
    expect(reviewText).toContain("Jurisdiction review");
    expect(reviewText).toContain("Language review");
    expect(reviewText).toContain("Editorial content status");
  });
});
