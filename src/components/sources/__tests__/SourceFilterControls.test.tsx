import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SourceFilterControls, DEFAULT_SOURCE_FILTERS } from "../SourceFilterControls";
import type { SourceFilters } from "../SourceFilterControls";

const noop = () => {};

function renderControls(overrides: Partial<{
  filters: SourceFilters;
  availableRegions: string[];
  availableLanguages: string[];
  filteredCount: number;
  totalCount: number;
}> = {}) {
  const filters = overrides.filters ?? DEFAULT_SOURCE_FILTERS;
  const setFilter = vi.fn();
  const clearFilter = vi.fn();
  const clearAllFilters = vi.fn();
  render(
    <SourceFilterControls
      filters={filters}
      setFilter={setFilter}
      clearFilter={clearFilter}
      clearAllFilters={clearAllFilters}
      availableRegions={overrides.availableRegions ?? []}
      availableLanguages={overrides.availableLanguages ?? []}
      filteredCount={overrides.filteredCount ?? 43}
      totalCount={overrides.totalCount ?? 43}
    />,
  );
  return { setFilter, clearFilter, clearAllFilters };
}

describe("SourceFilterControls", () => {
  it("renders source type filter chips", () => {
    renderControls();
    expect(screen.getByText("Court / legal record")).toBeInTheDocument();
    expect(screen.getByText("UN / international body")).toBeInTheDocument();
  });

  it("renders URL status filter chips", () => {
    renderControls();
    // "Broken link" and "Superseded" are unique to the URL status group
    expect(screen.getByText("Broken link")).toBeInTheDocument();
    expect(screen.getByText("Superseded")).toBeInTheDocument();
  });

  it("renders health status filter chips", () => {
    renderControls();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("Degraded")).toBeInTheDocument();
  });

  it("renders trust level filter chips", () => {
    renderControls();
    expect(screen.getByText(/Level 0/)).toBeInTheDocument();
    expect(screen.getByText(/Level 5/)).toBeInTheDocument();
  });

  it("renders region filter chips when regions are available", () => {
    renderControls({ availableRegions: ["Europe", "Middle East"] });
    expect(screen.getByText("Europe")).toBeInTheDocument();
    expect(screen.getByText("Middle East")).toBeInTheDocument();
  });

  it("renders language filter chips when languages are available", () => {
    renderControls({ availableLanguages: ["en", "fr", "nl"] });
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("FR")).toBeInTheDocument();
  });

  it("shows filter count text with no active filters", () => {
    renderControls({ filteredCount: 12, totalCount: 43 });
    expect(screen.getByText("12 of 43 sources displayed")).toBeInTheDocument();
  });

  it("shows filter count text with active filters", () => {
    renderControls({
      filters: { ...DEFAULT_SOURCE_FILTERS, sourceType: "court" },
      filteredCount: 12,
      totalCount: 43,
    });
    expect(screen.getByText("12 of 43 sources match the current filters")).toBeInTheDocument();
  });

  it("shows 'Clear all filters' when a filter is active", async () => {
    const user = userEvent.setup();
    renderControls({
      filters: { ...DEFAULT_SOURCE_FILTERS, sourceType: "court" },
    });
    expect(screen.getByText("Clear all filters")).toBeInTheDocument();
  });

  it("calls clearAllFilters when 'Clear all' is clicked", async () => {
    const user = userEvent.setup();
    const { clearAllFilters } = renderControls({
      filters: { ...DEFAULT_SOURCE_FILTERS, sourceType: "court" },
    });
    await user.click(screen.getByText("Clear all filters"));
    expect(clearAllFilters).toHaveBeenCalledOnce();
  });
});
