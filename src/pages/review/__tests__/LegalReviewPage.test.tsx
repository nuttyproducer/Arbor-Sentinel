import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LegalReviewPage from "../LegalReviewPage";
import { mockLegalReviewItem, toEnqueueInput } from "../mockReviewItems";
import { ReviewQueue } from "../../../lib/review/ReviewQueue";
import { LEGAL_CHECKLIST_ITEMS } from "../../../lib/review/legalChecklist";

describe("LegalReviewPage", () => {
  it("renders with the AI proposal and original source", () => {
    render(<LegalReviewPage />);

    expect(screen.getByText("AI legal proposal")).toBeInTheDocument();
    expect(screen.getByText("Original source")).toBeInTheDocument();

    // Proposal (left) vs source (right).
    expect(screen.getByTestId("side-by-side-left")).toHaveTextContent(/provisional measures/i);
    expect(screen.getByTestId("side-by-side-right")).toHaveTextContent(/26 January 2024/i);
  });

  it("includes all required legal checklist items", () => {
    render(<LegalReviewPage />);

    for (const item of LEGAL_CHECKLIST_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
    expect(screen.getByText("0/8 passed")).toBeInTheDocument();
  });

  it("updates review state when a quick action is taken", async () => {
    const user = userEvent.setup();
    render(<LegalReviewPage />);

    // Mock item starts in the "assigned" state.
    expect(screen.getByText("assigned")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start review" }));

    expect(screen.getByText("in_review")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start review" })).not.toBeInTheDocument();
  });

  it("propagates state changes to the queue", async () => {
    const user = userEvent.setup();
    const queue = new ReviewQueue();
    const enqueued = await queue.enqueue(toEnqueueInput(mockLegalReviewItem));
    const assigned = await queue.assignItem(enqueued.id, "reviewer-legal-1");

    render(<LegalReviewPage item={assigned} queue={queue} />);

    await user.click(screen.getByRole("button", { name: "Start review" }));

    await waitFor(async () => {
      const stored = await queue.getById(enqueued.id);
      expect(stored?.state).toBe("in_review");
    });
  });

  it("saves notes locally when no queue is provided", async () => {
    const user = userEvent.setup();
    render(<LegalReviewPage />);

    await user.click(screen.getByRole("button", { name: "Review notes" }));
    await user.type(
      screen.getByPlaceholderText("Record notes about this review item…"),
      "Double-check the provisional measures wording.",
    );
    await user.click(screen.getByRole("button", { name: "Save note" }));

    expect(screen.getByText("Note saved.")).toBeInTheDocument();
  });
});
