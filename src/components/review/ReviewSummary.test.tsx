// src/components/review/ReviewSummary.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewSummary } from "./ReviewSummary";
import type { ReviewChecklistResult } from "../../lib/review/types";

describe("ReviewSummary", () => {
  it("aggregates checklist results into per-category and total counts", () => {
    const checklistResults: Record<string, ReviewChecklistResult[]> = {
      Accuracy: [
        { itemId: "position-accuracy", result: "pass" },
        { itemId: "un-voting-verified", result: "fail" },
      ],
      Safety: [{ itemId: "no-hate-speech", result: "pass" }],
      Currency: [{ itemId: "source-dates-current", result: "na" }],
    };

    render(
      <ReviewSummary checklistResults={checklistResults} reviewerNotes="Checked against official records." />,
    );

    // Blocked because at least one required item failed.
    expect(screen.getByText("Blocked")).toBeInTheDocument();

    // Per-category counts.
    expect(screen.getByLabelText("Accuracy passed")).toHaveTextContent("1");
    expect(screen.getByLabelText("Accuracy failed")).toHaveTextContent("1");
    expect(screen.getByLabelText("Accuracy not applicable")).toHaveTextContent("0");
    expect(screen.getByLabelText("Safety passed")).toHaveTextContent("1");
    expect(screen.getByLabelText("Safety failed")).toHaveTextContent("0");
    expect(screen.getByLabelText("Currency not applicable")).toHaveTextContent("1");

    // Totals across categories.
    expect(screen.getByLabelText("Total passed")).toHaveTextContent("2");
    expect(screen.getByLabelText("Total failed")).toHaveTextContent("1");
    expect(screen.getByLabelText("Total not applicable")).toHaveTextContent("1");

    expect(screen.getByText("Checked against official records.")).toBeInTheDocument();
  });

  it("shows Ready when no checklist item failed", () => {
    render(
      <ReviewSummary
        checklistResults={{
          Accuracy: [{ itemId: "a1", result: "pass" }],
        }}
        reviewerNotes=""
      />,
    );

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("shows an empty state when no results are recorded", () => {
    render(<ReviewSummary checklistResults={{}} reviewerNotes="" />);
    expect(screen.getByText(/No checklist results recorded/i)).toBeInTheDocument();
  });
});
