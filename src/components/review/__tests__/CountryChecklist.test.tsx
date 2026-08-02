import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CountryChecklist } from "../CountryChecklist";
import { COUNTRY_CHECKLIST_ITEMS } from "../../../lib/review/countryChecklist";
import type { ReviewChecklistResult } from "../../../lib/review/types";

function groupFor(label: string) {
  return screen.getByRole("group", { name: `Result for ${label}` });
}

describe("CountryChecklist", () => {
  it("renders every country checklist item", () => {
    render(
      <CountryChecklist results={[]} onResultChange={vi.fn()} />,
    );
    for (const item of COUNTRY_CHECKLIST_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
    expect(screen.getByText("0/9 passed")).toBeInTheDocument();
  });

  it("marks all 9 items as required and groups them by category", () => {
    render(
      <CountryChecklist results={[]} onResultChange={vi.fn()} />,
    );
    expect(screen.getAllByText("Required")).toHaveLength(9);
    const categories = new Set(COUNTRY_CHECKLIST_ITEMS.map((item) => item.category));
    for (const category of categories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it("calls onResultChange with the selected item id when a toggle is pressed", async () => {
    const user = userEvent.setup();
    const onResultChange = vi.fn();
    render(
      <CountryChecklist results={[]} onResultChange={onResultChange} />,
    );

    await user.click(
      within(groupFor("UN voting records verified")).getByRole("button", {
        name: "Pass",
      }),
    );
    expect(onResultChange).toHaveBeenCalledWith("un-voting-verified", "pass", undefined);
  });

  it("reflects recorded results from props", () => {
    const results: ReviewChecklistResult[] = [
      { itemId: "source-dates-current", result: "fail" },
    ];
    render(
      <CountryChecklist results={results} onResultChange={vi.fn()} />,
    );
    const failButton = within(groupFor("Source dates current")).getByRole(
      "button",
      { name: "Fail" },
    );
    expect(failButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("0/9 passed")).toBeInTheDocument();
  });
});
