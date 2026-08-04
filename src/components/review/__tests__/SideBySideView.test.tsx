import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SideBySideView } from "../SideBySideView";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

/** jsdom has no layout engine — give elements a settable scrollTop. */
function allowScrollTop(element: HTMLElement) {
  Object.defineProperty(element, "scrollTop", { writable: true, value: 0 });
}

describe("SideBySideView", () => {
  it("renders both panel labels", () => {
    render(
      <SideBySideView
        leftLabel="Original"
        rightLabel="Translation"
        leftContent="left text"
        rightContent="right text"
      />,
    );
    expect(screen.getByText("Original")).toBeInTheDocument();
    expect(screen.getByText("Translation")).toBeInTheDocument();
  });

  it("renders left and right content", () => {
    render(
      <SideBySideView
        leftLabel="Original"
        rightLabel="Translation"
        leftContent={<p>Original paragraph</p>}
        rightContent={<p>Translated paragraph</p>}
      />,
    );
    expect(screen.getByText("Original paragraph")).toBeInTheDocument();
    expect(screen.getByText("Translated paragraph")).toBeInTheDocument();
  });

  it("synchronizes scrollTop between the two panels", () => {
    render(
      <SideBySideView
        leftLabel="Original"
        rightLabel="Translation"
        leftContent="left text"
        rightContent="right text"
      />,
    );
    const leftPanel = screen.getByTestId("side-by-side-left");
    const rightPanel = screen.getByTestId("side-by-side-right");
    allowScrollTop(leftPanel);
    allowScrollTop(rightPanel);

    leftPanel.scrollTop = 42;
    fireEvent.scroll(leftPanel);
    expect(rightPanel.scrollTop).toBe(42);

    rightPanel.scrollTop = 96;
    fireEvent.scroll(rightPanel);
    expect(leftPanel.scrollTop).toBe(96);
  });

  it("wraps highlighted ranges on the matching side in a <mark>", () => {
    render(
      <SideBySideView
        leftLabel="Original"
        rightLabel="Translation"
        leftContent="The quick brown fox"
        rightContent="Le renard brun rapide"
        highlights={[{ start: 4, end: 9, side: "left" }]}
      />,
    );
    const mark = screen.getByText("quick");
    expect(mark.tagName).toBe("MARK");
    expect(mark.className).toContain("bg-amber/30");
    // Right side stays plain text — no marks.
    expect(screen.getByText("Le renard brun rapide").tagName).not.toBe("MARK");
  });

  it("renders non-string content without applying highlights", () => {
    render(
      <SideBySideView
        leftLabel="Original"
        rightLabel="Translation"
        leftContent={<p>Custom node</p>}
        rightContent="right text"
        highlights={[{ start: 0, end: 5, side: "left" }]}
      />,
    );
    expect(screen.getByText("Custom node")).toBeInTheDocument();
    expect(screen.getByText("Custom node").tagName).toBe("P");
  });

  it("uses smooth scroll behaviour by default", () => {
    render(
      <SideBySideView
        leftLabel="Original"
        rightLabel="Translation"
        leftContent="left text"
        rightContent="right text"
      />,
    );
    expect(screen.getByTestId("side-by-side-left").style.scrollBehavior).toBe(
      "smooth",
    );
  });

  it("disables smooth scrolling when prefers-reduced-motion is set", () => {
    mockMatchMedia(true);
    render(
      <SideBySideView
        leftLabel="Original"
        rightLabel="Translation"
        leftContent="left text"
        rightContent="right text"
      />,
    );
    expect(screen.getByTestId("side-by-side-left").style.scrollBehavior).toBe(
      "auto",
    );
  });

  it("resizes the panels with arrow keys on the separator", async () => {
    const user = userEvent.setup();
    render(
      <SideBySideView
        leftLabel="Original"
        rightLabel="Translation"
        leftContent="left text"
        rightContent="right text"
      />,
    );
    const handle = screen.getByRole("separator", {
      name: "Resize comparison panels",
    });
    const before = Number(handle.getAttribute("aria-valuenow"));

    await user.click(handle);
    await user.keyboard("{ArrowLeft}");

    const after = Number(handle.getAttribute("aria-valuenow"));
    expect(after).toBeLessThan(before);
  });
});
