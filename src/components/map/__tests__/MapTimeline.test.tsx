import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { MapTimeline } from "../MapTimeline";
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
    date: "2024-06-01",
    ...overrides,
  };
}

const features = [
  makeFeature({ id: "a", title: "Alpha", date: "2024-01-01" }),
  makeFeature({ id: "b", title: "Beta", date: "2024-06-01" }),
  makeFeature({ id: "c", title: "Gamma", date: "2024-12-31" }),
];

function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

describe("MapTimeline", () => {
  let rafCallbacks: Array<() => void>;

  beforeEach(() => {
    rafCallbacks = [];
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function advanceFrame() {
    const cb = rafCallbacks.shift();
    if (cb) act(() => cb());
  }

  it("renders a range slider with min and max bounds from the features", () => {
    const { getByRole, getByLabelText } = render(
      <MapTimeline features={features} onRangeChange={vi.fn()} />
    );

    expect(getByRole("slider")).toBeTruthy();
    expect(getByLabelText("Earliest date").textContent).toBe("2024-01-01");
    expect(getByLabelText("Latest date").textContent).toBe("2024-12-31");
  });

  it("renders three speed options (1x, 2x, 5x)", () => {
    const { getByLabelText } = render(
      <MapTimeline features={features} onRangeChange={vi.fn()} />
    );

    expect(getByLabelText("Speed 1x")).toBeTruthy();
    expect(getByLabelText("Speed 2x")).toBeTruthy();
    expect(getByLabelText("Speed 5x")).toBeTruthy();
  });

  it("calls onRangeChange with the selected end date when the slider moves", () => {
    const onRangeChange = vi.fn();
    const { getByRole } = render(
      <MapTimeline features={features} onRangeChange={onRangeChange} />
    );

    fireEvent.change(getByRole("slider"), { target: { value: "50" } });

    const lastCall = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe("2024-01-01");
    expect(lastCall[1]).toBe("2024-07-01");
  });

  it("initializes to the full date span so all events show", () => {
    const onRangeChange = vi.fn();
    const { getByLabelText } = render(
      <MapTimeline features={features} onRangeChange={onRangeChange} />
    );

    expect(getByLabelText("Range start").textContent).toBe("2024-01-01");
    expect(getByLabelText("Range end").textContent).toBe("2024-12-31");
    expect(onRangeChange).toHaveBeenCalledWith("2024-01-01", "2024-12-31");
  });

  it("toggles play/pause and advances the range on animation frames", () => {
    const onRangeChange = vi.fn();
    const { getByLabelText } = render(
      <MapTimeline features={features} onRangeChange={onRangeChange} />
    );

    fireEvent.click(getByLabelText("Play timeline"));
    expect(getByLabelText("Pause timeline")).toBeTruthy();

    advanceFrame();
    advanceFrame();

    // Range should have advanced past the earliest date.
    expect(getByLabelText("Range end").textContent).not.toBe("2024-01-01");
    const lastCall = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1];
    expect(lastCall[1] > "2024-01-01").toBe(true);
  });

  it("stops playing when the range reaches the latest date", () => {
    const { getByLabelText } = render(
      <MapTimeline features={features} onRangeChange={vi.fn()} />
    );

    fireEvent.click(getByLabelText("Play timeline"));

    // Advance well past the end of the 0..100 slider (100 frames at 1x).
    for (let i = 0; i < 150; i++) advanceFrame();

    expect(getByLabelText("Play timeline")).toBeTruthy();
    expect(getByLabelText("Range end").textContent).toBe("2024-12-31");
  });

  it("does not animate when the user prefers reduced motion", () => {
    stubMatchMedia(true);
    const { getByLabelText, queryByLabelText } = render(
      <MapTimeline features={features} onRangeChange={vi.fn()} />
    );

    fireEvent.click(getByLabelText("Play timeline"));

    // Reduced motion prevents playback entirely.
    expect(queryByLabelText("Pause timeline")).toBeNull();
    expect(getByLabelText("Play timeline")).toBeTruthy();
    expect(rafCallbacks).toHaveLength(0);
  });

  it("does not crash when features are empty", () => {
    const { getByRole } = render(
      <MapTimeline features={[]} onRangeChange={vi.fn()} />
    );

    expect(getByRole("slider")).toBeTruthy();
  });
});
