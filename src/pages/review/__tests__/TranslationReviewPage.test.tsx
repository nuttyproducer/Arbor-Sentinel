import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TranslationReviewPage from "../TranslationReviewPage";
import { mockTranslationReviewItem, toEnqueueInput } from "../mockReviewItems";
import { ReviewQueue } from "../../../lib/review/ReviewQueue";
import { TRANSLATION_CHECKLIST_ITEMS } from "../../../lib/review/translationChecklist";

describe("TranslationReviewPage", () => {
  it("renders with source and translation", () => {
    render(<TranslationReviewPage />);

    expect(screen.getByText("Source (ar)")).toBeInTheDocument();
    expect(screen.getByText("Translation (en)")).toBeInTheDocument();

    expect(screen.getByTestId("side-by-side-left")).toHaveTextContent(/قال المتحدث/);
    expect(screen.getByTestId("side-by-side-right")).toHaveTextContent(/spokesperson/i);
  });

  it("highlights named entities in both panels", () => {
    render(<TranslationReviewPage />);

    const left = screen.getByTestId("side-by-side-left");
    const right = screen.getByTestId("side-by-side-right");

    const leftMarks = left.querySelectorAll("mark");
    const rightMarks = right.querySelectorAll("mark");

    // One mark per preserved entity occurrence (UN, Gaza, WHO, Geneva).
    expect(leftMarks).toHaveLength(4);
    expect(rightMarks).toHaveLength(4);

    // The preserved entity text itself is what gets wrapped.
    expect(Array.from(leftMarks).map((mark) => mark.textContent)).toContain("Gaza");
    expect(Array.from(rightMarks).map((mark) => mark.textContent)).toContain("Geneva");
  });

  it("shows the AI-assisted translation flag", () => {
    render(<TranslationReviewPage />);

    expect(screen.getByText(/human review required/)).toBeInTheDocument();
  });

  it("includes all translation checklist items", () => {
    render(<TranslationReviewPage />);

    for (const item of TRANSLATION_CHECKLIST_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
    expect(screen.getByText("0/8 passed")).toBeInTheDocument();
  });

  it("propagates state changes to the queue", async () => {
    const user = userEvent.setup();
    const queue = new ReviewQueue();
    const enqueued = await queue.enqueue(toEnqueueInput(mockTranslationReviewItem));
    const assigned = await queue.assignItem(enqueued.id, "reviewer-translation-1");

    render(<TranslationReviewPage item={assigned} queue={queue} />);

    await user.click(screen.getByRole("button", { name: "Start review" }));

    await waitFor(async () => {
      const stored = await queue.getById(enqueued.id);
      expect(stored?.state).toBe("in_review");
    });
  });
});
