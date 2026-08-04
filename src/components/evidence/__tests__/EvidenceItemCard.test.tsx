import { describe, it, expect } from "vitest";
import { categoryAccent } from "../EvidenceItemCard";

describe("categoryAccent", () => {
  it('returns "clay" for court record', () => {
    expect(categoryAccent("court record")).toBe("clay");
  });

  it('returns "clay" for human-rights report', () => {
    expect(categoryAccent("human-rights report")).toBe("clay");
  });

  it('returns "blue" for official UN document', () => {
    expect(categoryAccent("official UN document")).toBe("blue");
  });

  it('returns "blue" for parliamentary document', () => {
    expect(categoryAccent("parliamentary document")).toBe("blue");
  });

  it('returns "amber" for humanitarian update', () => {
    expect(categoryAccent("humanitarian update")).toBe("amber");
  });

  it('returns "amber" for verified investigative report', () => {
    expect(categoryAccent("verified investigative report")).toBe("amber");
  });

  it('returns "amber" for unknown categories (safe fallback)', () => {
    expect(categoryAccent("unknown category")).toBe("amber");
  });
});
