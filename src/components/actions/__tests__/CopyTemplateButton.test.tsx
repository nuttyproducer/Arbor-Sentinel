import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CopyTemplateButton } from "../CopyTemplateButton";

describe("CopyTemplateButton", () => {
  it("renders with default label", () => {
    render(<CopyTemplateButton text="Hello world" />);
    expect(screen.getByRole("button", { name: /copy template text to clipboard/i })).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<CopyTemplateButton text="Hello" label='Copy "Contact Rep" template to clipboard' />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it('shows "Copy template" text initially', () => {
    render(<CopyTemplateButton text="Test" />);
    expect(screen.getByText("Copy template")).toBeInTheDocument();
  });

  it("is keyboard accessible", () => {
    render(<CopyTemplateButton text="Test" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toContain("min-h-[44px]");
    expect(button.className).toContain("focus-visible:ring-2");
  });
});
