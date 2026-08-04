import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewActions } from "../ReviewActions";
import type { ReviewState } from "../../../lib/review/types";

describe("ReviewActions", () => {
  it("renders the current state", () => {
    render(
      <ReviewActions
        currentState="in_review"
        validTransitions={["approved"]}
        onAction={vi.fn()}
      />,
    );
    expect(screen.getByText("in_review")).toBeInTheDocument();
  });

  it("renders an action button for each valid transition", () => {
    render(
      <ReviewActions
        currentState="in_review"
        validTransitions={["changes_requested", "approved", "rejected"]}
        onAction={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Request changes" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("fires onAction immediately for a simple transition", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ReviewActions
        currentState="new"
        validTransitions={["assigned"]}
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Assign" }));
    expect(onAction).toHaveBeenCalledWith("assigned", undefined);
  });

  it("requires a note before confirming changes_requested", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ReviewActions
        currentState="in_review"
        validTransitions={["changes_requested"]}
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Request changes" }));

    const confirmButton = screen.getByRole("button", {
      name: "Confirm Request changes",
    });
    expect(confirmButton).toBeDisabled();
    expect(screen.getByText("A note is required for this action.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Note (required)"), "Needs clearer sources");
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);
    expect(onAction).toHaveBeenCalledWith(
      "changes_requested",
      "Needs clearer sources",
    );
  });

  it("shows an optional note for approved transitions", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ReviewActions
        currentState="in_review"
        validTransitions={["approved"]}
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.getByLabelText("Note (optional)")).toBeInTheDocument();

    // Optional note — confirm is enabled without typing.
    const confirmButton = screen.getByRole("button", { name: "Confirm Approve" });
    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);
    expect(onAction).toHaveBeenCalledWith("approved", undefined);
  });

  it("requires confirmation for irreversible published transition", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ReviewActions
        currentState="approved"
        validTransitions={["published"]}
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Publish" }));
    expect(
      screen.getByText(/Publishing makes this content publicly visible/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm Publish" }));
    expect(onAction).toHaveBeenCalledWith("published", undefined);
  });

  it("does not fire onAction when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ReviewActions
        currentState="approved"
        validTransitions={["rejected"]}
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Reject" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables all action buttons while loading", async () => {
    render(
      <ReviewActions
        currentState="in_review"
        validTransitions={["approved", "rejected"]}
        onAction={vi.fn()}
        isLoading
      />,
    );
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
  });

  it("handles transitions without a configured label", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ReviewActions
        currentState="rejected"
        validTransitions={["archived" as ReviewState]}
        onAction={onAction}
      />,
    );
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Archive" }));
    expect(onAction).toHaveBeenCalledWith("archived", undefined);
  });
});
