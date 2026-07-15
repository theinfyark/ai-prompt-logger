import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createAILogger,
  normalizeUsage,
  estimateCost,
} from "../src/index.js";

describe("ai-prompt-logger", () => {
  it("logs tokens, prompt, cost, and latency", () => {
    /** @type {object[]} */
    const entries = [];
    const logger = createAILogger({
      provider: "openai",
      pretty: false,
      onLog: (e) => entries.push(e),
    });

    const entry = logger.log({
      model: "gpt-4o-mini",
      prompt: "Hello",
      response: "Hi there",
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      latencyMs: 120,
    });

    assert.equal(entry.prompt, "Hello");
    assert.equal(entry.response, "Hi there");
    assert.deepEqual(entry.tokens, {
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });
    assert.equal(entry.latencyMs, 120);
    assert.equal(entry.responseTime, 120);
    assert.ok(typeof entry.costUsd === "number");
    assert.ok(entry.costUsd > 0);
    assert.equal(entries.length, 1);
  });

  it("normalizes Anthropic + Gemini usage", () => {
    assert.deepEqual(
      normalizeUsage("anthropic", { input_tokens: 3, output_tokens: 7 }),
      { promptTokens: 3, completionTokens: 7, totalTokens: 10 },
    );
    assert.deepEqual(
      normalizeUsage("gemini", {
        promptTokenCount: 2,
        candidatesTokenCount: 4,
        totalTokenCount: 6,
      }),
      { promptTokens: 2, completionTokens: 4, totalTokens: 6 },
    );
  });

  it("estimates cost for providers", () => {
    const cost = estimateCost("openai", "gpt-4o-mini", {
      promptTokens: 1_000_000,
      completionTokens: 1_000_000,
    });
    assert.equal(cost, 0.15 + 0.6);
  });

  it("track() measures latency automatically", async () => {
    /** @type {object[]} */
    const entries = [];
    const logger = createAILogger({
      onLog: (e) => entries.push(e),
      pretty: false,
    });

    const result = await logger.track(async () => {
      await new Promise((r) => setTimeout(r, 15));
      return {
        provider: "anthropic",
        model: "claude-3-5-haiku-latest",
        prompt: [{ role: "user", content: "hi" }],
        response: "hello",
        usage: { input_tokens: 4, output_tokens: 2 },
      };
    });

    assert.ok(result.__log.latencyMs >= 10);
    assert.equal(result.__log.provider, "anthropic");
    assert.ok(result.__log.prompt.includes("user"));
  });

  it("supports azure-openai and gemini providers", () => {
    const logger = createAILogger({ pretty: false, onLog: () => {} });

    const azure = logger.log({
      provider: "azure-openai",
      model: "gpt-4o",
      prompt: "q",
      response: "a",
      usage: { prompt_tokens: 100, completion_tokens: 50 },
      latencyMs: 10,
    });
    assert.equal(azure.provider, "azure-openai");
    assert.ok(azure.costUsd > 0);

    const gemini = logger.log({
      provider: "gemini",
      model: "gemini-2.0-flash",
      prompt: "q",
      response: "a",
      usage: { promptTokenCount: 100, candidatesTokenCount: 50 },
      latencyMs: 8,
    });
    assert.equal(gemini.provider, "gemini");
    assert.equal(gemini.tokens.totalTokens, 150);
  });
});
