// src/lib/ai/__tests__/StructuredOutputHandler.test.ts

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import { createMockProvider } from "../provider";

const personSchema = z.object({
  name: z.string(),
  age: z.number(),
});

describe("StructuredOutputHandler", () => {
  const handler = new StructuredOutputHandler();

  it("extracts and validates valid JSON", async () => {
    const provider = createMockProvider([
      { content: '{"name": "Alice", "age": 30}' },
    ]);

    const result = await handler.extract(
      provider,
      { system: "Extract person info.", user: "Alice is 30 years old." },
      personSchema,
    );

    expect(result.data).toEqual({ name: "Alice", age: 30 });
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.modelUsed).toBe("mock-model");
    expect(result.tokensUsed.input).toBeGreaterThan(0);
    expect(result.latencyMs).toBeGreaterThan(0);
  });

  it("retries on invalid JSON and succeeds", async () => {
    const provider = createMockProvider([
      { content: "not json at all" },
      { content: '{"name": "Bob", "age": 25}' },
    ]);

    const result = await handler.extract(
      provider,
      { system: "Extract person info.", user: "Bob is 25." },
      personSchema,
    );

    expect(result.data).toEqual({ name: "Bob", age: 25 });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("invalid JSON");
  });

  it("retries on schema validation failure and succeeds", async () => {
    const provider = createMockProvider([
      { content: '{"name": "Charlie"}' },  // missing age
      { content: '{"name": "Charlie", "age": 40}' },
    ]);

    const result = await handler.extract(
      provider,
      { system: "Extract person info.", user: "Charlie is 40." },
      personSchema,
    );

    expect(result.data).toEqual({ name: "Charlie", age: 40 });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("returns empty result after exhausting retries", async () => {
    const provider = createMockProvider([
      { content: "not json" },
      { content: "still not json" },
      { content: "nope" },
      { content: "also nope" },
    ]);

    const result = await handler.extract(
      provider,
      { system: "Extract person.", user: "Test." },
      personSchema,
      { maxRetries: 2 },
    );

    expect(result.data).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it("validates arrays against schemas", async () => {
    const arraySchema = z.array(personSchema);
    const provider = createMockProvider([
      { content: '[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]' },
    ]);

    const result = await handler.extract(
      provider,
      { system: "Extract people.", user: "Alice (30) and Bob (25)." },
      arraySchema,
    );

    expect(result.data).toHaveLength(2);
    expect(result.data![0].name).toBe("Alice");
    expect(result.data![1].name).toBe("Bob");
  });

  it("handles complex nested schemas", async () => {
    const nestedSchema = z.object({
      event: z.string(),
      date: z.string(),
      entities: z.array(z.object({ name: z.string(), role: z.string() })),
    });

    const json = JSON.stringify({
      event: "Summit",
      date: "2026-01-15",
      entities: [
        { name: "UN", role: "organizer" },
        { name: "Belgium", role: "host" },
      ],
    });

    const provider = createMockProvider([{ content: json }]);
    const result = await handler.extract(
      provider,
      { system: "Extract event.", user: "The UN summit in Belgium." },
      nestedSchema,
    );

    expect(result.data!.event).toBe("Summit");
    expect(result.data!.entities).toHaveLength(2);
  });

  it("decreases confidence with more retries", async () => {
    const provider = createMockProvider([
      { content: '{"name": "Alice"}' },
      { content: '{"name": "Alice", "age": 30}' },
    ]);

    const result = await handler.extract(
      provider,
      { system: "Extract.", user: "Test." },
      personSchema,
    );

    // After one retry, confidence should be slightly lower
    expect(result.confidence).toBeLessThan(1.0);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("respects custom maxRetries option", async () => {
    const provider = createMockProvider([
      { content: "bad" },
      { content: "bad" },
    ]);

    const result = await handler.extract(
      provider,
      { system: "Test.", user: "Test." },
      personSchema,
      { maxRetries: 0 },
    );

    expect(result.data).toBeNull();
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
