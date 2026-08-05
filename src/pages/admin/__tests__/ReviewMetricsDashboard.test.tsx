// src/pages/admin/__tests__/ReviewMetricsDashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReviewMetricsDashboard from "../ReviewMetricsDashboard";

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
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
  useReducedMotion: () => true,
}));

vi.mock("../../../lib/admin/reviewMetrics", async () => {
  const actual = await vi.importActual("../../../lib/admin/reviewMetrics");
  return {
    ...actual,
    fetchReviewData: vi.fn().mockResolvedValue({ items: [], profiles: [] }),
  };
});

describe("ReviewMetricsDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading", () => {
    render(
      <MemoryRouter>
        <ReviewMetricsDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("Review Queue Metrics")).toBeDefined();
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <ReviewMetricsDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Loading review data/)).toBeDefined();
  });
});
