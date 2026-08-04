import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstitutionChecklist } from "../InstitutionChecklist";
import { INSTITUTION_CHECKLIST_ITEMS } from "../../../lib/review/institutionChecklist";
import type { ReviewChecklistResult } from "../../../lib/review/types";

function groupFor(label: string) {
  return screen.getByRole("group", { name: `Result for ${label}` });
}

describe("InstitutionChecklist", () => {
  it("renders every institution checklist item", () => {
    render(
      <InstitutionChecklist results={[]} onResultChange={vi.fn()} />,
    );
    for (const item of INSTITUTION_CHECKLIST_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
    expect(screen.getByText("0/7 passed")).toBeInTheDocument();
  });

  it("marks all 7 items as required and groups them by category", () => {
    render(
      <InstitutionChecklist results={[]} onResultChange={vi.fn()} />,
    );
    expect(screen.getAllByText("Required")).toHaveLength(7);
    const categories = new Set(INSTITUTION_CHECKLIST_ITEMS.map((item) => item.category));
    for (const category of categories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it("calls onResultChange with the selected item id when a toggle is pressed", async () => {
    const user = userEvent.setup();
    const onResultChange = vi.fn();
    render(
      <InstitutionChecklist results={[]} onResultChange={onResultChange} />,
    );

    await user.click(
      within(groupFor("Institutional role accurate")).getByRole("button", {
        name: "Pass",
      }),
    );
    expect(onResultChange).toHaveBeenCalledWith("role-accuracy", "pass", undefined);
  });

  it("reflects recorded results from props", () => {
    const results: ReviewChecklistResult[] = [
      { itemId: "eu-distinctions", result: "pass" },
    ];
    render(
      <InstitutionChecklist results={results} onResultChange={vi.fn()} />,
    );
    const passButton = within(groupFor("EU-specific distinctions")).getByRole(
      "button",
      { name: "Pass" },
    );
    expect(passButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1/7 passed")).toBeInTheDocument();
  });
});
