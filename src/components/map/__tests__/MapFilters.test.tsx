import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MapFilters, type FilterState } from "../MapFilters";
import type { MapFeature, SafeCoordinate } from "../../../lib/map/types";

const safeCoord = (lat: number, lon: number): SafeCoordinate =>
  ({ lat, lon, precision: "city" }) as SafeCoordinate;

type FeatureOverrides = Partial<MapFeature> & { verificationLevel?: string };

function makeFeature(overrides: FeatureOverrides = {}): MapFeature {
  return {
    id: "f1",
    type: "event",
    category: "legal_proceeding",
    title: "Test Event",
    safeCoordinate: safeCoord(31.5, 34.5),
    sourceIds: [],
    isSensitive: false,
    date: "2024-01-15",
    ...overrides,
  } as MapFeature;
}

const features = [
  makeFeature({
    id: "a",
    type: "event",
    category: "legal_proceeding",
    verificationLevel: "3",
    date: "2024-01-01",
  }),
  makeFeature({
    id: "b",
    type: "event",
    category: "casualty_event",
    verificationLevel: "2",
    date: "2024-06-01",
  }),
  makeFeature({
    id: "c",
    type: "source",
    category: "legal_proceeding",
    verificationLevel: "4",
    date: "2024-12-31",
  }),
];

function lastFilterState(onFiltersChange: ReturnType<typeof vi.fn>): FilterState {
  const calls = onFiltersChange.mock.calls;
  return calls[calls.length - 1][0] as FilterState;
}

describe("MapFilters", () => {
  it("renders a checkbox per unique category", () => {
    const { getByLabelText } = render(
      <MapFilters features={features} onFiltersChange={vi.fn()} />
    );

    expect(getByLabelText("Filter category legal_proceeding")).toBeTruthy();
    expect(getByLabelText("Filter category casualty_event")).toBeTruthy();
  });

  it("renders a checkbox per unique source type", () => {
    const { getByLabelText } = render(
      <MapFilters features={features} onFiltersChange={vi.fn()} />
    );

    expect(getByLabelText("Filter source type event")).toBeTruthy();
    expect(getByLabelText("Filter source type source")).toBeTruthy();
  });

  it("renders a checkbox per unique verification level", () => {
    const { getByLabelText } = render(
      <MapFilters features={features} onFiltersChange={vi.fn()} />
    );

    expect(getByLabelText("Filter verification level 3")).toBeTruthy();
    expect(getByLabelText("Filter verification level 2")).toBeTruthy();
    expect(getByLabelText("Filter verification level 4")).toBeTruthy();
  });

  it("renders date range inputs", () => {
    const { getByLabelText } = render(
      <MapFilters features={features} onFiltersChange={vi.fn()} />
    );

    expect(getByLabelText("Filter start date")).toBeTruthy();
    expect(getByLabelText("Filter end date")).toBeTruthy();
  });

  it("calls onFiltersChange with the selected category when a checkbox is toggled", () => {
    const onFiltersChange = vi.fn();
    const { getByLabelText } = render(
      <MapFilters features={features} onFiltersChange={onFiltersChange} />
    );

    fireEvent.click(getByLabelText("Filter category legal_proceeding"));

    const state = lastFilterState(onFiltersChange);
    expect(state.categories.has("legal_proceeding")).toBe(true);
    expect(state.categories.has("casualty_event")).toBe(false);
  });

  it("calls onFiltersChange with the selected source type and verification level", () => {
    const onFiltersChange = vi.fn();
    const { getByLabelText } = render(
      <MapFilters features={features} onFiltersChange={onFiltersChange} />
    );

    fireEvent.click(getByLabelText("Filter source type source"));
    fireEvent.click(getByLabelText("Filter verification level 4"));

    const state = lastFilterState(onFiltersChange);
    expect(state.sourceTypes.has("source")).toBe(true);
    expect(state.verificationLevels.has("4")).toBe(true);
  });

  it("calls onFiltersChange with the date range when date inputs change", () => {
    const onFiltersChange = vi.fn();
    const { getByLabelText } = render(
      <MapFilters features={features} onFiltersChange={onFiltersChange} />
    );

    fireEvent.change(getByLabelText("Filter start date"), {
      target: { value: "2024-02-01" },
    });
    fireEvent.change(getByLabelText("Filter end date"), {
      target: { value: "2024-11-01" },
    });

    const state = lastFilterState(onFiltersChange);
    expect(state.dateStart).toBe("2024-02-01");
    expect(state.dateEnd).toBe("2024-11-01");
  });

  it("clear all resets every filter group", () => {
    const onFiltersChange = vi.fn();
    const { getByLabelText, getByRole } = render(
      <MapFilters features={features} onFiltersChange={onFiltersChange} />
    );

    fireEvent.click(getByLabelText("Filter category legal_proceeding"));
    fireEvent.click(getByLabelText("Filter source type event"));
    fireEvent.click(getByLabelText("Filter verification level 2"));
    fireEvent.change(getByLabelText("Filter start date"), {
      target: { value: "2024-01-01" },
    });

    fireEvent.click(getByRole("button", { name: /clear all/i }));

    const state = lastFilterState(onFiltersChange);
    expect(state.categories.size).toBe(0);
    expect(state.sourceTypes.size).toBe(0);
    expect(state.verificationLevels.size).toBe(0);
    expect(state.dateStart).toBe("");
    expect(state.dateEnd).toBe("");
  });

  it("does not crash with empty features", () => {
    const { getByRole } = render(
      <MapFilters features={[]} onFiltersChange={vi.fn()} />
    );

    // No category checkboxes, but the clear button still renders.
    expect(getByRole("button", { name: /clear all/i })).toBeTruthy();
  });
});
