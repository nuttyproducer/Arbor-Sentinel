import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MapControls } from "../MapControls";
import { MapContext, type MapContextValue } from "../MapContext";
import type { Map } from "maplibre-gl";

function createMockMap() {
  return {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    getZoom: vi.fn(() => 5),
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
    flyTo: vi.fn(),
  };
}

describe("MapControls", () => {
  let mockMap: ReturnType<typeof createMockMap>;

  beforeEach(() => {
    mockMap = createMockMap();
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
        <MapControls />
      </MapContext.Provider>
    );
  }

  it("renders zoom in button", () => {
    const { getByLabelText } = renderWithContext();
    expect(getByLabelText("Zoom in")).toBeTruthy();
  });

  it("calls map.zoomIn on zoom in click", () => {
    const { getByLabelText } = renderWithContext();
    fireEvent.click(getByLabelText("Zoom in"));
    expect(mockMap.zoomIn).toHaveBeenCalled();
  });

  it("renders zoom out button", () => {
    const { getByLabelText } = renderWithContext();
    expect(getByLabelText("Zoom out")).toBeTruthy();
  });

  it("calls map.zoomOut on zoom out click", () => {
    const { getByLabelText } = renderWithContext();
    fireEvent.click(getByLabelText("Zoom out"));
    expect(mockMap.zoomOut).toHaveBeenCalled();
  });

  it("renders reset view button", () => {
    const { getByLabelText } = renderWithContext();
    expect(getByLabelText("Reset map view")).toBeTruthy();
  });

  it("calls map.flyTo on reset view click", () => {
    const { getByLabelText } = renderWithContext();
    fireEvent.click(getByLabelText("Reset map view"));
    expect(mockMap.flyTo).toHaveBeenCalledWith({
      center: [0, 0],
      zoom: 2,
    });
  });

  it("does not crash when map is null", () => {
    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { getByLabelText } = render(
      <MapContext.Provider value={contextValue}>
        <MapControls />
      </MapContext.Provider>
    );

    // Buttons should still render — clicks are no-ops
    fireEvent.click(getByLabelText("Zoom in"));
    expect(mockMap.zoomIn).not.toHaveBeenCalled();
  });
});
