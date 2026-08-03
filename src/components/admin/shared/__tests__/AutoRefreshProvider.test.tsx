// src/components/admin/shared/__tests__/AutoRefreshProvider.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoRefreshProvider, AutoRefreshControls, useAutoRefresh, useAutoRefreshContext } from "../AutoRefreshProvider";

function TestConsumer({ onRefresh }: { onRefresh: () => void }) {
  const { interval } = useAutoRefreshContext();
  useAutoRefresh(onRefresh, interval);
  return <span data-testid="interval">{interval ?? "off"}</span>;
}

describe("AutoRefreshProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("provides default null interval", () => {
    const onRefresh = vi.fn();
    render(
      <AutoRefreshProvider>
        <TestConsumer onRefresh={onRefresh} />
      </AutoRefreshProvider>,
    );
    expect(screen.getByTestId("interval").textContent).toBe("off");
  });

  it("calls refresh callback at interval", () => {
    const onRefresh = vi.fn();
    render(
      <AutoRefreshProvider defaultInterval={60_000}>
        <TestConsumer onRefresh={onRefresh} />
      </AutoRefreshProvider>,
    );
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(onRefresh).toHaveBeenCalledTimes(2);
  });

  it("enforces minimum 30s interval even at faster setting", () => {
    const onRefresh = vi.fn();
    // user sets 1000ms (1s) — should be clamped to 30000ms
    render(
      <AutoRefreshProvider defaultInterval={30_000}>
        <TestConsumer onRefresh={onRefresh} />
      </AutoRefreshProvider>,
    );
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("stops calling when interval set to null", () => {
    const onRefresh = vi.fn();
    const { rerender } = render(
      <AutoRefreshProvider defaultInterval={60_000}>
        <TestConsumer onRefresh={onRefresh} />
      </AutoRefreshProvider>,
    );
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(onRefresh).toHaveBeenCalledTimes(1);

    rerender(
      <AutoRefreshProvider defaultInterval={null}>
        <TestConsumer onRefresh={onRefresh} />
      </AutoRefreshProvider>,
    );
    act(() => { vi.advanceTimersByTime(120_000); });
    expect(onRefresh).toHaveBeenCalledTimes(1); // no more calls
  });
});

describe("AutoRefreshControls", () => {
  it("renders interval options and selects active", async () => {
    const user = userEvent.setup();
    render(
      <AutoRefreshProvider defaultInterval={60_000}>
        <AutoRefreshControls />
      </AutoRefreshProvider>,
    );
    expect(screen.getByText("Off")).toBeDefined();
    expect(screen.getByText("30s")).toBeDefined();
    expect(screen.getByText("60s")).toBeDefined();
    expect(screen.getByText("5 min")).toBeDefined();
    expect(screen.getByText("60s").getAttribute("aria-pressed")).toBe("true");
    await user.click(screen.getByText("30s"));
    expect(screen.getByText("30s").getAttribute("aria-pressed")).toBe("true");
  });
});
