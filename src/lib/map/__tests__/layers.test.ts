import { describe, it, expect } from "vitest";
import { createLayerSpec, getLayerStyle, EVENT_CATEGORY_COLORS, SOURCE_CATEGORY_COLORS, ORG_CATEGORY_COLORS } from "../layers";
import type { MapLayerConfig } from "../types";

function makeConfig(overrides: Partial<MapLayerConfig> = {}): MapLayerConfig {
  return {
    id: "test-layer",
    group: "events",
    label: "Test Layer",
    features: [],
    style: { color: "#FF0000", radius: 8 },
    defaultVisible: true,
    ...overrides,
  };
}

describe("createLayerSpec", () => {
  it("creates a circle layer for point features", () => {
    const config = makeConfig();
    const spec = createLayerSpec(config, "test-source");
    expect(spec.id).toBe("test-layer");
    expect(spec.source).toBe("test-source");
    expect(spec.type).toBe("circle");
  });

  it("applies style color and radius to paint properties", () => {
    const config = makeConfig({ style: { color: "#3B6EA8", radius: 12 } });
    const spec = createLayerSpec(config, "test-source");
    if (spec.type !== "circle") {
      throw new Error("Expected circle layer");
    }
    expect(spec.paint).toBeDefined();
    if (spec.paint) {
      expect(spec.paint["circle-color"]).toBe("#3B6EA8");
      expect(spec.paint["circle-radius"]).toBe(12);
    }
  });

  it("sets visibility based on config.defaultVisible", () => {
    const visible = createLayerSpec(makeConfig({ defaultVisible: true }), "src");
    const hidden = createLayerSpec(makeConfig({ defaultVisible: false }), "src");
    if (visible.layout) {
      expect(visible.layout.visibility).toBe("visible");
    }
    if (hidden.layout) {
      expect(hidden.layout.visibility).toBe("none");
    }
  });
});

describe("getLayerStyle", () => {
  it("returns the correct color for a known category", () => {
    const style = getLayerStyle("legal_proceeding");
    expect(style).toBeDefined();
    expect(style.color).toBe(EVENT_CATEGORY_COLORS["legal_proceeding"]);
  });

  it("returns a fallback style for unknown categories", () => {
    const style = getLayerStyle("unknown_category" as never);
    expect(style).toBeDefined();
    expect(style.color).toBe("#999999");
    expect(style.radius).toBe(6);
  });
});

describe("color maps", () => {
  it("EVENT_CATEGORY_COLORS covers all event categories", () => {
    expect(Object.keys(EVENT_CATEGORY_COLORS)).toHaveLength(6);
  });

  it("SOURCE_CATEGORY_COLORS covers all source categories", () => {
    expect(Object.keys(SOURCE_CATEGORY_COLORS).length).toBeGreaterThanOrEqual(5);
  });

  it("ORG_CATEGORY_COLORS covers all organization categories", () => {
    expect(Object.keys(ORG_CATEGORY_COLORS).length).toBeGreaterThanOrEqual(5);
  });
});
