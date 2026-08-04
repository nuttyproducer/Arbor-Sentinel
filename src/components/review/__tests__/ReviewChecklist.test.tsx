import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewChecklist } from "../ReviewChecklist";
import type {
  ReviewChecklistItem,
  ReviewChecklistResult,
} from "../../../lib/review/types";

const ITEMS: ReviewChecklistItem[] = [
  {
    id: "legal-status",
    label: "Legal status accuracy",
    description: "Label uses correct controlled vocabulary",
    required: true,
    category: "Legal Terminology",
  },
  {
    id: "terminology",
    label: "Terminology policy compliance",
    description: "Terms match Legal Language Policy",
    required: true,
    category: "Legal Terminology",
  },
  {
    id: "attribution",
    label: "Source attribution correct",
    description: "Conclusions attributed to the issuing body",
    required: true,
    category: "Attribution",
  },
];

function groupFor(label: string) {
  return screen.getByRole("group", { name: `Result for ${label}` });
}

describe("ReviewChecklist", () => {
  it("groups items by category", () => {
    render(
      <ReviewChecklist
        items={ITEMS}
        results={[]}
        onResultChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Legal Terminology")).toBeInTheDocument();
    expect(screen.getByText("Attribution")).toBeInTheDocument();
  });

  it("shows a progress indicator of passed items", () => {
    const results: ReviewChecklistResult[] = [
      { itemId: "legal-status", result: "pass" },
      { itemId: "attribution", result: "fail" },
    ];
    render(
      <ReviewChecklist
        items={ITEMS}
        results={results}
        onResultChange={vi.fn()}
      />,
    );
    expect(screen.getByText("1/3 passed")).toBeInTheDocument();
  });

  it("marks required items", () => {
    render(
      <ReviewChecklist
        items={ITEMS}
        results={[]}
        onResultChange={vi.fn()}
      />,
    );
    expect(screen.getAllByText("Required")).toHaveLength(3);
  });

  it("calls onResultChange when a result toggle is pressed", async () => {
    const user = userEvent.setup();
    const onResultChange = vi.fn();
    render(
      <ReviewChecklist
        items={ITEMS}
        results={[]}
        onResultChange={onResultChange}
      />,
    );

    await user.click(
      within(groupFor("Terminology policy compliance")).getByRole("button", {
        name: "Pass",
      }),
    );
    expect(onResultChange).toHaveBeenCalledWith("terminology", "pass", undefined);

    await user.click(
      within(groupFor("Legal status accuracy")).getByRole("button", {
        name: "Fail",
      }),
    );
    expect(onResultChange).toHaveBeenCalledWith("legal-status", "fail", undefined);
  });

  it("reflects the selected result via aria-pressed", () => {
    const results: ReviewChecklistResult[] = [
      { itemId: "legal-status", result: "na" },
    ];
    render(
      <ReviewChecklist
        items={ITEMS}
        results={results}
        onResultChange={vi.fn()}
      />,
    );
    const naButton = within(groupFor("Legal status accuracy")).getByRole(
      "button",
      { name: "N/A" },
    );
    expect(naButton).toHaveAttribute("aria-pressed", "true");
  });

  it("includes a typed note when a result is toggled", async () => {
    const user = userEvent.setup();
    const onResultChange = vi.fn();
    render(
      <ReviewChecklist
        items={ITEMS}
        results={[]}
        onResultChange={onResultChange}
      />,
    );

    const textarea = screen.getByLabelText("Note for Legal status accuracy");
    await user.type(textarea, "Needs work");

    // No result selected yet — nothing persisted, note buffered locally.
    expect(onResultChange).not.toHaveBeenCalled();

    await user.click(
      within(groupFor("Legal status accuracy")).getByRole("button", {
        name: "Pass",
      }),
    );
    expect(onResultChange).toHaveBeenCalledWith("legal-status", "pass", "Needs work");
  });

  it("persists note edits immediately when a result is already set", async () => {
    const user = userEvent.setup();
    const onResultChange = vi.fn();
    const results: ReviewChecklistResult[] = [
      { itemId: "legal-status", result: "fail" },
    ];
    render(
      <ReviewChecklist
        items={ITEMS}
        results={results}
        onResultChange={onResultChange}
      />,
    );

    const textarea = screen.getByLabelText("Note for Legal status accuracy");
    await user.type(textarea, "See attachment");
    expect(onResultChange).toHaveBeenLastCalledWith(
      "legal-status",
      "fail",
      "See attachment",
    );
  });

  it("disables toggles and note inputs in readonly mode", () => {
    render(
      <ReviewChecklist
        items={ITEMS}
        results={[]}
        onResultChange={vi.fn()}
        readonly
      />,
    );
    expect(
      within(groupFor("Legal status accuracy")).getByRole("button", {
        name: "Pass",
      }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Note for Legal status accuracy")).toBeDisabled();
  });

  it("renders an empty state when no items are provided", () => {
    render(
      <ReviewChecklist items={[]} results={[]} onResultChange={vi.fn()} />,
    );
    expect(
      screen.getByText("No checklist items are defined for this review."),
    ).toBeInTheDocument();
  });
});
