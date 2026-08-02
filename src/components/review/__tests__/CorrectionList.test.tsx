// src/components/review/__tests__/CorrectionList.test.tsx

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CorrectionList } from "../CorrectionList";
import { makeCorrection } from "../../../pages/review/mockCorrections";

const pendingCorrections = [
  makeCorrection({
    id: "c1",
    category: "factual_error",
    targetPage: "/evidence/icj-2024-01-26",
    state: "new",
    createdAt: "2026-08-01T09:00:00.000Z",
  }),
  makeCorrection({
    id: "c2",
    category: "broken_link",
    targetPage: "/evidence/icj-2024-01-26",
    state: "new",
    isMajor: false,
    createdAt: "2026-08-02T09:00:00.000Z",
  }),
  makeCorrection({
    id: "c3",
    category: "legal_wording",
    targetPage: "/legal/icj-gaza",
    state: "under_review",
    createdAt: "2026-07-30T09:00:00.000Z",
  }),
];

describe("CorrectionList", () => {
  it("renders all pending corrections", () => {
    render(<CorrectionList corrections={pendingCorrections} onSelect={vi.fn()} />);

    expect(screen.getAllByText("/evidence/icj-2024-01-26")).toHaveLength(2);
    expect(screen.getByText("/legal/icj-gaza")).toBeInTheDocument();
    expect(screen.getByText("Showing 3 of 3 corrections")).toBeInTheDocument();
  });

  it("filters by state", async () => {
    const user = userEvent.setup();
    render(<CorrectionList corrections={pendingCorrections} onSelect={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText("State"), "under_review");

    expect(screen.getByText("/legal/icj-gaza")).toBeInTheDocument();
    expect(screen.queryByText("/evidence/icj-2024-01-26")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 3 corrections")).toBeInTheDocument();
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    render(<CorrectionList corrections={pendingCorrections} onSelect={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText("Category"), "broken_link");

    expect(screen.getAllByText("/evidence/icj-2024-01-26")).toHaveLength(1);
    expect(screen.queryByText("/legal/icj-gaza")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 3 corrections")).toBeInTheDocument();

    const rows = screen.getByTestId("correction-list-rows");
    expect(within(rows).getByText("Broken link")).toBeInTheDocument();
    expect(within(rows).queryByText("Legal wording error")).not.toBeInTheDocument();
  });

  it("filters by urgency", async () => {
    const user = userEvent.setup();
    render(<CorrectionList corrections={pendingCorrections} onSelect={vi.fn()} />);

    // Only broken_link has "normal" urgency; factual_error and legal_wording
    // are "high".
    await user.selectOptions(screen.getByLabelText("Urgency"), "high");

    expect(screen.getByText("Showing 2 of 3 corrections")).toBeInTheDocument();
    const rows = screen.getByTestId("correction-list-rows");
    expect(within(rows).getByText("Factual error")).toBeInTheDocument();
    expect(within(rows).getByText("Legal wording error")).toBeInTheDocument();
    expect(within(rows).queryByText("Broken link")).not.toBeInTheDocument();
  });

  it("fires onSelect when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CorrectionList corrections={pendingCorrections} onSelect={onSelect} />);

    // First row in the default (newest-first) order is c2 (broken link).
    await user.click(screen.getAllByText("/evidence/icj-2024-01-26")[0]);

    expect(onSelect).toHaveBeenCalledWith("c2");
  });

  it("sorts by the selected column", async () => {
    const user = userEvent.setup();
    render(<CorrectionList corrections={pendingCorrections} onSelect={vi.fn()} />);

    // Default sort is createdAt descending → newest first (c2, c1, c3).
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("/evidence/icj-2024-01-26");

    // Toggle Created to ascending → oldest first (c3).
    await user.click(screen.getByRole("button", { name: "Sort by Created" }));
    const sortedRows = screen.getAllByRole("row");
    expect(sortedRows[1]).toHaveTextContent("/legal/icj-gaza");
  });
});
