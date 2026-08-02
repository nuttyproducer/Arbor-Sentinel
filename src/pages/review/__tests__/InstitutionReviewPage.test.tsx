// src/pages/review/InstitutionReviewPage.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InstitutionReviewPage from "../InstitutionReviewPage";
import { mockInstitutionReviewItem, toEnqueueInput } from "../mockReviewItems";
import { INSTITUTION_CHECKLIST_ITEMS } from "../../../lib/review/institutionChecklist";
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

describe("InstitutionReviewPage", () => {
  it("renders the institution checklist with all required items", () => {
    render(<InstitutionReviewPage />);

    for (const item of INSTITUTION_CHECKLIST_ITEMS) {
      const row = screen.getByText(item.label).closest("li");
      expect(row).not.toBeNull();
      if (!row) continue;
      expect(within(row).getByText("Required")).toBeInTheDocument();
    }
  });

  it("renders the competency boundaries panel with can/cannot act status", () => {
    render(<InstitutionReviewPage />);

    const panel = screen.getByTestId("competency-boundaries-panel");
    expect(within(panel).getByText("External trade")).toBeInTheDocument();
    expect(within(panel).getByText("Environmental protection")).toBeInTheDocument();
    expect(within(panel).getByText("Direct taxation")).toBeInTheDocument();

    expect(within(panel).getAllByText("Can act")).toHaveLength(2);
    expect(within(panel).getAllByText("Cannot act")).toHaveLength(1);
  });

  it("renders the EU competency distinction indicator", () => {
    render(<InstitutionReviewPage />);

    const indicator = screen.getByTestId("eu-competency-distinction");
    expect(within(indicator).getByText("EU exclusive")).toBeInTheDocument();
    expect(within(indicator).getByText("Shared")).toBeInTheDocument();
    expect(within(indicator).getByText("National")).toBeInTheDocument();
    expect(within(indicator).getByText(/The EU acts alone/i)).toBeInTheDocument();
  });

  it("shares the base components (ReviewActions, ReviewHistory)", async () => {
    const user = userEvent.setup();
    render(<InstitutionReviewPage />);

    expect(screen.getByText("Review actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start review" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Review history" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Review history" }));
    expect(screen.getByText(statusChange("new", "assigned"))).toBeInTheDocument();
  });

  it("propagates state changes to the queue when one is provided", async () => {
    const user = userEvent.setup();
    const queue = new ReviewQueue(new InMemoryPersistence());
    const queued = await queue.enqueue(toEnqueueInput(mockInstitutionReviewItem));
    const assigned = await queue.assignItem(queued.id, "reviewer-institution-1");

    render(<InstitutionReviewPage item={assigned} queue={queue} />);

    await user.click(screen.getByRole("button", { name: "Start review" }));

    await waitFor(async () => {
      const persisted = await queue.getById(queued.id);
      expect(persisted?.state).toBe("in_review");
    });
  });
});
