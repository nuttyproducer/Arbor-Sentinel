import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { LayerGroupControl } from "../LayerGroupControl";
import { MapContext, type MapContextValue } from "../MapContext";
import type { MapLayerConfig } from "../../../lib/map/types";

function makeLayerConfig(overrides: Partial<MapLayerConfig> = {}): MapLayerConfig {
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

describe("LayerGroupControl", () => {
  it("renders a toggle checkbox per layer", () => {
    const layers = [makeLayerConfig({ id: "layer-a", label: "Layer A" }), makeLayerConfig({ id: "layer-b", label: "Layer B", group: "sources" })];

    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { getByLabelText } = render(
      <MapContext.Provider value={contextValue}>
        <LayerGroupControl layers={layers} />
      </MapContext.Provider>
    );

    expect(getByLabelText("Layer A")).toBeTruthy();
    expect(getByLabelText("Layer B")).toBeTruthy();
  });

  it("calls toggleLayerGroup when a group header is clicked", () => {
    const layers = [makeLayerConfig({ id: "layer-a", group: "events" })];

    const toggleLayerGroup = vi.fn();
    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup,
    };

    const { getByText } = render(
      <MapContext.Provider value={contextValue}>
        <LayerGroupControl layers={layers} />
      </MapContext.Provider>
    );

    fireEvent.click(getByText("Events"));
    expect(toggleLayerGroup).toHaveBeenCalledWith("events");
  });

  it("calls setLayerVisibility when individual layer checkbox is toggled", () => {
    const setLayerVisibility = vi.fn();
    const layers = [makeLayerConfig({ id: "layer-a", label: "Layer A" })];

    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: { "layer-a": true },
      setLayerVisibility,
      toggleLayerGroup: vi.fn(),
    };

    const { getByLabelText } = render(
      <MapContext.Provider value={contextValue}>
        <LayerGroupControl layers={layers} />
      </MapContext.Provider>
    );

    fireEvent.click(getByLabelText("Layer A"));
    expect(setLayerVisibility).toHaveBeenCalledWith("layer-a", false);
  });

  it("renders sub-layers when a layer has subLayers", () => {
    const layers = [
      makeLayerConfig({
        id: "parent",
        label: "Parent",
        subLayers: [makeLayerConfig({ id: "child", label: "Child" })],
      }),
    ];

    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { getByLabelText } = render(
      <MapContext.Provider value={contextValue}>
        <LayerGroupControl layers={layers} />
      </MapContext.Provider>
    );

    expect(getByLabelText("Child")).toBeTruthy();
  });
});
