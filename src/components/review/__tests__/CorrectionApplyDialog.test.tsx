// src/components/review/__tests__/CorrectionApplyDialog.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CorrectionApplyDialog } from "../CorrectionApplyDialog";
import { makeCorrection } from "../../../pages/review/mockCorrections";

const reviewedCorrection = makeCorrection({
  id: "c1",
  category: "factual_error",
  targetPage: "/evidence/icj-2024-01-26",
  state: "under_review",
  resolution: "update",
});

describe("CorrectionApplyDialog", () => {
  it("confirms before applying", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <CorrectionApplyDialog
        correction={reviewedCorrection}
        open
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Apply correction" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("cancels without applying", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <CorrectionApplyDialog
        correction={reviewedCorrection}
        open
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("renders nothing when closed", () => {
    render(
      <CorrectionApplyDialog
        correction={reviewedCorrection}
        open={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a public log preview for major corrections", () => {
    render(
      <CorrectionApplyDialog
        correction={reviewedCorrection}
        open
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Public log preview")).toBeInTheDocument();
    expect(
      screen.getByText("Factual error (update) on /evidence/icj-2024-01-26."),
    ).toBeInTheDocument();
  });

  it("hides the public log preview for minor corrections", () => {
    const minor = makeCorrection({
      id: "c2",
      category: "broken_link",
      targetPage: "/evidence/icj-2024-01-26",
      state: "under_review",
      resolution: "update",
      isMajor: false,
    });

    render(
      <CorrectionApplyDialog correction={minor} open onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.queryByText("Public log preview")).not.toBeInTheDocument();
  });

  it("warns that removal is irreversible", () => {
    const remove = makeCorrection({
      id: "c3",
      category: "factual_error",
      targetPage: "/evidence/icj-2024-01-26",
      state: "under_review",
      resolution: "remove",
    });

    render(
      <CorrectionApplyDialog correction={remove} open onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByText("Irreversible action")).toBeInTheDocument();
    expect(screen.getByText(/Removing deletes this content from the public page/)).toBeInTheDocument();
  });

  it("warns that downgrading is irreversible", () => {
    const downgrade = makeCorrection({
      id: "c4",
      category: "misleading_framing",
      targetPage: "/evidence/icj-2024-01-26",
      state: "under_review",
      resolution: "downgrade",
    });

    render(
      <CorrectionApplyDialog
        correction={downgrade}
        open
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Irreversible action")).toBeInTheDocument();
    expect(screen.getByText(/Downgrading reduces the prominence of this content/)).toBeInTheDocument();
  });
});
