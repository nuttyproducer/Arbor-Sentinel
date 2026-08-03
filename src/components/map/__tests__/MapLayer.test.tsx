import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MapLayer } from "../MapLayer";
import { MapContext, type MapContextValue } from "../MapContext";
import type { Map } from "maplibre-gl";
import type { MapLayerConfig, SafeCoordinate } from "../../../lib/map/types";

const safeCoord = (lat: number, lon: number): SafeCoordinate =>
  ({ lat, lon, precision: "city" }) as SafeCoordinate;

function createMockMap() {
  const layers: string[] = [];
  const sources: Record<string, unknown> = {};
  return {
    addSource: vi.fn((id: string, spec: unknown) => {
      // GeoJSON sources expose setData() — the M1 fix relies on it.
      sources[id] = { ...(spec as object), setData: vi.fn() };
    }),
    addLayer: vi.fn((spec: { id: string }) => { layers.push(spec.id); }),
    removeLayer: vi.fn((id: string) => {
      const idx = layers.indexOf(id);
      if (idx >= 0) layers.splice(idx, 1);
    }),
    removeSource: vi.fn((id: string) => { delete sources[id]; }),
    setPaintProperty: vi.fn(),
    setLayoutProperty: vi.fn(),
    getLayer: vi.fn((id: string) => (layers.includes(id) ? {} : undefined)),
    getSource: vi.fn((id: string) => sources[id]),
    _layers: layers,
    _sources: sources,
  };
}

function makeConfig(overrides: Partial<MapLayerConfig> = {}): MapLayerConfig {
  return {
    id: "test-layer",
    group: "events",
    label: "Test",
    features: [
      {
        id: "f1",
        type: "event",
        category: "legal_proceeding",
        title: "Test Event",
        safeCoordinate: safeCoord(52, 4),
        sourceIds: [],
        isSensitive: false,
      },
    ],
    style: { color: "#FF0000", radius: 8 },
    defaultVisible: true,
    ...overrides,
  };
}

describe("MapLayer", () => {
  let mockMap: ReturnType<typeof createMockMap>;

  beforeEach(() => {
    mockMap = createMockMap();
  });

  function renderWithContext(config: MapLayerConfig, visible = true) {
    const contextValue: MapContextValue = {
      map: mockMap as unknown as Map,
      layerVisibility: { [config.id]: visible },
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    return render(
      <MapContext.Provider value={contextValue}>
        <MapLayer config={config} visible={visible} />
      </MapContext.Provider>
    );
  }

  it("adds a GeoJSON source and circle layer on mount", () => {
    renderWithContext(makeConfig());
    expect(mockMap.addSource).toHaveBeenCalled();
    expect(mockMap.addLayer).toHaveBeenCalled();
    const sourceId = mockMap.addSource.mock.calls[0][0];
    expect(sourceId).toContain("test-layer");
    expect(sourceId).toContain("source");
  });

  it("returns null (zero-render)", () => {
    const { container } = renderWithContext(makeConfig());
    expect(container.innerHTML).toBe("");
  });

  it("cleans up layer and source on unmount", () => {
    const { unmount } = renderWithContext(makeConfig());
    unmount();
    expect(mockMap.removeLayer).toHaveBeenCalled();
    expect(mockMap.removeSource).toHaveBeenCalled();
  });

  it("updates visibility when visible prop changes", () => {
    const config = makeConfig();
    const { rerender } = renderWithContext(config, true);

    const contextValue: MapContextValue = {
      map: mockMap as unknown as Map,
      layerVisibility: { [config.id]: false },
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    rerender(
      <MapContext.Provider value={contextValue}>
        <MapLayer config={config} visible={false} />
      </MapContext.Provider>
    );

    expect(mockMap.setLayoutProperty).toHaveBeenCalledWith(
      "test-layer",
      "visibility",
      "none"
    );
  });

  it("updates source data when config.features change", () => {
    const configA = makeConfig();
    const { rerender } = renderWithContext(configA, true);

    const configB = makeConfig({
      features: [
        {
          ...configA.features[0],
          id: "f2",
          title: "Changed",
          safeCoordinate: safeCoord(51, 3),
        },
      ],
    });

    const contextValue: MapContextValue = {
      map: mockMap as unknown as Map,
      layerVisibility: { [configB.id]: true },
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    rerender(
      <MapContext.Provider value={contextValue}>
        <MapLayer config={configB} visible />
      </MapContext.Provider>
    );

    const sourceId = "test-layer--source";
    const source = mockMap.getSource(sourceId) as unknown as {
      setData: ReturnType<typeof vi.fn>;
    };
    expect(source.setData).toHaveBeenCalled();
  });

  it("updates paint properties when config.style changes", () => {
    const configA = makeConfig();
    const { rerender } = renderWithContext(configA, true);

    const configB = makeConfig({ style: { color: "#00FF00", radius: 12 } });

    const contextValue: MapContextValue = {
      map: mockMap as unknown as Map,
      layerVisibility: { [configB.id]: true },
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    rerender(
      <MapContext.Provider value={contextValue}>
        <MapLayer config={configB} visible />
      </MapContext.Provider>
    );

    expect(mockMap.setPaintProperty).toHaveBeenCalledWith(
      "test-layer",
      "circle-color",
      "#00FF00"
    );
    expect(mockMap.setPaintProperty).toHaveBeenCalledWith(
      "test-layer",
      "circle-radius",
      12
    );
  });

  it("does nothing when map is null", () => {
    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { unmount } = render(
      <MapContext.Provider value={contextValue}>
        <MapLayer config={makeConfig()} visible />
      </MapContext.Provider>
    );

    expect(mockMap.addSource).not.toHaveBeenCalled();
    unmount(); // should not throw
  });

  it("adds the source/layer once map becomes available (async load)", () => {
    // MapContainer starts with map=null and populates it after the "load"
    // event. MapLayer must attach the source/layer when the map arrives,
    // not only on the initial (null) mount.
    const contextValue: MapContextValue = {
      map: mockMap as unknown as Map,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { rerender } = render(
      <MapContext.Provider value={{ ...contextValue, map: null }}>
        <MapLayer config={makeConfig()} visible />
      </MapContext.Provider>
    );

    expect(mockMap.addSource).not.toHaveBeenCalled();

    rerender(
      <MapContext.Provider value={contextValue}>
        <MapLayer config={makeConfig()} visible />
      </MapContext.Provider>
    );

    expect(mockMap.addSource).toHaveBeenCalled();
    expect(mockMap.addLayer).toHaveBeenCalled();
  });
});
