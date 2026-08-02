import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewNotes } from "../ReviewNotes";

const TEXTAREA_PLACEHOLDER = "Record notes about this review item…";

describe("ReviewNotes", () => {
  it("renders a textarea with the initial value", () => {
    render(<ReviewNotes onSave={vi.fn()} initialValue="Draft note" />);
    const textarea = screen.getByPlaceholderText(TEXTAREA_PLACEHOLDER);
    expect(textarea).toHaveValue("Draft note");
  });

  it("calls onSave with the note body and confirms the save", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ReviewNotes onSave={onSave} initialValue="Final note" />);

    await user.click(screen.getByRole("button", { name: "Save note" }));
    expect(onSave).toHaveBeenCalledWith("Final note");
    expect(screen.getByText("Note saved.")).toBeInTheDocument();
  });

  it("disables the save button when the note is empty", () => {
    render(<ReviewNotes onSave={vi.fn()} initialValue="" />);
    expect(screen.getByRole("button", { name: "Save note" })).toBeDisabled();
  });

  it("warns when the note contains an email address", async () => {
    const user = userEvent.setup();
    render(<ReviewNotes onSave={vi.fn()} />);
    const textarea = screen.getByPlaceholderText(TEXTAREA_PLACEHOLDER);
    await user.type(textarea, "Contact jane.doe@example.com for follow-up");
    expect(screen.getByRole("alert")).toHaveTextContent(/personal information/);
  });

  it("warns when the note contains a phone number", async () => {
    const user = userEvent.setup();
    render(<ReviewNotes onSave={vi.fn()} />);
    const textarea = screen.getByPlaceholderText(TEXTAREA_PLACEHOLDER);
    await user.type(textarea, "Call +1 555-123-4567");
    expect(screen.getByRole("alert")).toHaveTextContent(/personal information/);
  });

  it("does not warn for clean text without PII", async () => {
    const user = userEvent.setup();
    render(<ReviewNotes onSave={vi.fn()} />);
    const textarea = screen.getByPlaceholderText(TEXTAREA_PLACEHOLDER);
    await user.type(textarea, "The sources check out.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears the saved confirmation when the note changes again", async () => {
    const user = userEvent.setup();
    render(<ReviewNotes onSave={vi.fn()} initialValue="Note" />);
    await user.click(screen.getByRole("button", { name: "Save note" }));
    expect(screen.getByText("Note saved.")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(TEXTAREA_PLACEHOLDER);
    await user.type(textarea, " more");
    expect(screen.queryByText("Note saved.")).not.toBeInTheDocument();
  });

  it("disables the textarea and save button in readonly mode", () => {
    render(
      <ReviewNotes onSave={vi.fn()} initialValue="Readonly" readonly />,
    );
    expect(screen.getByPlaceholderText(TEXTAREA_PLACEHOLDER)).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save note" })).toBeDisabled();
  });

  it("shows the content version badge when a version is provided", () => {
    render(<ReviewNotes onSave={vi.fn()} version={3} />);
    expect(screen.getByText("v3")).toBeInTheDocument();
  });

  it("omits the version badge when no version is provided", () => {
    render(<ReviewNotes onSave={vi.fn()} />);
    expect(screen.queryByText(/Version:/)).not.toBeInTheDocument();
  });
});
