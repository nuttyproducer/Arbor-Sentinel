import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MapLegend } from "../MapLegend";
import { MapContext, type MapContextValue } from "../MapContext";
import type { MapLayerConfig } from "../../../lib/map/types";

function makeConfig(overrides: Partial<MapLayerConfig> = {}): MapLayerConfig {
  return {
    id: "test-layer",
    group: "events",
    label: "Test Layer",
    features: [],
    style: { color: "#FF0000" },
    defaultVisible: true,
    ...overrides,
  };
}

describe("MapLegend", () => {
  it("renders visible layers with color swatches", () => {
    const layers = [makeConfig({ id: "a", label: "Layer A", style: { color: "#FF0000" } })];

    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: { a: true },
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { getByText } = render(
      <MapContext.Provider value={contextValue}>
        <MapLegend layers={layers} />
      </MapContext.Provider>
    );

    expect(getByText("Layer A")).toBeTruthy();
  });

  it("does not render hidden layers", () => {
    const layers = [makeConfig({ id: "a", label: "Hidden" })];

    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: { a: false },
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { queryByText } = render(
      <MapContext.Provider value={contextValue}>
        <MapLegend layers={layers} />
      </MapContext.Provider>
    );

    expect(queryByText("Hidden")).toBeNull();
  });

  it("renders nothing when no layers are visible", () => {
    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { container } = render(
      <MapContext.Provider value={contextValue}>
        <MapLegend layers={[makeConfig({ defaultVisible: false })]} />
      </MapContext.Provider>
    );

    // The component returns null — no DOM
    expect(container.querySelector("[aria-label='Map legend']")).toBeNull();
  });
});
