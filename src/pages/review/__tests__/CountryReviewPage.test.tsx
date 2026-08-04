// src/pages/review/CountryReviewPage.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CountryReviewPage from "../CountryReviewPage";
import { mockCountryReviewItem, toEnqueueInput } from "../mockReviewItems";
import { COUNTRY_CHECKLIST_ITEMS } from "../../../lib/review/countryChecklist";
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

describe("CountryReviewPage", () => {
  it("renders the country checklist with all required items", () => {
    render(<CountryReviewPage />);

    for (const item of COUNTRY_CHECKLIST_ITEMS) {
      const row = screen.getByText(item.label).closest("li");
      expect(row).not.toBeNull();
      if (!row) continue;
      expect(within(row).getByText("Required")).toBeInTheDocument();
    }
  });

  it("renders the source verification panel with verification status", () => {
    render(<CountryReviewPage />);

    const panel = screen.getByTestId("source-verification-panel");
    expect(within(panel).getByText("UN General Assembly voting record")).toBeInTheDocument();
    expect(within(panel).getByText("Federal Ministry of Foreign Affairs statement")).toBeInTheDocument();
    expect(within(panel).getByText("EU Council position paper")).toBeInTheDocument();

    // Verified vs unverified badges.
    expect(within(panel).getAllByText("Verified")).toHaveLength(2);
    expect(within(panel).getAllByText("Unverified")).toHaveLength(1);
  });

  it("shows a source-date freshness warning for stale sources", () => {
    render(<CountryReviewPage />);

    expect(screen.getByTestId("source-freshness-warning")).toBeInTheDocument();
    expect(screen.getByText(/over 12 months old/i)).toBeInTheDocument();
    // Two of the three mock sources predate the freshness window.
    expect(screen.getAllByText("Stale")).toHaveLength(2);
  });

  it("keeps the accountability score hidden by policy", () => {
    render(<CountryReviewPage />);

    // Policy indicator present...
    expect(screen.getByTestId("accountability-score-hidden")).toBeInTheDocument();
    expect(screen.getByText(/withheld by policy/i)).toBeInTheDocument();

    // ...and no numeric accountability score is rendered anywhere.
    expect(screen.queryByText(/Accountability score\s+\d+/i)).not.toBeInTheDocument();
  });

  it("shares the base components (ReviewActions, ReviewHistory)", async () => {
    const user = userEvent.setup();
    render(<CountryReviewPage />);

    expect(screen.getByText("Review actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start review" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Review history" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Review history" }));
    expect(screen.getByText(statusChange("new", "assigned"))).toBeInTheDocument();
  });

  it("propagates state changes to the queue when one is provided", async () => {
    const user = userEvent.setup();
    const queue = new ReviewQueue(new InMemoryPersistence());
    const queued = await queue.enqueue(toEnqueueInput(mockCountryReviewItem));
    const assigned = await queue.assignItem(queued.id, "reviewer-country-1");

    render(<CountryReviewPage item={assigned} queue={queue} />);

    await user.click(screen.getByRole("button", { name: "Start review" }));

    await waitFor(async () => {
      const persisted = await queue.getById(queued.id);
      expect(persisted?.state).toBe("in_review");
    });
  });
});
