// src/pages/review/__tests__/CorrectionReviewPage.test.tsx

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CorrectionReviewPage from "../CorrectionReviewPage";
import { createSeededCorrectionManager } from "../mockCorrections";

/**
 * The seeded manager holds 4 pending corrections (2 new, 2 under_review) and
 * one already-applied correction that must stay out of the queue.
 */
async function renderSeededPage() {
  const manager = await createSeededCorrectionManager();
  render(<CorrectionReviewPage manager={manager} />);
  await screen.findByText("Showing 4 of 4 corrections");
  return { manager };
}

/** Click a queue row by its category badge (scoped to the tbody so category
 * names don't collide with the filter select options). */
async function clickRowByCategory(user: ReturnType<typeof userEvent.setup>, label: string) {
  const rowsBody = screen.getByTestId("correction-list-rows");
  const badge = within(rowsBody).getByText(label);
  const row = badge.closest("tr");
  if (!row) throw new Error(`No queue row found for category "${label}".`);
  await user.click(row);
}

describe("CorrectionReviewPage", () => {
  it("loads and renders pending corrections from the manager", async () => {
    await renderSeededPage();

    const list = screen.getByTestId("correction-list");
    // The applied correction is excluded; legal page is the unique pending one.
    expect(within(list).getByText("/legal/icj-gaza")).toBeInTheDocument();
    expect(within(list).getAllByText("/evidence/icj-2024-01-26")).toHaveLength(3);
  });

  it("shows the mock queue without a manager", async () => {
    render(<CorrectionReviewPage />);

    await screen.findByText("Showing 4 of 4 corrections");
    const list = screen.getByTestId("correction-list");
    expect(within(list).getByText("/legal/icj-gaza")).toBeInTheDocument();
    expect(within(list).getAllByText("/evidence/icj-2024-01-26")).toHaveLength(3);
  });

  it("selecting a row shows its detail", async () => {
    const user = userEvent.setup();
    await renderSeededPage();

    // Select the legal_wording correction via its list badge.
    await clickRowByCategory(user, "Legal wording error");

    const detail = screen.getByTestId("correction-detail");
    expect(within(detail).getByText("/legal/icj-gaza")).toBeInTheDocument();
    expect(within(detail).getByText(/describes the ICJ order as a final judgment/i)).toBeInTheDocument();
    expect(
      within(detail).getByRole("button", { name: "Apply correction" }),
    ).toBeInTheDocument();
  });

  it("reviews a new correction and keeps it pending for apply", async () => {
    const user = userEvent.setup();
    await renderSeededPage();

    // Select the factual_error correction via its list badge.
    await clickRowByCategory(user, "Factual error");

    expect(screen.getByText(/ruling date is listed as 27 January 2024/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Update content" }));
    await user.type(
      screen.getByLabelText("Note (required)"),
      "ICJ order issued on 26 January 2024.",
    );
    await user.click(screen.getByRole("button", { name: "Confirm Update content" }));

    // Content resolutions keep the correction in the queue and surface apply.
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Apply correction" })).toBeInTheDocument();
    });
    expect(screen.getByText("Showing 4 of 4 corrections")).toBeInTheDocument();
  });

  it("applies an under-review correction after confirmation", async () => {
    const user = userEvent.setup();
    await renderSeededPage();

    // The legal_wording correction is already under_review with resolution
    // "update", so it is ready to apply.
    await clickRowByCategory(user, "Legal wording error");

    await user.click(screen.getByRole("button", { name: "Apply correction" }));

    const dialog = screen.getByRole("dialog", { name: "Apply correction" });
    // Major correction → public log preview shown before applying.
    expect(within(dialog).getByText("Public log preview")).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Legal wording error \(update\) on \/legal\/icj-gaza/),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Apply correction" }));

    // The applied correction leaves the pending queue but stays visible in the
    // detail panel with its new state.
    await waitFor(() => {
      const list = screen.getByTestId("correction-list");
      expect(within(list).queryByText("/legal/icj-gaza")).not.toBeInTheDocument();
    });
    const detail = screen.getByTestId("correction-detail");
    expect(within(detail).getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Showing 3 of 3 corrections")).toBeInTheDocument();
  });
});
