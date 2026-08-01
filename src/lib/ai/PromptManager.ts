// src/lib/ai/PromptManager.ts

import type { PromptTemplate } from "./types";

/**
 * Manages versioned prompt templates with variable substitution.
 *
 * Prompts are stored as markdown files with YAML-like frontmatter.
 * For the initial implementation, prompts are registered programmatically.
 * Vite raw imports for .md files can be wired in later.
 */
export class PromptManager {
  private templates: Map<string, PromptTemplate[]> = new Map();

  /**
   * Register a prompt template.
   */
  register(template: PromptTemplate): void {
    const existing = this.templates.get(template.name) ?? [];
    // Replace existing version or append new
    const idx = existing.findIndex((t) => t.version === template.version);
    if (idx >= 0) {
      existing[idx] = template;
    } else {
      existing.push(template);
    }
    // Keep sorted newest first
    existing.sort((a, b) => b.version - a.version);
    this.templates.set(template.name, existing);
  }

  /**
   * Get a prompt template by name, optionally at a specific version.
   * Returns the latest version if no version specified.
   */
  get(name: string, version?: number): PromptTemplate | undefined {
    const versions = this.templates.get(name);
    if (!versions || versions.length === 0) return undefined;

    if (version !== undefined) {
      return versions.find((t) => t.version === version);
    }

    return versions[0]; // Latest version
  }

  /**
   * Render a prompt with variable substitution.
   * Variables in the template use {{variableName}} syntax.
   *
   * Returns system and user prompt strings split by frontmatter convention:
   * Content before the first "---" or "# System" heading is the system prompt.
   * Content after is the user prompt.
   */
  render(
    name: string,
    variables: Record<string, string>,
    version?: number,
  ): { system: string; user: string } {
    const template = this.get(name, version);
    if (!template) {
      throw new Error(`Prompt template "${name}" not found`);
    }

    // Parse the template into system and user portions
    const { systemPrompt, userPrompt } = parsePromptSections(template.template);

    const system = substituteVariables(systemPrompt, variables);
    const user = substituteVariables(userPrompt, variables);

    return { system, user };
  }

  /**
   * Check if a prompt template is registered.
   */
  has(name: string): boolean {
    const versions = this.templates.get(name);
    return versions !== undefined && versions.length > 0;
  }

  /**
   * List all registered prompt names.
   */
  list(): string[] {
    return Array.from(this.templates.keys());
  }
}

/**
 * Parse a prompt template string into system and user sections.
 *
 * Convention:
 * - If the template contains "---" on its own line, content before is system,
 *   content after is user.
 * - If the template starts with "# System", that section is system, rest is user.
 * - Otherwise, the entire template is the user prompt (no system prompt).
 */
function parsePromptSections(raw: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  // Check for frontmatter delimiter
  const parts = raw.split("\n---\n");
  if (parts.length >= 2) {
    return {
      systemPrompt: parts[0].trim(),
      userPrompt: parts.slice(1).join("\n---\n").trim(),
    };
  }

  // Check for "# System" heading
  const systemMatch = raw.match(/^# System\n([\s\S]*?)(?=\n# User|\n# Prompt|$)/);
  if (systemMatch) {
    const systemContent = systemMatch[1].trim();
    const userContent = raw.slice(systemMatch[0].length).trim();
    // Strip the "# User" or "# Prompt" heading if present
    const userCleaned = userContent.replace(/^# (User|Prompt)\n/, "").trim();
    return { systemPrompt: systemContent, userPrompt: userCleaned };
  }

  // Default: entire template is user prompt
  return { systemPrompt: "", userPrompt: raw.trim() };
}

/**
 * Substitute {{variable}} placeholders in a template string.
 * Unknown variables are left as-is.
 */
function substituteVariables(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return varName in variables ? variables[varName] : match;
  });
}
