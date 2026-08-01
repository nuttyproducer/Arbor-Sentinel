// src/lib/ai/__tests__/PromptManager.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { PromptManager } from "../PromptManager";
import type { PromptTemplate } from "../types";

function makeTemplate(overrides: Partial<PromptTemplate> = {}): PromptTemplate {
  return {
    name: "test-prompt",
    version: 1,
    template: "This is a {{variable}} template.",
    ...overrides,
  };
}

describe("PromptManager", () => {
  let manager: PromptManager;

  beforeEach(() => {
    manager = new PromptManager();
  });

  it("registers and retrieves a prompt template", () => {
    manager.register(makeTemplate());
    const t = manager.get("test-prompt");
    expect(t).toBeDefined();
    expect(t!.name).toBe("test-prompt");
    expect(t!.version).toBe(1);
  });

  it("returns latest version by default", () => {
    manager.register(makeTemplate({ version: 1 }));
    manager.register(makeTemplate({ version: 2 }));
    manager.register(makeTemplate({ version: 3 }));

    const t = manager.get("test-prompt");
    expect(t!.version).toBe(3);
  });

  it("returns specific version when requested", () => {
    manager.register(makeTemplate({ version: 1, template: "v1" }));
    manager.register(makeTemplate({ version: 2, template: "v2" }));

    const t = manager.get("test-prompt", 1);
    expect(t!.template).toBe("v1");
  });

  it("returns undefined for unregistered prompt", () => {
    expect(manager.get("nonexistent")).toBeUndefined();
  });

  it("replaces existing version on re-register", () => {
    manager.register(makeTemplate({ version: 1, template: "original" }));
    manager.register(makeTemplate({ version: 1, template: "updated" }));

    const versions = manager.get("test-prompt");
    expect(versions!.template).toBe("updated");
  });

  it("renders with variable substitution", () => {
    manager.register(makeTemplate({
      template: "Hello {{name}}, your {{thing}} is ready.",
    }));

    const { user } = manager.render("test-prompt", {
      name: "World",
      thing: "report",
    });

    expect(user).toBe("Hello World, your report is ready.");
  });

  it("leaves unknown variables unchanged", () => {
    manager.register(makeTemplate({
      template: "Hello {{name}}, {{unknown}}.",
    }));

    const { user } = manager.render("test-prompt", { name: "World" });
    expect(user).toBe("Hello World, {{unknown}}.");
  });

  it("parses system and user sections from frontmatter delimiter", () => {
    manager.register(makeTemplate({
      template: "You are a helpful assistant.\n---\nPlease translate: {{text}}",
    }));

    const { system, user } = manager.render("test-prompt", { text: "Hello" });
    expect(system).toBe("You are a helpful assistant.");
    expect(user).toBe("Please translate: Hello");
  });

  it("parses system and user sections from headings", () => {
    manager.register(makeTemplate({
      template: "# System\nYou are a translator.\n# User\nTranslate: {{text}}",
    }));

    const { system, user } = manager.render("test-prompt", { text: "Bonjour" });
    expect(system).toBe("You are a translator.");
    expect(user).toBe("Translate: Bonjour");
  });

  it("treats entire template as user prompt when no sections", () => {
    manager.register(makeTemplate({
      template: "Just a simple {{thing}} prompt.",
    }));

    const { system, user } = manager.render("test-prompt", { thing: "test" });
    expect(system).toBe("");
    expect(user).toBe("Just a simple test prompt.");
  });

  it("throws when rendering unregistered prompt", () => {
    expect(() => manager.render("nonexistent", {})).toThrow(
      'Prompt template "nonexistent" not found',
    );
  });

  it("has() checks prompt existence", () => {
    expect(manager.has("test-prompt")).toBe(false);
    manager.register(makeTemplate());
    expect(manager.has("test-prompt")).toBe(true);
  });

  it("list() returns all prompt names", () => {
    manager.register(makeTemplate({ name: "prompt-a" }));
    manager.register(makeTemplate({ name: "prompt-b" }));
    expect(manager.list()).toEqual(expect.arrayContaining(["prompt-a", "prompt-b"]));
  });
});
