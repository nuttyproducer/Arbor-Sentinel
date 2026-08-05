// src/pages/admin/__tests__/PipelineDashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PipelineDashboard from "../PipelineDashboard";

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

vi.mock("../../../lib/admin/metrics", async () => {
  const actual = await vi.importActual("../../../lib/admin/metrics");
  return {
    ...actual,
    fetchPipelineData: vi.fn().mockResolvedValue({
      runs: [],
      report: {
        generatedAt: new Date().toISOString(),
        collectors: [],
        summary: {
          totalCollectors: 0, activeCount: 0, degradedCount: 0, failedCount: 0,
          unknownCount: 0, staleCount: 0, overallErrorRate: 0, coverageGaps: [],
        },
      },
      events: [],
    }),
  };
});

describe("PipelineDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading", () => {
    render(
      <MemoryRouter>
        <PipelineDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("Pipeline Monitoring")).toBeDefined();
  });

  it("renders time range selector", () => {
    render(
      <MemoryRouter>
        <PipelineDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("24 hours")).toBeDefined();
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <PipelineDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Loading pipeline data/)).toBeDefined();
  });
});
