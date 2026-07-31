import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { SourceRegistryTable } from "../SourceRegistryTable";
import type { SourceRecord } from "../../../types/content";

const mockSource: SourceRecord = {
  id: "test-1",
  slug: "test-source",
  title: "Test Source Title",
  publisher: "Test Publisher",
  sourceType: "court",
  url: "https://example.com/source",
  accessedAt: "2026-07-24",
  status: "active",
  version: 1,
  correctionUrl: "/corrections",
  trustLevel: 0,
  healthStatus: "unknown",
  automationStatus: "manual",
  failureCount: 0,
  monitoringEnabled: false,
  language: "en",
  region: "Europe",
  official: true,
};

const mockSources: SourceRecord[] = [
  mockSource,
  {
    ...mockSource,
    id: "test-2",
    slug: "test-source-2",
    title: "Second Source",
    publisher: "Another Publisher",
    sourceType: "journalism",
    healthStatus: "active",
    trustLevel: 4,
    region: "Middle East",
    language: "ar",
  },
  {
    ...mockSource,
    id: "test-3",
    slug: "test-source-3",
    title: "Failed Source",
    publisher: "Third Publisher",
    sourceType: "osint",
    healthStatus: "failed",
    status: "broken",
    trustLevel: 1,
  },
];

const renderTable = (sources = mockSources, selectedId?: string) => {
  const onSelect = vi.fn();
  render(
    <BrowserRouter>
      <SourceRegistryTable
        sources={sources}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </BrowserRouter>,
  );
  return { onSelect };
};

describe("SourceRegistryTable", () => {
  it("renders all sources in the table", () => {
    renderTable();
    expect(screen.getByText("Test Source Title")).toBeInTheDocument();
    expect(screen.getByText("Second Source")).toBeInTheDocument();
    expect(screen.getByText("Failed Source")).toBeInTheDocument();
  });

  it("displays publisher names", () => {
    renderTable();
    expect(screen.getByText("Test Publisher")).toBeInTheDocument();
    expect(screen.getByText("Another Publisher")).toBeInTheDocument();
  });

  it("renders health indicators for each source", () => {
    renderTable();
    const indicators = screen.getAllByText(/Active|Unknown|Failed/);
    expect(indicators.length).toBeGreaterThanOrEqual(3);
  });

  it("calls onSelect when a row is clicked", async () => {
    const { onSelect } = renderTable();
    const row = screen.getByRole("button", { name: /Select source: Test Source Title/i });
    await userEvent.click(row);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "test-1" }),
    );
  });

  it("applies selected styling when selectedId matches", () => {
    renderTable(mockSources, "test-1");
    const row = screen.getByRole("button", { name: /Select source: Test Source Title/i });
    expect(row.getAttribute("aria-selected")).toBe("true");
  });

  it("shows empty state when no sources", () => {
    render(
      <BrowserRouter>
        <SourceRegistryTable sources={[]} onSelect={vi.fn()} />
      </BrowserRouter>,
    );
    expect(screen.getByText(/No sources match these filters/i)).toBeInTheDocument();
  });

  it("renders source links with correct href", () => {
    renderTable();
    const link = screen.getByRole("link", { name: "Test Source Title" });
    expect(link).toHaveAttribute("href", "/sources/test-source");
  });

  it("renders trust levels", () => {
    renderTable();
    // "0/5" for first, "4/5" for second, "1/5" for third
    expect(screen.getByText("0/5")).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("renders status badges", () => {
    renderTable();
    const activeBadges = screen.getAllByText("Active");
    // "Active" appears as both a status badge and a health indicator label
    expect(activeBadges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Broken link")).toBeInTheDocument();
  });
});
