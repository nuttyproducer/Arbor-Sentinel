// src/pages/review/EditorialReviewPage.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditorialReviewPage from "../EditorialReviewPage";
import { mockEditorialReviewItem, toEnqueueInput } from "../mockReviewItems";
import { EDITORIAL_CHECKLIST_ITEMS } from "../../../lib/review/editorialChecklist";
import { ReviewQueue } from "../../../lib/review/ReviewQueue";
import { InMemoryPersistence } from "../../../lib/review/ReviewPersistence";

/**
 * Match a ReviewHistory transition entry. The rendered text is split across
 * nested <span> elements ("Status changed from <span>new</span> to
 * <span>assigned</span>"), so match against the combined textContent.
 */
function statusChange(from: string, to: string) {
  return (_content: string, element: Element | null) =>
    element?.textContent === `Status changed from ${from} to ${to}`;
}

describe("EditorialReviewPage", () => {
  it("renders the editorial checklist with all required items", () => {
    render(<EditorialReviewPage />);

    for (const item of EDITORIAL_CHECKLIST_ITEMS) {
      const row = screen.getByText(item.label).closest("li");
      expect(row).not.toBeNull();
      if (!row) continue;
      if (item.required) {
        expect(within(row).getByText("Required")).toBeInTheDocument();
      } else {
        expect(within(row).queryByText("Required")).not.toBeInTheDocument();
      }
    }
  });

  it("shares the base components (SideBySideView, ReviewActions, ReviewHistory)", async () => {
    const user = userEvent.setup();
    render(<EditorialReviewPage />);

    // SideBySideView: AI-edited vs original panels.
    expect(screen.getByTestId("side-by-side-left")).toHaveTextContent(
      /More than 40,000 people have been killed in Gaza/i,
    );
    expect(screen.getByTestId("side-by-side-right")).toHaveTextContent(
      /On 15 August 2024 the United Nations reported/i,
    );

    // ReviewActions renders for the current state.
    expect(screen.getByText("Review actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start review" })).toBeInTheDocument();

    // ReviewHistory is present and expands to show the recorded history.
    expect(screen.getByRole("button", { name: "Review history" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Review history" }));
    expect(screen.getByText(statusChange("new", "assigned"))).toBeInTheDocument();
  });

  it("propagates review actions to the parent content record locally", async () => {
    const user = userEvent.setup();
    render(<EditorialReviewPage />);

    expect(screen.getByText("assigned")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start review" }));

    expect(screen.getByText("in_review")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Review history" }));
    expect(screen.getByText(statusChange("assigned", "in_review"))).toBeInTheDocument();
  });

  it("propagates state changes to the queue when one is provided", async () => {
    const user = userEvent.setup();
    const queue = new ReviewQueue(new InMemoryPersistence());
    const queued = await queue.enqueue(toEnqueueInput(mockEditorialReviewItem));
    const assigned = await queue.assignItem(queued.id, "reviewer-editorial-1");

    render(<EditorialReviewPage item={assigned} queue={queue} />);

    await user.click(screen.getByRole("button", { name: "Start review" }));

    await waitFor(async () => {
      const persisted = await queue.getById(queued.id);
      expect(persisted?.state).toBe("in_review");
    });
  });
});
