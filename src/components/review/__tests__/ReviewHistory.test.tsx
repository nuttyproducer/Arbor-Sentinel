import { render, screen, within } from "@testing-library/react";
import { ReviewHistory } from "../ReviewHistory";
import type { ReviewComment, StateTransition } from "../../../lib/review/types";

const TRANSITIONS: StateTransition[] = [
  {
    from: "new",
    to: "assigned",
    timestamp: "2026-08-01T10:00:00Z",
    actor: "reviewer-1",
  },
  {
    from: "assigned",
    to: "in_review",
    timestamp: "2026-08-02T09:00:00Z",
    actor: "system",
    reason: "Started review",
  },
];

const COMMENTS: ReviewComment[] = [
  {
    id: "comment-1",
    reviewItemId: "review-1",
    authorId: "reviewer-2",
    body: "Looking good so far.",
    stateAtComment: "in_review",
    version: 2,
    createdAt: "2026-08-02T11:00:00Z",
  },
];

describe("ReviewHistory", () => {
  it("renders state transitions with from/to state and actor", () => {
    render(
      <ReviewHistory stateHistory={TRANSITIONS} comments={[]} />,
    );
    expect(
      screen.getAllByText((content) => content.includes("Status changed from")),
    ).toHaveLength(2);
    expect(screen.getByText("new")).toBeInTheDocument();
    expect(screen.getAllByText("assigned").length).toBeGreaterThan(0);
    expect(screen.getByText("by reviewer-1")).toBeInTheDocument();
  });

  it("renders transition reasons and System actor label", () => {
    render(
      <ReviewHistory stateHistory={TRANSITIONS} comments={[]} />,
    );
    expect(screen.getByText("Started review")).toBeInTheDocument();
    expect(screen.getByText("by System")).toBeInTheDocument();
  });

  it("renders comments with body, version, and author", () => {
    render(
      <ReviewHistory stateHistory={[]} comments={COMMENTS} />,
    );
    expect(screen.getByText("Looking good so far.")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("by reviewer-2")).toBeInTheDocument();
  });

  it("groups events by date", () => {
    render(
      <ReviewHistory stateHistory={TRANSITIONS} comments={COMMENTS} />,
    );
    expect(screen.getByText("01 Aug 2026")).toBeInTheDocument();
    expect(screen.getByText("02 Aug 2026")).toBeInTheDocument();
  });

  it("orders date groups newest first", () => {
    render(
      <ReviewHistory stateHistory={TRANSITIONS} comments={COMMENTS} />,
    );
    const dateHeadings = screen
      .getAllByRole("heading", { level: 4 })
      .map((heading) => heading.textContent);
    expect(dateHeadings[0]).toBe("02 Aug 2026");
    expect(dateHeadings[1]).toBe("01 Aug 2026");
  });

  it("orders events within a date group newest first", () => {
    render(
      <ReviewHistory stateHistory={TRANSITIONS} comments={COMMENTS} />,
    );
    const section = screen.getByText("02 Aug 2026").closest("section");
    expect(section).not.toBeNull();

    // The 11:00 comment (v2) should render above the 09:00 transition.
    const commentEntry = within(section as HTMLElement).getByText("v2");
    const transitionEntry = screen.getByText("in_review");
    expect(
      commentEntry.compareDocumentPosition(transitionEntry),
    ).toBe(commentEntry.DOCUMENT_POSITION_FOLLOWING);
  });

  it("renders an empty state when there is no history", () => {
    render(<ReviewHistory stateHistory={[]} comments={[]} />);
    expect(screen.getByText("No review history yet.")).toBeInTheDocument();
  });
});
