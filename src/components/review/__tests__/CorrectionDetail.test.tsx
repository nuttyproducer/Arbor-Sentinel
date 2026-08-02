// src/components/review/__tests__/CorrectionDetail.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CorrectionDetail } from "../CorrectionDetail";
import { makeCorrection } from "../../../pages/review/mockCorrections";

const fullCorrection = makeCorrection({
  id: "c1",
  category: "factual_error",
  targetPage: "/evidence/icj-2024-01-26",
  targetSection: "Ruling date",
  description:
    "The ruling date is listed as 27 January 2024; the ICJ order was issued on 26 January 2024.",
  sourceUrl: "https://www.icj-cij.org/case/192",
  state: "new",
});

describe("CorrectionDetail", () => {
  it("shows all correction fields", () => {
    render(
      <CorrectionDetail correction={fullCorrection} onReview={vi.fn()} onEscalate={vi.fn()} />,
    );

    expect(screen.getByText("/evidence/icj-2024-01-26")).toBeInTheDocument();
    expect(screen.getByText("Factual error")).toBeInTheDocument();
    expect(screen.getByText("High priority")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Major")).toBeInTheDocument();
    expect(screen.getByText("Ruling date")).toBeInTheDocument();
    expect(
      screen.getByText(/ruling date is listed as 27 January 2024/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "https://www.icj-cij.org/case/192" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open target page" })).toHaveAttribute(
      "href",
      "/evidence/icj-2024-01-26",
    );
  });

  it("fires onReview for a content resolution with a note", async () => {
    const user = userEvent.setup();
    const onReview = vi.fn();
    render(
      <CorrectionDetail correction={fullCorrection} onReview={onReview} onEscalate={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Update content" }));

    const confirmButton = screen.getByRole("button", { name: "Confirm Update content" });
    expect(confirmButton).toBeDisabled();
    expect(screen.getByText("A note is required for this action.")).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Note (required)"),
      "ICJ order issued on 26 January 2024.",
    );
    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);

    expect(onReview).toHaveBeenCalledWith("update", "ICJ order issued on 26 January 2024.");
  });

  it("fires onReview for a terminal resolution with a note", async () => {
    const user = userEvent.setup();
    const onReview = vi.fn();
    render(
      <CorrectionDetail correction={fullCorrection} onReview={onReview} onEscalate={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Reject correction" }));
    expect(screen.getByText(/Rejecting closes this correction without changes/)).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Note (required)"),
      "Verified against the primary source — no error found.",
    );
    await user.click(screen.getByRole("button", { name: "Confirm Reject correction" }));

    expect(onReview).toHaveBeenCalledWith(
      "reject",
      "Verified against the primary source — no error found.",
    );
  });

  it("fires onEscalate", async () => {
    const user = userEvent.setup();
    const onEscalate = vi.fn();
    render(
      <CorrectionDetail correction={fullCorrection} onReview={vi.fn()} onEscalate={onEscalate} />,
    );

    await user.click(screen.getByRole("button", { name: "Escalate" }));
    expect(onEscalate).toHaveBeenCalled();
  });

  it("surfaces the apply action for a reviewed content correction", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const reviewed = makeCorrection({
      id: "c1",
      category: "legal_wording",
      targetPage: "/legal/icj-gaza",
      state: "under_review",
      resolution: "update",
      resolutionNote: "Awaiting content edit.",
      assignedReviewer: "reviewer-admin",
    });

    render(
      <CorrectionDetail
        correction={reviewed}
        onReview={vi.fn()}
        onEscalate={vi.fn()}
        onApply={onApply}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Apply correction" }));
    expect(onApply).toHaveBeenCalled();
  });

  it("shows no resolution actions for a resolved correction", () => {
    const resolved = makeCorrection({
      id: "c1",
      state: "rejected",
      resolution: "reject",
      resolutionNote: "No error found.",
      resolvedAt: "2026-08-02T10:00:00.000Z",
    });

    render(<CorrectionDetail correction={resolved} onReview={vi.fn()} onEscalate={vi.fn()} />);

    expect(screen.getByText(/This correction is resolved/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Update content" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Apply correction" })).not.toBeInTheDocument();
  });
});
