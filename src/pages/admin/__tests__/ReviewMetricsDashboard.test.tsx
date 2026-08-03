// src/pages/admin/__tests__/ReviewMetricsDashboard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReviewMetricsDashboard from "../ReviewMetricsDashboard";

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

describe("ReviewMetricsDashboard", () => {
  it("renders all panel sections", () => {
    render(
      <MemoryRouter>
        <ReviewMetricsDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("Review Queue Metrics")).toBeDefined();
    expect(screen.getByText("Queue Depth")).toBeDefined();
    expect(screen.getByText("Queue Age Distribution")).toBeDefined();
    expect(screen.getByText("Review Throughput")).toBeDefined();
    expect(screen.getByText("SLA Compliance")).toBeDefined();
    expect(screen.getByText("Reviewer Performance")).toBeDefined();
    expect(screen.getByText("Bottlenecks")).toBeDefined();
  });

  it("renders CSV export button", () => {
    render(
      <MemoryRouter>
        <ReviewMetricsDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("Export CSV")).toBeDefined();
  });

  it("renders static preview notice", () => {
    render(
      <MemoryRouter>
        <ReviewMetricsDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText(/in-memory development data/)).toBeDefined();
  });
});
