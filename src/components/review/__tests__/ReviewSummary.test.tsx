import { render, screen } from "@testing-library/react";
import { ReviewSummary } from "../ReviewSummary";
import type { ReviewChecklistResult } from "../../../lib/review/types";

function results(
  overrides: Record<string, ReviewChecklistResult[]> = {},
): Record<string, ReviewChecklistResult[]> {
  return {
    Accuracy: [
      { itemId: "position-accuracy", result: "pass" },
      { itemId: "evidence-support", result: "fail" },
    ],
    Policy: [
      { itemId: "arms-transfer", result: "pass" },
      { itemId: "no-accountability-score", result: "na" },
    ],
    ...overrides,
  };
}

describe("ReviewSummary", () => {
  it("shows the internal-only badge", () => {
    render(
      <ReviewSummary
        checklistResults={results()}
        reviewerNotes=""
        recommendation="Approve"
      />,
    );
    expect(screen.getByText("Internal only")).toBeInTheDocument();
  });

  it("shows overall status blocked when any checklist item fails", () => {
    render(
      <ReviewSummary
        checklistResults={results()}
        reviewerNotes=""
        recommendation="Approve"
      />,
    );
    expect(screen.getByText("Blocked")).toBeInTheDocument();
  });

  it("shows overall status ready when nothing fails", () => {
    render(
      <ReviewSummary
        checklistResults={results({
          Accuracy: [
            { itemId: "position-accuracy", result: "pass" },
            { itemId: "evidence-support", result: "na" },
          ],
        })}
        reviewerNotes=""
        recommendation="Approve"
      />,
    );
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("aggregates passed/failed/na counts per checklist category", () => {
    render(
      <ReviewSummary
        checklistResults={results()}
        reviewerNotes=""
        recommendation="Approve"
      />,
    );
    expect(screen.getByLabelText("Accuracy passed")).toHaveTextContent("1");
    expect(screen.getByLabelText("Accuracy failed")).toHaveTextContent("1");
    expect(screen.getByLabelText("Accuracy not applicable")).toHaveTextContent("0");
    expect(screen.getByLabelText("Policy passed")).toHaveTextContent("1");
    expect(screen.getByLabelText("Policy failed")).toHaveTextContent("0");
    expect(screen.getByLabelText("Policy not applicable")).toHaveTextContent("1");
  });

  it("shows aggregate totals across all categories", () => {
    render(
      <ReviewSummary
        checklistResults={results()}
        reviewerNotes=""
        recommendation="Approve"
      />,
    );
    expect(screen.getByLabelText("Total passed")).toHaveTextContent("2");
    expect(screen.getByLabelText("Total failed")).toHaveTextContent("1");
    expect(screen.getByLabelText("Total not applicable")).toHaveTextContent("1");
  });

  it("renders reviewer notes", () => {
    render(
      <ReviewSummary
        checklistResults={results()}
        reviewerNotes="Position needs a more recent source."
        recommendation="Approve"
      />,
    );
    expect(
      screen.getByText("Position needs a more recent source."),
    ).toBeInTheDocument();
  });

  it("renders the recommendation when provided", () => {
    render(
      <ReviewSummary
        checklistResults={results()}
        reviewerNotes=""
        recommendation="Request changes before publish."
      />,
    );
    expect(
      screen.getByText("Request changes before publish."),
    ).toBeInTheDocument();
  });

  it("omits the recommendation section when not provided", () => {
    render(
      <ReviewSummary checklistResults={results()} reviewerNotes="" />,
    );
    expect(screen.queryByText("Recommendation")).not.toBeInTheDocument();
  });

  it("renders an empty state when no checklist results exist", () => {
    render(<ReviewSummary checklistResults={{}} reviewerNotes="" />);
    expect(
      screen.getByText("No checklist results recorded for this review."),
    ).toBeInTheDocument();
  });
});
