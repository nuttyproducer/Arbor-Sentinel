import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { MapSearch } from "../MapSearch";
import { MapContext, type MapContextValue } from "../MapContext";
import type { Map } from "maplibre-gl";
import type { MapFeature, SafeCoordinate } from "../../../lib/map/types";

const safeCoord = (lat: number, lon: number): SafeCoordinate =>
  ({ lat, lon, precision: "city" }) as SafeCoordinate;

function makeFeature(overrides: Partial<MapFeature> = {}): MapFeature {
  return {
    id: "f1",
    type: "event",
    category: "legal_proceeding",
    title: "Test Event",
    safeCoordinate: safeCoord(31.5, 34.5),
    sourceIds: [],
    isSensitive: false,
    date: "2024-01-15",
    description: "A documented report",
    ...overrides,
  };
}

const features = [
  makeFeature({
    id: "f1",
    title: "Gaza Hospital Strike",
    category: "casualty_event",
    date: "2024-01-15",
    description: "Report of a strike on Al-Shifa Hospital",
  }),
  makeFeature({
    id: "f2",
    title: "ICC Filing",
    category: "legal_proceeding",
    date: "2024-03-02",
    description: "Filing at the International Criminal Court",
  }),
  makeFeature({
    id: "f3",
    title: "UN Report",
    category: "documented_incident",
    date: "2024-05-10",
    description: "Human rights report on displacement",
  }),
];

function createMockMap() {
  return { panTo: vi.fn() };
}

describe("MapSearch", () => {
  let mockMap: ReturnType<typeof createMockMap>;

  beforeEach(() => {
    mockMap = createMockMap();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderWithContext() {
    const contextValue: MapContextValue = {
      map: mockMap as unknown as Map,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    return render(
      <MapContext.Provider value={contextValue}>
        <MapSearch features={features} />
      </MapContext.Provider>
    );
  }

  it("renders a search input", () => {
    const { getByPlaceholderText } = renderWithContext();
    expect(getByPlaceholderText("Search features…")).toBeTruthy();
  });

  it("does not show results before the debounce elapses", () => {
    const { getByPlaceholderText, queryByRole } = renderWithContext();
    fireEvent.change(getByPlaceholderText("Search features…"), {
      target: { value: "Gaza" },
    });
    expect(queryByRole("listbox")).toBeNull();
  });

  it("shows matching results after the debounce elapses", () => {
    const { getByPlaceholderText, getByRole } = renderWithContext();
    fireEvent.change(getByPlaceholderText("Search features…"), {
      target: { value: "Gaza" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(getByRole("listbox")).toBeTruthy();
    expect(getByRole("option", { name: "Gaza Hospital Strike" })).toBeTruthy();
  });

  it("does not render unmatched features", () => {
    const { getByPlaceholderText, queryByRole } = renderWithContext();
    fireEvent.change(getByPlaceholderText("Search features…"), {
      target: { value: "Gaza" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(queryByRole("option", { name: "ICC Filing" })).toBeNull();
    expect(queryByRole("option", { name: "UN Report" })).toBeNull();
  });

  it("fuzzy-matches across title, description, and category", () => {
    const { getByPlaceholderText, getByRole } = renderWithContext();

    // "hosptl" is a fuzzy subsequence of "hospital" in the title.
    fireEvent.change(getByPlaceholderText("Search features…"), {
      target: { value: "hosptl" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(getByRole("option", { name: "Gaza Hospital Strike" })).toBeTruthy();

    // Matches a word in the description.
    fireEvent.change(getByPlaceholderText("Search features…"), {
      target: { value: "displacement" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(getByRole("option", { name: "UN Report" })).toBeTruthy();

    // Matches a category.
    fireEvent.change(getByPlaceholderText("Search features…"), {
      target: { value: "legal_proceeding" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(getByRole("option", { name: "ICC Filing" })).toBeTruthy();
  });

  it("pans the map when a result is selected", () => {
    const { getByPlaceholderText, getByRole } = renderWithContext();
    fireEvent.change(getByPlaceholderText("Search features…"), {
      target: { value: "Gaza" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(getByRole("option", { name: "Gaza Hospital Strike" }));
    expect(mockMap.panTo).toHaveBeenCalledWith({
      center: [34.5, 31.5],
    });
  });

  it("does not crash when map is null", () => {
    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { getByPlaceholderText, getByRole } = render(
      <MapContext.Provider value={contextValue}>
        <MapSearch features={features} />
      </MapContext.Provider>
    );

    fireEvent.change(getByPlaceholderText("Search features…"), {
      target: { value: "Gaza" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(getByRole("option", { name: "Gaza Hospital Strike" }));
    // No map -> no-op, but no crash.
    expect(getByRole("listbox")).toBeTruthy();
  });

  it("renders no results when features are empty", () => {
    const contextValue: MapContextValue = {
      map: mockMap as unknown as Map,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { getByPlaceholderText, queryByRole } = render(
      <MapContext.Provider value={contextValue}>
        <MapSearch features={[]} />
      </MapContext.Provider>
    );

    fireEvent.change(getByPlaceholderText("Search features…"), {
      target: { value: "Gaza" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(queryByRole("listbox")).toBeNull();
  });
});
