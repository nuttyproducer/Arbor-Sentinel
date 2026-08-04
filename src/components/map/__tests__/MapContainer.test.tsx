// src/components/map/__tests__/MapContainer.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MapContainer } from "../MapContainer";
import { MapContext, type MapContextValue } from "../MapContext";

// Mock maplibre-gl
//
// NOTE: Deviates from the task brief's mock in three ways, all required for
// Vitest 4 compatibility:
//   1. `Map` uses a `function` (not arrow) implementation so `new Map()` is
//      constructable — Vitest 4 refuses to construct vi.fn() mocks whose
//      implementation is an arrow function.
//   2. `default.Map` and the named `Map` export share ONE mock function,
//      mirroring real maplibre-gl (the default export is the namespace object
//      that also carries the `Map` class). The brief used two separate
//      vi.fn()s, so calls made via `new maplibregl.Map(...)` (default import
//      in MapContainer) were invisible to assertions reading `maplibregl.Map`.
//   3. `on` fires the registered "load" callback synchronously so the
//      `map` context value becomes non-null (the brief's mock never fired it).
vi.mock("maplibre-gl", () => {
  const mockMap = {
    on: vi.fn((event: string, callback?: () => void) => {
      if (event === "load") callback?.();
      return mockMap;
    }),
    remove: vi.fn(),
    resize: vi.fn(),
    getCanvas: vi.fn(() => document.createElement("canvas")),
    getContainer: vi.fn(() => document.createElement("div")),
  };
  const MapMock = vi.fn(function () {
    return mockMap;
  });
  return {
    default: { Map: MapMock },
    Map: MapMock,
  };
});

describe("MapContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes a MapLibre Map instance on mount", async () => {
    const maplibregl = await import("maplibre-gl");
    render(
      <MapContainer>
        <div>child</div>
      </MapContainer>
    );
    expect(maplibregl.Map).toHaveBeenCalledTimes(1);
  });

  it("renders a div container with the map class", () => {
    const { container } = render(
      <MapContainer>
        <div>child</div>
      </MapContainer>
    );
    const mapDiv = container.querySelector(".map-container");
    expect(mapDiv).toBeTruthy();
  });

  it("provides the map instance via context", async () => {
    let contextValue: MapContextValue | null = null;

    render(
      <MapContainer>
        <MapContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </MapContext.Consumer>
      </MapContainer>
    );

    // The Consumer render prop runs after the map's "load" event fires, so
    // contextValue is non-null here. Cast to the declared type so TS does not
    // narrow the closure-assigned variable to `null`.
    expect((contextValue as MapContextValue | null)?.map).toBeTruthy();
  });

  it("renders children", () => {
    const { getByText } = render(
      <MapContainer>
        <div>Test Child</div>
      </MapContainer>
    );
    expect(getByText("Test Child")).toBeTruthy();
  });

  it("uses default viewport when none provided", async () => {
    const maplibregl = await import("maplibre-gl");
    render(
      <MapContainer>
        <div />
      </MapContainer>
    );
    const callArgs = (maplibregl.Map as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.center).toEqual([0, 0]);
    expect(callArgs.zoom).toBe(2);
  });

  it("uses provided initialViewport", async () => {
    const maplibregl = await import("maplibre-gl");
    render(
      <MapContainer initialViewport={{ center: [34.5, 31.5], zoom: 8 }}>
        <div />
      </MapContainer>
    );
    const callArgs = (maplibregl.Map as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.center).toEqual([34.5, 31.5]);
    expect(callArgs.zoom).toBe(8);
  });

  it("cleans up map on unmount", async () => {
    const maplibregl = await import("maplibre-gl");
    const { unmount } = render(
      <MapContainer>
        <div />
      </MapContainer>
    );
    unmount();
    const mockMap = (maplibregl.Map as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(mockMap.remove).toHaveBeenCalled();
  });
});
