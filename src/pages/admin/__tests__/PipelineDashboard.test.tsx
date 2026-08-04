// src/pages/admin/__tests__/PipelineDashboard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PipelineDashboard from "../PipelineDashboard";

// Mock framer-motion — jsdom doesn't support animation APIs.
// Components using Reveal (PageIntro, PageStatusNotice) render children
// without animation, matching the route-smoke-test convention.
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

describe("PipelineDashboard", () => {
  it("renders all panel sections", () => {
    render(
      <MemoryRouter>
        <PipelineDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("Pipeline Monitoring")).toBeDefined();
    expect(screen.getByText("Source Overview")).toBeDefined();
    expect(screen.getByText("Content Ingestion")).toBeDefined();
    expect(screen.getByText("AI Pipeline Metrics")).toBeDefined();
    expect(screen.getByText("Collector Status")).toBeDefined();
    expect(screen.getByText("Error Rates")).toBeDefined();
  });

  it("renders time range selector", () => {
    render(
      <MemoryRouter>
        <PipelineDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("24 hours")).toBeDefined();
  });

  it("renders static preview notice", () => {
    render(
      <MemoryRouter>
        <PipelineDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText(/in-memory development data/)).toBeDefined();
  });
});
