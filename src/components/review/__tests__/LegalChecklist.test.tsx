import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LegalChecklist } from "../LegalChecklist";
import { LEGAL_CHECKLIST_ITEMS } from "../../../lib/review/legalChecklist";
import type { ReviewChecklistResult } from "../../../lib/review/types";

function groupFor(label: string) {
  return screen.getByRole("group", { name: `Result for ${label}` });
}

describe("LegalChecklist", () => {
  it("renders every legal checklist item", () => {
    render(
      <LegalChecklist results={[]} onResultChange={vi.fn()} />,
    );
    for (const item of LEGAL_CHECKLIST_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
    expect(screen.getByText("0/8 passed")).toBeInTheDocument();
  });

  it("renders all 8 items as required and groups them by category", () => {
    render(
      <LegalChecklist results={[]} onResultChange={vi.fn()} />,
    );
    expect(screen.getAllByText("Required")).toHaveLength(8);
    const categories = new Set(LEGAL_CHECKLIST_ITEMS.map((item) => item.category));
    for (const category of categories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it("calls onResultChange with the selected item id when a toggle is pressed", async () => {
    const user = userEvent.setup();
    const onResultChange = vi.fn();
    render(<LegalChecklist results={[]} onResultChange={onResultChange} />);

    await user.click(
      within(groupFor("Legal status accuracy")).getByRole("button", {
        name: "Pass",
      }),
    );
    expect(onResultChange).toHaveBeenCalledWith(
      "legal-status-accuracy",
      "pass",
      undefined,
    );
  });

  it("reflects recorded results from props", () => {
    const results: ReviewChecklistResult[] = [
      { itemId: "source-attribution", result: "fail" },
    ];
    render(
      <LegalChecklist results={results} onResultChange={vi.fn()} />,
    );
    const failButton = within(groupFor("Source attribution correct")).getByRole(
      "button",
      { name: "Fail" },
    );
    expect(failButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("0/8 passed")).toBeInTheDocument();
  });
});
