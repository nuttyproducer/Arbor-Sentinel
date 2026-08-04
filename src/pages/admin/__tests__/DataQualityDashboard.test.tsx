// src/pages/admin/__tests__/DataQualityDashboard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DataQualityDashboard from "../DataQualityDashboard";

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

describe("DataQualityDashboard", () => {
  it("renders all panel sections", () => {
    render(
      <MemoryRouter>
        <DataQualityDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("Data Quality")).toBeDefined();
    expect(screen.getByText("Confidence Distribution")).toBeDefined();
    expect(screen.getByText("Duplicate Detection")).toBeDefined();
    expect(screen.getByText("Source Coverage")).toBeDefined();
    expect(screen.getByText("Data Freshness")).toBeDefined();
    expect(screen.getByText("Quality Trends")).toBeDefined();
  });

  it("renders time range selector", () => {
    render(
      <MemoryRouter>
        <DataQualityDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("30 days")).toBeDefined();
  });
});
