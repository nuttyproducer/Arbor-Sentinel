import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TranslationChecklist } from "../TranslationChecklist";
import { TRANSLATION_CHECKLIST_ITEMS } from "../../../lib/review/translationChecklist";
import type { ReviewChecklistResult } from "../../../lib/review/types";

function groupFor(label: string) {
  return screen.getByRole("group", { name: `Result for ${label}` });
}

describe("TranslationChecklist", () => {
  it("renders every translation checklist item", () => {
    render(
      <TranslationChecklist results={[]} onResultChange={vi.fn()} />,
    );
    for (const item of TRANSLATION_CHECKLIST_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
    expect(screen.getByText("0/8 passed")).toBeInTheDocument();
  });

  it("marks 7 of 8 items as required (tone-match is optional)", () => {
    render(
      <TranslationChecklist results={[]} onResultChange={vi.fn()} />,
    );
    expect(screen.getAllByText("Required")).toHaveLength(7);
    const categories = new Set(
      TRANSLATION_CHECKLIST_ITEMS.map((item) => item.category),
    );
    for (const category of categories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it("calls onResultChange with the selected item id when a toggle is pressed", async () => {
    const user = userEvent.setup();
    const onResultChange = vi.fn();
    render(
      <TranslationChecklist results={[]} onResultChange={onResultChange} />,
    );

    await user.click(
      within(groupFor("Original meaning preserved")).getByRole("button", {
        name: "Pass",
      }),
    );
    expect(onResultChange).toHaveBeenCalledWith("meaning-preserved", "pass", undefined);
  });

  it("reflects recorded results from props", () => {
    const results: ReviewChecklistResult[] = [
      { itemId: "tone-match", result: "na" },
    ];
    render(
      <TranslationChecklist results={results} onResultChange={vi.fn()} />,
    );
    const naButton = within(groupFor("Tone matches editorial standards")).getByRole(
      "button",
      { name: "N/A" },
    );
    expect(naButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("0/8 passed")).toBeInTheDocument();
  });
});
