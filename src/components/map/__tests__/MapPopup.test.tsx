import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MapPopup } from "../MapPopup";
import { MapContext, type MapContextValue } from "../MapContext";

describe("MapPopup", () => {
  it("renders nothing when no selected feature", () => {
    const contextValue: MapContextValue = {
      map: null,
      layerVisibility: {},
      setLayerVisibility: vi.fn(),
      toggleLayerGroup: vi.fn(),
    };

    const { container } = render(
      <MapContext.Provider value={contextValue}>
        <MapPopup />
      </MapContext.Provider>
    );

    expect(container.querySelector("[role=dialog]")).toBeNull();
  });
});
