// src/components/admin/shared/__tests__/TimeRangeSelector.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeRangeSelector } from "../TimeRangeSelector";

describe("TimeRangeSelector", () => {
  it("renders all preset buttons", () => {
    render(<TimeRangeSelector value="24h" onChange={() => {}} />);
    expect(screen.getByText("1 hour")).toBeDefined();
    expect(screen.getByText("24 hours")).toBeDefined();
    expect(screen.getByText("7 days")).toBeDefined();
    expect(screen.getByText("30 days")).toBeDefined();
  });

  it("marks active preset with aria-pressed", () => {
    render(<TimeRangeSelector value="7d" onChange={() => {}} />);
    expect(screen.getByText("7 days").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("24 hours").getAttribute("aria-pressed")).toBe("false");
  });

  it("calls onChange with correct range on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeRangeSelector value="24h" onChange={onChange} />);
    await user.click(screen.getByText("1 hour"));
    expect(onChange).toHaveBeenCalledOnce();
    const call = onChange.mock.calls[0][0];
    expect(call.preset).toBe("1h");
    expect(call.range).toHaveProperty("start");
    expect(call.range).toHaveProperty("end");
  });
});
