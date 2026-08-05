// src/pages/admin/__tests__/DataQualityDashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DataQualityDashboard from "../DataQualityDashboard";

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

vi.mock("../../../lib/admin/qualityMetrics", async () => {
  const actual = await vi.importActual("../../../lib/admin/qualityMetrics");
  return {
    ...actual,
    fetchQualityData: vi.fn().mockResolvedValue({
      entries: [],
      qualityData: { scores: [], contradictionReports: [], duplicateGroups: [] },
      coverageCells: [],
      freshnessInputs: [],
    }),
  };
});

describe("DataQualityDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading", () => {
    render(
      <MemoryRouter>
        <DataQualityDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("Data Quality")).toBeDefined();
  });

  it("renders time range selector", () => {
    render(
      <MemoryRouter>
        <DataQualityDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText("30 days")).toBeDefined();
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <DataQualityDashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Loading quality data/)).toBeDefined();
  });
});
