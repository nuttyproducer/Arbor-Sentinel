import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorialChecklist } from "../EditorialChecklist";
import { EDITORIAL_CHECKLIST_ITEMS } from "../../../lib/review/editorialChecklist";
import type { ReviewChecklistResult } from "../../../lib/review/types";

function groupFor(label: string) {
  return screen.getByRole("group", { name: `Result for ${label}` });
}

describe("EditorialChecklist", () => {
  it("renders every editorial checklist item", () => {
    render(
      <EditorialChecklist results={[]} onResultChange={vi.fn()} />,
    );
    for (const item of EDITORIAL_CHECKLIST_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
    expect(screen.getByText("0/8 passed")).toBeInTheDocument();
  });

  it("marks 7 of 8 items as required (clarity is optional)", () => {
    render(
      <EditorialChecklist results={[]} onResultChange={vi.fn()} />,
    );
    expect(screen.getAllByText("Required")).toHaveLength(7);
    const categories = new Set(
      EDITORIAL_CHECKLIST_ITEMS.map((item) => item.category),
    );
    for (const category of categories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it("calls onResultChange with the selected item id when a toggle is pressed", async () => {
    const user = userEvent.setup();
    const onResultChange = vi.fn();
    render(
      <EditorialChecklist results={[]} onResultChange={onResultChange} />,
    );

    await user.click(
      within(groupFor("Evidence supports all claims")).getByRole("button", {
        name: "Pass",
      }),
    );
    expect(onResultChange).toHaveBeenCalledWith("evidence-support", "pass", undefined);
  });

  it("reflects recorded results from props", () => {
    const results: ReviewChecklistResult[] = [
      { itemId: "clarity", result: "na" },
    ];
    render(
      <EditorialChecklist results={results} onResultChange={vi.fn()} />,
    );
    const naButton = within(groupFor("Clarity and readability")).getByRole(
      "button",
      { name: "N/A" },
    );
    expect(naButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("0/8 passed")).toBeInTheDocument();
  });
});
